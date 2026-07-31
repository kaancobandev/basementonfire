# Sunum kaynağı

`basementonfire-btm-sunum-TR.pdf` ve `basementonfire-btm-deck-EN.pdf` buradan üretiliyor.

## Yeniden üretmek

```
node belgeler/sunum/uret.mjs
```

PDF'ler Masaüstüne yazılır. Chrome'un print-to-PDF'i kullanılır (orijinal sunum da
öyle üretilmişti); font Google Fonts'tan çekildiği için **internet gerekir**.

## Düzenlemek

Tüm metin `icerik.mjs` içinde, TR ve EN ayrı nesneler. Tasarıma dokunmadan
cümle/rakam değiştirmek için orayı düzenle, sonra üret.

Slayt tipleri: `cover · bullets · stat · table · quadrant · timeline · closing`

## Makale sayısı ELLE YAZILMAZ

`{MAKALE}` ve `{KONU}` yer tutucuları, üretim sırasında `lib/articles.ts`'ten
sayılarak dolduruluyor. Yeni makale eklediğinde sunumda değiştirilecek bir şey
yok — sadece yeniden üret.

Sitenin kendisi de aynı mantıkla çalışıyor (`ARTICLE_COUNT` / `CATEGORY_COUNT`),
yani site ve sunum aynı kaynaktan besleniyor ve ayrışamıyorlar.

⚠ Reklam metinleri (`../google-ads-arama-kampanyasi.md`) türetilemiyor — Google
paneline elle yapıştırılıyor. Orada kesin sayı yerine **"30+"** tabanı kullanılıyor;
40'a ulaşınca elle güncelle.

## Rakamlar nereden geliyor

Hepsi `belgeler/` altındaki diğer dosyalarla aynı kaynaktan:
- Eşik değerleri → `app/components/article/heroPerf.ts`
- Gider ve başabaş → `gelir-gider-plani.md`
- Marka → `fikri-mulkiyet-plani.md`
- Kod metrikleri → `git rev-list --count HEAD`, `git ls-files | xargs wc -l`

⚠ Rakam değiştirirsen `proje-ozeti.md` ve `mulakat-sunum-metni.md`'yi de güncelle —
üçü aynı şeyi söylemeli.
