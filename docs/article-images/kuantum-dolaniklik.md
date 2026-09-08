# /articles/kuantum-dolaniklik görselleri

İÇ NOT — yayınlanmaz. Görseller `public/articles/kuantum-dolaniklik/` altında, `ArticleImage` ile
Netlify Image CDN üzerinden servis edilir (otomatik WebP + responsive).
Tümü `scripts/source-images.mjs` ile Wikimedia Commons'tan indirildi: lisans doğrulandı,
ticari kullanıma açık (NC/ND yok), en fazla 1600px genişliğe indirildi.

Yeniden üretmek için: `node scripts/source-images.mjs kuantum-dolaniklik`

## Manifest

| Dosya | Yerleşim | Lisans | Kaynak/Yazar | Commons |
|---|---|---|---|---|
| `bell-karatahta.webp` | AÇILIŞ — Bertlmann'ın çorapları kutusundan sonra. GÖZLE DOĞRULANDI: dosya adının iddiası içerikle DESTEKLENİYOR — karatahtada tam olarak iki kollu bir dolanıklık deneyi şeması var (ortada kaynak, iki yana giden dalgalı çizgiler, her kolda eğik çizgili kareler yani analizörler, uçlarda dedektörler). Yine de ALTYAZI SINIRI: Commons açıklaması yalnız 'portre, CERN, Haziran 1982' diyor; 'tam eşitsizliğini yazarken' gibi bir sahne iddiası KURMA, tahtadaki şemayı TARİF ET. Tarih ikramiyesi: Haziran 1982 — Aspect'in deneylerini yayımladığı yıl. | CC BY 4.0 | CERN | [Commons](https://commons.wikimedia.org/wiki/File:John_Bell_commenting_the_famous_Bell%27s_inequalities_(8206244).jpg) |
| `einstein-bohr.webp` | TARİH ÇİFTİNİN SOL YARISI, zaman çizelgesinden önce. 🚨 YÖN TUZAĞI: BOHR SOLDA (konuşuyor, ağzı açık), EINSTEIN SAĞDA (arkaya yaslanmış, elinde bir şey tutuyor). Ters yazmak çok kolay, gözle doğrulandı. Commons: Ehrenfest'in Leiden'daki evinde, 11 Aralık 1925; vesile büyük olasılıkla Lorentz'in doktorasının 50. yılı. ⚠ ALTYAZI SINIRI: bu kare EPR'den ON YIL ÖNCE çekildi — 'EPR'yi tartışıyorlar' YAZMA. Doğru kullanım: tartışmanın ne kadar eski olduğunu göstermek. | Public domain | Paul Ehrenfest Original uploader was Gra | [Commons](https://commons.wikimedia.org/wiki/File:Niels_Bohr_Albert_Einstein_by_Ehrenfest.jpg) |
| `aspect.webp` | TARİH ÇİFTİNİN SAĞ YARISI. Royal Society portresi, 2015. Commons açıklaması Bell eşitsizliği testlerini ve dolanık foton çiftlerini açıkça anıyor, yani makaledeki rolüyle örtüşüyor. GÖZLE DOĞRULANDI: kravatı KEDİ desenli — kuantum fizikçisi için hoş bir tesadüf, altyazıda hafifçe anılabilir ama Aspect'in niyetine dair iddia KURMA (deseni görüyoruz, şakayı biz okuyoruz). 2022 Nobel'ini Clauser ve Zeilinger'le paylaştı. | CC BY-SA 4.0 | Royal Society uploader | [Commons](https://commons.wikimedia.org/wiki/File:Alain-Aspect-ForMemRS.jpg) |
| `leibniz.webp` | ESKİ DÜŞÜNÜRLER bölümü, Leibniz ironisi kutusunun yanında. Christoph Bernhard Francke, yak. 1695, kamu malı. ALTYAZI SINIRI: 'önceden kurulmuş uyum'u Leibniz iki PARÇACIK için değil RUH-BEDEN birliği için kurdu — makale kurgusunu ödünç alıyor, bunu altyazı da tekrarlamalı. Ve 'Leibniz kuantumu önceden bildi' izlenimi VERME; makalenin açıkça yalanladığı kalıp bu. | Public domain | Christoph Bernhard Francke | [Commons](https://commons.wikimedia.org/wiki/File:Christoph_Bernhard_Francke_-_Bildnis_des_Philosophen_Leibniz_(ca._1695)_(cropped).jpg) |
