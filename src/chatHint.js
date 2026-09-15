// Maps chat proxy failures to copy an operator can act on.
// Hostnames, GGUF paths, and intern notes stay off the page.

export function chatLoadHint(status, message) {
  const code = Number(status) || 0;
  const raw = String(message || "");

  if (code === 429 || /meşgul|çok istek|çok sık/i.test(raw)) {
    return "Asistan meşgul. Birkaç saniye bekleyip yeniden gönder.";
  }
  if (code === 400 && /kapsam|kuralını değiştir/i.test(raw)) {
    return "Bu istek asistanın kuralını değiştirmeye çalışıyor. Ürün, alarm veya kaplama sor.";
  }
  if (code === 503 || /henüz hazır değil/i.test(raw)) {
    if (!/henüz hazır değil/i.test(raw) && code === 503) {
      return "Asistan şu an yanıt veremiyor. Biraz sonra yeniden dene.";
    }
    if (/derin/i.test(raw)) {
      return "Derin cevaplar henüz hazır değil. Hızlı cevapları dene veya biraz sonra yeniden gönder.";
    }
    if (/orta/i.test(raw)) {
      return "Orta cevaplar henüz hazır değil. Hızlı cevapları dene veya biraz sonra yeniden gönder.";
    }
    return "Bu yanıt kipi henüz hazır değil. Biraz sonra yeniden dene.";
  }
  if (code === 504 || /zaman aşımı|gecikti/i.test(raw)) {
    return "Yanıt zaman aşımına uğradı. Hızlı cevapları dene veya biraz sonra yeniden gönder.";
  }
  if (code === 400 || /gövde json değil|istek geçersiz/i.test(raw)) {
    return "İstek okunamadı. Soruyu kısaltıp yeniden gönder.";
  }
  if (code === 502) {
    return "Asistan şu an yanıt veremiyor. Biraz sonra yeniden dene.";
  }
  if (/failed to fetch|networkerror|load failed|err_connection/i.test(raw)) {
    return "Asistan sunucusuna ulaşılamadı. Ağ bağlantını kontrol edip yeniden dene.";
  }
  return "Asistan şu an yanıt veremiyor. Biraz sonra yeniden dene.";
}
