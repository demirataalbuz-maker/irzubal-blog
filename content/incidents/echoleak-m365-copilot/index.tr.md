---
title: "EchoLeak: Tek bir e-postayla Microsoft 365 Copilot'tan veri sızdırmak"
date: 2026-09-27
summary: "Aim Labs, M365 Copilot'ın gelen bir e-postadaki gizli talimatlara uyup kurum içi verileri kullanıcı hiçbir şeye tıklamadan dışarı taşıyabildiğini gösterdi. Microsoft açığı sunucu tarafında kapattı."
incident_date: 2025-06-11
org: "Microsoft 365 Copilot"
severity: critical
cvss: "9.3"
status: confirmed
cve: "CVE-2025-32711"
buckets: ["ai-system-vulnerability"]
owasp: ["LLM01", "LLM02", "LLM05"]
atlas: ["AML.T0051.001", "AML.T0068", "AML.T0057", "AML.T0077"]
sources:
  - publisher: "Microsoft MSRC"
    title: "CVE-2025-32711: M365 Copilot Information Disclosure Vulnerability"
    date: "2025-06-11"
    url: "https://msrc.microsoft.com/update-guide/vulnerability/CVE-2025-32711"
  - publisher: "CVE Program"
    title: "CVE-2025-32711 kaydı (CVSS 3.1 vektörü, CWE-74)"
    date: "2025-06-11"
    url: "https://www.cve.org/CVERecord?id=CVE-2025-32711"
  - publisher: "Aim Labs (Aim Security)"
    title: "EchoLeak: ilk açıklama ve saldırı zinciri"
    date: "2025-06-11"
    url: "https://www.aim.security/lp/aim-labs-echoleak-blogpost"
  - publisher: "Reddy & Gujral, arXiv:2509.10540"
    title: "EchoLeak: The First Real-World Zero-Click Prompt Injection Exploit in a Production LLM System"
    date: "2025-09"
    url: "https://arxiv.org/abs/2509.10540"
  - publisher: "OWASP GenAI Security Project"
    title: "OWASP Top 10 for LLM Applications 2025"
    url: "https://genai.owasp.org/llm-top-10/"
  - publisher: "MITRE ATLAS"
    title: "AML.T0051.001 LLM Prompt Injection: Indirect"
    url: "https://atlas.mitre.org/techniques/AML.T0051.001"
---

## Ne oldu

Haziran 2025'te Aim Security'nin araştırma ekibi Aim Labs, Microsoft 365 Copilot'ta **EchoLeak** adını verdiği bir açığı yayımladı [[1]](#src-1) [[3]](#src-3). Saldırganın tek yapması gereken, hedef kuruluştaki birine e-posta göndermekti. Kurbanın e-postayı açması, bir bağlantıya tıklaması ya da Copilot'a o e-postayı sorması gerekmiyordu. Kullanıcı daha sonra Copilot'a sıradan bir iş sorusu sorduğunda Copilot, e-postadaki talimatları da bağlama alıyor ve kurum içi veriyi saldırganın sunucusuna taşıyan bir yanıt üretiyordu.

