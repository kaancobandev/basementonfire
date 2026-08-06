-- ============================================================
-- ENFLASYON MAKALESİ — QUIZ SORULARI
-- ============================================================
-- Site genelinde quiz denetimi (2026-08-06) tek eksik makaleyi buldu:
-- enflasyon'un quiz_questions tablosunda HİÇ sorusu yoktu, dolayısıyla
-- bileşen kendini gizliyordu. Diğer 35 makalenin sorusu vardı.
--
-- Sorular makalenin kendi gövdesinden çıkarıldı; her biri metinde açıkça
-- anlatılan bir noktayı ölçüyor. Doğru cevap konumları BİLEREK dağıtıldı
-- (A/B/C/D) — site genelinde doğru cevabın %81 oranında B çıkması sorunu
-- daha önce düzeltilmişti, aynı hatayı yeniden üretmeyelim.
--
-- GÜVENLİ: `where not exists` ile korunuyor, tekrar çalıştırılabilir.
-- ============================================================

insert into public.quiz_questions (question, options, correct_index, explanation, article_slug)
select v.question, v.options::jsonb, v.correct_index, v.explanation, v.article_slug
from (values
    ('1585''te yeniçerinin kesesindeki akçe sayısı değişmediği hâlde neden daha az ekmek alabildi?',
     '["Ekmek üretimi durmuştu","Darphane akçenin gümüş oranını yaklaşık %44 düşürdü","Maaşı gecikmeli ödendi","Ekmeğe özel vergi kondu"]', 1,
     'Tağşiş: 100 dirhem gümüşten kesilen akçe sayısı 450''den 850''e çıktı. Sayı sabit kaldı, paranın içindeki değer düştü.',
     'enflasyon'),

    ('Domatesin kuraklık yüzünden pahalanması neden tek başına enflasyon sayılmaz?',
     '["Bu nispi fiyat değişimidir; enflasyon genel fiyat seviyesinin sürekli yükselmesidir","Gıda enflasyon hesabına girmez","Mevsimlik ürünler sepette yer almaz","Kuraklık geçici olduğu için sayılmaz"]', 0,
     'Nispi fiyat değişimi bir malın diğerlerine göre pahalanmasıdır ve enflasyonu sıfıra yakın ülkelerde de olur. Enflasyon, fiyatların topluca ve üst üste yükselmesidir.',
     'enflasyon'),

    ('Enflasyonu "paranın hikâyesi" olarak okumak ne demektir?',
     '["Para basımının durduğu anlamına gelir","Yalnızca döviz kurunu ilgilendirir","Fiyatların yükselmesi, paranın satın alma gücünün düşmesiyle aynı cümledir","Nakit yerine altın tutulması gerektiği anlamına gelir"]', 2,
     'Fiyat seviyesinin yükselmesi ile paranın alım gücünün düşmesi aynı olgunun iki yüzüdür — 1585''teki akçe gibi.',
     'enflasyon'),

    ('TÜFE sepeti nasıl bir listedir?',
     '["Yalnızca temel gıda ürünlerini içerir","Her yıl tamamen yeniden yazılır","Devletin belirlediği tavan fiyat listesidir","Ortalama bir hanenin aldıklarını temsil eder ve hayat değiştikçe güncellenir"]', 3,
     '2026''da baz yıl 2025''e çekildi, ana grup sayısı 13 oldu ve sepete 38 yeni kalem girdi: kravat ve gazete çıktı, simit ve hazır börek girdi.',
     'enflasyon'),

    ('Enflasyon "bana daha yüksek geliyor" hissinin matematiksel sebebi nedir?',
     '["Sepet, ortalama haneyi temsil eder; ortalama diye biri yoktur","Sepete lüks ürünler dâhil edilmez","Fiyatlar bültenden önce açıklanır","Endeks her ay sıfırlanır"]', 0,
     'Kirada oturan birinin bütçesinde konutun ağırlığı sepettekinden çok fazladır; evi olan bir emeklininki de ortalamadan sapar — ters yöne.',
     'enflasyon'),

    ('ÜFE, TÜFE''den nasıl ayrılır?',
     '["Yalnızca ithal ürünleri ölçer","Üreticinin karşılaştığı maliyet fiyatlarını ölçer ve genelde TÜFE''nin önünden gider","Yılda bir kez açıklanır","Sadece kamu kurumlarının alımlarını kapsar"]', 1,
     'Üreticinin bugün ödediği maliyet birkaç ay sonra rafa yansıdığı için ÜFE öncü gösterge sayılır.',
     'enflasyon'),

    ('Maaşın %25 arttı, aynı dönemde enflasyon %31,75 oldu. Ne oldu?',
     '["Reel olarak kazandın","Alım gücün değişmedi","Nominal olarak kaybettin","Nominal kazandın, reel kaybettin — alım gücün yaklaşık %5 azaldı"]', 3,
     'Hesap düz bir bölme: 1,25 ÷ 1,3175 = 0,949. Etiketteki sayı büyüdü, satın alabildiğin küçüldü.',
     'enflasyon'),

    ('Kayıtlardaki en yüksek hiperenflasyon hangi ülkede yaşandı?',
     '["Zimbabve, 2008","Almanya, 1923","Macaristan, 1946 — fiyatlar yaklaşık her 15 saatte bir ikiye katlandı","Venezuela, 2018"]', 2,
     'İkinci Dünya Savaşı sonrası pengő çöktü; rekor bugüne kadar kırılmadı. Türkiye''nin yakın dönem zirvesi ise Ekim 2022''de %85,51''di.',
     'enflasyon')
) as v(question, options, correct_index, explanation, article_slug)
where not exists (
  select 1 from public.quiz_questions q
  where q.article_slug = v.article_slug and q.question = v.question
);

-- Kontrol
-- select correct_index, count(*) from public.quiz_questions
-- where article_slug = 'enflasyon' group by 1 order by 1;
