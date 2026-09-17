# Pi asistan + I2C alıcı + yerel PostgREST

Raspberry Pi 5 (4 GB). LoRa alıcı Deneyap Kart 1A v2, I2C köle **0x2A**. Pi master (`GPIO2` SDA pin 3, `GPIO3` SCL pin 5, ortak GND). Servis: `aog-i2c.service` → `i2c_to_supabase.py`.

Yerel tablo: `pi/supabase` (Postgres + PostgREST + Caddy `:8000`). PWA `VITE_SUPABASE_URL=http://192.168.68.61:8000`. Vercel HTTPS için tünel gerekir.

Kurulumdan önce `pi/supabase/.env.example`'ı `pi/supabase/.env` olarak kopyala ve `AOG_PG_PASSWORD`, `AOG_AUTHENTICATOR_PASSWORD`, `AOG_JWT_SECRET` için gerçek rastgele değerler üret (örn. `openssl rand -base64 48`). Bu dosya olmadan `docker compose up` hata verir — sabit/varsayılan bir sır artık yok. `mint_jwt.py` çalıştırmadan önce aynı `AOG_JWT_SECRET`'i ortama al: `set -a; . .env; set +a; python3 mint_jwt.py service_role`. Caddy artık sadece `https://akilli-orman-gozlemcisi-software.vercel.app` origin'ine CORS izni veriyor (`*` değil).

Alıcı USB ile Mac’te de durabilir; veri yolu I2C’dir. A4/A5 Arduino I2C değildir; kartın **SDA / SCL** (D10 / D11) pinlerini kullan.

## Asistan

PWA `/asistan` aynı kökte açılır. Adres yazılmaz. Vite `PI_CHAT_URL` ile `/v1` vekiller.

`chat_proxy.py` `:8080` üzerinde OpenAI uyumlu `/v1/chat/completions` açar. Gövdedeki `model` alanı `hizli`, `orta` veya `derin` olur. İstemci `system` satırı ve sahte geçmiş atılır; her istekte `AOG.md` + kip kuralı yazılır; kullanıcı metni talimat sayılmaz. Enjeksiyon (jailbreak, sahte system, `system prompt`) llama’ya gitmez. İngilizce taslak, PDF vaadi ve spek listesi yanıt sayılmaz; vekil ürün cümlesine döner. CORS `CHAT_CORS_ORIGIN` (varsayılan Vercel PWA + yerel Vite). `CF-Connecting-IP` yalnız loopback tünelden okunur. IP başına 10 sn’de 3 ve dakikada 8 istek, global dakikada 16, aynı anda 1 llama, gövde 16 KB. Limit dolunca 60 sn ban ve `Retry-After`. CORS curl'ü kesmez; tünel hostname `vercel.json` içinde döner. Üç kip de `-c 4096` ile açılır; `AOG.md` 2048 bağlama sığmaz. llama HTTP hataları 503 JSON döner (502 Cloudflare sayfasına çevrilmesin diye). 4 GB RAM için aynı anda tek llama-server çalışır; kip değişince önceki GGUF bellekten iner, istenen diskten yüklenir.

Operatör GGUF yolları (PWA’da geçmez):

- hızlı: `models/Qwen_Qwen3.5-0.8B-Q4_K_M.gguf`
- orta: `models/gemma-3-1b-it-Q4_K_M.gguf`
- derin: `models/DeepSeek-R1-Distill-Qwen-1.5B-Q4_K_M.gguf`

Bu üç dosya GitHub’da yoktur. Yazılım deposunu indirmek [INDIRME.md](../INDIRME.md). Ağırlıkları Pi’de `~/aog-pi/models` altına çek:

```bash
mkdir -p /home/demir/aog-pi/models
cd /home/demir/aog-pi/models

# huggingface-cli (pip install -U "huggingface_hub[cli]")
huggingface-cli download bartowski/Qwen_Qwen3.5-0.8B-GGUF Qwen_Qwen3.5-0.8B-Q4_K_M.gguf --local-dir .
huggingface-cli download unsloth/gemma-3-1b-it-GGUF gemma-3-1b-it-Q4_K_M.gguf --local-dir .
huggingface-cli download bartowski/DeepSeek-R1-Distill-Qwen-1.5B-GGUF DeepSeek-R1-Distill-Qwen-1.5B-Q4_K_M.gguf --local-dir .
```

`wget` ile aynı dosyalar:

```bash
wget -O Qwen_Qwen3.5-0.8B-Q4_K_M.gguf \
  "https://huggingface.co/bartowski/Qwen_Qwen3.5-0.8B-GGUF/resolve/main/Qwen_Qwen3.5-0.8B-Q4_K_M.gguf"
wget -O gemma-3-1b-it-Q4_K_M.gguf \
  "https://huggingface.co/unsloth/gemma-3-1b-it-GGUF/resolve/main/gemma-3-1b-it-Q4_K_M.gguf"
wget -O DeepSeek-R1-Distill-Qwen-1.5B-Q4_K_M.gguf \
  "https://huggingface.co/bartowski/DeepSeek-R1-Distill-Qwen-1.5B-GGUF/resolve/main/DeepSeek-R1-Distill-Qwen-1.5B-Q4_K_M.gguf"
```

Kaynak sayfalar: [Qwen 0.8B GGUF](https://huggingface.co/bartowski/Qwen_Qwen3.5-0.8B-GGUF), [Gemma 3 1B GGUF](https://huggingface.co/unsloth/gemma-3-1b-it-GGUF), [DeepSeek-R1 1.5B GGUF](https://huggingface.co/bartowski/DeepSeek-R1-Distill-Qwen-1.5B-GGUF). Orta kip Unsloth Q4_K_M (~0,8 GB); Gemma 4 E2B (~2,9 GB) 4 GB Pi’de orta kipi yavaşlatıyordu.

Yazılım vekilini depodan Pi’ye kopyala (`chat_proxy.py`, `AOG.md`, `aog-chat.service`). `llama-server` için llama.cpp’yi Pi’de derle; ikili `LLAMA_BIN` ile `aog-chat.service` içinde gösterilir.

Servis: `aog-chat.service` (eski `aog-asistan.service` durdurulur). PWA üst menüden `/asistan` açar.

## ML

`ml_score.py` + `aog-ml.timer`. sklearn `Pipeline`: `StandardScaler` + `LogisticRegression(class_weight="balanced")`. Etiket sabit karar örnekleridir. Her sınıftan en az 3 örnek yoksa `logreg-wait` (skor 0). Çıktı `scores` (`model`: `logreg` veya `logreg-wait`). Ayar PWA `/makine`. Asistan ile aynı anda eğitme.
