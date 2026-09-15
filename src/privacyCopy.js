export const NOTICE_DATE = "10 Eylül 2026";

export const CONTROLLER = {
  name: "Defenders Of Green",
  product: "Akıllı Orman Gözlemcisi",
  site: "https://akilli-orman-gozlemcisi-software.vercel.app",
  github: "https://github.com/kdorukdemirtas-star/Akilli-Orman-Gozlemcisi-Software",
};

export const DATA_ROWS = [
  {
    category: "Hesap",
    examples: "E-posta, oturum, isteğe bağlı ad",
    purpose: "Giriş, kayıt, istasyon kodunu hesaba bağlamak",
    basis: "Sözleşme (KVKK md. 5/1-c) ve açık rıza",
    keep: "Hesap silinene kadar (Clerk)",
  },
  {
    category: "İstasyon kodu",
    examples: "AOG-… kodu, Clerk unsafeMetadata",
    purpose: "Kutu QR ile hesaba bağlanır",
    basis: "Sözleşme",
    keep: "Hesap silinene veya bağ koparılana kadar",
  },
  {
    category: "Asistan sohbeti",
    examples: "Soru, yanıt, kip",
    purpose: "Asistanı bu tarayıcıda hesaba yazmak. Demo tuşu ortak sohbeti Pi üzerinde tutar",
    basis: "Sözleşme ve açık rıza",
    keep: "Hesaplı sohbet bu tarayıcıdaki localStorage. Demo sohbeti herkese açık ortak kayıttır",
  },
  {
    category: "Asistan iletimi",
    examples: "Soru metni",
    purpose: "Cloudflare tüneli üzerinden işletmecinin Raspberry Pi makinelerinde yanıt üretmek",
    basis: "Sözleşme",
    keep: "Pi üzerinde geçici işlem; kalıcı sohbet hesabı yoktur",
  },
  {
    category: "Telemetri",
    examples: "Sıcaklık, gaz, alev, RSSI",
    purpose: "Pano izleme",
    basis: "Meşru menfaat (KVKK md. 5/1-f): orman istasyonu. Kişi sayısı tutulmaz",
    keep: "İşletmecinin Pi paket tablosunda 24 saat",
  },
  {
    category: "Paket GPS",
    examples: "Enlem / boylam, veri tabanında durabilir",
    purpose: "İstasyon kaydı. Pano haritası paket GPS'ini göstermez; tanıtım pinidir",
    basis: "Meşru menfaat",
    keep: "Paket süresi ile aynı (pano 24 saat)",
  },
  {
    category: "Alarm metni",
    examples: "ntfy konusu",
    purpose: "İstasyon uyarısını çekmek",
    basis: "Meşru menfaat",
    keep: "ntfy.sh barındırması",
  },
  {
    category: "Çerez tercihi",
    examples: "aog-consent-v1",
    purpose: "6698 ve BTK çerez rehberi için kayıt",
    basis: "Açık rıza ve yasal yükümlülük",
    keep: "Bu tarayıcı; tercih değişene kadar",
  },
  {
    category: "Arayüz kayıtları",
    examples: "Eklenti, cihaz türü, kaplama tarihi",
    purpose: "Bu tarayıcıdaki arayüz",
    basis: "Meşru menfaat",
    keep: "Bu tarayıcı. Hesaba bağlı değildir; sohbet silme bunları silmez",
  },
  {
    category: "Yazı tipi ve harita",
    examples: "IP, karo koordinatı",
    purpose: "Google Fonts ve OpenStreetMap görüntüsü",
    basis: "Açık rıza. Reddedilirse sistem yazı tipi kullanılır; harita karosu yüklenmez",
    keep: "İstek anı; Google veya OSM kendi kayıtlarını tutuyorsa onların politikası",
  },
];

export const PROCESSOR_ROWS = [
  {
    name: "Clerk, Inc.",
    job: "Hesap ve oturum",
    where: "ABD",
    note: "CLOUD Act kapsamı. Adequacy kararı bu metinde iddia edilmez",
  },
  {
    name: "Vercel",
    job: "Site barındırma",
    where: "ABD",
    note: "CLOUD Act kapsamı",
  },
  {
    name: "Cloudflare",
    job: "Clerk bot koruması ve asistan tüneli",
    where: "Küresel",
    note: "Soru metni tünelden Pi'ye gider",
  },
  {
    name: "Raspberry Pi (işletmeci)",
    job: "Asistan yanıtı, istasyon köprüsü ve paket kaydı",
    where: "Yerel ağ",
    note: "Pano 24 saat. İstemci sistem metni ve sohbet geçmişi gönderilmez",
  },
  {
    name: "ntfy.sh",
    job: "Alarm konusu",
    where: "ntfy barındırması",
    note: "Alarm metnini çeker",
  },
  {
    name: "Google",
    job: "Yazı tipi dosyası",
    where: "ABD",
    note: "Yalnız açık rıza varsa",
  },
  {
    name: "OpenStreetMap",
    job: "Harita karosu",
    where: "OSM sunucuları",
    note: "Yalnız açık rıza varsa. Paket GPS'i panoda açılmaz",
  },
];

