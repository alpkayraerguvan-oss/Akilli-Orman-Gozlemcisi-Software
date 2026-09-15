// Client-side refuse only. The Pi proxy is the real boundary.
// Product questions pass. Only clear jailbreaks are blocked.

const PRODUCT_RE =
  /lora|alarm|kaplama|kutu|yangın|yangin|alev|gps|mesh|mq-?9|pano|orman|gözlem|\baog\b|sıcaklık|ntfy|karışım|karisim|asistan|sistem|kural|\bhop\b|verici|alıcı|alici|nasıl çalış|ne işe yarar|hakkında bilgi|wi-?fi|eşik|paket|istasyon|cihaz|eklenti|deneyap|sklearn|standardscaler|\bnss\b|\bgpio\b|\bdio0\b|\bpin\b|max6675|\bskor\b|clerk|firmware|termokupl|öğrenmesi|malzeme|içeri|bileşen/i;

const HARD_INJECT_RE =
  /ignore\s+(all\s+|any\s+)?(previous|prior|above)\s+(instructions|rules|prompts)|jailbreak|dan\s+mode|developer\s+mode|new\s+system\s+prompt|reveal\s+.{0,40}(system\s+prompt|hidden\s+prompt)|print\s+.{0,30}(system|hidden)\s+prompt|önceki\s+(talimat|kural|komut).{0,40}(unut|yoksay|görmezden|geçersiz)|sistem\s+prompt|system\s+prompt|<\/?system>|\[INST\]|<<SYS>>|\[system\]|role\s*[:=]\s*system/i;

export const INJECTION_HINT =
  "Bu istek asistanın kuralını değiştirmeye çalışıyor. Ürün, alarm veya kaplama sor.";

export function sanitizeUser(text, cap = 500) {
  return String(text || "")
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, "")
    .trim()
    .slice(0, cap);
}

export function looksLikeInjection(text) {
  const blob = sanitizeUser(text, 1000);
  if (!blob) return false;
  const hard = HARD_INJECT_RE.test(blob);
  if (PRODUCT_RE.test(blob) && !hard) return false;
  if (hard) return true;
  const compact = blob.replace(/\s+/g, "");
  if (
    compact.length >= 360 &&
    /^[A-Za-z0-9+/=]+$/.test(compact) &&
    (blob.match(/ /g) || []).length < 5
  ) {
    return true;
  }
  return false;
}
