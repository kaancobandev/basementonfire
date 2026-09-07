# /articles/zihin-yukleme görselleri

İÇ NOT — yayınlanmaz. Görseller `public/articles/zihin-yukleme/` altında, `ArticleImage` ile
Netlify Image CDN üzerinden servis edilir (otomatik WebP + responsive).
Tümü `scripts/source-images.mjs` ile Wikimedia Commons'tan indirildi: lisans doğrulandı,
ticari kullanıma açık (NC/ND yok), en fazla 1600px genişliğe indirildi.

Yeniden üretmek için: `node scripts/source-images.mjs zihin-yukleme`

## Manifest

| Dosya | Yerleşim | Lisans | Kaynak/Yazar | Commons |
|---|---|---|---|---|
| `cajal-hipokampus.webp` | 1. SORU (Haritalama) açılışı — 'beyin ilk kez elle haritalandı' fikri. KAYNAK METNİ DOĞRULANDI: Santiago Ramón y Cajal, Histologie du Système Nerveux de l'Homme et des Vertébrés, A. Maloine, Paris, 1911. ALTYAZI SINIRI: çizim KEMİRGEN hipokampüsü, insan DEĞİL — 'insan beyni' yazma. Oklar Cajal'ın imzası: sinyalin hangi yöne aktığını gösteriyorlar, yani daha o zaman soru 'bağlantı nerede' değil 'bilgi nereye gidiyor'du. PD-old (Cajal 1934'te öldü). | Public domain | — | [Commons](https://commons.wikimedia.org/wiki/File:CajalHippocampus.jpeg) |
| `c-elegans-mikroskop.webp` | 2. SORU (Çalıştırma) — solucanın kendisi. Aydınlık alan mikroskobu, okülerden çekilmiş (dairesel vinyet gerçek, kırpma değil). Wiki Science Competition 2025 India. ALTYAZI SINIRI: karede ONLARCA birey var, tek bir hayvan değil; 'işte 302 nöronlu hayvan' derken çoğul kurmaya dikkat. Çok uzun dikey kare (2252×4000) → ağ görseliyle çift sütunda eşlenirken narrow kullan. | CC BY-SA 4.0 | Gannu03 | [Commons](https://commons.wikimedia.org/wiki/File:Caenorhabditis_elegans_under_a_light_microscope_01.jpg) |
| `c-elegans-ag.webp` | 2. SORU (Çalıştırma) — solucanın BÜTÜN sinir ağı tek karede; mikroskop karesiyle YAN YANA duracak, bölümün tezi bu eşleşmede: hayvan da elimizde, haritası da, yine çalıştıramıyoruz. ALTYAZI SINIRI: Gephi ile çizilmiş, veri Watts & Strogatz derlemesinden — bu 1986 konnektomunun kendisi DEĞİL, ondan türetilen ağ; 'White 1986' diye künyeleme. Beyaz zeminli (makale koyu) — bilerek, diyagramlar beyazda okunuyor. Görselde Gephi logosu var, kırpma. | CC BY-SA 3.0 | Mentatseb | [Commons](https://commons.wikimedia.org/wiki/File:C.elegans-brain-network.jpg) |
| `piramidal-noron.webp` | 2. SORU — 'bir nöron bir düğüm değildir' kutusu (Beniaguev 2021: tek nöron için 5-8 katmanlı ağ). Golgi boyası, 40x. Dallar boyunca DENDRİTİK DİKENLER çıplak gözle seçiliyor — görselin işi tam olarak bu, karmaşıklığı göstermek. KAYNAK METNİ: epilepsi hastasının hipokampüsü. ALTYAZI FIRSATI: makaledeki 1,4 petabaytlık insan korteksi örneği de epilepsi ameliyatından geliyordu — aynı sağlanma hikâyesi, bağla. | CC BY-SA 2.5 | MethoxyRoxy | [Commons](https://commons.wikimedia.org/wiki/File:Pyramidal_hippocampal_neuron_40x.jpg) |
| `frontier-superbilgisayar.webp` | KURUNTU bölümü — 'yeterli hesap gücü olsa yapardık' maddesi. Oak Ridge National Laboratory. ALTYAZI SINIRI: yalnız DOĞRULANMIŞ rakamı kullan — Frontier Haziran 2022'de 1,102 exaFLOPS ile ilk gerçek exascale sistem oldu. 2026 sıralamasını buraya YAZMA (o rakam ayrı doğrulama ister). Görselin işi makinenin büyüklüğünü değil, YETMEDİĞİNİ göstermek: darboğaz hesap değil, veri ve model. Koyu zeminli kare, makaleyle uyumlu. | CC BY 2.0 | Oak Ridge National Laboratory | [Commons](https://commons.wikimedia.org/wiki/File:Frontier_supercomputer_(6).jpg) |
