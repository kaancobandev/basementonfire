# /articles/carthage görselleri

`ArticleImage` ile Netlify Image CDN üzerinden servis edilir (otomatik WebP + responsive).
Tümü `scripts/source-images.mjs` ile Wikimedia Commons'tan indirildi: lisans doğrulandı,
ticari kullanıma açık (NC/ND yok), en fazla 1600px genişliğe indirildi.

Yeniden üretmek için: `node scripts/source-images.mjs carthage`

## Manifest

| Dosya | Yerleşim | Lisans | Kaynak/Yazar | Commons |
|---|---|---|---|---|
| `ports-punik.webp` | Bölüm 1 (⚓) · Salammbo'daki Pön limanları — yapay liman kompleksinin bugünkü hâli | CC BY 3.0 | Citizen59 | [Commons](https://commons.wikimedia.org/wiki/File:PortsPuniquesSalamboTunis.jpg) |
| `deniz-mahmuzu.webp` | Bölüm 2 (⚔️) · Punik yazıtlı (Baal'e adak) tunç mahmuz — Egad Adaları savaşından (MÖ 241), I. Pön Savaşı'nın SONU. Özgün buluntu, replika değil; 2010'da 80m derinden çıkarıldı. ALTYAZI UYARISI: savaşın nedenini değil, savaşın maddi gerçekliğini gösterir | CC BY-SA 4.0 | Sb2s3 | [Commons](https://commons.wikimedia.org/wiki/File:Carthaginian_naval_ram_(2).jpg) |
| `hannibal-fil-alpler.webp` | Bölüm 3 (🐘) · ~1625 tablosu, Poussin'e ATFEDİLEN (Blunt atfeder, Thuillier reddeder) — Hannibal fil sırtında Alpler'de. ALTYAZI ZORUNLU: 17. yy TEMSİLÎ yorumu, çağdaş kayıt DEĞİL; efsane ile lojistik fiyasko kontrastı zaten bu tablonun hayaliliğinden doğar | Public domain | Attributed to Nicolas Poussin | [Commons](https://commons.wikimedia.org/wiki/File:Hannibal_traversant_les_Alpes_%C3%A0_dos_d%27%C3%A9l%C3%A9phant_-_Nicolas_Poussin.jpg) |
| `tophet-alani.webp` | Bölüm 4 (🏺) · Tophet kutsal alanı — binlerce küpün bulunduğu kazı sahası | CC BY-SA 4.0 | IssamBarhoumi | [Commons](https://commons.wikimedia.org/wiki/File:Tophet_de_Carthage.jpg) |
| `tanit-steli.webp` | Bölüm 4 (🏺) · MÖ 3. yy Tanit işaretli adak steli, Kartaca Tophet'inden (bugün MBA Lyon 1969-86). ATIF MAYINI (ölçüldü): Commons'ta Artist alanı BOŞ (4/4 denemede boş, API kararlı). Credit ise 'Rama<br>Own work' → strip() <br>'yi boşluk KOYMADAN siler → attrib() 'RamaOwn work' üretir. Yani credit 'RamaOwn work · CC BY-SA 2.0 fr' olur = isim bozuk. Dosyanın Attribution alanı zorunlu metni birebir verir ('Photograph by Rama, Wikimedia Commons, Cc-by-sa-2.0-fr') ama script Attribution'ı hiç İSTEMEZ. → credit ELLE 'Rama · CC BY-SA 2.0 fr' yazılacak | CC BY-SA 2.0 fr | Rama Own work | [Commons](https://commons.wikimedia.org/wiki/File:Stele_with_palm_and_Tanit_sign-MBA_Lyon_1969-86-IMG_0548.jpg) |
| `byrsa-tepesi.webp` | Bölüm 5 (🏛️) · Byrsa tepesindeki PUNİK mahalle (Hannibal Mahallesi) kalıntıları — kuşatmanın son direniş noktası. Commons açıklaması birebir doğrular: 'Ruins of the Punic Quarter on the Byrsa hill'. ATIF NOTU: Artist alanı 'No machine-readable author provided...' saçmalığı döndürür → credit ELLE 'BishkekRocks · kamu malı' yazılacak (kamu malı, hukuken zorunlu değil ama üretilen metin çöp) | Public domain | No machine-readable author provided. Bis | [Commons](https://commons.wikimedia.org/wiki/File:Quartier_Punique.JPG) |
| `antonine-hamamlari.webp` | Bölüm 5 (🏛️) · Antonine Hamamları — Caesar/Augustus sonrası yeniden doğan Roma Kartacası | CC BY-SA 4.0 | Silar | [Commons](https://commons.wikimedia.org/wiki/File:01996_Ruins_of_Antonine_Baths_at_Carthage.jpg) |
