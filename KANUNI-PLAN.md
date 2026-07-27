# Kanuni Sultan Süleyman — Makale Planı

> **Durum:** plan. Kod yazılmadı.
> **Rota:** `/articles/kanuni` · **Kategori:** Tarih · **Emoji:** ⚖️
> **Seri:** Sezar → Augustus → Fatih → **Kanuni** (4. parça)
> **Talep verisi:** Türkçe Vikipedi'de *I. Süleyman* aylık **63.000–70.000** okunma (Kas 2025 / Mar 2026 / Haz 2026 ölçümleri)

---

## 1. Tez — makale neyi iddia ediyor

Serinin kuralı aynı: **kahraman ya da canavar değil, bir vaka.** Ve **sıfat değil, sayı.**

Her parçanın bir teşhisi var:

| Makale | Teşhis |
|---|---|
| Sezar | Merhamet bir silahtı — ve bir ölüm fermanı |
| Augustus | Reddederek almak |
| Fatih | Bir fikrin ele geçirdiği adam |
| **Kanuni** | **Kanunu yazan adamın kendi kanununa yenilmesi** |

**Merkez soru:** *Kanunu yazan adam, kendi kanununa yenilir mi?*

**Çatı:** Aynı adama Batı **"Muhteşem"**, Doğu **"Kanunî"** dedi. İkisi de eksik ve ikisi de aynı şeyi anlatıyor: bu adam bir **düzen** kurdu — ve o düzen sırayla en yakın dostunu, en sevilen oğlunu ve ikinci oğlunu yuttu. Hepsi usulüne uygun. Hiçbiri kanunsuz değil.

**Seriye bağlanma noktası (kritik):** Oğullarını öldüren kural — kardeş katli maddesi — **Fatih Kanunnâmesi'nden** gelir. Fatih kuralı yazdı; Süleyman kuralın içinde yaşamak zorunda kaldı. Bu, iki makaleyi birbirine kilitleyen gerçek bir tarihsel bağ, uydurma bir köprü değil. Üstelik maddenin **gerçekten Fatih'e ait olup olmadığı tartışmalı** — bu da makalenin en iyi Kaynak Karşılaştırıcı bölümü olur.

### Editöryel korkuluklar (pazarlıksız)

1. **Politika yok.** Ne övgü ne yergi. Sıfat yerine sayı, iddia yerine kaynak.
2. **Şehzade Mustafa bölümü Türkiye'de duygusal yüklü bir konu** (Muhteşem Yüzyıl tartışması). Çözüm: tek bir anlatıcıya yaslanma; Osmanlı kroniği + Venedik balyos raporu + modern tarihçi (Zahit Atçıl) yan yana. Okuru ikna etme, **kaynakları göster, kararı ona bırak.**
3. Kesin bilinmeyen hiçbir şey kesinmiş gibi yazılmayacak (ör. 42 gün rakamı, Mohaç top sayısı, zehir/entrika iddiaları). Belirsizlik `MythNote` / `SourceNote` ile **açıkça** işaretlenir.

---

## 2. Palet ve kimlik — İznik

Seride her makalenin kendi rengi var (Fatih: obsesyon mavisi + altın). Kanuni'nin paleti **İznik çinisi** — tarihsel olarak dürüst, seride benzersiz:

```ts
// app/articles/kanuni/ui.tsx
export const ACCENT   = '#2fb8ae'; // İznik turkuazı — nizam, su, düzen
export const BG       = '#070c1e'; // kobalt gece — divan, mürekkep
export const GOLD     = '#d9a441'; // tuğra, miğfer, ihtişam (Batı'nın gördüğü)
export const CORAL    = '#dd4b3e'; // İznik mercan kırmızısı — infaz, kan, kesme
export const COBALT   = '#3355c4'; // çini mavisi — hukuk metni, ferman
export const MARBLE   = '#e8e6df'; // Süleymaniye mermeri
export const ASH      = '#7c8190'; // silinen, belirsiz, ölü
```

