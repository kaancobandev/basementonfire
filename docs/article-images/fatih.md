# /articles/fatih görselleri

Bu klasördeki dosyalar `https://basementonfire.com/articles/fatih/<dosya>` yolundan
servis edilir ve `ArticleImage` bileşeni ile Netlify Image CDN üzerinden (otomatik
WebP + responsive) gösterilir.

## Kurallar
- **Biçim:** `.webp` (tercih) / `.jpg` / `.png`. (SVG/GIF `Img` CDN'ine girmez → düz `<img>` kullan.)
- **Ad:** küçük harf, tireli, açıklayıcı — ör. `truva-mezar.webp`, `bogazkesen.webp`.
- **Oran:** `ArticleImage ratio` prop'unu görselin GERÇEK en-boy oranıyla eşleştir
  (object-cover eşleşen oranda kırpmaz, CLS olmaz). Higgsfield çıktısı genelde 16:9 / 1:1 / 9:16.
- **Kredi:** yapay zekâ ile üretilen görsellerde `credit="Temsilî görsel · yapay zekâ"`
  kullanılması önerilir (makalenin doğrulama teziyle tutarlı; okur yanılmasın).

## Manifest (yerleşim) — 10/10 CANLI

| Dosya | Perde | İçerik | Kredi |
|-------|-------|--------|-------|
| `truva-akhilleus.png` | 0 | Fatih, Akhilleus mezarı başında | Temsilî · yapay zekâ |
| `rumeli-hisari.jpg` | 2 | Rumeli Hisarı / Boğazkesen | — |
| `theodosius-surlari.jpg` | 3 | Teodosius Surları | — |
| `sahi-top.png` | 3 | Urban / şahi topu | — |
| `gemileri-karadan-yurutmek.jpg` | 4 | Gemilerin karadan yürütülmesi | Temsilî tablo |
| `istanbulun-fethi.jpg` | 5 | Zonaro — şehre giriş tablosu | Fausto Zonaro |
| `ayasofya.jpg` | 6 | Ayasofya iç mekân | — |
| `bellini-portre.jpg` | 6 | Gentile Bellini portresi | Gentile Bellini, 1480 |
| `sahni-seman.webp` | 6 | Fatih Külliyesi / Sahn-ı Seman | — |
| `otranto-map-image.jpg` | 7 | Otranto seferi haritası | — |

Not: `.jfif` olarak gelen iki dosya (surlar, otranto) CDN/MIME uyumu için `.jpg`'ye taşındı.