export const COOKIE_ROWS = [
  {
    name: "Clerk oturum çerezleri",
    kind: "Zorunlu",
    why: "Giriş, kayıt ve hesabı açık tutmak. Pano, Asistan ve Cihaz bu çerez olmadan açılmaz.",
    keep: "Clerk oturum süresi; çıkış veya hesap silmede düşer",
  },
  {
    name: "aog-chat-threads-v1:{hesap}",
    kind: "Zorunlu (hesap)",
    why: "Asistan sohbeti yalnız bu tarayıcıda, Clerk kullanıcı kimliğine yazılır. Başka hesabın sohbeti görünmez.",
    keep: "Bu tarayıcı; sohbet silme veya site verisini temizleyene kadar",
  },
  {
    name: "aog-consent-v1",
    kind: "Zorunlu",
    why: "Çerez tercihini hatırlar. 6698 ve BTK çerez rehberi için kayıt tutulur.",
    keep: "Bu tarayıcı; tercih değişene kadar",
  },
  {
    name: "Google Fonts",
    kind: "İsteğe bağlı",
    why: "Yazı tipi dosyası Google'a IP gönderir. Reddedilirse sistem yazı tipi kullanılır.",
    keep: "İstek anı. Birinci taraf çerez yazılmaz",
  },
  {
    name: "OpenStreetMap karoları",
    kind: "İsteğe bağlı",
    why: "Pano haritası OSM sunucusuna IP ve kare koordinatı gönderir. Konum gösterimi tanıtım pinidir; paket GPS'i panoda açılmaz.",
    keep: "İstek anı. Birinci taraf çerez yazılmaz",
  },
];

export const COOKIE_INTRO = [
  "6698 ve BTK Elektronik Haberleşme Sektöründe Kişisel Verilerin İşlenmesi ve Gizliliğin Korunması hakkındaki çerez uygulamasına göredir.",
  "Zorunlu çerezler hesabı ve sohbeti çalıştırır; bunlar olmadan Pano, Asistan ve Cihaz açılmaz. İsteğe bağlı aktarım (yazı tipi, harita) için açık rıza alınır. Reddetmek asistanı kapatmaz. Rızayı aynı yerden geri çekersin.",
];