**Renk dramaturjisi:** Perde 0–4 turkuaz/kobalt hâkim (düzen kuruluyor). Perde 5'ten itibaren mercan kırmızısı sayfaya sızar (düzen kendini yemeye başlıyor). Perde 8'de yalnız altın + mermer kalır.

---

## 3. Three.js hero — sayfanın açılışı

### ✅ Önerilen: **Dört Taçlı Venedik Miğferi** (`ThreeCrownHero.tsx`)

**Neden bu obje:** 1532'de Venedikli kuyumcu Luigi Caorlini'ye **İbrahim Paşa'nın siparişiyle** yaptırıldı. Avusturya tipi bir miğferin içine **dört taç** yerleştirilmiş; üstünde hilal tutan sorguç. Papa'nın **üç katlı** tiarasını sayıca geçmek için tasarlandı — yani "evrensel hükümdarlık" iddiası. Ve muhtemelen **Süleyman bunu hiç takmadı**: Batılı elçileri etkilemek için yanına konulan bir sergi objesiydi.

**Tasarım hamlesi — hero'nun kendisi makalenin ilk tuzağı:** Okur 20 saniye boyunca dönen mücevherli tacı izler. Perde 1'de öğrenir ki o taç bir **rekvizit**tir, Venedik'te sipariş üzerine üretilmiştir, ve siparişi veren adam dört yıl sonra boğdurulacaktır. Hero objesi, "Muhteşem" isminin nasıl **imal edildiğinin** kanıtı olur.

**Teknik:**
- Saf primitif geometri — **dış varlık/lisans riski sıfır**: `LatheGeometry` (miğfer kubbesi) + 4 × `TorusGeometry` (taç katmanları, artan yarıçapla) + `ConeGeometry`/kıl şeritleri (sorguç) + küçük `SphereGeometry`lerden mücevher dizisi + `TorusGeometry` yay parçasıyla hilal.
- `MeshStandardMaterial` — metalness 0.92 / roughness 0.22, `GOLD`; mücevherler için ayrı emissive materyal (zümrüt + yakut noktaları).
- Işık: 1 × `DirectionalLight` (anahtar) + 1 × düşük yoğunluklu `HemisphereLight`. **HDR/env-map YOK** (dış istek = CSP + performans sorunu); yansıma hissi fresnel'le çözülür.
- Hareket: yavaş Y ekseni dönüşü (~0,12 rad/sn) + hafif salınım. Taçlar **çok az** farklı hızda dönebilir (katmanlı iş hissi).
- Zemin: mevcut `ArticleHero` shader gradyanı (kobalt gece) — **tek WebGL bağlamı**, `Object3DHero` desenindeki gibi.

### Alternatif (ikinci tercih): **3B Tuğra** (`ThreeTughraHero.tsx`)

Süleyman'ın tuğrasının SVG path'i `THREE.Shape` → `ExtrudeGeometry` ile altın kabartmaya çevrilir; yükleme anında üç dikey tuğ kalem darbesi gibi yukarı çıkar. `/articles/kaligrafi` ile doğal iç link.

**Riskler:** (1) path'in lisansı doğrulanmalı — tuğranın kendisi 16. yy (kamu malı) ama modern SVG çizimi olmayabilir; en temizi **kendi vektörümüzü çizmek**. (2) Arap yazısı ekstrüde edildiğinde mobilde küçük boyutta çamurlaşabilir → okunabilirlik ölçülmeli.

**Karar:** Miğfer hero'da, **tuğra finalde** (Perde 8 mühür tuzağı). Böylece sayfa "sahte taçla açılıp gerçek imzayla kapanır."

### Performans kuralları (mevcut desenden, pazarlıksız)

- `heroPerf.ts` → `deviceTier()`, `dprCap()` (dpr ≤ 1.75), `makeFpsGuard()` (**ısınma penceresi şart**, yoksa ilk karelerde yanlış karar verir).
- `IntersectionObserver` → ekran dışındayken `rAF` **durur**.
- `prefers-reduced-motion` → tek statik kare.
- **Cleanup'ta `loseContext()` ÇAĞRILMAZ** — Strict Mode'da bağlamı öldürür, dev'de hero görünmez olur.
- WebGL başlatılamazsa canvas gizlenir, arkadaki radyal gradyan görünür (zarif fallback).
- Okunabilirlik **ölçülür**: hero başlığının 4 köşesinde luminans kontrastı; kaza her seferinde alt başlıkta oluyor.

