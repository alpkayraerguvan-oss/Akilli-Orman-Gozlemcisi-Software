#!/usr/bin/env python3
"""Pi I2C master: Deneyap alici (0x2A) -> packet table.

Deneyap is the I2C slave. This process only reads 32-byte frames.
"""

from __future__ import annotations

import fcntl
import json
import os
import struct
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

I2C_SLAVE = 0x0703

ADDR = int(os.environ.get("AOG_I2C_ADDR", "0x2A"), 0)
BUS_ID = int(os.environ.get("AOG_I2C_BUS", "1"))
STATION = os.environ.get("AOG_STATION_ID", "AOG-DEMO-1")
ENV_PATH = Path(os.environ.get("AOG_ENV", "/home/demir/aog-pi/.env"))
FRAME = 32
MAGIC = 0xA1
FMT = "<BBHhBBBbHiiBB10x"


def load_env(path: Path) -> dict[str, str]:
    out: dict[str, str] = {}
    if not path.is_file():
        raise SystemExit(f"env yok: {path}")
    for line in path.read_text().splitlines():
        if not line.strip() or line.lstrip().startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        out[k.strip()] = v.strip().strip('"').strip("'")
    return out


# Physical sanity bounds. LoRa at 433 MHz carries no auth/crypto, so a
# spoofed transmitter can send anything matching the magic byte — reject
# frames whose fields fall outside what the actual sensors can report,
# instead of trusting the wire and letting bogus values reach scores/ML.
MQ9_MAX = 4095  # 12-bit ADC ceiling
T_MIN_C = -20.0  # MAX6675 does not read usable sub-freezing values
GPS_STATES = (0, 1, 2)


def valid_row(row: dict) -> bool:
    if row["gps"] not in GPS_STATES:
        return False
    if row["mq9"] < 0 or row["mq9"] > MQ9_MAX:
        return False
    if row["a8"] not in (0, 1) or row["a9"] not in (0, 1):
        return False
    if row["t"] < T_MIN_C:
        return False
    lat = row.get("lat")
    if lat is not None and not (-90.0 <= lat <= 90.0):
        return False
    lon = row.get("lon")
    if lon is not None and not (-180.0 <= lon <= 180.0):
        return False
    return True


def unpack_frame(data: bytes) -> dict | None:
    if len(data) < 22 or data[0] != MAGIC:
        return None
    magic, seq, n, t_cc, gps, a8, a9, rssi, mq9, lat_e5, lon_e5, hop, flags = struct.unpack(
        FMT, data[:FRAME] if len(data) >= FRAME else data.ljust(FRAME, b"\x00")
    )
    if magic != MAGIC or (flags & 1) == 0:
        return None
    row = {
        "station_id": STATION,
        "n": int(n),
        "t": t_cc / 100.0,
        "gps": int(gps),
        "mq9": int(mq9),
        "a8": int(a8),
        "a9": int(a9),
        "v": int(rssi),
    }
    if lat_e5:
        row["lat"] = lat_e5 / 1e5
    if lon_e5:
        row["lon"] = lon_e5 / 1e5
    if hop:
        row["_hop"] = int(hop)
    row["_seq"] = int(seq)
    if not valid_row(row):
        return None
    return row


def public_row(row: dict) -> tuple[dict, int | None]:
    out = dict(row)
    out.pop("_seq", None)
    hop = out.pop("_hop", None)
    if isinstance(hop, int) and hop >= 1:
        out["hop"] = hop
    return out, hop if isinstance(hop, int) else None


def post_row(url: str, anon: str, row: dict) -> int:
    req = urllib.request.Request(
        f"{url}/rest/v1/packets",
        data=json.dumps(row).encode("utf-8"),
        method="POST",
        headers={
            "apikey": anon,
            "Authorization": f"Bearer {anon}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=12) as resp:
            return resp.status
    except urllib.error.HTTPError as e:
        body = e.read()[:180]
        print(f"HTTP {e.code} {body!r}", flush=True)
        return e.code


def open_bus() -> int:
    fd = os.open(f"/dev/i2c-{BUS_ID}", os.O_RDWR)
    fcntl.ioctl(fd, I2C_SLAVE, ADDR)
    return fd


def strip_s3_addr(data: bytes) -> bytes:
    """ESP32-S3 I2C slave often prefixes the 8-bit read address (0x55 for 0x2A)."""
    addr_rd = (ADDR << 1) | 1
    if len(data) >= 2 and data[0] == addr_rd and data[1] == MAGIC:
        return data[1 : 1 + FRAME].ljust(FRAME, b"\x00")[:FRAME]
    if data[:1] == bytes([MAGIC]):
        return data[:FRAME].ljust(FRAME, b"\x00")[:FRAME]
    return data[:FRAME].ljust(FRAME, b"\x00")


def read_frame(fd: int) -> bytes:
    data = os.read(fd, FRAME)
    if len(data) < 22:
        raise OSError(5, f"kisa okuma {len(data)}")
    return strip_s3_addr(data)


def main() -> int:
    env = load_env(ENV_PATH)
    url = env.get("VITE_SUPABASE_URL", "").rstrip("/")
    anon = env.get("SUPABASE_SERVICE_ROLE_KEY") or env.get("VITE_SUPABASE_ANON_KEY", "")
    if not url or not anon:
        raise SystemExit("VITE_SUPABASE_URL / anahtar eksik")
    print(f"I2C bus={BUS_ID} addr=0x{ADDR:02X} station={STATION}", flush=True)
    last_seq = None
    last_n = None
    posted = 0
    misses = 0
    try:
        while True:
            fd = None
            try:
                fd = open_bus()
                while True:
                    try:
                        data = read_frame(fd)
                        misses = 0
                    except OSError as e:
                        raise
                    row = unpack_frame(data)
                    if not row:
                        time.sleep(0.25)
                        continue
                    if row["mq9"] == 0 and row["t"] == 0.0 and row["gps"] == 0:
                        time.sleep(0.25)
                        continue
                    if row["_seq"] == last_seq:
                        time.sleep(0.25)
                        continue
                    # Same n from the direct hop is kept; hop=1 must still land.
                    if row["n"] == last_n and not row.get("_hop"):
                        time.sleep(0.25)
                        continue
                    body, hop_n = public_row(row)
                    code = post_row(url, anon, body)
                    if code in (200, 201):
                        last_seq = row["_seq"]
                        last_n = row["n"]
                        posted += 1
                        print(
                            f"yazildi #{posted} n={row['n']} t={row['t']} mq9={row['mq9']} rssi={row.get('v')} hop={hop_n} a8={row['a8']} a9={row['a9']}",
                            flush=True,
                        )
                    else:
                        time.sleep(1)
                        continue
                    time.sleep(0.25)
            except OSError as e:
                misses += 1
                if misses in (1, 5, 20) or misses % 40 == 0:
                    print(f"i2c yok ({e}) — SDA/SCL/GND ve 0x2A firmware", flush=True)
                time.sleep(0.5 if misses < 10 else 2)
            finally:
                if fd is not None:
                    try:
                        os.close(fd)
                    except OSError:
                        pass
    except KeyboardInterrupt:
        print(f"durdu posted={posted}", flush=True)
        return 0


if __name__ == "__main__":
    sys.exit(main())
