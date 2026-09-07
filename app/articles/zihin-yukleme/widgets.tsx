'use client';

// Zihin yükleme makalesinin interaktif parçaları.
//
// Tasarım kuralı: bu makalenin tezi "iddia türlerini ayırt etmeyi öğren".
// O yüzden widget'lar süs değil, tezin kendisini YAPTIRARAK öğretiyor —
// okur iddiayı kendisi sınıflandırıyor, sonra kaynağı görüyor.
//
// ⚠ Ağır bir şey YOK: WebGL, GSAP, canvas kullanılmıyor. Hero zaten
// ArticleShell üzerinden GSAP çekiyor; buraya ikinci bir yük eklemiyoruz.

import { useState } from 'react';

const ACCENT = '#818cf8';

/* ══════════════════════════════════════════════════════════════════════
   ÖLÇEK MERDİVENİ — "ne kadarı yapıldı" sorusunun görsel cevabı.
   Sayılar log ölçekte; doğrusal çizilirse ilk dört basamak görünmez olur.
   ══════════════════════════════════════════════════════════════════════ */

type Basamak = {
  ad: string;
  emoji: string;
  noron: number;
  noronEtiket: string;
  yil: string;
  detay: string;
  kaynak: string;
};

const BASAMAKLAR: Basamak[] = [
  {
    ad: 'Solucan (C. elegans)',
    emoji: '🪱',
    noron: 302,
    noronEtiket: '302 nöron',
    yil: '1986 · nicel sürüm 2019',
    detay:
      'Tam bağlantı şeması 40 yıldır elimizde. Hermafroditte 302, erkekte 385 nöron. Modellemeye elverişli nicel matrisler ise 2019’da tamamlandı.',
    kaynak: 'White 1986 · Cook 2019',
  },
  {
    ad: 'Meyve sineği (tam beyin)',
    emoji: '🪰',
    noron: 139255,
    noronEtiket: '139.255 nöron · ~50 milyon sinaps',
    yil: '2024',
    detay:
      'Yetişkin dişi sineğin bütün beyni. Otomatik yöntemler yetmedi: yaklaşık 33 insan-yılı elle düzeltme emeği harcandı.',
    kaynak: 'Dorkenwald 2024, Nature',
  },
  {
    ad: 'Fare görme korteksi (~1 mm³)',
    emoji: '🐭',
    noron: 200000,
    noronEtiket: '200.000+ hücre · 523 milyon sinaps',
    yil: '2025',
    detay:
      'Tarihte ilk kez yapı ve işlev AYNI hayvandan birlikte alındı: aynı dokuda hem bağlantı haritası hem ~75.000 nöronun canlı aktivite kaydı.',
    kaynak: 'MICrONS Consortium 2025, Nature',
  },
  {
    ad: 'İnsan korteksi (~1 mm³)',
    emoji: '🧠',
    noron: 57000,
    noronEtiket: '~57.000 hücre · ~150 milyon sinaps · 1,4 petabayt',
    yil: '2024',
    detay:
      'Saç telinden ince bir doku dilimi. 45 yaşında bir kadının, altındaki epileptik odağa ulaşmak için ameliyatla çıkarılmış sol ön orta temporal girusu — yani “tipik bir beyin” değil, elde ne varsa o.',
    kaynak: 'Shapson-Coe 2024, Science',
  },
  {
    ad: 'Bütün insan beyni',
    emoji: '🗻',
    noron: 86000000000,
    noronEtiket: '61–99 milyar nöron',
    yil: 'yapılmadı',
    detay:
      'Yukarıdaki 1,4 petabaytlık parça, bütün beynin yaklaşık MİLYONDA BİRİ. Nöron sayısının kendisi bile kesin bilinmiyor: en çok anılan “86 milyar” dört erkek bedenden ölçüldü, istatistiksel aralık 73–99 milyar.',
    kaynak: 'Azevedo 2009 · Goriely 2025',
  },
];

