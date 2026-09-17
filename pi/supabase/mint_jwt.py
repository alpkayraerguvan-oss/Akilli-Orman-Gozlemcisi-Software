#!/usr/bin/env python3
"""Mint HS256 JWTs for the Pi PostgREST (anon / service_role)."""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import sys
import time

SECRET = os.environ.get("AOG_JWT_SECRET")
if not SECRET:
    sys.exit("mint_jwt.py: set AOG_JWT_SECRET in the environment (same value as pi/supabase/.env)")


def b64(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).rstrip(b"=").decode()


def mint(role: str) -> str:
    header = b64(json.dumps({"alg": "HS256", "typ": "JWT"}, separators=(",", ":")).encode())
    payload = b64(
        json.dumps(
            {"role": role, "iss": "supabase", "iat": int(time.time())},
            separators=(",", ":"),
        ).encode()
    )
    sig = hmac.new(SECRET.encode(), f"{header}.{payload}".encode(), hashlib.sha256).digest()
    return f"{header}.{payload}.{b64(sig)}"


if __name__ == "__main__":
    role = sys.argv[1] if len(sys.argv) > 1 else "anon"
    print(mint(role))
