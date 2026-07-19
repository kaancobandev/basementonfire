'use client';

import { useEffect, useState, type ReactNode, type CSSProperties } from 'react';
import Link from 'next/link';
import ArticleBibliography, { type BibItem } from '@/app/components/ArticleBibliography';
import ArticleImage from '@/app/components/article/ArticleImage';

const refs: BibItem[] = [
  { title: 'Paralel Yaşamlar — Pyrrhus', authors: 'Plutarkhos', year: 'MS ~100', source: 'Antik biyografi' },
  { title: 'Pyrrhus, king of Epirus', source: 'Encyclopædia Britannica', url: 'https://www.britannica.com/biography/Pyrrhus-king-of-Epirus' },
  { title: 'Pyrrhic victory', source: 'Encyclopædia Britannica', url: 'https://www.britannica.com/topic/Pyrrhic-victory' },
  { title: 'Pyrrhus of Epirus', source: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Pyrrhus_of_Epirus' },
];

/* ════════════════════════ VERİ ════════════════════════ */

const quotes = [
  {
    tr: 'Romalılara karşı bir zafer daha kazanırsak, tamamen mahvoluruz.',
    ctx: 'Asculum Savaşı sonrası (MÖ 279) — tarihe geçen "Pirus zaferi" deyiminin doğduğu an.',
    icon: '🏛️',
  },
  {
    tr: 'Kartaca ve Roma için nasıl bir savaş meydanı bırakıyorum!',
    ctx: 'Sicilya\'dan ayrılırken; iki büyük gücün kaçınılmaz çatışmasını yıllar öncesinden gördü.',
    icon: '⚔️',
  },
  {
    tr: 'Bu adamlar barbar olabilir ama savaşmalarında barbarca hiçbir şey yok.',
    ctx: 'Roma ordusunun disiplinli düzenini ilk gördüğünde söylediği rivayet edilir.',
    icon: '🛡️',
  },
  {
    tr: 'Bana bir tarafta İskender\'in ordusunu, diğer tarafta cesaretini verin; dünyayı fethederim.',
    ctx: 'İdolü Büyük İskender\'e duyduğu hayranlığı yansıtan sözlerinden.',
    icon: '🦅',
  },
];

const battles = [
  {
    id: 'heraclea', name: 'Herakleia', year: 'MÖ 280', loc: 'Güney İtalya', enemy: 'Roma Cumhuriyeti', color: '#e0b34a',
    result: 'Zafer — ama ağır bedelle',
    forces: '~25.000 asker · 20 savaş fili',
    losses: 'Pirus ~4.000 · Roma ~7.000',
    desc: 'Pirus ile Roma\'nın ilk büyük karşılaşması. Romalılar tarihlerinde ilk kez savaş fili gördü — bu devasa yaratıklara korkuyla "Lucania öküzleri" dediler. Filler Roma süvarisini paniğe sürükledi, hatlar dağıldı ve Pirus sahayı kazandı. Fakat en deneyimli subaylarını ve birliklerini yitirdi; yeri doldurulamayacak bir kayıptı.',
  },
  {
    id: 'asculum', name: 'Asculum', year: 'MÖ 279', loc: 'Apulia, İtalya', enemy: 'Roma Cumhuriyeti', color: '#cf4b3a',
    result: 'Zafer — yıkıcı kayıp',
    forces: '~40.000 asker · 19 fil',
    losses: 'Pirus ~3.500 · Roma ~6.000',
    desc: 'İki gün süren kanlı bir mücadele. Pirus yine kazandı ama ordusunun çekirdeğini oluşturan elit askerlerini kaybetti. Zaferi kutlayanlara verdiği yanıt çağları aştı: "Romalılara karşı bir zafer daha kazanırsak, tamamen mahvoluruz." İşte "Pirus zaferi" deyimi buradan doğdu.',
  },
  {
    id: 'sicily', name: 'Sicilya Seferi', year: 'MÖ 278–276', loc: 'Sicilya', enemy: 'Kartaca', color: '#b07a3e',
    result: 'Büyük ilerleme, sonra geri çekilme',
    forces: 'Yunan kentlerinin desteğiyle büyük ordu',
    losses: 'Doğrudan büyük savaş değil; kuşatmalar',
    desc: 'Sicilyalı Yunanlar Pirus\'u Kartaca\'ya karşı çağırdı. Neredeyse tüm adayı ele geçirdi, yalnızca Lilybaeum kalesi direndi. Ama sert yönetimi ve ağır talepleri yüzünden Yunan kentlerinin desteğini kaybetti. Adadan ayrılırken o meşhur kehanetvari sözünü söyledi: "Kartaca ve Roma için nasıl bir savaş meydanı bırakıyorum!"',
  },
  {
    id: 'beneventum', name: 'Beneventum', year: 'MÖ 275', loc: 'Samnium, İtalya', enemy: 'Roma (M. Curius Dentatus)', color: '#9b6dd4',
    result: 'Beraberlik / stratejik yenilgi',
    forces: 'Yıpranmış ordu · filler',
    losses: 'Ağır; geri çekilmek zorunda kaldı',
    desc: 'Romalılar artık fillerle nasıl baş edeceklerini öğrenmişti: ateşli oklar ve gürültüyle filleri ürküttüler, panikleyen filler kendi saflarını ezdi. Pirus bu kez kazanamadı ve İtalya\'yı terk etti. Altı yıllık İtalya macerası, kazanılan savaşlara rağmen kaybedilmiş bir savaş olarak bitti.',
  },
];

const cineas = [
  { who: 'Cineas', t: 'Romalıları yenersek ne yapacağız efendim?', d: 'Bilge danışman Cineas, sefere çıkmadan önce Pirus\'a sordu.' },
  { who: 'Pirus', t: 'Bütün İtalya bizim olur — zengin ve güçlü.', d: 'Cineas yine sordu: "Peki İtalya\'yı aldıktan sonra?"' },
  { who: 'Pirus', t: 'Hemen yanı başında Sicilya var, onu da alırız.', d: 'Cineas: "Sicilya bizi durdurur mu?"' },
  { who: 'Pirus', t: 'Oradan Afrika\'ya, Kartaca\'ya geçeriz.', d: 'Cineas: "Peki tüm bunları ele geçirince?"' },
  { who: 'Pirus', t: 'O zaman dinlenir, kadeh kaldırır, keyfimize bakarız!', d: 'Cineas gülümsedi: "Peki efendim, bizi şu an dinlenip keyfimize bakmaktan alıkoyan ne? Tüm bunlara katlanmadan da huzura sahip olabiliriz."' },
];

const campaign = [
  { t: 'Tarentum\'un çağrısı', y: 'MÖ 280', d: 'Güney İtalya\'daki zengin Yunan kenti Tarentum, Roma baskısına karşı Pirus\'tan yardım istedi. Pirus 25.000 asker ve 20 fille Adriyatik\'i geçti.', dot: 'tarentum' },
  { t: 'Herakleia Zaferi', y: 'MÖ 280', d: 'İlk savaşta filler Roma\'yı şoke etti; Pirus kazandı ama ordusunun en iyilerini kaybetti.', dot: 'heraclea' },
  { t: 'Roma\'ya yürüyüş', y: 'MÖ 280', d: 'Pirus Roma\'ya yaklaştı, barış teklif etti. Yaşlı senatör Appius Claudius\'un ateşli konuşmasıyla Senato teklifi reddetti.', dot: 'rome' },
  { t: 'Asculum', y: 'MÖ 279', d: 'İkinci pahalı zafer. "Bir zafer daha kazanırsak mahvoluruz."', dot: 'asculum' },
  { t: 'Sicilya Seferi', y: 'MÖ 278', d: 'Kartaca\'ya karşı Sicilya\'ya geçti, adanın neredeyse tamamını aldı.', dot: 'sicily' },
  { t: 'Beneventum & Dönüş', y: 'MÖ 275', d: 'Roma fillere karşı taktik geliştirdi. Pirus durduruldu ve İtalya\'yı terk etti.', dot: 'beneventum' },
];

const mapDots: Record<string, { x: number; y: number; l: string }> = {
  epir: { x: 70, y: 95, l: 'Epir' },
  tarentum: { x: 250, y: 120, l: 'Tarentum' },
  heraclea: { x: 245, y: 138, l: 'Herakleia' },
  rome: { x: 175, y: 78, l: 'Roma' },
  asculum: { x: 235, y: 100, l: 'Asculum' },
  beneventum: { x: 205, y: 110, l: 'Beneventum' },
  sicily: { x: 175, y: 185, l: 'Sicilya' },
};

const facts = [
  { icon: '🦅', t: '"Kartal" lakabı', d: 'Askerleri ona Kartal (Aetos) derdi. O da gururla "Sizin kanatlarınızla uçuyorum" diye karşılık verirdi.' },
  { icon: '🐘', t: 'Roma fillerle tanıştı', d: 'Herakleia, Romalıların savaş filini ilk gördüğü andı. Bu yaratıklara "Lucania öküzleri" adını taktılar.' },
  { icon: '🏆', t: 'Hannibal\'ın listesi', d: 'Büyük Kartacalı komutan Hannibal, Pirus\'u Büyük İskender\'den sonra gelmiş geçmiş en iyi general sayardı.' },
  { icon: '📜', t: 'Savaş sanatı yazarı', d: 'Pirus, taktik ve ordu düzeni üzerine kitaplar yazdı; sonraki kuşak komutanlar (Hannibal dahil) bunları inceledi.' },
  { icon: '🦶', t: 'Şifalı ayak parmağı', d: 'Söylenceye göre sağ ayağının baş parmağı dalak hastalıklarını iyileştirir, cenaze ateşinde bile kül olmaz, sapasağlam kalırdı.' },
  { icon: '🧱', t: 'Bir kiremitle son', d: 'Çağın en korkulan savaşçısı, Argos sokaklarında çatıdan bir kiremit fırlatan yaşlı bir kadın yüzünden can verdi.' },
];

const quizQs = [
  { text: 'Pirus hangi krallığın kralıydı?', opts: ['Makedonya', 'Epir', 'Sparta', 'Kartaca'], a: 1 },
  { text: '"Pirus zaferi" ne anlama gelir?', opts: ['Kolay ve ucuz bir zafer', 'Kazanana yenilgi kadar pahalıya patlayan zafer', 'Hile ile kazanılan zafer', 'Savaşsız kazanılan zafer'], a: 1 },
  { text: 'Romalılar ilk kez hangi savaşta savaş fili gördü?', opts: ['Asculum', 'Beneventum', 'Herakleia', 'Cannae'], a: 2 },
  { text: 'Pirus kimi idol edinmiş, kime uzaktan akrabaydı?', opts: ['Jül Sezar', 'Büyük İskender', 'Leonidas', 'Hannibal'], a: 1 },
  { text: 'Pirus nasıl öldü?', opts: ['Savaş meydanında kahramanca', 'Zehirlenerek', 'Argos\'ta bir kiremitle', 'Hastalıktan'], a: 2 },
  { text: 'Cineas diyaloğunun ana fikri nedir?', opts: ['Daha çok fethetmek gerekir', 'Hırsın sonu yoktur; huzur için fethe gerek yok', 'Filler savaşı kazandırır', 'Roma yenilmezdir'], a: 1 },
];

/* ════════════════════════ YARDIMCI: STEPPER ════════════════════════ */

function Stepper({ steps, accent, children }: { steps: { t: string; d: string; who?: string }[]; accent: string; children: (i: number) => ReactNode }) {
  const [i, setI] = useState(0);
  return (
    <div className="pyr-stepper">
      <div className="pyr-stepper-viz">{children(i)}</div>
      <div className="pyr-stepper-panel">
        <div className="pyr-dots">
          {steps.map((_, k) => (
            <button key={k} className={`pyr-dot ${k === i ? 'on' : ''}`} onClick={() => setI(k)} aria-label={`Adım ${k + 1}`}
              style={k <= i ? { background: accent, borderColor: accent } : undefined} />
          ))}
        </div>
        <div className="pyr-step-meta" style={{ color: accent }}>{steps[i].who ? steps[i].who : `ADIM ${i + 1} / ${steps.length}`}</div>
        <h4 className="pyr-step-title">{steps[i].t}</h4>
        <p className="pyr-step-desc">{steps[i].d}</p>
        <div className="pyr-stepper-ctrl">
          <button className="pyr-ctrl-btn" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0}>← Geri</button>
          <button className="pyr-ctrl-btn pyr-ctrl-primary" style={{ background: accent, borderColor: accent }} onClick={() => setI(Math.min(steps.length - 1, i + 1))} disabled={i === steps.length - 1}>İleri →</button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════ ANA BİLEŞEN ════════════════════════ */

export default function PyrrhusClient() {
  const [openBattle, setOpenBattle] = useState<string | null>('heraclea');

  const [quizQ, setQuizQ] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<Record<number, number>>({});
  const [done, setDone] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) (e.target as HTMLElement).classList.add('visible'); });
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  function answerQ(sel: number) {
    if (answered[quizQ] !== undefined) return;
    if (sel === quizQs[quizQ].a) setScore((s) => s + 1);
    setAnswered((prev) => ({ ...prev, [quizQ]: sel }));
    setTimeout(() => {
      if (quizQ + 1 < quizQs.length) setQuizQ((q) => q + 1);
      else setDone(true);
    }, 900);
  }
  function restartQuiz() { setQuizQ(0); setScore(0); setAnswered({}); setDone(false); }

  // Pirus zaferi sayacı: her zaferden sonra azalan ordu gücü
  const strength = [
    { b: 'Sefer başı', v: 100 },
    { b: 'Herakleia ✦', v: 84 },
    { b: 'Asculum ✦', v: 66 },
    { b: 'Sicilya', v: 52 },
    { b: 'Beneventum', v: 34 },
  ];

  return (
    <main className="main-content pyr-page">

      {/* ── Üst bar ── */}
      <div className="pyr-topbar">
        <Link href="/" className="pyr-back" aria-label="Ana sayfa">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
        </Link>
        <span className="pyr-topbar-title">Kral Pirus</span>
      </div>

      {/* ── HERO ── */}
      <header className="pyr-hero">
        <div className="pyr-hero-rays" aria-hidden="true" />
        <div className="pyr-emblem" aria-hidden="true">
          <svg viewBox="0 0 140 140">
            <defs>
              <linearGradient id="pyrGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f0d27a" /><stop offset="1" stopColor="#b07a3e" /></linearGradient>
            </defs>
            {/* defne çelengi */}
            {[-1, 1].map((s) => (
              <g key={s}>
                {[0, 1, 2, 3, 4, 5].map((k) => (
                  <ellipse key={k} cx={70 + s * (34 + k * 2)} cy={70 - 44 + k * 17} rx="9" ry="4" fill="url(#pyrGold)" opacity={0.85}
                    transform={`rotate(${s * (35 - k * 8)} ${70 + s * (34 + k * 2)} ${70 - 44 + k * 17})`} />
                ))}
              </g>
            ))}
            {/* kalkan + kılıç */}
            <circle cx="70" cy="72" r="30" fill="none" stroke="url(#pyrGold)" strokeWidth="2.5" />
            <path d="M70 50 L70 94 M58 58 L82 86 M82 58 L58 86" stroke="#cf4b3a" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
            <circle cx="70" cy="72" r="6" fill="url(#pyrGold)" />
          </svg>
        </div>
        <div className="pyr-hero-eyebrow">ΒΑΣΙΛΕΥΣ ΤΗΣ ΗΠΕΙΡΟΥ · EPİR KRALI</div>
        <h1 className="pyr-hero-title">KRAL <span className="pyr-grad">PİRUS</span></h1>
        <p className="pyr-hero-sub">
          Savaş fillerinin tozu, kazanılan ama yıkan zaferler ve sonu gelmeyen bir hırs...
          Büyük İskender'in gölgesinde doğan, Roma'yı titreten ve adını bir deyime kazıyan
          kralın destanı. <em>“Bir zafer daha kazanırsak, mahvoluruz.”</em>
        </p>
        <div className="pyr-hero-meta">
          <span>⌛ MÖ 319 – 272</span><span className="pyr-sep">·</span>
          <span>🏛️ Epir Hanedanı (Aiakidler)</span><span className="pyr-sep">·</span>
          <span>🦅 “Kartal”</span>
        </div>
        <div className="pyr-hero-tags">
          {['Epir', 'Savaş Filleri', 'Roma', 'Pirus Zaferi', 'Herakleia', 'Asculum', 'Sicilya', 'Kineas'].map((t) => (
            <span key={t} className="pyr-tag">{t}</span>
          ))}
        </div>
      </header>

      {/* ── 1. KİM ── */}
      <section className="pyr-section reveal">
        <div className="pyr-kicker">I — Efsanenin Doğuşu</div>
        <h2 className="pyr-h2">Kim bu Pirus?</h2>
        <p className="pyr-p">
          Pirus, antik dünyanın kuzeybatı <Link href="/articles/greece" className="article-ilink">Yunanistan</Link>'daki <strong>Epir</strong> krallığının hükümdarıydı.
          Damarlarında Akhilleus'a uzandığına inanılan bir kan taşıyordu ve <strong>Büyük İskender'in
          uzaktan akrabasıydı</strong>. Çağdaşları onu İskender'in yeniden doğuşu gibi gördü: aynı cüret,
          aynı karizma, aynı doymak bilmez fetih arzusu.
        </p>
        <div className="pyr-img-pair">
          <ArticleImage narrow
            className="pyr-img"
            src="/articles/pirus/pirus-portre.webp"
            ratio="1600 / 2133"
            priority
            alt="Miğferli bir erkeğin mermer büstü; miğfer alnın üstünde yükseliyor, sakallı yüz hafifçe yana dönük."
            caption="Geleneksel olarak Pirus’a atfedilen büst. Roma dönemi mermer kopyası — yaşarken yapılmış bir portre değil ve kimlik teşhisi kesin sayılmıyor."
            credit="Napoli MANN · CC BY"
          />
          <ArticleImage narrow
            className="pyr-img"
            src="/articles/pirus/iskender-bust.webp"
            ratio="1600 / 1785"
            alt="Genç, sakalsız bir erkeğin mermer başı; dalgalı saçları alnından geriye savrulmuş, başı hafifçe yukarı ve yana dönük."
            caption="İdolü ve uzaktan akrabası: Büyük İskender. Bu portre de ölümünden yüz elli-iki yüz yıl sonra yapılmış idealize bir Hellenistik çalışma; çağdaşlarının onu nasıl gördüğünü değil, sonrakilerin nasıl hatırlamak istediğini gösteriyor."
            credit="British Museum · CC BY-SA"
          />
        </div>

        <p className="pyr-p">
          Bir asker, bir taktik dehası ve bir maceraperestti. Ama trajedisi de buradaydı: savaş kazanmakta
          eşsizdi, <strong>kazandığını korumakta</strong> ise beceriksiz. Sürekli yeni bir parıltının peşinden
          koştu — ve her zaferde biraz daha eridi.
        </p>
        <div className="pyr-callout">
          <span className="pyr-callout-icon">🏆</span>
          <p><Link href="/articles/carthage" className="article-ilink">Kartaca</Link>lı <strong>Hannibal</strong>'a gelmiş geçmiş en büyük komutanlar sorulduğunda, birinciliğe
          İskender'i, ikinciliğe <strong>Pirus</strong>'u koyduğu, kendini ancak üçüncü saydığı anlatılır.
          Zira Pirus'un Sicilya'da karşısına aldığı Kartaca da, Akdeniz'in kaderini belirleyecek güç
          mücadelesinin başat oyuncularından biriydi.</p>
        </div>
      </section>

      {/* ── 2. SÖZLER ── */}
      <section className="pyr-section reveal">
        <div className="pyr-kicker">II — Çağları Aşan Sözler</div>
        <h2 className="pyr-h2">Meşhur Sözleri</h2>
        <div className="pyr-quotes">
          {quotes.map((q, i) => (
            <figure key={i} className="pyr-quote">
              <div className="pyr-quote-mark">“</div>
              <blockquote>{q.tr}</blockquote>
              <figcaption><span className="pyr-quote-ico">{q.icon}</span>{q.ctx}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ── 3. KİNEAS DİYALOĞU ── */}
      <section className="pyr-section reveal">
        <div className="pyr-kicker">III — Bilgeliğin Sınavı</div>
        <h2 className="pyr-h2">Kineas Diyaloğu — “Peki ya sonra?”</h2>
        <p className="pyr-p">
          Sefere çıkmadan önce, bilge danışmanı <strong>Kineas</strong>, Pirus'a basit ama yıkıcı bir soru
          dizisi sordu. Bu diyalog, hırsın sonsuz döngüsüne dair antik çağın en güçlü derslerinden biridir.
          Adım adım ilerlet:
        </p>
        <ArticleImage
          className="pyr-img"
          src="/articles/pirus/appius-kineas.webp"
          ratio="1600 / 746"
          alt="Tarihî tablo: mermer bir salonda oturan senatörlerin önünde, yaşlı ve kör bir adam iki kişinin koluna girmiş, ayakta konuşuyor."
          caption="Kineas Roma Senatosu’nda barış teklifini sunarken, kör Appius Claudius reddi savunuyor. Temsilî: sahneden yaklaşık iki bin yıl sonra, 19. yüzyıl sonunda İtalya’da resmedildi."
          credit="Giuseppe Sciuti · kamu malı"
        />

        <Stepper steps={cineas} accent="#e0b34a">
          {(i) => (
            <svg viewBox="0 0 300 190" className="pyr-svg">
              {/* iki figür */}
              <g opacity={cineas[i].who === 'Pirus' ? 1 : 0.4} style={{ transition: 'opacity .3s' }}>
                <circle cx="80" cy="70" r="30" fill="rgba(224,179,74,0.12)" stroke="#e0b34a" strokeWidth="2" />
                <text x="80" y="80" textAnchor="middle" fontSize="28">👑</text>
                <text x="80" y="118" textAnchor="middle" fontSize="11" fill="#a89478" fontWeight="700">Pirus</text>
              </g>
              <g opacity={cineas[i].who === 'Cineas' ? 1 : 0.4} style={{ transition: 'opacity .3s' }}>
                <circle cx="220" cy="70" r="30" fill="rgba(155,109,212,0.12)" stroke="#9b6dd4" strokeWidth="2" />
                <text x="220" y="80" textAnchor="middle" fontSize="28">🧔</text>
                <text x="220" y="118" textAnchor="middle" fontSize="11" fill="#a89478" fontWeight="700">Kineas</text>
              </g>
              <path d="M112 60 Q150 40 188 60" stroke="#e0b34a" strokeWidth="1.5" fill="none" opacity="0.6" markerEnd="url(#pyrArr)" />
              <text x="150" y="150" textAnchor="middle" fontSize="11" fill="#cf4b3a" fontWeight="700">“Peki ya sonra?” × {i + 1}</text>
              <defs><marker id="pyrArr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="#e0b34a" /></marker></defs>
            </svg>
          )}
        </Stepper>
        <p className="pyr-hint">💭 Pirus susup kaldı. Kineas haklıydı — ama hırs hiçbir zaman mantığı dinlemedi.</p>
      </section>

      {/* ── 4. SEFER HARİTASI ── */}
      <section className="pyr-section reveal">
        <div className="pyr-kicker">IV — Sefer</div>
        <h2 className="pyr-h2">İtalya Macerası — Sefer Haritası</h2>

        <div className="pyr-img-pair">
          <ArticleImage narrow
            className="pyr-img"
            src="/articles/pirus/dodona-tiyatro.webp"
            ratio="1600 / 669"
            alt="Dik yamaca kurulmuş çok basamaklı antik tiyatronun geniş açı görüntüsü; arkada dağlar ve yeşil vadi."
            caption="Dodona tiyatrosu — Pirus’un kendi yaptırdığı yapı (MÖ 297–272). Bugün görülen hâli katmanlı: Roma tahribatı, arenaya dönüştürülme ve modern restorasyon üst üste binmiş durumda."
            credit="Wikimedia Commons · CC BY-SA"
          />
          <ArticleImage narrow
            className="pyr-img"
            src="/articles/pirus/ambracia-apollon.webp"
            ratio="1600 / 505"
            alt="Şehir içinde, alçak duvarlarla çevrili arkeolojik alanda sıra sıra kırık sütun kaideleri ve temel taşları."
            caption="Pirus’un başkenti Ambracia’dan (bugünkü Arta) kalan Apollon Pythios tapınağı. Tapınak Pirus’un eseri değil: ondan yaklaşık iki yüzyıl önce, Arkaik dönemde yapılmıştı — kral hazır bir şehri başkent seçti."
            credit="Wikimedia Commons · CC BY-SA"
          />
        </div>
        <p className="pyr-p">
          MÖ 280'de Pirus, Yunan kenti Tarentum'un çağrısıyla Adriyatik'i geçip İtalya'ya ayak
          bastı. Altı yıl sürecek bu destansı sefer onu Roma kapılarına, oradan Sicilya'ya taşıyacaktı. Adımları izle:
        </p>
        <Stepper steps={campaign.map((c) => ({ t: `${c.t} · ${c.y}`, d: c.d }))} accent="#cf4b3a">
          {(i) => {
            const active = campaign[i].dot;
            return (
              <svg viewBox="0 0 320 230" className="pyr-svg pyr-map">
                {/* deniz */}
                <rect x="0" y="0" width="320" height="230" fill="rgba(40,80,110,0.10)" rx="8" />
                {/* İtalya çizmesi (stilize) */}
                <path d="M150 40 L185 55 L210 80 L225 105 L215 125 L235 130 L240 145 L225 160 L205 150 L195 130 L180 120 L165 105 L160 80 L150 60 Z"
                  fill="rgba(176,122,62,0.18)" stroke="#b07a3e" strokeWidth="1.5" />
                {/* Sicilya */}
                <path d="M150 175 L185 178 L168 200 Z" fill="rgba(176,122,62,0.18)" stroke="#b07a3e" strokeWidth="1.5" />
                {/* Epir (sağ/doğu) */}
                <path d="M60 75 L95 80 L100 110 L70 120 L55 100 Z" fill="rgba(224,179,74,0.15)" stroke="#e0b34a" strokeWidth="1.5" />
                {/* rota oku Epir -> Tarentum */}
                <path d="M95 100 Q160 150 240 122" stroke="#cf4b3a" strokeWidth="1.5" strokeDasharray="4 4" fill="none" opacity={i >= 1 ? 0.7 : 0.25} />
                {/* noktalar */}
                {Object.entries(mapDots).map(([k, d]) => {
                  const on = k === active;
                  return (
                    <g key={k} opacity={on ? 1 : 0.45} style={{ transition: 'opacity .3s' }}>
                      <circle cx={d.x} cy={d.y} r={on ? 6 : 3.5} fill={on ? '#cf4b3a' : '#e0b34a'} stroke="#140d07" strokeWidth="1" />
                      {on && <circle cx={d.x} cy={d.y} r="11" fill="none" stroke="#cf4b3a" strokeWidth="1.5" opacity="0.6"><animate attributeName="r" values="7;14;7" dur="1.6s" repeatCount="indefinite" /></circle>}
                      <text x={d.x} y={d.y - 9} textAnchor="middle" fontSize="9" fill={on ? '#f0d27a' : '#a89478'} fontWeight={on ? 700 : 400}>{d.l}</text>
                    </g>
                  );
                })}
              </svg>
            );
          }}
        </Stepper>
      </section>

      {/* ── 5. SAVAŞLAR ── */}
      <section className="pyr-section reveal">
        <div className="pyr-kicker">V — Kan ve Çelik</div>
        <h2 className="pyr-h2">Savaşları</h2>

        <ArticleImage
          className="pyr-img"
          src="/articles/pirus/savas-filleri.webp"
          ratio="1600 / 1234"
          alt="Kabartma benzeri sahne: zırhlı askerlerin arasında savaş filleri, hortumları havada, çevrelerinde mızraklı piyadeler."
          caption="Savaş filleri lejyonların karşısında. İki çekince: bu sahne Zama’yı (MÖ 202, Hannibal’a karşı) betimler, Pirus’un Herakleia’sını değil; ve olaydan çok sonra hayal edilmiş bir eserdir. Yine de Roma piyadesinin ilk kez fille karşılaştığında ne gördüğünü anlatır."
          credit="Wikimedia Commons · kamu malı"
        />

        <p className="pyr-p">Bir savaşa dokun, detaylarını aç — kuvvetler, kayıplar ve o günün hikâyesi:</p>
        <div className="pyr-battles">
          {battles.map((b) => (
            <div key={b.id} className={`pyr-battle ${openBattle === b.id ? 'open' : ''}`} style={{ '--bc': b.color } as CSSProperties}>
              <button className="pyr-battle-head" onClick={() => setOpenBattle(openBattle === b.id ? null : b.id)} aria-expanded={openBattle === b.id}>
                <span className="pyr-battle-year">{b.year}</span>
                <span className="pyr-battle-name">{b.name}<small>{b.loc} · {b.enemy}</small></span>
                <span className="pyr-battle-res">{b.result}</span>
                <span className="pyr-battle-chev">{openBattle === b.id ? '−' : '+'}</span>
              </button>
              {openBattle === b.id && (
                <div className="pyr-battle-body">
                  <div className="pyr-battle-stats">
                    <div><span className="pyr-bs-l">Kuvvetler</span><span className="pyr-bs-v">{b.forces}</span></div>
                    <div><span className="pyr-bs-l">Kayıplar</span><span className="pyr-bs-v">{b.losses}</span></div>
                  </div>
                  <p>{b.desc}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Savaş düzeni: filler */}
        <h3 className="pyr-h3">Herakleia düzeni — fillerin dehşeti</h3>
        <div className="pyr-diagram">
          <svg viewBox="0 0 680 150" className="pyr-svg">
            <text x="60" y="20" fontSize="11" fill="#e0b34a" fontWeight="700">PİRUS</text>
            <text x="600" y="20" fontSize="11" fill="#cf4b3a" fontWeight="700">ROMA</text>
            {/* falanks */}
            {[0, 1, 2, 3, 4, 5].map((k) => <rect key={k} x={50 + k * 14} y="45" width="9" height="60" rx="2" fill="#e0b34a" opacity="0.8" />)}
            <text x="80" y="125" textAnchor="middle" fontSize="9" fill="#a89478">Falanks (sarisalar)</text>
            {/* filler */}
            {[0, 1, 2].map((k) => <text key={k} x={260 + k * 50} y="85" textAnchor="middle" fontSize="34">🐘</text>)}
            <text x="310" y="125" textAnchor="middle" fontSize="9" fill="#a89478">Savaş filleri — “Lucania öküzleri”</text>
            {/* roma */}
            {[0, 1, 2, 3, 4, 5].map((k) => <rect key={k} x={560 + k * 14} y="45" width="9" height="60" rx="2" fill="#cf4b3a" opacity="0.8" />)}
            <text x="600" y="125" textAnchor="middle" fontSize="9" fill="#a89478">Lejyonlar</text>
            {/* ok */}
            <path d="M360 75 L520 75" stroke="#cf4b3a" strokeWidth="2" strokeDasharray="5 4" markerEnd="url(#pyrArr2)" />
            <defs><marker id="pyrArr2" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6" fill="#cf4b3a" /></marker></defs>
          </svg>
        </div>
      </section>

      {/* ── 6. PİRUS ZAFERİ ── */}
      <section className="pyr-section reveal">
        <div className="pyr-kicker">VI — Bir Deyimin Doğuşu</div>
        <h2 className="pyr-h2">“Pirus Zaferi” Nedir?</h2>
        <p className="pyr-p">
          <strong>Pirus zaferi</strong>, kazanana o kadar pahalıya patlar ki, neredeyse bir yenilgiye eşdeğer olan
          zaferdir. Pirus her savaşı kazandı ama her seferinde ordusunun en iyilerini gömdü. Roma kayıplarını
          kolayca yerine koyabiliyordu; Pirus ise denizin ötesinden gelen, yeri doldurulamaz askerlerini.
          İşte o erimenin görseli:
        </p>
        <div className="pyr-meter">
          {strength.map((s, i) => (
            <div key={i} className="pyr-meter-row">
              <span className="pyr-meter-label">{s.b}</span>
              <div className="pyr-meter-track">
                <div className="pyr-meter-fill" style={{ width: `${s.v}%`, background: `linear-gradient(90deg, #e0b34a, ${s.v < 50 ? '#cf4b3a' : '#b07a3e'})` }} />
              </div>
              <span className="pyr-meter-val">{s.v}%</span>
            </div>
          ))}
        </div>
        <p className="pyr-hint">📉 Zaferler arttıkça ordu eridi. Bugün hâlâ siyasette, iş dünyasında ve sporda “kazandık ama çok pahalıya” denildiğinde bu kralın adı anılır.</p>
      </section>

      {/* ── 7. SON ── */}
      <section className="pyr-section reveal">
        <div className="pyr-kicker">VII — Trajik Son</div>
        <h2 className="pyr-h2">Sparta, Argos ve Bir Kiremit</h2>
        <p className="pyr-p">
          İtalya'dan döndükten sonra Pirus durulmadı. Makedonya'ya, ardından Sparta'ya saldırdı.
          MÖ 272'de Argos kentinin dar sokaklarında çetin bir gece çarpışmasına tutuldu. Tam bir düşmanı
          alt etmek üzereyken, bir damın üstündeki <strong>yaşlı bir kadın</strong> — oğlunu korumak için —
          aşağı bir <strong>kiremit fırlattı</strong>.
        </p>
        <p className="pyr-p">
          Kiremit Pirus'u ensesinden vurdu; sersemleyen kral atından düştü ve öldürüldü. Onlarca orduyu
          bozguna uğratan, <Link href="/articles/rome" className="article-ilink">Roma</Link>'yı titreten efsanevi savaşçı, sıradan bir kiremitle tarihe karıştı —
          kaderin acı bir cilvesi.
        </p>
        <ArticleImage
          className="pyr-img"
          src="/articles/pirus/argos-tiyatro.webp"
          ratio="1600 / 900"
          alt="Yamaca oyulmuş yarım daire biçimli antik tiyatronun taş basamakları; arkada zeytinlikler ve ova."
          caption="Argos: Pirus’un öldüğü kent. Ölüm tiyatroda değil, kentin dar sokaklarındaki gece çarpışmasında oldu — bu, o kentten geriye kalanların en görkemlisi."
          credit="Wikimedia Commons · CC BY-SA"
        />

        <div className="pyr-callout pyr-callout-red">
          <span className="pyr-callout-icon">🧱</span>
          <p>“Tanrılar bir insanı yok etmek isterlerse, önce onu gururlandırırlar.” Pirus'un sonu, antik
          dünyanın <strong>kibir ve kader</strong> üzerine en sevdiği derslerden biri oldu.</p>
        </div>
      </section>

      {/* ── 8. İLGİNÇ GERÇEKLER ── */}
      <section className="pyr-section reveal">
        <div className="pyr-kicker">VIII — Bilinmeyenler</div>
        <h2 className="pyr-h2">İlginç Gerçekler</h2>
        <div className="pyr-facts">
          {facts.map((f, i) => (
            <div key={i} className="pyr-fact">
              <div className="pyr-fact-ico">{f.icon}</div>
              <h4 className="pyr-fact-t">{f.t}</h4>
              <p className="pyr-fact-d">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 9. MİRAS ── */}
      <section className="pyr-section reveal">
        <div className="pyr-kicker">IX — Miras</div>
        <h2 className="pyr-h2">Geriye Ne Kaldı?</h2>
        <p className="pyr-p">
          Pirus bir imparatorluk kuramadı; fethettiği hiçbir toprağı elinde tutamadı. Ama askeri dehası,
          fil taktikleri ve özellikle <strong>adını taşıyan deyim</strong> sayesinde adı çağları aştı. O,
          dâhi bir komutanın bile <strong>stratejik hedef olmadan</strong> kazandığı her savaşın aslında
          bir kayıp olabileceğinin ölümsüz simgesidir.
        </p>
        <div className="pyr-legacy">
          {[
            ['🐘', 'Fil taktikleri', 'Sonraki komutanlara (Hannibal dahil) ilham verdi'],
            ['📖', '“Pirus zaferi”', 'Bugün hâlâ kullanılan evrensel bir deyim'],
            ['⚔️', 'Askeri yazıları', 'Antik dünyanın strateji kütüphanesine girdi'],
            ['🎭', 'Trajik figür', 'Hırs ve kaderin edebî sembolü'],
          ].map(([e, t, d], i) => (
            <div key={i} className="pyr-leg-card"><div className="pyr-leg-e">{e}</div><strong>{t}</strong><span>{d}</span></div>
          ))}
        </div>
      </section>

      {/* ── 10. QUIZ ── */}
      <section className="pyr-section reveal">
        <div className="pyr-kicker">X — Sınav Meydanı</div>
        <h2 className="pyr-h2">Mini Quiz</h2>
        <div className="pyr-quiz">
          {!done ? (
            <>
              <div className="pyr-quiz-top">
                <span>Soru {quizQ + 1} / {quizQs.length}</span>
                <span className="pyr-quiz-score">Puan: {score}</span>
              </div>
              <h3 className="pyr-quiz-q">{quizQs[quizQ].text}</h3>
              <div className="pyr-quiz-opts">
                {quizQs[quizQ].opts.map((o, oi) => {
                  const sel = answered[quizQ];
                  const isAns = sel !== undefined;
                  const correct = quizQs[quizQ].a;
                  let cls = 'pyr-opt';
                  if (isAns) { if (oi === correct) cls += ' correct'; else if (oi === sel) cls += ' wrong'; else cls += ' dim'; }
                  return (
                    <button key={oi} className={cls} onClick={() => answerQ(oi)} disabled={isAns}>
                      <span className="pyr-opt-letter">{String.fromCharCode(65 + oi)}</span>{o}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="pyr-quiz-result">
              <div className="pyr-quiz-emoji">{score >= 5 ? '👑' : score >= 3 ? '🦅' : '📜'}</div>
              <h3 className="pyr-quiz-rtitle">{score} / {quizQs.length} doğru</h3>
              <p className="pyr-quiz-rdesc">{score >= 5 ? 'Bir Epir kralı kadar bilgesin! Kineas seninle gurur duyardı.' : score >= 3 ? 'Sağlam bir komutan! Birkaç savaş daha kazanırsın.' : 'Pirus gibi — yukarı kaydırıp bir kez daha kuşan!'}</p>
              <button className="pyr-ctrl-btn pyr-ctrl-primary" style={{ background: '#e0b34a', borderColor: '#e0b34a' }} onClick={restartQuiz}>↺ Tekrar dene</button>
            </div>
          )}
        </div>
      </section>

      {/* ── Footer ── */}
      <ArticleBibliography items={refs} accent="#e0b34a" />

      <footer className="pyr-footer">
        <div className="pyr-footer-mark">BASEMENTS</div>
        <p>Kral Pirus: her savaşı kazanıp savaşı kaybeden adam. Hırsın ve cesaretin, zaferin ve yıkımın aynı madalyonun iki yüzü olduğunu bize hatırlatan kartal. 🦅</p>
        <Link href="/discover" className="pyr-footer-link">← Diğer içerikleri keşfet</Link>
      </footer>

      <style>{`
        .pyr-page {
          --gold:#e0b34a; --gold-bright:#f0d27a; --crimson:#cf4b3a; --bronze:#b07a3e; --royal:#9b6dd4;
          --bg:#130d07; --panel:rgba(255,255,255,0.03); --line:rgba(224,179,74,0.16);
          --ink:#efe6d6; --muted:#a89478;
          background: var(--bg);
          color: var(--ink);
          min-height: 100vh;
          font-family: "Iowan Old Style", "Palatino Linotype", Georgia, serif;
          line-height: 1.65;
          overflow-x: clip;
        }

        /* Topbar */
        .pyr-topbar { position: sticky; top: 0; z-index: 40; background: rgba(19,13,7,0.92); backdrop-filter: blur(12px); border-bottom: 1px solid var(--line); padding: 10px 16px; display: flex; align-items: center; gap: 10px; }
        .pyr-back { color: var(--ink); display: flex; padding: 6px; border-radius: 50%; transition: background .15s; }
        .pyr-back:hover { background: rgba(224,179,74,0.12); }
        .pyr-topbar-title { font-weight: 700; font-size: .95rem; color: var(--gold); letter-spacing: .04em; }

        /* Hero */
        .pyr-hero { position: relative; text-align: center; padding: 48px 20px 44px; overflow: hidden; background: radial-gradient(ellipse at 50% -5%, rgba(224,179,74,0.16), transparent 62%); }
        .pyr-hero-rays { position: absolute; inset: 0; pointer-events: none; opacity: .5;
          background: conic-gradient(from 0deg at 50% 0%, transparent 0deg, rgba(224,179,74,0.06) 12deg, transparent 24deg, rgba(224,179,74,0.06) 36deg, transparent 48deg, rgba(207,75,58,0.05) 60deg, transparent 72deg);
          mask-image: radial-gradient(ellipse at 50% 0%, #000, transparent 65%);
          -webkit-mask-image: radial-gradient(ellipse at 50% 0%, #000, transparent 65%); }
        .pyr-emblem { position: relative; width: 120px; margin: 0 auto 10px; filter: drop-shadow(0 4px 20px rgba(224,179,74,0.3)); }
        .pyr-emblem svg { width: 100%; height: auto; }
        .pyr-hero-eyebrow { position: relative; font-size: .64rem; font-weight: 700; letter-spacing: .28em; color: var(--bronze); margin-bottom: 12px; font-family: system-ui, sans-serif; }
        .pyr-hero-title { position: relative; font-size: clamp(2.4rem, 9vw, 5rem); font-weight: 800; margin: 0 0 18px; letter-spacing: .04em; line-height: 1; }
        .pyr-grad { background: linear-gradient(100deg, var(--gold-bright), var(--bronze), var(--crimson)); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .pyr-hero-sub { position: relative; max-width: 600px; margin: 0 auto 20px; color: #cdbfa6; font-size: clamp(.92rem, 2vw, 1.05rem); }
        .pyr-hero-sub em { color: var(--gold); font-style: italic; }
        .pyr-hero-meta { position: relative; display: flex; flex-wrap: wrap; gap: 8px 4px; justify-content: center; align-items: center; font-size: .82rem; color: var(--muted); margin-bottom: 22px; font-family: system-ui, sans-serif; }
        .pyr-sep { color: var(--bronze); }
        .pyr-hero-tags { position: relative; display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
        .pyr-tag { padding: 6px 14px; font-size: .76rem; font-weight: 600; color: var(--gold); background: rgba(224,179,74,0.08); border: 1px solid rgba(224,179,74,0.22); border-radius: 9999px; font-family: system-ui, sans-serif; }

        /* Section */
        .pyr-section { max-width: 820px; margin: 0 auto; padding: 42px 16px; border-top: 1px solid rgba(224,179,74,0.08); }
        /* ArticleImage'ın slate varsayılanları bu altın-bronz paletle çakışıyor. */
        .pyr-img {
          --ai-caption: #cbbfa8;
          --ai-credit: #a89478;
          --ai-border: rgba(224,179,74,0.24);
          --ai-fill: rgba(224,179,74,0.05);
          --ai-mark: rgba(224,179,74,0.28);
        }
        .pyr-img-pair { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; align-items: start; }
        @media (max-width: 700px) { .pyr-img-pair { grid-template-columns: 1fr; } }
        .pyr-kicker { font-size: .7rem; font-weight: 700; letter-spacing: .2em; color: var(--crimson); margin-bottom: 8px; text-transform: uppercase; font-family: system-ui, sans-serif; }
        .pyr-h2 { font-size: clamp(1.5rem, 4.5vw, 2.2rem); font-weight: 800; margin: 0 0 16px; letter-spacing: .01em; color: var(--gold-bright); }
        .pyr-h3 { font-size: 1.1rem; font-weight: 700; margin: 32px 0 14px; color: var(--gold); }
        .pyr-p { color: #d9cdb6; font-size: 1.02rem; margin: 0 0 18px; }
        .pyr-p strong, .pyr-callout strong, .pyr-fact strong { color: var(--ink); font-weight: 700; }
        .pyr-p em { color: var(--gold); font-style: italic; }
        .pyr-hint { font-size: .86rem; color: var(--muted); margin-top: 16px; background: var(--panel); border: 1px dashed var(--line); border-radius: 10px; padding: 12px 14px; font-family: system-ui, sans-serif; }

        .reveal { opacity: 0; transform: translateY(30px); transition: opacity .7s cubic-bezier(.2,.7,.2,1), transform .7s cubic-bezier(.2,.7,.2,1); }
        .reveal.visible { opacity: 1; transform: none; }

        /* Callout */
        .pyr-callout { display: flex; gap: 12px; background: linear-gradient(90deg, rgba(224,179,74,0.08), transparent); border: 1px solid rgba(224,179,74,0.2); border-left: 3px solid var(--gold); border-radius: 12px; padding: 14px 16px; margin: 18px 0; }
        .pyr-callout-red { background: linear-gradient(90deg, rgba(207,75,58,0.1), transparent); border-color: rgba(207,75,58,0.3); border-left-color: var(--crimson); }
        .pyr-callout-icon { font-size: 1.5rem; flex-shrink: 0; }
        .pyr-callout p { margin: 0; font-size: .92rem; color: #d9cdb6; }

        /* Quotes */
        .pyr-quotes { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 18px; }
        .pyr-quote { position: relative; margin: 0; background: var(--panel); border: 1px solid var(--line); border-radius: 14px; padding: 22px 20px 18px; overflow: hidden; }
        .pyr-quote::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: linear-gradient(var(--gold), var(--crimson)); }
        .pyr-quote-mark { position: absolute; top: 2px; right: 12px; font-size: 3.5rem; color: rgba(224,179,74,0.15); font-family: Georgia, serif; line-height: 1; }
        .pyr-quote blockquote { margin: 0 0 12px; font-size: 1.08rem; font-style: italic; color: var(--gold-bright); line-height: 1.5; }
        .pyr-quote figcaption { font-size: .82rem; color: var(--muted); display: flex; gap: 8px; align-items: flex-start; font-family: system-ui, sans-serif; }
        .pyr-quote-ico { font-size: 1rem; flex-shrink: 0; }

        /* Stepper */
        .pyr-stepper { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; background: var(--panel); border: 1px solid var(--line); border-radius: 14px; padding: 16px; margin: 16px 0; }
        .pyr-stepper-viz { display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.25); border-radius: 10px; padding: 10px; min-height: 190px; }
        .pyr-stepper-panel { display: flex; flex-direction: column; }
        .pyr-dots { display: flex; gap: 7px; margin-bottom: 12px; }
        .pyr-dot { width: 11px; height: 11px; border-radius: 50%; border: 1.5px solid var(--muted); background: transparent; cursor: pointer; padding: 0; transition: all .2s; }
        .pyr-dot.on { transform: scale(1.25); }
        .pyr-step-meta { font-size: .72rem; font-weight: 800; letter-spacing: .1em; margin-bottom: 6px; text-transform: uppercase; font-family: system-ui, sans-serif; }
        .pyr-step-title { font-size: 1.08rem; font-weight: 800; margin: 0 0 8px; color: var(--ink); }
        .pyr-step-desc { font-size: .9rem; color: #d9cdb6; margin: 0 0 16px; flex: 1; }
        .pyr-stepper-ctrl { display: flex; gap: 8px; }
        .pyr-ctrl-btn { flex: 1; padding: 9px 14px; border-radius: 9px; border: 1px solid var(--line); background: rgba(255,255,255,0.04); color: var(--ink); font-weight: 700; font-size: .85rem; cursor: pointer; transition: opacity .2s, transform .1s; font-family: system-ui, sans-serif; }
        .pyr-ctrl-btn:disabled { opacity: .35; cursor: not-allowed; }
        .pyr-ctrl-btn:not(:disabled):active { transform: scale(.96); }
        .pyr-ctrl-primary { color: #20160a; }
        .pyr-svg { width: 100%; height: auto; display: block; }
        .pyr-map { max-height: 240px; }

        /* Diagram */
        .pyr-diagram { background: var(--panel); border: 1px solid var(--line); border-radius: 14px; padding: 16px; margin: 16px 0; }

        /* Battles */
        .pyr-battles { display: flex; flex-direction: column; gap: 8px; margin: 18px 0; }
        .pyr-battle { border: 1px solid var(--line); border-radius: 12px; overflow: hidden; background: var(--panel); border-left: 3px solid var(--bc); transition: background .2s; }
        .pyr-battle.open { background: color-mix(in srgb, var(--bc) 8%, transparent); }
        .pyr-battle-head { width: 100%; display: flex; align-items: center; gap: 12px; padding: 13px 15px; background: none; border: none; color: var(--ink); cursor: pointer; text-align: left; }
        .pyr-battle-year { font-weight: 800; font-size: .76rem; color: var(--bc); background: color-mix(in srgb, var(--bc) 14%, transparent); padding: 4px 9px; border-radius: 7px; flex-shrink: 0; font-family: system-ui, sans-serif; white-space: nowrap; }
        .pyr-battle-name { font-weight: 700; flex: 1; display: flex; flex-direction: column; font-size: 1rem; }
        .pyr-battle-name small { font-size: .72rem; color: var(--muted); font-weight: 400; font-family: system-ui, sans-serif; }
        .pyr-battle-res { font-size: .76rem; color: var(--bc); font-weight: 600; text-align: right; font-family: system-ui, sans-serif; }
        .pyr-battle-chev { font-size: 1.3rem; color: var(--muted); width: 16px; text-align: center; flex-shrink: 0; }
        .pyr-battle-body { padding: 0 16px 16px; }
        .pyr-battle-stats { display: flex; gap: 10px; margin: 4px 0 12px; flex-wrap: wrap; }
        .pyr-battle-stats > div { flex: 1; min-width: 140px; background: rgba(0,0,0,0.25); border: 1px solid var(--line); border-radius: 9px; padding: 9px 12px; display: flex; flex-direction: column; }
        .pyr-bs-l { font-size: .68rem; letter-spacing: .08em; color: var(--muted); text-transform: uppercase; font-family: system-ui, sans-serif; }
        .pyr-bs-v { font-size: .88rem; color: var(--gold); font-weight: 600; margin-top: 2px; font-family: system-ui, sans-serif; }
        .pyr-battle-body p { margin: 0; font-size: .94rem; color: #d9cdb6; }

        /* Meter */
        .pyr-meter { display: flex; flex-direction: column; gap: 12px; margin: 18px 0; }
        .pyr-meter-row { display: flex; align-items: center; gap: 12px; }
        .pyr-meter-label { width: 110px; font-size: .82rem; color: var(--ink); font-family: system-ui, sans-serif; flex-shrink: 0; }
        .pyr-meter-track { flex: 1; height: 14px; background: rgba(255,255,255,0.05); border-radius: 7px; overflow: hidden; border: 1px solid var(--line); }
        .pyr-meter-fill { height: 100%; border-radius: 7px; transition: width 1s cubic-bezier(.2,.7,.2,1); }
        .pyr-meter-val { width: 42px; text-align: right; font-size: .82rem; font-weight: 700; color: var(--gold); font-family: system-ui, sans-serif; }

        /* Facts */
        .pyr-facts { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 12px; margin-top: 18px; }
        .pyr-fact { background: var(--panel); border: 1px solid var(--line); border-radius: 14px; padding: 18px; transition: border-color .2s, transform .2s; }
        .pyr-fact:hover { border-color: rgba(224,179,74,0.4); transform: translateY(-3px); }
        .pyr-fact-ico { font-size: 2rem; margin-bottom: 8px; }
        .pyr-fact-t { margin: 0 0 6px; font-size: 1rem; color: var(--gold); }
        .pyr-fact-d { margin: 0; font-size: .88rem; color: #d9cdb6; }

        /* Legacy */
        .pyr-legacy { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px; }
        .pyr-leg-card { background: var(--panel); border: 1px solid var(--line); border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 2px; }
        .pyr-leg-e { font-size: 1.6rem; margin-bottom: 4px; }
        .pyr-leg-card strong { font-size: .95rem; color: var(--gold); }
        .pyr-leg-card span { font-size: .82rem; color: var(--muted); }

        /* Quiz */
        .pyr-quiz { background: var(--panel); border: 1px solid var(--line); border-radius: 16px; padding: 20px; }
        .pyr-quiz-top { display: flex; justify-content: space-between; font-size: .8rem; font-weight: 700; color: var(--muted); margin-bottom: 12px; font-family: system-ui, sans-serif; }
        .pyr-quiz-score { color: var(--gold); }
        .pyr-quiz-q { font-size: 1.12rem; font-weight: 700; margin: 0 0 16px; color: var(--ink); }
        .pyr-quiz-opts { display: flex; flex-direction: column; gap: 8px; }
        .pyr-opt { display: flex; align-items: center; gap: 12px; text-align: left; padding: 13px 15px; border-radius: 11px; border: 1px solid var(--line); background: rgba(255,255,255,0.03); color: var(--ink); font-size: .95rem; cursor: pointer; transition: all .18s; font-family: inherit; }
        .pyr-opt:not(:disabled):hover { border-color: var(--gold); background: rgba(224,179,74,0.07); }
        .pyr-opt-letter { width: 24px; height: 24px; border-radius: 6px; display: grid; place-items: center; font-weight: 800; font-size: .78rem; background: rgba(224,179,74,0.1); color: var(--muted); flex-shrink: 0; font-family: system-ui, sans-serif; }
        .pyr-opt.correct { border-color: var(--gold); background: rgba(224,179,74,0.14); }
        .pyr-opt.correct .pyr-opt-letter { background: var(--gold); color: #20160a; }
        .pyr-opt.wrong { border-color: var(--crimson); background: rgba(207,75,58,0.14); }
        .pyr-opt.wrong .pyr-opt-letter { background: var(--crimson); color: #fff; }
        .pyr-opt.dim { opacity: .5; }
        .pyr-opt:disabled { cursor: default; }
        .pyr-quiz-result { text-align: center; padding: 12px; }
        .pyr-quiz-emoji { font-size: 3rem; margin-bottom: 8px; }
        .pyr-quiz-rtitle { font-size: 1.5rem; font-weight: 800; margin: 0 0 6px; color: var(--gold-bright); }
        .pyr-quiz-rdesc { color: var(--muted); font-size: .92rem; margin: 0 0 18px; }

        /* Footer */
        .pyr-footer { max-width: 680px; margin: 0 auto; text-align: center; padding: 48px 20px 64px; border-top: 1px solid var(--line); }
        .pyr-footer-mark { font-family: system-ui, sans-serif; font-weight: 800; letter-spacing: .3em; color: var(--gold); font-size: .85rem; margin-bottom: 14px; }
        .pyr-footer p { color: var(--muted); font-size: .95rem; max-width: 500px; margin: 0 auto 18px; font-style: italic; }
        .pyr-footer-link { color: var(--gold); text-decoration: none; font-weight: 700; font-size: .9rem; font-family: system-ui, sans-serif; }
        .pyr-footer-link:hover { text-decoration: underline; }

        /* Responsive */
        @media (max-width: 680px) {
          .pyr-section { padding: 34px 14px; }
          .pyr-quotes { grid-template-columns: 1fr; }
          .pyr-stepper { grid-template-columns: 1fr; }
          .pyr-stepper-viz { min-height: 160px; }
          .pyr-legacy { grid-template-columns: 1fr; }
          .pyr-battle-res { display: none; }
          .pyr-meter-label { width: 88px; font-size: .76rem; }
        }
      `}</style>
    </main>
  );
}