export function OlcekMerdiveni() {
  const [secili, setSecili] = useState(3);
  const enBuyuk = Math.log10(BASAMAKLAR[BASAMAKLAR.length - 1].noron);
  const b = BASAMAKLAR[secili];

  return (
    <div className="my-8 rounded-2xl border border-indigo-400/25 bg-indigo-400/[0.04] p-5 sm:p-6">
      <div className="mb-1 text-xs font-bold tracking-widest text-indigo-300">ÖLÇEK MERDİVENİ</div>
      <p className="m-0 mb-5 text-sm text-slate-400">
        Haritalama gerçekten ilerliyor. Basamaklara dokun — ve son basamağa geldiğinde araya giren boşluğa bak.
      </p>

      <div className="flex flex-col gap-2">
        {BASAMAKLAR.map((x, i) => {
          const oran = Math.log10(x.noron) / enBuyuk;
          const aktif = i === secili;
          return (
            <button
              key={x.ad}
              type="button"
              onClick={() => setSecili(i)}
              aria-pressed={aktif}
              className="group grid w-full grid-cols-[auto_1fr] items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-white/[0.04]"
              style={aktif ? { background: 'rgba(129,140,248,0.10)' } : undefined}
            >
              <span className="text-lg" aria-hidden>{x.emoji}</span>
              <span className="min-w-0">
                <span className="flex items-baseline justify-between gap-2">
                  <span className={`truncate text-sm ${aktif ? 'font-bold text-white' : 'text-slate-300'}`}>{x.ad}</span>
                  <span className="shrink-0 text-[0.7rem] tabular-nums text-slate-500">{x.yil}</span>
                </span>
                <span className="mt-1 block h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
                  <span
                    className="block h-full rounded-full transition-[width] duration-500"
                    style={{ width: `${Math.max(4, oran * 100)}%`, background: aktif ? ACCENT : 'rgba(129,140,248,0.4)' }}
                  />
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-xl border border-indigo-400/20 bg-black/20 px-4 py-4" aria-live="polite">
        <div className="text-sm font-bold text-indigo-200">{b.noronEtiket}</div>
        <p className="m-0 mt-2 text-sm leading-relaxed text-slate-300">{b.detay}</p>
        <div className="mt-2 text-[0.7rem] text-slate-500">Kaynak: {b.kaynak}</div>
      </div>

      <p className="m-0 mt-4 text-xs leading-relaxed text-slate-500">
        Çubuklar <strong className="text-slate-400">logaritmik</strong> ölçekte. Doğrusal çizilseydi ilk dört basamak
        görünmez olurdu — çünkü aradaki fark o kadar büyük.
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   İDDİA AYRACI — makalenin tezi, oynanabilir hâlde.
   Dört raf var ve DÖRDÜNCÜSÜ asıl ders: bazı iddialar yanlış değil,
   ÖLÇÜYE KAPALI. Okur bunu bir düğmeye basarak keşfediyor.
   ══════════════════════════════════════════════════════════════════════ */

type Raf = 'olculdu' | 'acik' | 'kapali' | 'kuruntu';

const RAFLAR: { id: Raf; ad: string; kisa: string; renk: string }[] = [
  { id: 'olculdu', ad: 'Ölçüldü', kisa: 'Laboratuvarda gösterildi', renk: '#34d399' },
  { id: 'acik', ad: 'Açık soru', kisa: 'Ciddi biçimde tartışılıyor', renk: '#38bdf8' },
  { id: 'kapali', ad: 'Ölçüye kapalı', kisa: 'Deneyle çözülemez', renk: '#a78bfa' },
  { id: 'kuruntu', ad: 'Kuruntu', kisa: 'Dayanağı yok', renk: '#fb7185' },
];

type Iddia = { metin: string; dogru: Raf; aciklama: string; kaynak?: string };

const IDDIALAR: Iddia[] = [
  {
    metin: 'Bir milimetreküp insan korteksinin nanometre çözünürlüklü haritası 1,4 petabayt tutuyor.',
    dogru: 'olculdu',
    aciklama:
      'Ölçüldü ve yayımlandı: o hacimde ~57.000 hücre, ~150 milyon sinaps ve ~230 mm kan damarı var. Aynı parça bütün beynin yaklaşık milyonda biri.',
    kaynak: 'Shapson-Coe 2024, Science',
  },
  {
    metin: 'Bağlantı haritası tek başına, sinyalin beyinde nasıl yayılacağını söylemeye yetmiyor.',
    dogru: 'olculdu',
    aciklama:
      '302 nöronlu solucanda 23.433 nöron çifti tek tek uyarılıp ölçüldü. Sinyal yayılımı, anatomiden yapılan tahminlerden saptı: nöronlar birbirine yalnız “kablolarla” değil, elektron mikroskobunda görünmeyen kimyasallarla da konuşuyor.',
    kaynak: 'Randi 2023, Nature',
  },
  {
    metin: 'Tek bir kortikal nöronu taklit etmek için 5–8 katmanlı derin bir yapay sinir ağı gerekiyor.',
    dogru: 'olculdu',
    aciklama:
      '“Yapay sinir ağındaki bir düğüm = bir nöron” eşitliğini tek başına bitiren bulgu. Karmaşıklığın büyük kısmını NMDA reseptörleri taşıyor: onlar çıkarılınca tek gizli katman yetiyor.',
    kaynak: 'Beniaguev 2021, Neuron',
  },
  {
    metin: 'Uzun süreli hafıza, korunmuş bir beynin yapısından geri okunabilir.',
    dogru: 'acik',
    aciklama:
      '312 sinirbilimciye soruldu: %70,5’i hafızanın esasen bağlantı desenlerinde ve sinaptik güçlerde tutulduğunu düşünüyor, ama statik bir yapı fotoğrafından hafıza çıkarılabilmesine verdikleri medyan olasılık ~%40. Yani ne “kesin” ne “saçmalık”.',
    kaynak: 'Zeleznikow-Johnston 2025, PLoS ONE',
  },
  {
    metin: 'Zihin, taşıyıcısından bağımsız bir hesaplamadır — yani prensipte başka bir donanımda çalışabilir.',
    dogru: 'acik',
    aciklama:
      'Zihnin hesaplamalı kuramı bilişsel bilimde ana akım konumdur, ama kanıtlanmış değildir. Yükleme vaadinin tamamı bu açık sorunun olumlu yanıtlanacağı varsayımına yaslanıyor. Ana akım bir bilinç kuramı (IIT) ise bunu açıkça reddediyor.',
    kaynak: 'Tononi 2025 · IIT-Concerned 2025, Nature Neuroscience',
  },
  {
    metin: 'Kopyan senden davranışsal olarak ayırt edilemiyorsa, o kopya sensin.',
    dogru: 'kapali',
    aciklama:
      'Ayırt edilemezlik ölçülebilir; “aynı kişi olmak” ölçülemez. Chalmers’ın moleküler ikiz argümanı: ikizin niteliksel olarak seninle özdeş olabilir, ama sayısal olarak değildir — ikizi öldürürlerse sen yaşarsın. Alanın kendi teknik yol haritası bu seviyeyi incelemeyi açıkça reddediyor.',
    kaynak: 'Chalmers 2014 · Sandberg & Bostrom 2008',
  },
  {
    metin: 'Beynimizin yalnızca %10’unu kullanıyoruz.',
    dogru: 'kuruntu',
    aciklama:
      'Kökeni bilim değil, reklamcılık. En ucuz çürütme metabolizmadan geliyor: beyin vücut ağırlığının %2’si ama enerjinin %20’sini yakıyor. Evrim bu kadar pahalı bir organın %90’ını atıl bırakmazdı. Yine de İngiltere’de öğretmenlerin %48’i buna katılıyor.',
    kaynak: 'Dekker 2012 · Macdonald 2017',
  },
  {
    metin: 'Beyinde nöronlardan on kat fazla glia hücresi var.',
    dogru: 'kuruntu',
    aciklama:
      'Gerçek oran yaklaşık 1:1 — 86,1 milyar nöron, 84,6 milyar nöron-dışı hücre. Ama dikkat: kuruntuyu düzelten sayının kendisi de sağlam değil. Nöron sayısı hâlâ bilinmiyor, en iyi tahmin 61–99 milyar arası.',
    kaynak: 'Azevedo 2009 · Goriely 2025',
  },
  {
    metin: 'Yeterli hesap gücümüz olsaydı bir insan beynini şimdiden simüle ederdik.',
    dogru: 'kuruntu',
    aciklama:
      'Soru yanlış kurulmuş. Gereken güç tahminleri 10¹⁵ ile 10³⁰ FLOPS arasında değişiyor — on beş büyüklük mertebesi belirsizlik. Alt uç bugün elimizde. Cevap tamamen “hangi biyolojik ayrıntı gerekli?” sorusuna bağlı ve o soru cevapsız. Darboğaz hesap gücü değil, veri ve model.',
    kaynak: 'Sandberg & Bostrom 2008 · State of Brain Emulation Report 2025 (ön baskı)',
  },
  {
    metin: 'Matrix, insan zihninin bilgisayara yüklenmesini anlatır.',
    dogru: 'kuruntu',
    aciklama:
      'Filmde hiçbir insanın zihni aktarılmaz. Beyinler kapsüllerde, kendi kafataslarında durur; makineler yalnız duyusal girdi besler. Bu bir “fanustaki beyin” senaryosu — yüklemenin tersi. Chalmers’ın ifadesiyle: Neo aslında bir fanustaki beyindir.',
    kaynak: 'Chalmers 2005, “The Matrix as Metaphysics”',
  },
];

export function IddiaAyraci() {
  const [i, setI] = useState(0);
  const [secim, setSecim] = useState<Raf | null>(null);
  const [dogruSayi, setDogruSayi] = useState(0);
  const [bitti, setBitti] = useState(false);

  const iddia = IDDIALAR[i];
  const dogruRaf = RAFLAR.find((r) => r.id === iddia.dogru)!;

  function sec(r: Raf) {
    if (secim) return;
    setSecim(r);
    if (r === iddia.dogru) setDogruSayi((n) => n + 1);
  }
  function ileri() {
    if (i + 1 >= IDDIALAR.length) { setBitti(true); return; }
    setI(i + 1);
    setSecim(null);
  }
  function bastanBasla() {
    setI(0); setSecim(null); setDogruSayi(0); setBitti(false);
  }

  if (bitti) {
    return (
      <div className="my-8 rounded-2xl border border-indigo-400/25 bg-indigo-400/[0.04] p-6 text-center">
        <div className="text-xs font-bold tracking-widest text-indigo-300">İDDİA AYRACI</div>
        <div className="mt-3 text-4xl font-black text-white">{dogruSayi}/{IDDIALAR.length}</div>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-300">
          Asıl mesele kaç tanesini bildiğin değil. <strong className="text-indigo-200">Dört rafın var olduğunu</strong>{' '}
          fark etmek. Çoğu tartışma, “ölçüye kapalı” bir iddiayı “açık soru” sanmaktan ya da “açık soru”yu
          “kuruntu” diye kestirip atmaktan çıkıyor.
        </p>
        <button
          type="button"
          onClick={bastanBasla}
          className="mt-5 rounded-lg border border-indigo-400/40 px-4 py-2 text-sm font-bold text-indigo-200 transition-colors hover:bg-indigo-400/10"
        >
          Baştan dene
        </button>
      </div>
    );
  }

  return (
    <div className="my-8 rounded-2xl border border-indigo-400/25 bg-indigo-400/[0.04] p-5 sm:p-6">
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <span className="text-xs font-bold tracking-widest text-indigo-300">İDDİA AYRACI</span>
        <span className="text-xs tabular-nums text-slate-500">{i + 1} / {IDDIALAR.length}</span>
      </div>
      <p className="m-0 mb-4 text-sm text-slate-400">Bu iddia hangi rafa ait?</p>

      <blockquote className="m-0 mb-5 border-l-4 pl-4 text-lg leading-relaxed text-slate-100" style={{ borderColor: ACCENT }}>
        {iddia.metin}
      </blockquote>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {RAFLAR.map((r) => {
          const secildi = secim === r.id;
          const buDogru = secim && r.id === iddia.dogru;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => sec(r.id)}
              disabled={!!secim}
              className="rounded-xl border px-3 py-3 text-left transition-all disabled:cursor-default"
              style={{
                borderColor: buDogru ? r.renk : secildi ? 'rgba(251,113,133,0.6)' : 'rgba(255,255,255,0.12)',
                background: buDogru ? `${r.renk}1f` : secildi ? 'rgba(251,113,133,0.10)' : 'transparent',
                opacity: secim && !buDogru && !secildi ? 0.45 : 1,
              }}
            >
              <span className="block text-sm font-bold" style={{ color: secim ? (buDogru ? r.renk : '#e2e8f0') : '#e2e8f0' }}>
                {r.ad}
              </span>
              <span className="mt-0.5 block text-[0.68rem] leading-snug text-slate-400">{r.kisa}</span>
            </button>
          );
        })}
      </div>

      {secim && (
        <div className="mt-5 rounded-xl border border-white/10 bg-black/25 px-4 py-4" aria-live="polite">
          <div className="text-sm font-bold" style={{ color: dogruRaf.renk }}>
            {secim === iddia.dogru ? '✓ Doğru raf' : `✗ Doğru raf: ${dogruRaf.ad}`}
          </div>
          <p className="m-0 mt-2 text-sm leading-relaxed text-slate-300">{iddia.aciklama}</p>
          {iddia.kaynak && <div className="mt-2 text-[0.7rem] text-slate-500">Kaynak: {iddia.kaynak}</div>}
          <button
            type="button"
            onClick={ileri}
            className="mt-4 rounded-lg border border-indigo-400/40 px-4 py-2 text-sm font-bold text-indigo-200 transition-colors hover:bg-indigo-400/10"
          >
            {i + 1 >= IDDIALAR.length ? 'Bitir' : 'Sıradaki iddia →'}
          </button>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   VERİ — ArticleShell bileşenlerine beslenen düz diziler.
   ══════════════════════════════════════════════════════════════════════ */

export const timeline = [
  {
    year: '1986',
    title: 'İlk tam konnektom',
    text: '302 nöronlu bir solucanın bütün bağlantı şeması çıkarıldı. Bugüne kadar tam konnektomu alınmış tür sayısı hâlâ bir elin parmaklarını geçmiyor.',
  },
  {
    year: '2005',
    title: 'Blue Brain başlıyor',
    text: 'EPFL’de kortikal mikrodevreyi bilgisayarda yeniden kurma projesi. On dokuz yıl sürecek.',
  },
  {
    year: '2013',
    title: 'Human Brain Project',
    text: 'Avrupa Birliği amiral gemisi. On yılda 607 milyon avro, 19 ülkeden 155 kurum. Bir yıl sonra yüzlerce bilim insanı yönetime açık mektupla itiraz edecek.',
  },
  {
    year: '2018',
    title: 'Beyin koruma ödülü',
    text: 'Aldehit-stabilize kriyoprezervasyon, bağımsız değerlendirmeyle bir domuz beyninin sinaptik yapısını koruyarak Büyük Memeli Ödülü’nü kazandı. Aynı yıl MIT, aynı yöntemi satmaya çalışan şirketle bağını kesti.',
  },
  {
    year: '2023',
    title: 'HBP kapanıyor',
    text: '3000’den fazla yayın, EBRAINS altyapısı, ~200 beyin bölgesinin 3B haritası. Bu listede bir insan beyni simülasyonu yok.',
  },
  {
    year: '2024',
    title: 'Sinek ve bir milimetreküp',
    text: 'Yetişkin meyve sineğinin tam beyin konnektomu (139.255 nöron) ve bir milimetreküp insan korteksinin 1,4 petabaytlık haritası aynı yıl yayımlandı. Blue Brain yıl sonunda kapandı.',
  },
  {
    year: '2025',
    title: 'Yapı ve işlev birlikte',
    text: 'Fare görme korteksinde ilk kez bağlantı haritası ve canlı nöron aktivitesi aynı hayvandan alındı. Aynı yıl 312 sinirbilimciye soruldu: insan emülasyonu için medyan tahmin 2125.',
  },
];

// Kültür tablosu. İKİ EKSEN bilerek: tek eksenli bir ayraç (“tarama yıkıcıysa
// bilime yakın”) yanlış sonuç veriyor — SOMA’da tarama yıkıcı DEĞİL, dehşeti
// tam da bundan geliyor: her aktarımda eski beden bilinçli olarak geride kalır.
export const kultur: {
  ad: string;
  yil: string;
  yukleme: 'evet' | 'hayir' | 'kismen';
  dogru: string;
  yanlis: string;
}[] = [
  {
    ad: 'The Matrix',
    yil: '1999',
    yukleme: 'hayir',
    dogru: 'Beyne sahte duyusal girdi vermek gerçek bir kategori — ve beyin-bilgisayar arayüzleriyle kısmen zaten yapılıyor.',
    yanlis: 'Hiçbir insanın zihni aktarılmaz. Beyinler kapsülde, kafatasında durur. Bu yükleme değil, “fanustaki beyin”.',
  },
  {
    ad: 'SOMA',
    yil: '2015',
    yukleme: 'evet',
    dogru: 'Kopya sorununu bugüne kadarki en acı biçimde kuran yapıt: tarama yıkıcı değildir, her aktarımda eski beden bilinçli olarak geride kalır.',
    yanlis: 'Neredeyse yok. Mekanizma değil, sonuç üzerine kurulu — ve o sonuç felsefi literatürle birebir örtüşüyor.',
  },
  {
    ad: 'Star Trek: TNG — “Second Chances”',
    yil: '1993',
    yukleme: 'kismen',
    dogru: 'İki Riker da eşit derecede gerçek. Parfit’in bölünme senaryosunun televizyondaki en temiz örneği.',
    yanlis: 'Işınlanma mekanizması kurgusal; ama sorduğu soru gerçek.',
  },
  {
    ad: 'Black Mirror — “USS Callister”',
    yil: '2017',
    yukleme: 'evet',
    dogru: 'Kopya tam bilinçlidir ve acı çeker; orijinal hiçbir şey hissetmez. Ayrımı mükemmel gösterir.',
    yanlis: 'DNA’dan bilinç kopyalanması. DNA anı taşımaz — en ucuz kanıt tek yumurta ikizleri: aynı DNA, ayrı iki kişi.',
  },
  {
    ad: 'Black Mirror — “White Christmas”',
    yil: '2014',
    yukleme: 'evet',
    dogru: 'Öznel zamanın hızlandırılabilmesi fikri, bir emülasyonun saat hızının donanıma bağlı olmasından mantıken çıkar.',
    yanlis: 'Kopyalamanın nasıl yapıldığı hiç anlatılmaz.',
  },
  {
    ad: 'Neuromancer',
    yil: '1984',
    yukleme: 'kismen',
    dogru: 'İki kategoriyi aynı kitapta ayırır: siberuzaya “bağlanmak” ile Dixie Flatline’ın ROM kopyası aynı şey değildir. Dijital ölümsüzlüğü ödül değil, yük olarak kurar — kopya kendi silinmesini ister.',
    yanlis: 'Teknik mekanizma yok; ama kitabın iddiası da teknik değil.',
  },
  {
    ad: 'Altered Carbon',
    yil: 'roman 2002',
    yukleme: 'evet',
    dogru: 'Bedenin değiştirilebilir olmasının toplumsal sonuçlarını ciddiye alır.',
    yanlis: 'Kendi kendini çürütür: zenginler zihin kopyalarını uzak depolarda tutup “düzenli günceller”. Güncellenebilen şey bir akış değil, periyodik bir yedektir.',
  },
  {
    ad: 'Transcendence',
    yil: '2014',
    yukleme: 'evet',
    dogru: 'Neredeyse yok.',
    yanlis: 'Listenin en zayıfı. Mekanizma hiç açıklanmaz; “kuantum bilgisayar” teknik içerik değil, süs.',
  },
  {
    ad: 'Severance',
    yil: '2022',
    yukleme: 'hayir',
    dogru: '“Süreklilik nedir?” sorusunu donanım hiç değiştirmeden sorar. Tek beyin, tek bilinç akışı, iki bellek bölmesi.',
    yanlis: 'Yükleme değil — ama zaten öyle olduğunu iddia etmiyor.',
  },
];