Microsoft açığa **CVE-2025-32711** numarasını verdi, "kritik" olarak sınıflandırdı (CVSS 3.1: 9.3) ve düzeltmeyi sunucu tarafında yaptı. Müşterilerin bir şey yapması gerekmedi. Açığın gerçek saldırılarda kullanıldığına dair bir iz bildirilmedi [[1]](#src-1) [[4]](#src-4).

| Tarih | Olay |
|---|---|
| Ocak 2025 | Aim Labs açığı buluyor ve Microsoft'a (MSRC) bildiriyor [[4]](#src-4) |
| 9 Nisan 2025 | CVE numarası ayrılıyor [[2]](#src-2) |
| Mayıs 2025 | Microsoft düzeltmeyi sunucu tarafında yayına alıyor [[4]](#src-4) |
| 11 Haziran 2025 | CVE ve Aim Labs raporu kamuya açıklanıyor [[1]](#src-1) [[3]](#src-3) |
| Eylül 2025 | Saldırı zincirini ayrıntılı inceleyen akademik makale yayımlanıyor [[4]](#src-4) |

## Tehdit

- **Saldırgan kim:** Kuruma e-posta gönderebilen herhangi biri. Hesap, parola ya da iç erişim gerekmiyor. CVSS vektöründe bu `PR:N` (yetki yok) ve `UI:N` (kullanıcı etkileşimi yok) olarak geçiyor [[2]](#src-2).
- **Neye ulaşıyor:** Copilot'ın o kullanıcı adına okuyabildiği her şeye: e-postalar, OneDrive dosyaları, SharePoint içerikleri, Teams yazışmaları [[3]](#src-3) [[4]](#src-4). Saldırgan veriye kendisi dokunmuyor. Veriyi Copilot toplayıp dışarı taşıyor.
- **En kötü senaryo:** Kullanıcının erişebildiği gizli bir belge (satın alma planı, müşteri listesi, bir belgede unutulmuş erişim anahtarı) tek bir e-postayla ve kimse fark etmeden dışarı çıkıyor. Kullanıcı hiçbir uyarı görmüyor. Kayıtlarda yalnızca sıradan bir Copilot sohbeti duruyor.

## Açık nerede

Tek bir hata yoktu; dört ayrı savunma arka arkaya aşıldı. Hepsinin altındaki tasarım kusuruna Aim Labs **LLM kapsam ihlali** (LLM Scope Violation) adını verdi: dışarıdan gelen güvenilmeyen bir metin (saldırganın e-postası), kullanıcının ayrıcalıklı verisiyle aynı bağlam penceresine giriyor ve model ikisini birbirinden ayıramıyor [[3]](#src-3) [[4]](#src-4).

1. **Prompt enjeksiyonu sınıflandırıcısı atlatıldı.** Microsoft'un XPIA (cross-prompt injection attack) sınıflandırıcısı, modele talimat vermeye çalışan içerikleri yakalamak için vardı. Talimatlar yapay zekâya değil, e-postayı okuyan bir insana yazılmış gibi ifade edilince sınıflandırıcı bunları zararsız saydı [[4]](#src-4).
2. **Bağlantı temizleme atlatıldı.** Copilot yanıtlardaki dış bağlantıları temizliyordu, ama yalnızca `[metin](adres)` biçimindeki satır içi Markdown bağlantılarını. Referans biçimindeki bağlantılar (`[metin][ref]` ve altta `[ref]: adres`) filtreden geçiyordu [[4]](#src-4).
3. **Görsel kendiliğinden yüklendi.** Yanıta referans biçiminde bir görsel konunca tarayıcı onu kullanıcı hiçbir şeye tıklamadan indiriyor. Görsel adresine gömülen veri de bu istekle birlikte gidiyor [[4]](#src-4).
4. **İçerik güvenliği politikası (CSP) atlatıldı.** Tarayıcı görselleri yalnızca izin verilen Microsoft alan adlarından yüklüyordu. Ama izinli adreslerden biri olan Teams'in bağlantı önizleme servisi, kendisine verilen herhangi bir adresi sunucu tarafında çağırıyordu. İstek böylece "güvenilir" bir Microsoft adresi üzerinden saldırganın sunucusuna ulaştı [[4]](#src-4).

Microsoft açığı CWE-74 (çıktının bir sonraki bileşende enjeksiyona yol açması) olarak sınıflandırdı [[2]](#src-2).

**Eşleme**

| Çerçeve | Madde | Bu olaydaki karşılığı |
|---|---|---|
| OWASP | LLM01 Prompt Enjeksiyonu | Dolaylı enjeksiyon: talimat kullanıcıdan değil, modelin okuduğu e-postadan geliyor |
| OWASP | LLM02 Hassas Bilgi İfşası | Kullanıcının yetkili olduğu veri, yetkisiz bir üçüncü kişiye gidiyor |
| OWASP | LLM05 Hatalı Çıktı İşleme | Modelin ürettiği Markdown doğrulanmadan tarayıcıda işleniyor ve görsel isteği atılıyor |
| ATLAS | AML.T0051.001 | E-posta üzerinden dolaylı prompt enjeksiyonu |
| ATLAS | AML.T0068 | Talimatların sınıflandırıcıdan kaçacak biçimde yazılması |
| ATLAS | AML.T0057 | Modelin bağlı olduğu veri kaynaklarından sızıntı |
| ATLAS | AML.T0077 | Verinin, yanıt işlenirken (görsel yüklenirken) dışarı taşınması |

## Saldırgan gözü

Saldırganın bakışından EchoLeak şık bir zincir, çünkü her adım tek başına "küçük" görünen bir boşluğu kullanıyor:

1. **E-postayı yaz.** E-posta, bir çalışana yazılmış sıradan bir iş notu gibi görünür. Talimatlar bu notun içine, insana hitap eden cümleler olarak gömülür.
2. **Bulunmasını sağla.** Copilot her soruda tüm posta kutusunu okumaz, soruyla ilgili bulduğu içerikleri bağlama çeker. Bu yüzden e-posta, çalışanların sık sorduğu konulara (izin, İK, proje) benzeyecek şekilde yazılır ki bağlama girme şansı artsın.
3. **Bekle.** Kurban bir gün Copilot'a ilgili bir soru sorduğunda e-posta bağlama girer. Saldırganın o anda bir şey yapması gerekmez.
4. **Veriyi paketle.** Talimat, modelden bağlamdaki en hassas bilgiyi alıp bir görsel adresinin parametresine koymasını ister.
5. **Kanalı aç.** Referans biçimli görsel ile izinli bir Microsoft adresi üzerinden yönlendirme bir araya gelince tarayıcı isteği kendiliğinden atar. Veri, saldırganın sunucu kayıtlarına düşer.

Bir saldırgan bundan sonra şunları dener: aynı zinciri başka giriş kanallarıyla kurmak (paylaşılan belge, Teams mesajı, takvim daveti); filtrelerin unuttuğu bir sonraki Markdown biçimini aramak; izin listesinde, adres alıp sunucu tarafında çağıran başka bir servis bulmak. Çıktı filtresi kara listeyle çalışıyorsa, saldırganın işi listede olmayan biçimi bulmaktır.

## Nasıl düzelirdi

### a) Savunan taraf: Microsoft 365 ve onu kullanan kurum

- **Çıktıyı beyaz listeyle işle.** Kara liste (yalnızca satır içi bağlantıları temizlemek) her zaman bir biçimi kaçırır. Yanıtta dış adrese giden her bağlantı ve görsel, yazım biçiminden bağımsız olarak ya kaldırılmalı ya da kullanıcı onayına bağlanmalı [[4]](#src-4).
- **CSP izin listesini denetle.** İzinli bir alan adı, başka adreslere istek atan bir servis barındırıyorsa (önizleme, proxy, yönlendirme), o liste pratikte her yere izin veriyor demektir.
- **Dış içeriği ayrı tut.** Kuruluş dışından gelen e-posta, iç verilerle aynı bağlama alınmamalı. Alınıyorsa açıkça "güvenilmeyen kaynak" olarak işaretlenmeli [[4]](#src-4).
- **Kurum tarafında kapsamı daralt.** Copilot kullanıcının erişebildiği her şeyi okuyabildiği için aşırı paylaşılmış SharePoint siteleri ve "herkese açık" klasörler doğrudan risk. Hassas belgeler etiketlenmeli ve AI asistanın işleyebileceği içerikten çıkarılmalı.

### b) AI tarafı: ajan korumaları, yetkiler, izleme

- **Talimatla veriyi ayır.** Bağlama giren her parçaya kaynak etiketi eklenmeli (kullanıcı, iç belge, dış e-posta) ve dış kaynaktan gelen metin talimat olarak işlenmemeli. Bu tek başına yetmez, ama sınıflandırıcının tek savunma hattı olmasını engeller [[4]](#src-4).
- **Sınıflandırıcıya tek başına güvenme.** XPIA sınıflandırıcısı insana hitap eder gibi yazılmış talimatları kaçırdı. Giriş sınıflandırıcısı, çıktı denetimi ve ağ kısıtı ayrı katmanlar olarak birlikte çalışmalı.
- **Kapsam ihlalini doğrudan engelle.** Bir yanıt hem güvenilmeyen bir kaynaktan içerik hem hassas bir iç belge kullanıyorsa ve dış bir adres içeriyorsa, yanıt engellenmeli ya da onaya düşmeli.
- **İzle.** Yanıtlardaki dış adresler, uzun kodlanmış parametreler ve görsel referansları kaydedilip uyarı üretmeli. EchoLeak'te kullanıcı hiçbir şey görmedi; tespit ancak çıktı ve ağ kayıtlarından yapılabilirdi.

## Ne öğrendim

- Prompt enjeksiyonu tek başına sonuç değil, bir tetikleyici. Zararın büyüklüğünü arkasından gelen çıktı işleme ve ağ katmanındaki küçük boşluklar belirliyor.
- Kara listeyle yazılmış her filtre saldırgana "listede olmayanı bul" görevini veriyor. EchoLeak'te bu, tek bir Markdown yazım biçimiydi.
- "Güvenilir alan adı", o alan adında başka adresleri çağıran bir servis varsa anlamını yitiriyor.
- Bu zinciri kendi ajan test ortamımda sahte bir gelen kutusu ve görsel isteğini yakalayan yerel bir sunucuyla yeniden kurup, yerel modellerin dış e-postadaki talimata uyup uymadığını ölçmek istiyorum.
