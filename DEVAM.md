# Kayıt — 18 Eylül 2026

Otomatik bir frontend/backend/güvenlik taraması yapıldı, bulunan hatalar `fix/security-and-bug-fixes` dalında düzeltildi. Bu dosyada şifre, `sk_live_`, OAuth secret yok.

## Yapılan düzeltmeler (kod içinde, testler geçiyor: 59 JS + 33 Python)

- **`clerkFapi.js`**: `/__clerk` proxy'si her `Origin` başlığını `Access-Control-Allow-Credentials: true` ile birlikte yansıtıyordu — herhangi bir kötü niyetli site, ziyaretçinin Clerk oturumunu okuyabilirdi (CORS + credentials açığı). Artık sadece bilinen origin'lere (gerekirse `CLERK_PROXY_ALLOWED_ORIGINS` env'i ile eklenebilir) izin veriyor.
- **`pi/supabase/docker-compose.yml`, `mint_jwt.py`, `init.sql`/`init.sh`**: PostgREST JWT secret'ı ve DB parolaları `"...-change-me..."` gibi hardcoded'dı; artık `pi/supabase/.env` dosyasından okunuyor (örnek: `.env.example`), yoksa container/script çalışmıyor. **Pi'de gerçek `.env` dosyasını oluşturup rastgele değerlerle doldurman gerekiyor** (`openssl rand -base64 48` vb.) — bkz. `pi/README.md`.
- **`pi/supabase/Caddyfile`**: `Access-Control-Allow-Origin: *` + Private-Network-Access açıktı; artık sadece `https://akilli-orman-gozlemcisi-software.vercel.app` origin'ine izin veriyor.
- **`pi/i2c_to_supabase.py`**: LoRa'dan gelen paketler hiç doğrulanmadan DB'ye/ML'e giriyordu (433 MHz şifresiz, sahte verici zehirleyebilirdi). Artık GPS durumu, ADC aralığı, sıcaklık ve enlem/boylam için fiziksel mantık kontrolü var; uyumsuz paket atılıyor.
- **`api/chat.js`**: auth/rate-limit yoktu; IP başına basit bir limit eklendi. (Not: bu endpoint şu an frontend tarafından hiç çağrılmıyor, bkz. aşağı.)
- **`src/pluginStore.js`**: `localStorage.setItem` try/catch'siz çağrılıyordu; private-browsing/quota-exceeded durumunda tüm SPA çöküyordu. Artık hataya toleranslı.
- **`src/Makine.jsx`**: Supabase sorgusunda eksik `.catch()` eklendi.
- **`src/config.js`**: gerçek prod Supabase URL/anon key'i hardcoded fallback olarak commit'lenmişti (fork/klon yanlışlıkla prod'a bağlanabilirdi); kaldırıldı, env yoksa artık net hata fırlatıyor.
- **`src/stationBind.js`**: client tarafından yazılabilen `unsafeMetadata.stationId`'nin ileride RLS'e güvenilecek bir yetkilendirme kaynağı olması riskine karşı uyarı yorumu eklendi (şu an istismar edilemez — RLS her şeyi `AOG-DEMO-1`'e kilitliyor — ama istasyon bazlı RLS gelirse önce `user_stations` gibi sunucu tarafı bir tabloya taşınmalı).
- **`.gitattributes`**: `pi/AOG.md` için `eol=lf` eklendi; Windows'ta `core.autocrlf=true` ile `npm test` kırılıyordu.

## Düzeltilmeyen / bilinçli dokunulmayan noktalar

- **Asistan `/v1` tüneli ölü** (bkz. aşağı, ayrı başlık) — kod hatası değil, altyapı/operasyon işi.
- **Pi'de `SUPABASE_SERVICE_ROLE_KEY` fiziksel donanımda saklanıyor** — RLS'i tamamen bypass eden bir anahtar, ormandaki kutuda/Pi'de duruyor. Gerçek çözüm mimari (Pi yerine bir backend proxy'nin insert yapması) — otomatik düzeltmedim, ürün kararı gerektiriyor.
- **`vercel.json`'daki tünel hostname'i public repo'da duruyor** — düşük risk (tünel geçici olduğu için zaten değişiyor) ama bilgi ifşası. Aşağıdaki kalıcı tünel çözümüyle birlikte ele alınmalı.
- **Demo sohbetin herkese açık/paylaşımlı yazılabilir olması** — `pi/chat_proxy.py`'deki `/v1/demo-threads` — kasıtlı ürün özelliği ("share one public chat"), dokunmadım.
- **Asistan'ı Pi çökünce otomatik olarak `/api/chat`'teki kural tabanlı (LLM'siz) cevaba düşürmeyi denedim** ama `scripts/check.mjs` bunu açıkça yasaklıyor (`assert.doesNotMatch(vercelChat, /"destination": "\/api\/chat"/)`, `assert.doesNotMatch(asistan, /mdReply/)`) — yani bu bilinçli bir ürün kararı (gerçek LLM yerine sahte cevap kullanıcıya gösterilmesin). Geri aldım.

## Asistan şu an canlıda çalışmıyor — tünel ölü

`nslookup advocate-arena-climbing-contracting.trycloudflare.com` → **Non-existent domain**. `vercel.json`'daki `/v1/:path*` hedefi bu adrese gidiyor, o da yok — canlı sitede Asistan her soruya `HTTP 502 DNS_HOSTNAME_NOT_FOUND` döndürüyor.

Yukarıdaki "Yarın açınca" bölümündeki adımları takip et (kip host + `cloudflared tunnel --url http://127.0.0.1:8080` yeniden başlat, yeni URL'yi al, `vercel.json`'a yaz, commit, push). **Kalıcı çözüm**: `trycloudflare.com` quick tunnel yerine Cloudflare'de isimli/kalıcı bir tünel (`cloudflared tunnel create` + DNS route) kurulursa hostname sabitlenir ve bu sorun her yeniden başlatmada tekrar etmez.

## Deploy notu

Bu düzeltmeler `fix/security-and-bug-fixes` dalına push edildi (main'e değil) — Vercel `main`'den otomatik deploy ettiği için, gerçek Clerk/Supabase/Pi ile test edilmeden direkt prod'a düşmesin diye. PR linkini kontrol et, gözden geçir, sonra `main`'e merge et.

---

# Kayıt — 15 Eylül 2026 akşam

Yazılım `main` `028e174`. PWA yayında. Bu dosyada şifre, `sk_live_`, OAuth secret yok.

## Durum

- PWA: `https://akilli-orman-gozlemcisi-software.vercel.app`
- GitHub: `kdorukdemirtas-star/Akilli-Orman-Gozlemcisi-Software` `main`
- SW: `aog-shell-v14`
- Clerk: GitHub SSO. Google ve Microsoft kapalı.
- Asistan `/v1` → `vercel.json` quick tunnel (`trycloudflare.com/v1/:path*`). Tunnel düşerse hostname değişir; `vercel.json` hedefini güncelle, commit, push.
- Clerk altındaki **Demo**: hesapsız giriş. Demo sohbeti ortak (`/v1/demo-threads`). Hesaplı sohbet ayrı kalır.
- Kip: Hızlı / Orta / Derin. İstemci 120 s bekler; AOG.md basılmaz. Kip yanıtı `pi/chat_proxy.py` üzerinden gider.
- Donanım klasörü (`Akıllı Orman Gözlemcisi`) git deposu değil.

## Yarın açınca

1. Bu Mac’te kip dinleyicisi (`127.0.0.1:8080`) ve quick tunnel ayakta olsun. `pkill -f chat_proxy.py` kullanma; PID ile durdur.
2. `curl -sS http://127.0.0.1:8080/health` → `kips`.
3. Tunnel URL `vercel.json` ile aynı mı bak. Değiştiyse rewrite’ı yaz, push et.
4. Canlı sitede sert yenile. Asistan’da Clerk veya Demo.

```bash
cd /Users/dorukdemirtas/Desktop/Akilli-Orman-Gozlemcisi-Software
AOG_INFER=ollama LISTEN=127.0.0.1 PORT=8080 python3 pi/chat_proxy.py
# ayrı terminal:
cloudflared tunnel --url http://127.0.0.1:8080
```

Pi (LAN) notu duruyor: `pkill -f chat_proxy.py` kullanma. Jüri metninde Mac / kip host adı yok.

## Kilit ürün kuralları

- Tokenlar `src/tokens.css`. HUD’u yeniden stil etme
- `fixedAlert` ve firmware AND kuralını değiştirme
- Asistan gerçekleri `pi/AOG.md` + `AOG_FACTS` birebir. Chat `fetch("/v1/chat/completions")`
- Kip: Hızlı / Orta / Derin cevaplar. Hop: Mesh sistemi
- Slayt: eşik yok, SWOT yok, dünyada ilk yok, kamera yok, GGUF adı yok
- Testler: `node --test scripts/check.mjs` ve `python3 scripts/test_chat_proxy.py`

## Clerk

- App: `app_3J6jotrFwy4EMawIaQhDyq9T3Xh`
- Production: `ins_3J6p8v8hOCnuo6LHPERH3m0Zjyi`
- Callback: `https://akilli-orman-gozlemcisi-software.vercel.app/__clerk/v1/oauth_callback`
- Vercel env adları (değer yok): `VITE_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `VITE_CLERK_PROXY_URL=/__clerk`, `VITE_CLERK_JS_URL`

## Git / deploy

- Vercel: `akilli-orman-gozlemcisi-software`
- `.env.local` commit etme
- `pi/demo_threads.json` gitignore; Demo sohbeti kip hostunda durur
