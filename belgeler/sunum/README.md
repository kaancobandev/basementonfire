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

## Rakamlar nereden geliyor

Hepsi `belgeler/` altındaki diğer dosyalarla aynı kaynaktan:
- Eşik değerleri → `app/components/article/heroPerf.ts`
- Gider ve başabaş → `gelir-gider-plani.md`
- Marka → `fikri-mulkiyet-plani.md`
- Kod metrikleri → `git rev-list --count HEAD`, `git ls-files | xargs wc -l`

⚠ Rakam değiştirirsen `proje-ozeti.md` ve `mulakat-sunum-metni.md`'yi de güncelle —
üçü aynı şeyi söylemeli.
