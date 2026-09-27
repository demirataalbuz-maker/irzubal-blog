# irzubal-blog: yazı tarifi

Kullanıcı bir haber ya da olay verip "bunu yaz" dediğinde izlenecek kurallar.

## Akış
1. Olayı birincil kaynaklardan doğrula: üretici bildirimi (MSRC, GHSA, vendor blog), CVE kaydı (`https://cveawg.mitre.org/api/cve/<ID>` JSON'u CVSS ve CWE için güvenilir), araştırmacının kendi yazısı, varsa makale. Yalnızca ikincil haber sitesine dayanan iddiayı yazma ya da "bildirildi" diye işaretle.
2. `content/incidents/<kisa-ad>/index.tr.md` ve `index.en.md` yaz. İkisi aynı ön bilgiyi taşır; yalnızca `title`, `summary`, `chain` ve metin çevrilir. `sources`, `tags` ve diğer tüm alanlar iki dosyada birebir aynı olmalı (CMS'te `i18n: duplicate`; farklı olursa paneldeki ilk kayıt TR değerini EN'e yazar).
3. Altı bölüm, bu sırayla ve bu başlıklarla (CSS numaralandırıyor, başka `##` ekleme):
   TR: Ne oldu / Tehdit / Açık neredeydi / Saldırgan gözüyle / Nasıl düzelirdi / Ne öğrendim
   EN: What happened / The threat / Where the flaw was / Attacker's view / How it could have been fixed / What I learned
   "Nasıl düzelirdi" altında iki `###`: a) savunan taraf, b) AI tarafı (ajan korumaları, yetkiler, izleme).
3b. Ön bilgideki `chain:` listesi yazının imza şemasıdır: 4-6 adım, her adımda `attack` (saldırının o adımı) ve `defense` (zinciri o adımda kıracak kontrol). Kısa ve somut tut; iki dilde de doldur.
4. Metin içi kaynak: `[[n]](#src-n)`; n, ön bilgideki `sources` sırası.
5. `hugo --gc --minify` uyarısız bitmeli; önizlemede bilgi kutusu, çipler ve `/tags/` filtresi kontrol edilir.

## Doğruluk kuralları
- OWASP kimlikleri **2025** listesine göre (`data/owasp.yaml`). 2023 numaraları farklı (ör. 2023'te LLM06 = Sensitive Information Disclosure; 2025'te LLM02).
- ATLAS kimliği yalnızca `data/atlas.yaml`'da varsa kullanılır. Yoksa önce resmi veriden doğrula: `mitre-atlas/atlas-data` → `dist/v6/ATLAS-latest.yaml` (içinde güncel dosya adı yazar), sonra dosyayı yeniden üret.
- Önem derecesi: varsa üreticinin CVSS'i; yoksa gerekçesini "Tehdit" bölümüne yaz.
- `status: disputed`: üretici olayı ya da etkisini reddediyorsa, kaynaklar çelişiyorsa.
- "Saldırgan gözü" kavramsal kalır; çalışır payload, hazır exploit kodu ya da hedef listesi yazılmaz.
- Kaynak metin kopyalanmaz; kendi cümlelerimizle yazılır, alıntı en fazla bir kısa cümle.
- "Ne öğrendim" kullanıcının sesi: taslak yazılır ve kullanıcıya gözden geçirmesi söylenir.

## Dil ve üslup
- Türkçe doğal ve sade; teknik terimin ilk geçtiği yerde parantez içinde İngilizcesi.
- Uydurma sayı, tarih ya da alıntı yok. Emin olunmayan tarih "Ocak 2025" gibi ay düzeyinde verilir.

## Tasarım ("Mor Baskı")
- Kırmızı = saldırı, mavi = savunma, mor = ikisi (purple team). Bölüm renkleri sabit sıradan gelir (1 olay, 2-4 kırmızı, 5 mavi, 6 mor); başlık sırasını bozma.
- Vurgu rengi hep mor (`--accent`); kullanıcı 2026-09-27'de mercek düğmesini (kırmızı/mavi) kaldırttı, geri ekleme. Baskı (`data-theme`, gece/gündüz) `assets/js/theme.js`'de; `?edition=day` bağlantısı çalışır.
- Fontlar `static/fonts/` altında gömülü (OFL); dışarıdan font/betik yükleme, CSP sıkı.
- Şablonlarda `data-on…` ile başlayan öznitelik kullanma: Go html/template `data-` önekini atıp `on*` olay özniteliği sanıyor ve değeri JS dizesi olarak tırnaklıyor.
- İngilizce sayılı metinler i18n'de `one`/`other` biçimli; `i18n "anahtar" sayı` ile çağır.

## Yönetim paneli (irzubal.com/admin)
- Sveltia CMS, `static/admin/`. Şema `static/admin/config.yml`; alan adları ön bilgiyle birebir aynı, yeni alan eklersen ikisini birlikte güncelle.
- ATLAS seçim listesi üretilir: `data/atlas.yaml` değişince `python tools/cms-atlas-secenekleri.py`.
- Sveltia sürümü sabit + SRI: güncellemek için `sh tools/sveltia-guncelle.sh [sürüm]` (unpkg ile jsDelivr özetlerini karşılaştırır).
- `/admin/*` kendi CSP'sini `netlify.toml`'dan alır; genel sitenin CSP'sini gevşetme.
- Panelde metin editörü ham Markdown modunda açılır; zengin metin modu `[[1]](#src-1)`, tablo ve `{.linkrow}` sözdizimini bozabilir.

## Yayın
- Netlify, GitHub deposuna bağlı; push = yayın. DNS Squarespace'te, MX/TXT kayıtlarına asla dokunma.
- Push etmeden önce kullanıcıya sor.
