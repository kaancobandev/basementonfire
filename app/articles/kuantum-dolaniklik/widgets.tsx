'use client';

// Kuantum dolanıklık makalesinin interaktif parçaları.
//
// Tasarım kuralı: bu makalenin tezi "korelasyon var, iletişim yok — ve uyum,
// parçacıkların cebinde taşıdığı hiçbir cevap listesiyle açıklanamayacak kadar
// güçlü". İkinci yarısı SÖZLE anlatılınca inandırıcı olmuyor; o yüzden
// MerminKutulari onu OYNATARAK gösteriyor: okur talimat listesiyle oynayıp
// 1/3'ün altına inemediğini kendi görüyor.
//
// ⚠ Ağır bir şey YOK: WebGL/GSAP/canvas kullanılmıyor. Hero zaten ArticleShell
// üzerinden GSAP çekiyor, buraya ikinci bir yük binmiyor.

import { useState } from 'react';

const ACCENT = '#f472b6'; // Bertlmann'ın pembe çorabı

/* ══════════════════════════════════════════════════════════════════════
   TERİM MERDİVENİ — her basamak yalnız kendinden öncekilere dayanır.
   Kullanıcı isteği: "terim kullanacağın zaman önceden açıklamasını da söyle".
   Gövdede terimler ilk geçtikleri yerde ayrıca açılıyor; bu widget başvuru
   listesi, okur takıldığında geri dönebilsin diye.
   ══════════════════════════════════════════════════════════════════════ */

const TERIMLER: { ad: string; tanim: string; uyari?: string }[] = [
  {
    ad: 'Kuantum',
    tanim: 'Doğanın en küçük ölçeğinde enerjinin sürekli bir musluk gibi değil, bölünemez küçük porsiyonlar hâlinde gelmesi. Kelimenin kendisi zaten “bir porsiyon” demek.',
  },
  {
    ad: 'Ölçüm',
    tanim: 'Kuantum sistemini bir aletle — ve dolayısıyla çevresiyle — etkileşime sokup ondan tek bir kesin sonuç almak.',
    uyari: 'Bir insanın bakması GEREKMEZ. Bir dedektör, bir fotoğraf plakası, hatta bir hava molekülü de aynı işi görür.',
  },
  {
    ad: 'Süperpozisyon',
    tanim: 'Bir sistemin, ölçülene kadar birden fazla olasılığı birden “açık” tutması.',
    uyari: '“Cevabı var ama biz bilmiyoruz” DEĞİL. Ayrıca neyin kararsız olduğu hangi soruyu sorduğunuza bağlıdır: bir eksende kararsız olan durum başka bir eksende gayet kesindir.',
  },
  {
    ad: 'Ölçüm ayarı (eksen)',
    tanim: 'Sisteme hangi soruyu soracağınızın seçimi: filtreyi kaç dereceye kurduğunuz, manyetik alanı hangi yöne çevirdiğiniz.',
    uyari: 'Bu yazının bütün gizemi bu seçimin var olmasından doğuyor. Ayarı olmayan hiçbir mecaz dolanıklığı anlatamaz.',
  },
  {
    ad: 'Polarizasyon',
    tanim: 'Işığın titreşim yönü. Güneş gözlüğünüzün camı tam da bunu süzüyor. Dolanıklık deneylerinde en çok ölçülen özellik.',
  },
  {
    ad: 'Korelasyon (uyum)',
    tanim: 'İki ölçümün sonuçlarının birbirine uyması.',
    uyari: 'Uymak, birinin ötekine bir şey GÖNDERMESİ demek değildir. Bu yazının ekseni tam olarak bu ayrım.',
  },
  {
    ad: 'Dolanıklık',
    tanim: 'İki sistemin ortak durumunun, her birinin kendi ayrı durumlarının basit bir birleşimine ayrıştırılamaması. Schrödinger’in formülüyle: bütünü mümkün en iyi şekilde bilmek, parçalarını en iyi şekilde bilmeyi içermez.',
    uyari: 'Tanım “önce temas etmiş olmak” DEĞİL. Etkileşim, dolanıklık üretmenin bir yolu — tanımı değil.',
  },
  {
    ad: 'Yerellik',
    tanim: 'Bir yerde olup bitenin uzaktaki bir yeri, ancak araya ışık hızını aşmayan bir şey girerse etkileyebileceği ilkesi. Kısaca: uzaktan dokunulmaz.',
  },
  {
    ad: 'Yerel gizli değişken',
    tanim: '“Parçacıklar aslında yola çıkarken cevabı ceplerinde taşıyorlardı, biz bilmiyorduk” fikri: her parçacığın yalnızca kendi bulunduğu yerdeki bilgiye dayanan gizli bir talimat listesi taşıdığı varsayımı.',
    uyari: 'Deneylerin elediği şey tam olarak bu. Gizli değişkenlerin TAMAMI değil — yalnız YEREL olanları.',
  },
  {
    ad: 'Bell eşitsizliği',
    tanim: 'Cevaplar önceden ve yerel olarak yazılmış olsaydı, ölçüm uyumunun dışına çıkamayacağı aralık.',
    uyari: '“Aşamayacağı tavan” demek yarı yanlış: bazı düzeneklerde uyum tavanı aşmaz, tabanın ALTINA düşer. Doğrusu “aralığın dışında”.',
  },
  {
    ad: 'Kaçamak yolu (loophole)',
    tanim: 'Deneyin, sonucun “aslında sıradan bir sebeple” açıklanmasına kapı bırakan zayıf noktası: dedektörlerin sinyalleşebilecek kadar yakın olması, parçacıkların yalnızca uygun bir kısmının yakalanması, ayarı seçen rastgeleliğin kaynakla ilişkili olması.',
  },
  {
    ad: 'Mesajlaşamama teoremi',
    tanim: 'Dolanıklıkla tek bir bit bile gönderilemeyeceğinin matematiksel kanıtı: uzaktaki kişinin kendi verisinde göreceği hiçbir şey, sizin ne yaptığınıza göre değişmez.',
  },
  {
    ad: 'Klasik kanal',
    tanim: 'Telefon, internet, radyo. “Klasik” burada “eski moda” değil, “kuantum olmayan” demek — ve ışık hızını aşamaz.',
  },
  {
    ad: 'Dekoherans',
    tanim: 'Sistemin çevresiyle etkileşip kuantumluğunu çevreye dağıtması. Kaybolmaz; geri toplanamaz hâle gelir.',
    uyari: 'Büyük ve sıcak şeylerde neden kuantumluk görmediğimizin cevabı bu. Ama ölçüm problemini ÇÖZMÜŞ değil.',
  },
];

