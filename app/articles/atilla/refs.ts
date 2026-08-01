import type { BibItem } from '@/app/components/ArticleBibliography';

// Kaynakça — düz (client-olmayan) modül; page.tsx (JSON-LD citation) + Client ortak kaynağı.
//
// BU MAKALENİN KAYNAK SORUNU HERKESTEN BÜYÜK: Atilla hakkında elimizde TEK bir
// görgü tanığı var (Priskos, 449 elçiliği) ve onun eseri de KAYIP — yalnızca
// başkalarının içine aldığı parçalar duruyor. Geri kalan her şey ya yüzyıl
// sonrasından (Jordanes, 551), ya düşman kalemi, ya da destan.
//
// Bu yüzden kaynaklar üç kuşağa ayrılmış hâlde duruyor ve makale hangisinin
// hangisi olduğunu okura söylüyor:
//   (1) ÇAĞDAŞ  — Priskos, Prosper, Hydatius: olayı gören ya da yaşarken yazan.
//   (2) SONRAKİ — Jordanes, Marcellinus Comes: 70-100 yıl sonra, ikinci elden.
//   (3) MİRAS   — Nominalia, Kézai, Edda, Nibelungen: tarih değil, HAFIZA belgesi.
//       Bunlar "ne oldu"yu değil "kim sahiplendi"yi anlatır (Perde 10).
//
// Modern literatür de bilerek karışık: Türk tarih yazımının Hun-Türk hattı
// (Kafesoğlu, Taşağıl, Németh) ile Batı literatürünün temkinli kanadı
// (Maenchen-Helfen, Thompson) YAN YANA duruyor. Maenchen-Helfen bu makalenin
// çerçevesine en çok itiraz eden kaynaktır ve tam da bu yüzden listede.
export const refs: BibItem[] = [
  /* ── (1) ÇAĞDAŞ — olayı gören ya da yaşarken yazan ── */
  {
    title:
      'Elçilik anlatısı (Fragment 8) — Atilla’nın otağında geçen 449 ziyafetinin TEK görgü tanığı kaydı: tahta kadeh, süssüz kılıç ve Roma’dan kaçıp Hunlarda yaşamayı seçen Rum tüccar',
    authors: 'Panionlu Priskos (Priscus of Panium)',
    year: '449 (eser kayıp; parçalar hâlinde)',
    source:
      'Yunanca aslı kayıp; parçalar Jordanes ve 10. yy Bizans derlemesi Excerpta de Legationibus üzerinden geldi',
    url: 'https://faculty.georgetown.edu/jod/texts/priscus.html',
  },
  {
    title:
      'Chronicon — 452 İtalya seferi sırasında yarımadadaki kıtlık ve salgının çağdaş kaydı (Mincio dönüşünün "ilahi müdahale" dışı açıklaması)',
    authors: 'Hydatius',
    year: '~468',
    source: 'Çağdaş Hispania kaydı',
  },
  {
    title:
      'Epitoma Chronicon — Papa I. Leo’nun Mincio’daki görüşmesinin en erken kaydı; Roma kilisesine yakın kalem',
    authors: 'Prosper Tiro (Aquitanialı Prosper)',
    year: '~455',
    source: 'Çağdaş, ama taraflı: Leo anlatısının kaynağı bu metindir',
  },

  /* ── (2) SONRAKİ — 70-100 yıl sonra, ikinci elden ── */
  {
    title:
      'Getica — Atilla’nın fizikî tasviri, Mars’ın Kılıcı, Bleda’nın ölümü, Catalaunum ve üç tabutlu defin anlatısının kaynağı',
    authors: 'Jordanes',
    year: '551',
    source:
      'Kayıp Cassiodorus’tan özet; GOT YANLISI ve olaylardan ~100 yıl sonra. Priskos’u kullanır ama nerede alıntıladığı, nerede eklediği belirsiz',
  },
  {
    title:
      'Chronicon — Atilla’nın ölümünü "bir kadının eliyle" diye kaydeden tek kaynak (Priskos/Jordanes’in kanama anlatısına karşı)',
    authors: 'Marcellinus Comes',
    year: '~518-534',
    source: 'Doğu Roma sarayına yakın, olaydan ~70 yıl sonra',
  },

  /* ── (3) MİRAS — tarih değil, hafıza belgesi (Perde 10) ── */
  {
    title:
      'Bulgar Hanları Nominaliası — Dulo hanedanını Avitohol ve İrnik’le başlatan liste; İrnik’in Atilla’nın oğlu Ernak olduğu yaygın kabul, Avitohol’ün Atilla olduğu ise tartışmalı',
    authors: 'Anonim (Kilise Slavcası nüshalar)',
    year: 'çekirdeği erken, nüshalar geç',
    source: 'Birincil miras belgesi: bir hanedanın kendi soyunu nereye bağladığını gösterir',
    url: 'https://en.wikipedia.org/wiki/Nominalia_of_the_Bulgarian_Khans',
  },
  {
    title:
      'Gesta Hunnorum et Hungarorum — Macar hanedanının soyunu Atilla’ya bağlayan kroniğin kendisi; Hun-Macar sürekliliği anlatısının kurucu metni',
    authors: 'Kézai Simon (Simon of Kéza)',
    year: '~1283',
    source: 'Kraliyet kroniği: olay kaydı değil, HAK İDDİASI belgesi',
  },
  {
    title:
      'Şiirsel Edda — Atlakviða ve Atlamál: Atli (Atilla) İskandinav şiirinde hain ve açgözlü çizilir, Guðrún’un intikamıyla ölür',
    authors: 'Anonim; Codex Regius',
    year: 'yazma ~1270, şiirler daha eski',
    source: 'Destan geleneği: ölümün "bir kadın" hattı burada da karşımıza çıkar',
  },
  {
    title:
      'Nibelungenlied — Aynı adamın ZIT portresi: Etzel burada cömert, ölçülü ve saygın bir hükümdardır',
    authors: 'Anonim (Orta Yüksek Almanca)',
    year: '~1200',
    source: 'Alman destanı: Edda’nın tam karşı kutbu; ikisi yan yana okunmalı',
  },

  /* ── MODERN LİTERATÜR ── */
  {
    title:
      'Ancient genomes reveal trans-Eurasian connections between the European Huns and the Xiongnu Empire — 370 antik genom (MÖ 200-MS 600); Karpat Havzası’ndaki bazı ELİT gömülerle Hun (Xiongnu) elitleri arasında doğrudan soy bağı',
    authors: 'Guido Alberto Gnecchi-Ruscone ve ark.',
    year: '2025',
    source:
      'PNAS. ⚠ İki bulguyu BİRLİKTE okumak şart: elit soy bağı doğrulandı, ama nüfusun tamamı için kitlesel göç bulunmadı — yüksek çeşitlilikte bir federasyon tablosu',
    url: 'https://www.pnas.org/doi/abs/10.1073/pnas.2418485122',
  },
  {
    title: 'Türk Millî Kültürü — kut anlayışı, ikili teşkilat ve kurultay: bozkır devlet yapısının çerçevesi',
    authors: 'İbrahim Kafesoğlu',
    year: '1977',
    source: 'Türk tarih yazımının Hun-Türk hattındaki temel eseri',
  },
  {
    title: 'Hunlar / Kök Tengri’nin Çocukları — Asya Hunlarından Avrupa Hunlarına bozkır siyasetinin sürekliliği',
    authors: 'Ahmet Taşağıl',
    year: '2016 ve sonrası baskılar',
    source: 'Çin kaynaklarını doğrudan kullanan Türk tarihçiliği',
  },
  {
    title:
      'The World of the Huns: Studies in Their History and Culture — alan literatürünün başvuru eseri; Hun-Türk özdeşliğine EN TEMKİNLİ yaklaşan kaynak, bilerek listede',
    authors: 'Otto J. Maenchen-Helfen',
    year: '1973',
    source: 'University of California Press. Bu makalenin çerçevesine itiraz eden taraf',
  },
  {
    title:
      'The End of Empire: Attila the Hun and the Fall of Rome — haraç ekonomisi, 449 suikast komplosu ve Catalaunum’un modern değerlendirmesi',
    authors: 'Christopher Kelly',
    year: '2009',
    source: 'W. W. Norton',
  },
  {
    title:
      'The Fall of the Roman Empire: A New History of Rome and the Barbarians — Kavimler Göçü zincirinin ve 476’nın Atilla’dan BAĞIMSIZ mekanizmasının çerçevesi',
    authors: 'Peter Heather',
    year: '2005',
    source: 'Oxford University Press',
  },
  {
    title:
      '447 Konstantinopolis depremi — 57 kulenin yıkılışı ve tarihin kendisinin tartışmalı olduğu (26 Ocak / 6 Kasım / 8 Kasım / 8 Aralık) kaydı',
    authors: 'Vikipedi (İngilizce) — çapraz kontrol için',
    year: 'erişim 2026',
    source: 'Tek dayanak değil; tarih tartışmasının varlığını göstermek için',
    url: 'https://en.wikipedia.org/wiki/447_Constantinople_earthquake',
  },
];