---

## 4. Perde perde yapı

Sekiz perde + final. Her perde bir sahne, bir sayı seti, bir interaktif.

---

### PERDE 0 · COLD OPEN — "Kırk iki gün" (Zigetvar, 7 Eylül 1566)

**Sahne:** Macaristan'da bir kale kuşatması. Çadırda 71 yaşında bir adam ölüyor. Vezir-i âzam Sokollu Mehmed Paşa ölümü **saklıyor**. Ordu yürümeye devam ediyor, divan toplanıyor, fermanlar çıkıyor, mühür basılıyor — **ölü bir adamın adına.** Yatağına başkası yatırılıyor. İç organları çadırın yerine gömülüyor, ceset tahnit ediliyor.

**Kapanış cümlesi:** *"Bu adam öldükten sonra bile kanunu işletiyordu. Peki yaşarken ne yaptı?"*

**Modül:** Yok. Saf metin + tek görsel. (Fatih'in Truva açılışıyla aynı ritim: garip bir sahne, sonra geri sarma.)

**Sayılar:** 6/7 Eylül 1566 gecesi · 71 yaşında · ölüm ~42 gün gizlendi *(kaynak: Afyoncu; süre kaynaklarda değişir → `MythNote` ile işaretlenecek)* · defin 28 Kasım 1566, Süleymaniye.

---

### PERDE 1 · İKİ İSİM — "Muhteşem" nasıl imal edildi (1520–1532)

**Sahne:** 30 Eylül 1520'de tahta çıkan adama Batı "Magnificent", Doğu "Kanunî" dedi. Aynı adam, iki ayrı ad. Peki "Muhteşem" adı nereden geldi? Kısmen **satın alındı.**

**Modül A — `VenetianCrown` (hero'nun ifşası):** Miğferin katmanlı sökümü. Okur her tacın üstüne dokunur:
- 1. taç → "Papa'nın tiarası üç katlı"
- 2. taç → "Şarlken'in tacı"
- 3. taç → "…"
- 4. taç → **"Dört. Sayıyla üstünlük iddiası."**
Sonra ifşa: sipariş İbrahim Paşa'dan, yapım Venedik (Luigi Caorlini), tarih 1532, kullanım **savaş değil — Batılı elçilere sergi.** Kapanış satırı: *"Bu makalenin başında hayran hayran izlediğin obje, bir propaganda rekvizitiydi. Ve siparişi veren adam dört yıl sonra boğdurulacak."*

**Modül B — `SourceCompare` (paylaşılan bileşen):** Aynı hükümdar, üç kalem:
| Kaynak | Rol | Ne gördü |
|---|---|---|
| Venedik balyosu (relazione) | rakip devletin gözlemcisi | ihtişam, gelir, ordu büyüklüğü |
| Osmanlı kâtibi / münşeat | saray | nizam, adalet, kanun |
| Habsburg propaganda broşürü | düşman matbaası | tehdit, "Türk korkusu" |

---

### PERDE 2 · KANUN MAKİNESİ — "Kanunî" ne demek (1530'lar–1550'ler)

**Sahne:** "Kanunî" sıfatı romantik bir övgü değil, teknik bir tanım. Osmanlı'da **şeriat** (değişmez) ile **kanun** (padişahın örfî hukuku) yan yana çalışır; Şeyhülislam **Ebussuud Efendi** ikisini birbirine dikişleyen adamdır. Kanunnâme'nin ünlü ilkesi: *memur ya da halktan, zengin ya da fakir, şehirli ya da köylü — suç işlediğinde kanun önünde eşittir.*

**Modül — `DivandaBirDava` (interaktif yargı):** Okura kanunnâmeden alınmış **3 gerçek dava tipi** verilir; her birinde 3 şık. Okur hükmü verir, sonra kanunnâmenin **gerçek** hükmünü görür — ve çoğu zaman şaşırır (Osmanlı ceza hukuku beklenenden çok daha fazla **para cezası** temellidir).

*Araştırma gerekli:* dava metinleri Uriel Heyd, *Studies in Old Ottoman Criminal Law* + Ebussuud fetvaları + Uzunçarşılı'dan alınacak. **Uydurulmayacak.**

**Neden bu modül:** "Kanunî" sıfatını okura **anlattırmak** yerine **yaşattırır**. Ve Perde 5–7'nin trajedisini kurar: bu makine gerçekten çalışıyordu — sorun tam da bu.

---

### PERDE 3 · MOHAÇ — İki saatte biten krallık (29 Ağustos 1526)

**Sahne:** Bir krallık, öğleden sonra başlayıp akşam biten bir muharebede tarihten siliniyor. Kral II. Lajos kaçarken bir derede boğuluyor.

**⚔️ SAVAŞ SİMÜLASYONU — `sim-mohac.tsx`**

**Okur MACAR tarafında.** (Fatih'te "sen XI. Konstantin'sin" deseninin kardeşi — ama mekanik olarak **farklı**: orada kaynak/zaman yönetimi vardı, burada **tempo ve tuzak** var.)

**Mekanik — 3 karar anı, tek zaman çubuğu (~2 saat):**
1. **Akıncı perdesi görünür.** Şarj mı, bekle mi, keşif mi? → Şarj edersen hafif süvari **geri çekilir** (sahte ricat).
2. **Hat açılıyor gibi.** Peşine düş mü, dur mu? → Peşine düşersen zincirlenmiş top hattının menziline girersin.
3. **Toplar konuşuyor.** Geri çekil mi, ikinci dalga mı? → Her iki seçenek de yeniçeri tüfek ateşine.

**İfşa (her yolun sonunda aynı):** *"Hangi kapıdan girdiysen aynı yere çıktın. Çünkü bu muharebe muharebe alanında kazanılmadı — top hattı zincirlendiğinde çoktan kazanılmıştı."* Ardından sayılar ve **kaynak çelişkisi bandı**: top sayısı ve ordu mevcutları kaynaklarda ciddi biçimde çelişir; sim tek bir rakamı doğru diye satmaz, **aralık** gösterir.

**Teknik:** Canvas 2D (WebGL değil — `sim-siege` deseni). Dokunmatik: yalnız **tap**, sürükleme yok. `InView` + `dynamic(ssr:false)` + `posters.tsx` içinde SVG poster. Uzun ömürlü `rAF` ekran dışında `IntersectionObserver` ile durur.

---

### PERDE 4 · VİYANA — İmparatorluğun sınırı bir takvimdi (1529)

**Sahne:** 1529'da Viyana kuşatılıyor ve **alınamıyor**; 16 Ekim'de kuşatma kaldırılıyor. Ders kitabı "kahramanca direniş" der. Sayılar başka bir şey söyler.

**Modül — `SeferTakvimi` (makalenin en iyi "aha" anı):** İki sürgü:
- **Kalkış tarihi** (İstanbul'dan) — erken çıkarsan yollar çamur, otlar bitmemiş (atlar yem bulamaz); geç çıkarsan hedefe eylülde varırsın.
- **Hedef** — Belgrad / Budin / Viyana / Malta / Zigetvar.

Çıktı: yürüyüş günü + varış tarihi + **ilk kara/çamura kaç gün kaldığı** = elindeki gerçek kuşatma penceresi.

**İfşa:** Viyana'ya vardığında elinde birkaç hafta var, üstelik ağır kuşatma topları yolda çamura saplanmış. *"İmparatorluğun sınırını cesaret değil takvim çizdi."*

Bu widget aynı zamanda **Malta 1565** ve **Zigetvar 1566**'yı da açıklar — ve Perde 0'daki ölümü tekrar anlamlandırır: adam **yolda** öldü, çünkü hep yoldaydı.

*Doğrulanacak:* günlük ordu yürüyüş hızı ve menzilnâme verileri (menzil kayıtları üzerinden; tek bir gazete kaynağına yaslanılmayacak).

---

### PERDE 5 · MAKBUL → MAKTUL — İbrahim Paşa (14/15 Mart 1536 gecesi)

**Sahne:** Pargalı İbrahim. 1523'ten beri vezir-i âzam. Padişahın çocukluk arkadaşı, aynı odada yattıkları söylenen adam, sultanın kız kardeşiyle evli. Ve Perde 1'deki tacın siparişini veren kişi. Bir gece sarayda boğduruluyor. Lakabı **"Makbul"**du; sonra **"Maktul"** oldu — tek harf.

**🪤 TUZAK 1 — `MuhruBas`:**
Okurun önüne bir **ferman metni** konur. Boş bir mühür yeri vardır. Buton: **"Mührü bas."** Okur basar (basacaktır — Augustus'un "Alkışla" tuzağı bunu kanıtladı).

**İfşa:** *"Tebrikler. En yakın arkadaşını öldürdün. Dikkat et: bunun için hiçbir kanuna ihtiyacın olmadı. Kanunu sen yazıyorsun. Bu makalenin adı 'Kanunî' — ama kanun onun için de geçerli miydi?"*

Ardından ölçülü ve dürüst not: infazın **sebebi kaynaklarda net değildir** (rakip vezirlerin etkisi, "Serasker Sultan" unvanının yarattığı rahatsızlık, İran seferi kararları). Kesin sebep bilinmiyor — makale **bilmediğini söyler**.

---

### PERDE 6 · ÇADIR — Şehzade Mustafa (6 Ekim 1553, Ereğli)

**Sahne:** Sefer yolunda, ordunun ortasında. En sevilen şehzade, babasının çadırına çağrılıyor. İçeride dilsizler var. Ordu dışarıda bekliyor ve neredeyse ayaklanıyor.

**🪤 KARAR NOKTASI + OYLAMA — `Cadir`** (`lib/polls.ts` → `'kanuni-cadir'`)

*"Sen Mustafa'sın. Baban çağırdı. Ne yaparsın?"*
| Seçenek | Tarihsel sonuç |
|---|---|
| **Çadıra gir** | Gerçekte yaptığı şey |
| **Girme, ordunla dön** | Bu, tam olarak **suçlandığı şeydir**: isyan. Girmemek suçlamayı doğrular |
| **Adamlarını içeri sok** | Babanın çadırına silahlı adam sokmak = aynı suç |

**İfşa:** *Her kapı kilitli. Bu bir bilmece değil — durumun kendisi buydu.* Oy dağılımı gösterilir (çerezsiz, anonim; mevcut `article_poll_votes` altyapısı).

**Kaynak disiplini:** Hürrem Sultan ve Rüstem Paşa'nın rolü **hâkim anlatı**dır ama tek anlatı değildir; modern tarihçi Zahit Atçıl bunu Venedik arşivleriyle sorgular. `SourceCompare` yerine burada kısa bir `MythNote` yeterli — asıl karşılaştırma Perde 7'de.

---

### PERDE 7 · KANUNUN KENDİSİ — Fatih'in yazdığı madde (seri kilidi)

**Sahne:** Şehzade Bayezid, İran'a kaçtı; 25 Eylül 1561'de oğullarıyla birlikte idam edildi. İki oğul gitti. Dayanak: **nizam-ı âlem için kardeş katli** — Fatih Kanunnâmesi'nin maddesi.

Ve şimdi asıl soru: **Fatih bu maddeyi gerçekten yazdı mı?**

**Modül — `SourceCompare` (4 kaynak) + oylama** (`'kanuni-kardes-katli'`):
- Kanunnâme'nin bilinen nüshaları ve tarihlenmesi
- Maddeyi otantik kabul eden görüş
- Sonradan eklenmiş (enterpolasyon) olabileceğini savunan görüş
- Uygulamanın Fatih'ten **önce de** var olduğu argümanı (kanun sebep mi, sonuç mu?)

Oylama: *"Sence bu madde Fatih'in kalemiyle mi yazıldı?"*

**Bu perde makalenin omurgası:** Fatih makalesine (`/articles/fatih`) doğrudan iç link — ve Fatih makalesine de buraya **geri link eklenecek** (iç linkleme kuralı: her makale ≥1 inbound + outbound).

---

### PERDE 8 · SÜLEYMANİYE + FİNAL — "Kırk iki gün" kapanıyor

**Sahne:** 1550–1557: Mimar Sinan, Süleymaniye. Kanun bir de taşa yazılır. Sonra Perde 0'a dönülür: Zigetvar, ölü sultan, yürüyen ordu, basılan mühür.

**🪤 FİNAL TUZAĞI — `TugrayiBas`:**
3B/2B altın tuğra belirir. Buton: **"Mührü bas — sefer devam etsin."** Okur basar.

**İfşa:** *"Bunu kırk iki gün boyunca ölü bir adamın adına yaptılar. Sen de az önce ölü bir adamın imzasını attın. Ve işledi. Çünkü kanun, onu yazan adam öldükten sonra da çalışır — asıl mesele buydu. Batı ona 'Muhteşem' dedi: gördüğü şey taçtı. Doğu 'Kanunî' dedi: gördüğü şey nizamdı. İkisi de eksikti. O, kurduğu makinenin hem mimarı hem malzemesiydi."*

+ **Paylaş butonu** (`navigator.share` → pano fallback), Augustus'taki desenle aynı.
+ İsteğe bağlı mini modül: `TugrayiCoz` — tuğranın parçaları (sere, beyze, tuğ, zülfe, kol) tıklanabilir → `/articles/kaligrafi` iç linki.

---

### Kapanış blokları (şablon zorunlulukları)

1. `ArticleQuiz` — 6–8 soru, hepsi makalenin içinden. *(Not: paylaşılan ArticleQuiz'e `ProofCard` bağlamak ayrı bir iş — yapılırsa 12 makale birden kazanır.)*
2. `ArticleBibliography` — **zorunlu**, standing rule.
3. İlgili konular (`relatedArticles`) + `/rastgele`.

---

## 5. Dosya planı (mevcut desene birebir uyar)

```
app/articles/kanuni/
├─ page.tsx               # metadata + JSON-LD (articleJsonLd + breadcrumbJsonLd) — SUNUCU
│                         #   ⚠ openGraph.images YAZILMAZ (dosya-konvansiyonunu ezer)
├─ KanuniClient.tsx       # perde kompozisyonu — 'use client'
├─ data.ts               # tüm metin/sayı sabitleri (TEK KAYNAK)
├─ refs.ts               # BibItem[] kaynakça (page.tsx JSON-LD citation da bunu okur)
├─ ui.tsx                # palet + WidgetFrame, InView, WidgetSkeleton, SourceNote,
│                        #   MythNote, Stat, tr(), useReducedMotion(), refreshScroll()
├─ chrome.tsx            # ReadingProgress + PerdeNav
├─ widgets.tsx           # VenetianCrown · DivandaBirDava · SeferTakvimi ·
│                        #   MuhruBas · Cadir · TugrayiBas · TugrayiCoz
├─ sim-mohac.tsx         # savaş simülasyonu (canvas 2D, lazy)
├─ posters.tsx           # SVG posterler (lazy modüllerin yer tutucusu)
└─ opengraph-image.tsx   # paylaşım kartı (lib/og.tsx + lib/questions.ts)

app/components/article/
└─ ThreeCrownHero.tsx    # YENİ — dört taçlı miğfer (three.js)
```

**Neden bu kadar dosya:** interaktif-yoğun makale deseni. Tek dosyada tutulursa hem bakım hem bundle bozulur; `radyoaktivite` ve `fatih` bu yüzden bölünmüş durumda.

---

## 6. Kod dışı kayıt listesi (unutulursa makale yarım çalışır)

| # | Dosya | Ne eklenecek |
|---|---|---|
| 1 | `lib/articles.ts` | `{ slug:'kanuni', title:'Kanuni Sultan Süleyman', emoji:'⚖️', desc:'…', category:'Tarih' }` |
| 2 | `lib/questions.ts` | `kanuni: \`Kanunu yazan adam kendi kanununa yenilir mi?\`` (≤60 karakter ✓) |
| 3 | `lib/polls.ts` | `'kanuni-cadir': ['gir','donme','adam']`, `'kanuni-kardes-katli': ['fatih','sonradan']` |
| 4 | `app/components/article/Object3DHero.tsx` | `Object3DKind` birliğine `'crown'` + `ArticleHero`'da dallanma |
| 5 | `app/sitemap.ts` | izin listesine `/articles/kanuni` — **önce anonim 200 + kendi metadata'sı index mi, doğrula** |
| 6 | `app/articles/fatih/*` | Kanuni'ye **geri link** (kardeş katli maddesi bölümünde) — orphan bırakma |
| 7 | `netlify` cache warmer | 34 URL listesine yeni rota |
| 8 | Görseller | `public/articles/kanuni/` + AVIF/WebP dönüşümü (`sharp`), ham PNG commit'lenmez |

**Dış iç link hedefleri (outbound):** `/articles/fatih` (zorunlu, seri) · `/articles/kaligrafi` (tuğra) · `/articles/rome` (Kayser-i Rûm / evrensel hükümdarlık iddiası) · `/articles/sanat-akimlari` (İznik/Osmanlı estetiği).

---

## 7. Görsel planı

Her makalede görsel var (32/32) ve kural sert: **dosya adı ≠ içerik — şüphelenince göze bak.**

| Perde | Görsel | Kaynak / telif |
|---|---|---|
| 0 | Zigetvar kuşatması minyatürü ya da temsilî çadır sahnesi | 16. yy minyatür (PD) veya temsilî AI (**"Temsilî görsel · yapay zekâ"** künyesi zorunlu) |
| 1 | Dört taçlı miğferi gösteren Venedik gravürü (~1532) | 16. yy, PD — **müze sitesinin kendi lisansı ayrıca kontrol edilecek** |
| 2 | Kanunnâme sayfası / divan minyatürü | PD |
| 3 | Mohaç minyatürü (Hünernâme) | PD |
| 5 | İbrahim Paşa dönemi saray minyatürü | PD |
| 8 | Süleymaniye | Kendi/PD fotoğraf — **CC-NC/ND kabul edilmez** (bölgesellik de eleme sebebi) |

---

## 8. Kaynakça iskeleti (`refs.ts` — taslak)

**Birincil**
- *Kanunnâme-i Âl-i Osman* (Süleyman dönemi kanunnâmeleri)
- Venedik balyos raporları (*relazioni*)
- Osmanlı kronikleri: Celâlzâde Mustafa, *Tabakâtü'l-Memâlik*; Peçevi; Selânikî
- Ebussuud Efendi fetvaları

**Modern**
- Gülru Necipoğlu, "Süleyman the Magnificent and the Representation of Power…", *The Art Bulletin*, 1989 — **miğfer bölümünün omurgası**
- Zahit Atçıl, Şehzade Mustafa'nın idamı üzerine (Osmanlı Araştırmaları / İSAM) — hâkim anlatıya modern itiraz
- Uriel Heyd, *Studies in Old Ottoman Criminal Law* — kanun makinesi
- Halil İnalcık — kanun/şeriat ilişkisi ve kanunnâme tartışması
- Erhan Afyoncu — Zigetvar ve ölümün gizlenmesi *(gazete köşesi: destekleyici kaynak, tek dayanak değil)*

**Kaynakların taraflı olduğu `refs.ts` başında açıkça yazılacak** (Fatih'te olduğu gibi).

---

## 9. Yazmadan önce doğrulanacaklar

| # | İddia | Durum |
|---|---|---|
| 1 | Ölüm **42 gün** gizlendi | Afyoncu veriyor; başka kaynaklar farklı süre verebilir → **ikinci akademik kaynak şart**, yoksa "kaynaklar 20–48 gün arasında değişir" biçiminde yazılır |
| 2 | Mohaç'ta top sayısı / ordu mevcutları | Kaynaklar ciddi çelişir → sim **aralık** gösterecek |
| 3 | Ordu günlük yürüyüş hızı (sefer takvimi widget'ının temeli) | Menzilnâme verisinden doğrulanacak — widget'ın **tüm iddiası** buna dayanıyor |
| 4 | İbrahim Paşa'nın idam sebebi | Kesin bilinmiyor → makale bilmediğini söyleyecek |
| 5 | Kardeş katli maddesinin otantikliği | Zaten tartışma olarak sunuluyor ✓ |
| 6 | Miğferin "hiç takılmadığı" | Kaynak "*may never have been worn*" diyor → **"muhtemelen"** olarak yazılacak, kesin değil |
| 7 | Tuğra vektörünün lisansı | Kendi çizimimizi yapmak en temizi |

---

## 10. Yapım sırası

| Faz | İş | Çıktı |
|---|---|---|
| **1** | `data.ts` + `refs.ts` + kaynak doğrulama (bölüm 9) | Metin ve sayılar sabit |
| **2** | `ThreeCrownHero` + `ui.tsx` + `chrome.tsx` + iskelet perdeler | Sayfa ayakta, hero dönüyor |
| **3** | Metin geçişi (8 perde) + görseller | **Bu noktada makale tek başına yayınlanabilir** |
| **4** | Hafif widget'lar: `VenetianCrown`, `SeferTakvimi`, `TugrayiCoz` | En yüksek fayda/emek oranı |
| **5** | Tuzaklar + oylama: `MuhruBas`, `Cadir`, `TugrayiBas` + `lib/polls.ts` | Paylaşım motoru |
| **6** | `sim-mohac.tsx` + poster | En pahalı parça — **en sona**, çünkü makale onsuz da tamamdır |
| **7** | Quiz, kaynakça, kayıt listesi (bölüm 6), OG kartı | Yayın |
| **8** | Mobil scroll/perf denetimi + okunabilirlik ölçümü | Kapanış |

**Neden bu sıra:** Faz 3'te durursan elinde eksiksiz bir makale olur. Fatih'te sim'i erken yazmak bütün takvimi yemişti.

---

## 11. Bilinen mayınlar (bu repoda daha önce yandığımız yerler)

1. **`content.ts` gövdesi tek satırdır** — bölüm eklerken silinirse makale **boş yayınlanır** ve `tsc`/build/200 hiçbiri görmez. Değişiklikten sonra **kelime sayısı ölç.**
2. **`page.tsx`'te `openGraph.images` yazma** — dosya tabanlı OG kartını sessizce ezer (19 kart bir kez böyle ölmüştü).
3. **Dev sunucusu açıkken `next build` çalıştırma** — `.next` bozulur.
4. **`loseContext()` cleanup'ta çağrılmaz** — Strict Mode'da hero dev'de kaybolur.
5. **Dinamik segmentte `revalidate`**, boş `generateStaticParams` olmadan çalışmaz.
6. **Tailwind utility'leri `globals.css`'in katmansız kurallarına yenilir** — makale kendi `<style>` bloğunda `.kapsam h1` ile ezmeli.
7. **Önizleme sekmesi donuk** — CSS transition ölçerken önce transition'ları kapat, yoksa geçiş öncesi değeri okursun.

---

## 12. Dağıtım

- `/paylasim` stüdyosu **otomatik** carousel (1080×1350) + reel kapağı üretir — yeni makale registry'ye girer girmez kapsama dahil.
- Paylaşılabilir kanca (Instagram carousel 1. kare için): **"Batı ona 'Muhteşem' dedi. Doğu 'Kanunî'. İkisi de eksikti."**
- İkinci kanca (reel): **"Bir imparatorluğu 42 gün boyunca ölü bir adam yönetti."**
- Zamanlama: TRT1'de *Mehmed: Fetihler Sultanı* sezon dönüşü sonbaharda — Osmanlı arama dalgası eylül–kasımda yükseliyor. **Yayın için ideal pencere: eylül.**