export function TerimMerdiveni() {
  const [acik, setAcik] = useState<number | null>(0);
  return (
    <div className="my-8 rounded-2xl border border-pink-400/25 bg-pink-400/[0.04] p-5 sm:p-6">
      <div className="mb-1 text-xs font-bold tracking-widest text-pink-300">TERİM MERDİVENİ</div>
      <p className="m-0 mb-4 text-sm text-slate-400">
        Her basamak yalnız kendinden öncekilere dayanıyor. Yazının herhangi bir yerinde takılırsan buraya dön.
      </p>
      <ol className="m-0 flex list-none flex-col gap-1 p-0">
        {TERIMLER.map((t, i) => {
          const aktif = acik === i;
          return (
            <li key={t.ad}>
              <button
                type="button"
                onClick={() => setAcik(aktif ? null : i)}
                aria-expanded={aktif}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-white/[0.04]"
              >
                <span
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[0.7rem] font-black"
                  style={{ background: aktif ? ACCENT : 'rgba(244,114,182,0.15)', color: aktif ? '#1c1017' : '#f9a8d4' }}
                >
                  {i + 1}
                </span>
                <span className={`text-sm ${aktif ? 'font-bold text-white' : 'text-slate-300'}`}>{t.ad}</span>
                <span className="ml-auto text-xs text-slate-500" aria-hidden>{aktif ? '−' : '+'}</span>
              </button>
              {aktif && (
                <div className="mb-2 ml-9 mr-2 rounded-lg border border-pink-400/20 bg-black/25 px-4 py-3">
                  <p className="m-0 text-sm leading-relaxed text-slate-300">{t.tanim}</p>
                  {t.uyari && (
                    <p className="m-0 mt-2 text-sm leading-relaxed" style={{ color: '#fbcfe8' }}>
                      <strong>Dikkat:</strong> {t.uyari}
                    </p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   MERMİN KUTULARI — makalenin kalbi, oynanabilir Bell testi.

   Mermin 1981'in düzeneği: iki kutu, her birinde üç konumlu bir düğme,
   kırmızı/yeşil iki lamba. İki kural gözlenir:
     (1) İKİ DÜĞME AYNI konumdaysa lambalar HER ZAMAN aynı rengi verir.
     (2) Düğmeler FARKLI konumdaysa uyum oranı DÖRTTE BİR çıkar.

   Talimat listesi (yerel gizli değişken) resmi (1)'i sağlayabilir: her çifte
   üç konum için önceden yazılmış ortak bir renk listesi verilir. Ama o zaman
   (2) ÜÇTE BİR'in altına İNEMEZ — çünkü üç konuma iki renk dağıtıldığında
   en az ikisi aynı olmak zorundadır (güvercin yuvası). Çarpışma budur.

   ⚠ Talimat kipinde listeler KASITLI olarak "iki bir, bir öteki" biçiminden
   seçiliyor; yani gizli değişken modelinin EN İYİ hâli. Rastgele seçilseydi
   uyum daha da yükselirdi. En iyi hâli bile 1/3'ün altına inemiyor.
   ══════════════════════════════════════════════════════════════════════ */

type Atis = { a: number; b: number; ra: 'K' | 'Y'; rb: 'K' | 'Y' };

// Üç konuma iki renk dağıtan, "ikisi bir renk biri öteki" olan altı liste.
const LISTELER: ('K' | 'Y')[][] = [
  ['K', 'K', 'Y'], ['K', 'Y', 'K'], ['Y', 'K', 'K'],
  ['Y', 'Y', 'K'], ['Y', 'K', 'Y'], ['K', 'Y', 'Y'],
];

function birAtis(kip: 'kuantum' | 'talimat', a: number, b: number): Atis {
  if (kip === 'talimat') {
    const l = LISTELER[Math.floor(Math.random() * LISTELER.length)];
    return { a, b, ra: l[a], rb: l[b] };
  }
  // Kuantum: aynı ayarda daima uyum, farklı ayarda 1/4 uyum.
  const ra: 'K' | 'Y' = Math.random() < 0.5 ? 'K' : 'Y';
  const uyum = a === b ? true : Math.random() < 0.25;
  return { a, b, ra, rb: uyum ? ra : ra === 'K' ? 'Y' : 'K' };
}

export function MerminKutulari() {
  const [kip, setKip] = useState<'kuantum' | 'talimat'>('kuantum');
  const [ayni, setAyni] = useState({ toplam: 0, uyan: 0 });
  const [farkli, setFarkli] = useState({ toplam: 0, uyan: 0 });
  const [son, setSon] = useState<Atis[]>([]);

  function calistir(adet: number) {
    let a2 = { ...ayni }, f2 = { ...farkli };
    const yeni: Atis[] = [];
    for (let i = 0; i < adet; i++) {
      const a = Math.floor(Math.random() * 3);
      const b = Math.floor(Math.random() * 3);
      const at = birAtis(kip, a, b);
      const uydu = at.ra === at.rb;
      if (a === b) a2 = { toplam: a2.toplam + 1, uyan: a2.uyan + (uydu ? 1 : 0) };
      else f2 = { toplam: f2.toplam + 1, uyan: f2.uyan + (uydu ? 1 : 0) };
      yeni.push(at);
    }
    setAyni(a2); setFarkli(f2);
    setSon((s) => [...yeni.slice(-10), ...s].slice(0, 10));
  }
  function sifirla() { setAyni({ toplam: 0, uyan: 0 }); setFarkli({ toplam: 0, uyan: 0 }); setSon([]); }
  function kipDegis(k: 'kuantum' | 'talimat') { setKip(k); sifirla(); }

  const fOran = farkli.toplam ? (farkli.uyan / farkli.toplam) * 100 : null;
  const aOran = ayni.toplam ? (ayni.uyan / ayni.toplam) * 100 : null;
  const renk = (r: 'K' | 'Y') => (r === 'K' ? '#f87171' : '#4ade80');

  return (
    <div className="my-8 rounded-2xl border border-pink-400/25 bg-pink-400/[0.04] p-5 sm:p-6">
      <div className="mb-1 text-xs font-bold tracking-widest text-pink-300">MERMİN KUTULARI · OYNANABİLİR BELL TESTİ</div>
      <p className="m-0 mb-4 text-sm leading-relaxed text-slate-400">
        İki kutu, her birinde <strong className="text-slate-300">üç konumlu</strong> bir düğme ve iki lamba: kırmızı ya da yeşil.
        Her turda iki düğme rastgele bir konuma kuruluyor ve bir çift parçacık gönderiliyor. Sen yalnız lambalara bakıyorsun.
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        {([
          ['kuantum', 'Gerçek deney', 'laboratuvarda ölçülen'],
          ['talimat', 'Talimat listesiyle', 'cevaplar cepte yazılı'],
        ] as const).map(([k, ad, alt]) => (
          <button
            key={k}
            type="button"
            onClick={() => kipDegis(k)}
            aria-pressed={kip === k}
            className="rounded-xl border px-4 py-2 text-left transition-colors"
            style={{
              borderColor: kip === k ? ACCENT : 'rgba(255,255,255,0.14)',
              background: kip === k ? 'rgba(244,114,182,0.12)' : 'transparent',
            }}
          >
            <span className="block text-sm font-bold" style={{ color: kip === k ? '#fbcfe8' : '#e2e8f0' }}>{ad}</span>
            <span className="block text-[0.68rem] text-slate-400">{alt}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => calistir(1)} className="rounded-lg border border-pink-400/40 px-4 py-2 text-sm font-bold text-pink-200 transition-colors hover:bg-pink-400/10">1 çift gönder</button>
        <button type="button" onClick={() => calistir(500)} className="rounded-lg border border-pink-400/40 px-4 py-2 text-sm font-bold text-pink-200 transition-colors hover:bg-pink-400/10">500 çift gönder</button>
        <button type="button" onClick={sifirla} className="rounded-lg border border-white/15 px-4 py-2 text-sm text-slate-400 transition-colors hover:bg-white/5">Sıfırla</button>
      </div>

      {/* Son atışlar */}
      {son.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-1.5" aria-hidden>
          {son.map((s, i) => (
            <span key={i} className="flex items-center gap-1 rounded-md border border-white/10 bg-black/25 px-2 py-1 text-[0.68rem] tabular-nums text-slate-400">
              {s.a + 1}·{s.b + 1}
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: renk(s.ra) }} />
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: renk(s.rb) }} />
            </span>
          ))}
        </div>
      )}

      {/* Sayaçlar */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2" aria-live="polite">
        <div className="rounded-xl border border-white/10 bg-black/25 px-4 py-4">
          <div className="text-xs font-bold text-slate-400">Düğmeler AYNI konumda</div>
          <div className="mt-1 text-3xl font-black" style={{ color: '#4ade80' }}>
            {aOran === null ? '—' : `%${aOran.toFixed(0)}`}
          </div>
          <div className="text-[0.7rem] text-slate-500">{ayni.toplam} tur · beklenen %100</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/25 px-4 py-4">
          <div className="text-xs font-bold text-slate-400">Düğmeler FARKLI konumda</div>
          <div className="mt-1 text-3xl font-black" style={{ color: fOran === null ? '#94a3b8' : fOran < 30 ? ACCENT : '#fbbf24' }}>
            {fOran === null ? '—' : `%${fOran.toFixed(1)}`}
          </div>
          <div className="text-[0.7rem] text-slate-500">
            {farkli.toplam} tur · talimat listesi <strong className="text-slate-400">%33,3’ün altına inemez</strong>
          </div>
        </div>
      </div>

      {/* Eşik çubuğu */}
      {fOran !== null && farkli.toplam >= 50 && (
        <div className="mt-4">
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/[0.07]">
            <span className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-300" style={{ width: `${Math.min(100, fOran)}%`, background: fOran < 30 ? ACCENT : '#fbbf24' }} />
            <span className="absolute inset-y-0 w-px bg-white/60" style={{ left: '33.33%' }} />
          </div>
          <div className="mt-1 flex justify-between text-[0.68rem] text-slate-500">
            <span>%0</span>
            <span className="text-slate-400">↑ talimat listesinin tabanı: %33,3</span>
            <span>%100</span>
          </div>
        </div>
      )}

      <p className="m-0 mt-5 text-sm leading-relaxed text-slate-300">
        {kip === 'talimat' ? (
          <>
            <strong className="text-white">Talimat listesiyle oynuyorsun.</strong> Her çifte, üç düğme konumu için önceden
            yazılmış ortak bir renk listesi veriliyor — yani parçacıklar cevabı cebinde taşıyor. Aynı konumda uyum daima
            %100 çıkıyor, tamam. Ama farklı konumda oran <strong className="text-white">%33,3’ün altına inmiyor</strong> ve
            inemez: üç konuma iki renk dağıtırsan en az ikisi aynı olmak zorunda. Listeler burada bilerek gizli değişken
            modelinin <em>en iyi</em> hâlinden seçildi.
          </>
        ) : (
          <>
            <strong className="text-white">Gerçek deneyi görüyorsun.</strong> Aynı konumda uyum yine %100 — talimat listesinin
            açıklayabildiği kısım bu. Ama farklı konumda oran <strong style={{ color: ACCENT }}>%25’e</strong> oturuyor:
            hiçbir talimat listesinin inemeyeceği yerin altına. Çarpışma burada. Cevaplar önceden ve yerel olarak yazılmış
            olamaz — çünkü yazılmış olsaydı bu sayı %33,3’ün altına düşemezdi.
          </>
        )}
      </p>
      <p className="m-0 mt-3 text-xs leading-relaxed text-slate-500">
        Dikkat: bu bir benzetme değil. Mermin’in kendi kaydıyla düzenek, EPR bilmecesinin sadeleştirilmiş bir hikâyesi
        değil, kendisi. Ve yön tuzağına düşme: burada uyum “çok fazla” değil <strong className="text-slate-400">çok az</strong> —
        önemli olan sayının büyüklüğü değil, hiçbir önceden anlaşmanın üretemeyeceği <em>aralığın dışında</em> olması.
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   VERİ
   ══════════════════════════════════════════════════════════════════════ */

export const timeline = [
  { year: '1935', title: 'EPR itirazı', text: 'Einstein, Podolsky ve Rosen kuantum kuramının eksik olduğunu savunan makaleyi yayımladı. Metni kaleme alan Podolsky’ydi; Einstein sonradan Schrödinger’e yazdığı mektupta asıl meselenin biçimcilik içinde boğulduğundan yakınacaktı.' },
  { year: '1935', title: 'Schrödinger terimi koyuyor', text: '“Dolanıklık” kelimesi bu yıl doğdu. Schrödinger onu kuantum mekaniğinin bir özelliği değil, klasik düşünceden kopuşunu dayatan ayırt edici özelliği ilan etti.' },
  { year: '1964', title: 'Bell tartışmayı deneye çeviriyor', text: 'John Bell, “cevaplar önceden ve yerel olarak yazılmış olsaydı” varsayımının ölçülebilir bir sınır doğurduğunu gösterdi. Felsefi tartışma bir anda laboratuvar sorusuna dönüştü.' },
  { year: '1972', title: 'İlk test', text: 'Freedman ve Clauser kalsiyum atomlarından çıkan foton çiftleriyle Bell eşitsizliğini ilk kez sınadı.' },
  { year: '1982', title: 'Aspect: ayarlar uçarken değişiyor', text: 'Aspect, Dalibard ve Roger analizörleri fotonlar yoldayken değiştirdi — böylece dedektörlerin önceden anlaşma ihtimali daraldı.' },
  { year: '1998', title: 'Innsbruck: 400 metre', text: 'Weihs ve ekibi ayarları kampüsün iki ucunda, ışığın gidip gelemeyeceği bir zaman penceresinde rastgele seçti. Ölçülen değer 2,73 ± 0,02 — klasik tavan 2.' },
  { year: '2015', title: 'Üç grup, aynı yıl, kaçamaksız', text: 'Delft (1,3 km, elektron spinleri), Viyana ve NIST/Boulder üç ana kaçamak yolunu ilk kez aynı anda kapattı. Delft’in istatistiksel gücü mütevazıydı; aynı yıl diğer ikisi çok daha yüksek anlamlılıkla doğruladı.' },
  { year: '2017', title: 'Uzaydan 1.203 kilometre', text: 'Micius uydusu dolanık foton çiftlerini birbirinden 1.203 km uzaktaki iki yer istasyonuna dağıttı — fiber kabloyla ulaşılan mesafeyi on iki büyüklük mertebesinden fazla aşarak.' },
  { year: '2022', title: 'Nobel', text: 'Fizik Nobel’i Aspect, Clauser ve Zeilinger’e verildi: dolanık fotonlarla yapılan deneyler, Bell eşitsizliklerinin ihlalinin ortaya konması ve kuantum bilgi biliminde öncülük.' },
];

// Kültür tablosu. İKİ EKSEN: (1) yapıt mesajlaşamama teoremini ihlal ediyor mu,
// (2) "kuantum" kelimesi orada gerçek bir kavram mı yoksa boş bir joker mi.
export const kultur: { ad: string; yil: string; tur: 'ihlal' | 'joker' | 'saglam'; dogru: string; yanlis: string }[] = [
  {
    ad: 'Üç Cisim Problemi',
    yil: 'roman 2008 · dizi 2024',
    tur: 'ihlal',
    dogru: 'Dolanıklığı olay örgüsünün merkezine koyan, en ciddi kurgu denemesi. Türk okur sofonları diziden sekiz yıl önce, İthaki’nin 2016 çevirisiyle tanıdı.',
    yanlis: 'Sofonlar yıldızlar arası mesafede anında haberleşiyor — mesajlaşamama teoreminin yasakladığı şeyin ta kendisi. Dizinin kendi bilim danışmanı bunu kabul ediyor: ışıktan hızlı iletişim olamaz, kurgu bunu “gizli boyutlar” diyerek atlıyor.',
  },
  {
    ad: 'Ant-Man and the Wasp',
    yil: '2018',
    tur: 'ihlal',
    dogru: 'Fikri Caltech’ten gerçek bir kuantum fizikçisi önerdi: dolanıklık, kayıp karakteri kurtarmanın anahtarı olsun.',
    yanlis: 'Filmde dolanıklık bir haberleşme kanalı gibi işliyor. Asıl ders şu: aynı fizikçi bir röportajda dolanıklığı “parçacıkların birbiriyle iletişim kurabilmesi” diye anlatmıştı. Hata popüler kültürde değil, popülerleştirme dilinde başlıyor.',
  },
  {
    ad: 'Star Trek — ışınlayıcı',
    yil: '1966’dan beri',
    tur: 'ihlal',
    dogru: 'Kuantum ışınlama gerçekten var — ama madde değil, DURUM aktarılıyor ve klasik kanaldan iki bit gönderilmeden işlem bitmiyor.',
    yanlis: 'Dizide madde ışınlanıyor. Yazarlar belirsizlik ilkesinin sorun çıkardığını fark edip “Heisenberg dengeleyicisi” adında uydurma bir alet koydular. Teknik danışmana “nasıl çalışıyor?” diye sorulduğunda cevabı efsane oldu: “Gayet iyi çalışıyor, teşekkürler.”',
  },
  {
    ad: 'Devs',
    yil: '2020',
    tur: 'saglam',
    dogru: 'Yorum tartışmasını ciddiye alan tek yapıt: bir karakter Bohm çizgisini savunuyor, makine ancak çok-dünyalı yoruma dayanan algoritmayla çalışıyor.',
    yanlis: 'Adı konmuş bir fizik danışmanı yok; yaratıcısı kendini “bilime meraklı bir yazar” diye tanımlıyor. Tatlı ironi: danışmanı olan yapıtlar fiziği daha çok eğdi.',
  },
  {
    ad: 'Doctor Who — “Blink”',
    yil: '2007',
    tur: 'joker',
    dogru: 'Ağlayan Melekler bakılınca donuyor; gözlem fikrini akılda kalıcı biçimde işliyor.',
    yanlis: 'Bu dolanıklık değil, ölçüm. Üstelik melekler ancak BAKAN biri olduğunda kilitleniyor — fizikte ise etkileşim yeterli, bilinç gerekmiyor.',
  },
  {
    ad: 'Outer Wilds',
    yil: '2019',
    tur: 'joker',
    dogru: 'Kuantum Ay, gözlenmediğinde başka bir gezegenin yörüngesine geçiyor. Süperpozisyon sezgisini oyunlaştırıyor.',
    yanlis: 'Oyun “gözlem” derken bilinçli bakışı kastediyor. Fizikte ölçüm için bir bilince gerek yok; bu ayrım kaybolunca “bilinç gerçekliği yaratır” kuruntusuna kapı açılıyor.',
  },
  {
    ad: 'Avengers: Endgame',
    yil: '2019',
    tur: 'joker',
    dogru: 'Neredeyse yok.',
    yanlis: 'Filmde anılan “Deutsch önermesi” diye bir şey yok — adı geçen fizikçinin kendisi böyle bir önermesi olmadığını söylüyor. “Kuantum âlemi” burada zaman yolculuğunu mümkün kılan sihirli bir muska işlevi görüyor.',
  },
  {
    ad: 'Tenet',
    yil: '2020',
    tur: 'joker',
    dogru: 'Konusu dolanıklık değil, entropi — yani termodinamik. Yönetmenin dürüstlüğü örnek: danışmanı olan fizikçiye, adını filme bilimsel gerçeklik süsü vermek için kullanmayacağına söz vermiş.',
    yanlis: 'Buna rağmen popüler tartışmada sık sık kuantum dolanıklıkla karıştırılıyor.',
  },
];

// Eski düşünürler. ⚠ Hiçbiri "kuantumu önceden bildi" diye sunulmuyor —
// katkıları öngörü değil, doğru SORUYU sormak.
export const dusunurler: { ad: string; ne: string; nasil: string; kirilma: string }[] = [
  {
    ad: 'Leibniz',
    ne: 'Önceden kurulmuş uyum (1696)',
    nasil: 'Birbirine hiç dokunmayan iki saat aynı anı gösterir. Leibniz üç açıklama sayar — aralarında bir bağ, sürekli bir ustanın ayarlaması, ya da baştan öyle ustalıkla yapılmış olmaları — ve üçüncüyü seçer. Her töz “yalnızca kendi yasalarını izler”, yine de “sanki birbirlerini etkiliyormuş gibi” uyum içindedir.',
    kirilma: 'Fizikçenin diline çevrilince bu tam olarak bir yerel gizli değişken modelidir: kaynakta yazılmış talimat, yalnız yerel okuma. Einstein’ın istediği çözüm buydu; Leibniz onu 250 yıl önce vermişti — ve deney ikisini birden eledi. Not: Leibniz bunu parçacıklar için değil ruh-beden birliği için söylüyordu; kurgusunu ödünç alıyoruz.',
  },
  {
    ad: 'Aristoteles',
    ne: 'Bilkuvve ve bilfiil',
    nasil: 'Heisenberg, kuantum kuramındaki olasılık dalgasını anlatmak için doğrudan Aristoteles’in “potentia” kavramına başvurdu: bu, bir şey için bir eğilimdi — eski kavramın niceliksel sürümü. Türkçede zaten yaşayan bir ayrım: palamut bilkuvve meşedir, bilfiil değil.',
    kirilma: 'Palamut tek bir sonuca yönelir ve olgunlaşma zamana yayılır; kuantum geçişi ani, dışsal ve geri dönülmez biçimde rastgeledir. Ve bu bir keşif değil: Aristoteles kuantumu önceden bilmedi, Heisenberg anlatmak için ondan bir kelime ödünç aldı.',
  },
  {
    ad: 'Gazâlî',
    ne: 'Nedensellik zorunlu değildir (11. yüzyıl)',
    nasil: 'Tehâfüt’ün on yedinci meselesinde, alışkanlıkla sebep sanılan şeyle sonuç sanılan şey arasındaki bağın zorunlu olmadığını savunur. Pamuk ateşe değince yanar, ama “değme” ile “yanma” arasındaki bağı gözlemlemeyiz; ardışıklığı gözlemleriz.',
    kirilma: 'Gazâlî’nin cevabı ilahiyattır: bağın kaynağı Allah’ın takdiridir. Yani soruyu çözer. Bell ise onu keskinleştirir ve belirli bir açıklama türünün imkânsız olduğunu deneyle gösterir. Aynı soru, farklı mahkeme: biri metafizikte, öteki laboratuvarda.',
  },
  {
    ad: 'Hume',
    ne: 'Bağlantıyı görmeyiz (1748)',
    nasil: 'Bir olay ötekini izler; ama aralarındaki bağı asla gözlemleyemeyiz. Birlikte görünürler, bağlı görünmezler. Bilardo topları örneği buradan.',
    kirilma: 'Dolanıklıkta güçlü bir uyum var ama görünür bir bağ yok — Hume’un uyarısı burada birebir işe yarıyor. Ama abartmayın: elenen şey belirli bir ortak-neden açıklaması türüdür, ortak-neden fikrinin tamamı değil.',
  },
];
