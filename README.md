# irzubal.com

Gerçek AI güvenlik olaylarını saldırı ve savunma tarafından inceleyen iki dilli (TR/EN) portfolyo blogu. Hugo ile üretilen statik site; arka uç, veritabanı ya da giriş yok.

## Yapı

```
content/
  _index.tr.md / _index.en.md        ana sayfa
  incidents/<olay>/index.tr.md       olay analizi (Türkçe)
  incidents/<olay>/index.en.md       aynı analiz (İngilizce), aynı klasörde
  about.tr.md / about.en.md          Hakkında
  tags.tr.md / tags.en.md            etiket filtresi sayfası
data/owasp.yaml                      OWASP LLM Top 10 (2025) adları, TR + EN
data/atlas.yaml                      MITRE ATLAS teknik adları (ATLAS-2026.09)
i18n/tr.yaml, i18n/en.yaml           menü, etiket ve arayüz metinleri
layouts/                             şablonlar (tema yok, hepsi burada)
assets/css/main.css                  tasarım (renk değişkenleri en üstte)
archetypes/incidents.md              yeni yazı iskeleti
```

Türkçe kök adreste (`/`), İngilizce `/en/` altında. Aynı klasördeki `index.tr.md` ve `index.en.md` otomatik eşleşir; dil düğmesi aynı yazının öbür diline gider.

## Yeni olay ekleme

```bash
hugo new content incidents/olay-adi/index.tr.md
```

Sonra aynı klasöre `index.en.md` ekle, iki dosyayı doldur, `draft: true` satırını sil. Etiketler ön bilgide:

| Alan | Değerler |
|---|---|
| `buckets` | `ai-as-attacker`, `ai-system-vulnerability` |
| `owasp` | `LLM01` … `LLM10` |
| `atlas` | `AML.T0051.001` gibi, `data/atlas.yaml`'daki kimlikler |
| `severity` | `low`, `medium`, `high`, `critical` |
| `status` | `confirmed`, `disputed` |

## Yerelde çalıştırma

```bash
hugo server
```

`http://localhost:1313` adresinde açılır, dosyayı kaydettikçe yenilenir.

## Yayın (Netlify + GitHub)

Site Netlify'da duruyor; DNS Squarespace'te kalıyor ve ona dokunulmuyor (Google Workspace mail kayıtları orada).

1. Bu klasör GitHub'da bir depoya push edilir.
2. Netlify → irzubal.com sitesi → **Site configuration → Build & deploy → Continuous deployment → Link repository** → GitHub → bu depo.
3. Derleme ayarları `netlify.toml`'dan gelir (`hugo --gc --minify`, yayın klasörü `public`, Hugo 0.166.0). Başka bir şey girmeye gerek yok.
4. Bundan sonra her `git push` siteyi birkaç dakikada günceller.

`netlify.toml` ayrıca güvenlik başlıklarını ekler (sıkı CSP, HSTS, X-Frame-Options vb.). Sayfalarda satır içi betik ya da stil yok, CSP'yi gevşetme.

## Yönetim paneli (irzubal.com/admin)

[Sveltia CMS](https://sveltiacms.app) ile tarayıcıdan yazı ekleme/düzenleme. Her kayıt `main` dalına commit atar, Netlify siteyi yeniden yayınlar.

**Bir kerelik kurulum (GitHub ile giriş):**

1. GitHub → Settings → Developer settings → **OAuth Apps** → **New OAuth App**
   - Application name: `irzubal CMS`
   - Homepage URL: `https://irzubal.com`
   - Authorization callback URL: `https://api.netlify.com/auth/done`
   - **Register application** → Client ID'yi kopyala → **Generate a new client secret** → secret'ı kopyala (bir kez gösterilir).
2. Netlify → irzubal.com projesi → **Project configuration → Security → OAuth** → Authentication providers → **Install provider** → **GitHub** → Client ID ve Client Secret'ı yapıştır → **Install**.
3. `https://irzubal.com/admin/` → **Sign In with GitHub**.

Alternatif (en az yetki): **Sign In Using Access Token** ile yalnızca bu depoya `Contents: Read and write` izni olan fine-grained token kullanılabilir.

**Dosyalar:** `static/admin/index.html` (Sveltia, sabit sürüm + SRI), `static/admin/config.yml` (alanlar), `tools/cms-atlas-secenekleri.py` (ATLAS listesi), `tools/sveltia-guncelle.sh` (sürüm yükseltme). Yüklenen görseller `static/images/` altına gider.

**Güvenlik:** Genel sitenin CSP'si değişmedi. `/admin/*` kendi CSP'sini `netlify.toml`'dan alır (Netlify aynı başlığı birleştirmiyor, yalnızca bu kural uygulanıyor; 2026-09-27'de canlıda doğrulandı).
