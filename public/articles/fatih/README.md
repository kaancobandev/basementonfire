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

## Manifest (yerleşim)

**Kodda bağlandı (dosya bekleniyor):**

| Dosya | Perde | İçerik | Durum |
|-------|-------|--------|-------|
| `truva-akhilleus.jpg` | 0 | Fatih, Akhilleus mezarı başında (AI, temsilî) | ⏳ dosya bekleniyor |
| `rumeli-hisari.jpg` | 2 | Rumeli Hisarı / Boğazkesen | ⏳ |
| `istanbulun-fethi.jpg` | 5 | Zonaro — şehre giriş tablosu | ⏳ |
| `ayasofya.jpg` | 6 | Ayasofya iç mekân | ⏳ |
| `bellini-portre.jpg` | 6 | Gentile Bellini portresi (1480) | ⏳ |

**Henüz kodda bağlanmadı (dosya gelince bağlanacak):**

| Dosya | Perde | İçerik |
|-------|-------|--------|
| `theodosius-surlari` | 3 | Teodosius Surları |
| `sahi-top` | 3 | Urban / şahi topu |
| `gemileri-karadan-yurutmek` | 4 | Gemilerin karadan yürütülmesi |
| `sahni-seman` | 6 | Sahn-ı Seman medreseleri |
| `otranto-map-image` | 7 | Otranto seferi haritası |