export const PRIVACY_SECTIONS = [
  {
    id: "sorumlu",
    title: "Veri sorumlusu",
    paragraphs: [
      "6698 sayılı Kişisel Verilerin Korunması Kanunu md. 10 uyarınca aydınlatma metnidir. GDPR (AB) md. 13/14 bilgisi aynı sayfadadır.",
      "Veri sorumlusu Defenders Of Green takımıdır. Ürün Akıllı Orman Gözlemcisi, TEKNOFEST 2026. Site: https://akilli-orman-gozlemcisi-software.vercel.app.",
      "Tescilli ticaret unvanı, VERBIS numarası, veri koruma görevlisi ve AB temsilcisi bu metinde yoktur. Başvuru bu sayfadaki haklar bölümünden veya GitHub deposu üzerinden yapılır. Ayrı bir e-posta veya KEP adresi yayımlanmaz.",
    ],
  },
  {
    id: "neden",
    title: "Hangi veriler, hangi amaçla",
    paragraphs: [
      "Hesap Clerk e-posta, oturum ve isteğe bağlı ad ile kurulur. İstasyon kodu Clerk unsafeMetadata içinde durur; kutu QR ile hesaba bağlanır.",
      "Asistan: soru metni ve yanıt bu tarayıcıda hesaba yazılır. Soru, asistan yanıtı için Cloudflare tüneli üzerinden işletmecinin Raspberry Pi makinelerine gider; istemci sistem metni ve sohbet geçmişi gönderilmez.",
      "Pano: istasyon paketleri (sıcaklık, gaz, alev, RSSI) işletmecinin Pi paket tablosunda 24 saat bakılır. Paketteki GPS veri tabanında durabilir; pano haritası paket GPS'ini göstermez. ntfy konusu alarm metnini çeker.",
      "Eklenti, cihaz türü ve kaplama tarihi bu tarayıcıda, hesaba bağlı olmadan durabilir. Sohbet silme bunları silmez; tarayıcı verisini temizleyerek kalkar.",
    ],
  },
  {
    id: "hukuk",
    title: "Hukuki sebepler (KVKK md. 5)",
    paragraphs: [
      "Hesap ve sohbet, sözleşmenin kurulması ve ifası ile açık rızaya dayanır. Giriş yapılmadan Pano, Asistan ve Cihaz açılmaz.",
      "İsteğe bağlı çerez (yazı tipi, harita) için açık rıza alınır; reddetmek asistanı kapatmaz. Rıza Çerezler sayfasından geri çekilir.",
      "İstasyon telemetrisi orman izleme meşru menfaati çerçevesinde işlenir; kişi sayısı tutulmaz.",
    ],
  },
  {
    id: "aktarim",
    title: "Yurt dışı aktarım ve işleyenler",
    paragraphs: [
      "Clerk, Inc. (ABD) hesabı tutar. Vercel barındırır. Paket tablosu işletmecinin Raspberry Pi makinelerinde durur. ntfy.sh alarm konusunu barındırır. Cloudflare hem Clerk bot koruması hem asistan tünelidir. Google Fonts ve OpenStreetMap yalnız açık rıza varsa çağrılır.",
      "KVKK md. 8 ve md. 9 kapsamında bu aktarımlar hizmetin sunulması için yapılır. ABD'de CLOUD Act kapsamı Clerk ve Vercel için geçerlidir; ayrı bir Adequacy kararı bu metinde iddia edilmez. Clerk veya Vercel'in kendi DPA metinleri bu ürünün imzaladığı bir sözleşme gibi yazılmaz.",
    ],
  },
  {
    id: "sure",
    title: "Saklama",
    paragraphs: [
      "Clerk hesabı silinene kadar durur. Hesaplı sohbet bu tarayıcının localStorage kaydı ve hesap kimliği ile sınırlıdır. Demo tuşu ortak sohbeti Pi üzerinde tutar; o kayıt herkese açıktır. Pi üzerinde hesaplı soru geçici işlenir. Paketler panoda son 24 saattir. Çerez tercihi bu tarayıcıda kalır.",
    ],
  },
  {
    id: "haklar",
    title: "KVKK md. 11 hakları",
    paragraphs: [
      "Veri konusu kişi öğrenme, düzeltme, silme, aktarılan üçüncü kişileri bilme, itiraz ve zararın giderilmesini isteme hakkına sahiptir. Bu üründe sohbet bu tarayıcıda hesaba yazılır; indirme ve silme bu sayfadadır. Clerk hesabı UserButton veya bu sayfadaki silme ile kapanır.",
      "Başvuru KVKK md. 13 usulüne göredir. Cevap süresi 30 gündür. Kurul'a (Kişisel Verileri Koruma Kurulu, Ankara) şikayet yolu açıktır. BTK elektronik haberleşme çerez kuralları isteğe bağlı çerez için ret imkânını zorunlu kılar; ret kabul ile aynı yerdedir.",
    ],
    list: [
      "Kişisel veri işlenip işlenmediğini öğrenme",
      "İşlenmişse buna ilişkin bilgi talep etme",
      "İşleme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme",
      "Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme",
      "Eksik veya yanlış işlenmişse düzeltilmesini isteme",
      "Silinmesini veya yok edilmesini isteme",
      "Düzeltme ve silmenin aktarıldığı üçüncü kişilere bildirilmesini isteme",
      "Otomatik sistemlerle analiz sonucu aleyhine bir sonucun çıkmasına itiraz",
      "Kanuna aykırı işleme nedeniyle zararın giderilmesini talep etme",
    ],
  },
  {
    id: "gdpr",
    title: "GDPR (AB) ve ABD",
    paragraphs: [
      "AB sakinleri için GDPR md. 13/14 bilgilendirme, md. 15 erişim, md. 16 düzeltme, md. 17 silme, md. 20 taşınabilirlik bu sayfadaki indirme ve silme ile karşılanır. Açık rıza md. 7 uyarınca Çerezler sayfasından geri çekilir. Şikayet, ilgili ülkenin denetim makamına yapılır.",
      "Hesaba yönelik otomatik karar (GDPR md. 22) yoktur. İstasyon paketindeki sıcaklık, gaz ve alev sınıflandırması kişi profillemesi değildir.",
      "Satış yoktur. Reklam ağı yoktur. Kaliforniya CCPA/CPRA: kişisel veri satılmaz ve reklam için paylaşılmaz. Do Not Sell or Share talebi bu ürün için fiilen boştur; yine de sohbet silme ve hesap silme çalışır. 18 yaşından küçüklerden hesap istenmez.",
    ],
  },
  {
    id: "sinir",
    title: "Sınır",
    paragraphs: [
      "Bu metin ürünün KVKK aydınlatma metnidir. VERBIS kaydı, avukat onayı ve Clerk üretim anahtarı veri sorumlusunun işidir. GDPR sertifikası iddiası yoktur.",
    ],
  },
];

function rowText(row) {
  return Object.values(row).join(" ");
}

export function privacyBlob() {
  return [
    NOTICE_DATE,
    Object.values(CONTROLLER).join(" "),
    ...DATA_ROWS.map(rowText),
    ...PROCESSOR_ROWS.map(rowText),
    ...COOKIE_ROWS.map(rowText),
    ...COOKIE_INTRO,
    ...PRIVACY_SECTIONS.flatMap((row) => [
      row.title,
      ...(row.paragraphs || []),
      ...(row.list || []),
    ]),
  ].join("\n");
}
