# Göbeklitepe makale görselleri

Bu klasöre koyduğun `.jpg` / `.png` dosyaları production'da otomatik olarak
Netlify Image CDN'den geçer (WebP + responsive srcSet). Sadece orijinali at,
elle boyutlandırma/sıkıştırma gerekmez. (SVG'ler CDN'den geçmez; oldukları gibi
sunulur.)

Makale kodu (`app/articles/gobeklitepe/`) şu dosya adlarını bekliyor. Dosyayı
tam bu adla kaydet; içerik hazır olduğunda otomatik görünür. Bir görselin konusu
farklıysa haber ver, yerini/altyazısını değiştireyim.

| Dosya | Nerede kullanılıyor | Önerilen konu | En/boy oranı |
|---|---|---|---|
| `hero.jpg` | Giriş bölümü (kahraman) | Çevrelerin genel görünümü (koruyucu çatı altından) ya da gökyüzüne karşı bir T-pilar | yatay, ~16/9 |
| `pilar.jpg` | "T-pilarlar" bölümü | Merkezi ikiz pilarların yakın çekimi (kollar/eller/kemer görünsün) | dikey ya da kare, ~3/4 |
| `oyma.jpg` | "Taşa kazınan hayvanlar" bölümü | Bir hayvan kabartması yakın çekimi (tilki, yılan ya da Akbaba Taşı) | yatay, ~4/3 |
| `kazi.jpg` | "Keşif" / zaman çizelgesi bölümü | Kazı çalışması, hava fotoğrafı ya da höyüğün görünümü | yatay, ~16/9 |
| `manzara.jpg` | Kapanış bölümü | Şanlıurfa ovası / höyük / altın saat manzarası | yatay, ~16/9 |

SVG(ler): dekoratif/harita SVG'lerini de bu klasöre koyabilirsin (ör.
`konum.svg`). Renk/animasyon isteyen ikon-SVG'leri ise koda gömeceğiz.

Görsel yokken makale kırılmaz: her figür, dosya gelene kadar altyazılı bir
yer-tutucu kutu gösterir.
