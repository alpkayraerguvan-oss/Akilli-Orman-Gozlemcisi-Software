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
