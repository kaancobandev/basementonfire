'use client';

import { useEffect, useState, type ReactNode, type CSSProperties } from 'react';
import Link from 'next/link';
import ArticleBibliography, { type BibItem } from '@/app/components/ArticleBibliography';
import ArticleImage from '@/app/components/article/ArticleImage';

const refs: BibItem[] = [
  { title: 'Computer Networks (5. baskı)', authors: 'Andrew S. Tanenbaum & David J. Wetherall', year: '2010', source: 'Pearson' },
  { title: 'How does the Internet work?', source: 'Cloudflare Learning Center', url: 'https://www.cloudflare.com/learning/network-layer/how-does-the-internet-work/' },
  { title: 'HTTP — Hypertext Transfer Protocol', source: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP' },
  { title: 'RFC 791 (IP) & RFC 793 (TCP)', authors: 'Jon Postel (ed.)', year: '1981', source: 'IETF' },
  { title: 'What is DNS?', source: 'Cloudflare Learning Center', url: 'https://www.cloudflare.com/learning/dns/what-is-dns/' },
];

/* ════════════════════════ VERİ ════════════════════════ */

const osiLayers = [
  { n: 7, name: 'Uygulama', en: 'Application', color: '#38bdf8', icon: '🖥️', pdu: 'Veri', group: 'Uygulama',
    desc: 'Kullanıcının doğrudan etkileşime girdiği katman. Tarayıcı, e-posta istemcisi ve diğer uygulamalar burada çalışır; ağ servislerine bu katmandan erişilir.',
    proto: 'HTTP · HTTPS · DNS · FTP · SMTP · SSH' },
  { n: 6, name: 'Sunum', en: 'Presentation', color: '#22d3ee', icon: '🔐', pdu: 'Veri', group: 'Uygulama',
    desc: 'Verinin biçimlendirildiği, şifrelendiği ve sıkıştırıldığı katman. TLS/SSL şifreleme ve karakter kodlaması burada devreye girer.',
    proto: 'TLS/SSL · JPEG · ASCII · UTF-8' },
  { n: 5, name: 'Oturum', en: 'Session', color: '#2dd4bf', icon: '🔗', pdu: 'Veri', group: 'Uygulama',
    desc: 'İki cihaz arasındaki oturumları açar, yönetir ve düzgünce kapatır. Bağlantının sürekliliğini ve senkronizasyonunu sağlar.',
    proto: 'NetBIOS · RPC · PPTP' },
  { n: 4, name: 'Taşıma', en: 'Transport', color: '#34d399', icon: '📦', pdu: 'Segment', group: 'Taşıma',
    desc: 'Uçtan uca iletişim. Veriyi segmentlere böler ve port numaralarıyla doğru uygulamaya yönlendirir. TCP güvenilirlik, UDP ise hız sağlar.',
    proto: 'TCP · UDP' },
  { n: 3, name: 'Ağ', en: 'Network', color: '#fbbf24', icon: '🧭', pdu: 'Paket', group: 'İnternet',
    desc: 'Paketlerin kaynaktan hedefe IP adresleri üzerinden, ağdan ağa yönlendirilmesi. Yönlendiriciler (router) bu katmanda çalışır.',
    proto: 'IP · ICMP · OSPF · BGP' },
  { n: 2, name: 'Veri Bağı', en: 'Data Link', color: '#fb923c', icon: '🔌', pdu: 'Çerçeve', group: 'Ağ Erişimi',
    desc: 'Aynı yerel ağdaki cihazlar arası iletim. Fiziksel MAC adresleri burada kullanılır; anahtarlar (switch) bu katmanda çalışır.',
    proto: 'Ethernet · Wi-Fi 802.11 · ARP · PPP' },
  { n: 1, name: 'Fiziksel', en: 'Physical', color: '#fb7185', icon: '⚡', pdu: 'Bit', group: 'Ağ Erişimi',
    desc: 'Verinin elektrik sinyali, ışık (fiber) veya radyo dalgası olarak fiziksel ortamda 0 ve 1 dizisi halinde iletilmesi.',
    proto: 'Kablo · Fiber · Radyo · Hub' },
];

const protocols = [
  { name: 'HTTP', port: '80', layer: 'Uygulama', tp: 'TCP', use: 'Web sayfaları (şifresiz)' },
  { name: 'HTTPS', port: '443', layer: 'Uygulama', tp: 'TCP', use: 'Şifreli web (TLS üzerinden)' },
  { name: 'DNS', port: '53', layer: 'Uygulama', tp: 'UDP/TCP', use: 'Alan adı → IP çözümleme' },
  { name: 'SSH', port: '22', layer: 'Uygulama', tp: 'TCP', use: 'Güvenli uzaktan erişim' },
  { name: 'FTP', port: '20/21', layer: 'Uygulama', tp: 'TCP', use: 'Dosya transferi' },
  { name: 'SMTP', port: '25', layer: 'Uygulama', tp: 'TCP', use: 'E-posta gönderimi' },
  { name: 'DHCP', port: '67/68', layer: 'Uygulama', tp: 'UDP', use: 'Otomatik IP adresi dağıtımı' },
  { name: 'NTP', port: '123', layer: 'Uygulama', tp: 'UDP', use: 'Saat senkronizasyonu' },
];

const encapSteps = [
  { t: 'Veri (Data)', d: 'Uygulama katmanında tarayıcının ürettiği ham veri — örneğin bir HTTP GET isteği. Henüz hiçbir ağ başlığı eklenmemiştir.', layer: 'Uygulama', color: '#38bdf8' },
  { t: 'Segment', d: 'Taşıma katmanı veriye bir TCP başlığı ekler: kaynak/hedef port, sıra numarası, doğrulama (checksum). Artık veri bir "segment" oldu.', layer: 'Taşıma (TCP)', color: '#34d399' },
  { t: 'Paket (Packet)', d: 'Ağ katmanı bir IP başlığı ekler: kaynak ve hedef IP adresi, TTL. Segment artık ağlar arası yolculuğa hazır bir "paket".', layer: 'Ağ (IP)', color: '#fbbf24' },
  { t: 'Çerçeve (Frame)', d: 'Veri bağı katmanı Ethernet başlığı (kaynak/hedef MAC) ve sonuna bir hata kontrolü (FCS) ekler. Yerel ağda iletilebilir bir "çerçeve" oluştu.', layer: 'Veri Bağı (Ethernet)', color: '#fb923c' },
  { t: 'Bitler (Bits)', d: 'Fiziksel katman çerçeveyi 0 ve 1 dizisine çevirip kablodan elektrik, fiberden ışık ya da havadan radyo sinyali olarak gönderir.', layer: 'Fiziksel', color: '#fb7185' },
];

const dnsSteps = [
  { t: 'Tarayıcı sorar', d: 'basementonfire.com yazdın. Tarayıcı önce kendi önbelleğine, sonra işletim sistemine bakar; bulamazsa ISP\'nin DNS çözücüsüne (resolver) sorar.' },
  { t: 'Kök sunucu (Root)', d: 'Çözücü, 13 kök sunucudan birine sorar: ".com uzantısına kim bakıyor?" Kök, ilgili TLD sunucusunun adresini döndürür.' },
  { t: 'TLD sunucusu', d: 'Çözücü .com TLD sunucusuna sorar: "basementonfire.com\'a kim yetkili?" TLD, alan adının yetkili (authoritative) sunucusunu işaret eder.' },
  { t: 'Yetkili sunucu', d: 'Yetkili ad sunucusu nihai cevabı bilir ve alan adının gerçek IP adresini (örn. 203.0.113.42) döndürür.' },
  { t: 'Önbelleğe alınır', d: 'Çözücü cevabı TTL süresince önbelleğe alır ve tarayıcıya iletir. Bir sonraki ziyarette bu adımların çoğu atlanır — bu yüzden çok hızlıdır.' },
];

const tcpSteps = [
  { t: 'SYN →', d: 'İstemci sunucuya bir SYN (senkronize) paketi gönderir: "Bağlanmak istiyorum, sıra numaram X." Bu, el sıkışmanın başlangıcıdır.' },
  { t: '← SYN-ACK', d: 'Sunucu SYN-ACK ile yanıt verir: "Tamam, isteğini aldım (ACK) ve ben de bağlanmak istiyorum (SYN), sıra numaram Y."' },
  { t: 'ACK →', d: 'İstemci son bir ACK gönderir: "Senin de isteğini aldım." Üçlü el sıkışma tamamlandı; artık güvenilir veri akışı başlayabilir.' },
];

const tlsSteps = [
  { t: 'ClientHello', d: 'İstemci desteklediği TLS sürümlerini, şifreleme paketlerini (cipher suites) ve rastgele bir sayı gönderir.' },
  { t: 'ServerHello + Sertifika', d: 'Sunucu şifreleme yöntemini seçer, kendi rastgele sayısını ve dijital sertifikasını (içinde açık anahtarı vardır) gönderir.' },
  { t: 'Sertifika doğrulama', d: 'İstemci sertifikayı güvenilir bir Sertifika Otoritesi (CA) imzalamış mı diye kontrol eder. Geçersizse tarayıcı uyarı verir.' },
  { t: 'Anahtar değişimi', d: 'İki taraf, açık anahtar kriptografisiyle ortak bir gizli oturum anahtarı (session key) üzerinde anlaşır — kimse dinlese bile çözemez.' },
  { t: 'Finished — Şifreli kanal', d: 'Her iki taraf "Finished" mesajı gönderir. Artık tüm trafik bu simetrik oturum anahtarıyla şifrelidir. 🔒' },
];

const tcpUdp = [
  { f: 'Bağlantı', tcp: 'Bağlantı kurar (el sıkışma)', udp: 'Bağlantısız, hemen gönderir' },
  { f: 'Güvenilirlik', tcp: 'Garantili teslim + sıralama', udp: 'Garanti yok, kayıp olabilir' },
  { f: 'Hız', tcp: 'Daha yavaş (ek yük fazla)', udp: 'Çok hızlı, az ek yük' },
  { f: 'Sıra', tcp: 'Paketler sırayla birleştirilir', udp: 'Sıra garantisi yok' },
  { f: 'Kullanım', tcp: 'Web, e-posta, dosya', udp: 'Video, oyun, sesli arama, DNS' },
];

const httpMethods = [
  { m: 'GET', d: 'Veri ister (sayfa, görsel). Yan etkisi olmamalı.', c: '#34d399' },
  { m: 'POST', d: 'Yeni veri gönderir (form, yorum).', c: '#38bdf8' },
  { m: 'PUT', d: 'Var olan bir kaynağı tümüyle günceller.', c: '#a78bfa' },
  { m: 'DELETE', d: 'Bir kaynağı siler.', c: '#fb7185' },
  { m: 'PATCH', d: 'Bir kaynağı kısmen günceller.', c: '#fbbf24' },
];

const httpStatus = [
  { code: '1xx', name: 'Bilgi', d: 'İstek alındı, işlem sürüyor.', c: '#8b9bb4' },
  { code: '2xx', name: 'Başarılı', d: '200 OK — istek başarıyla tamamlandı.', c: '#34d399' },
  { code: '3xx', name: 'Yönlendirme', d: '301/302 — kaynak başka adrese taşındı.', c: '#38bdf8' },
  { code: '4xx', name: 'İstemci Hatası', d: '404 Bulunamadı, 403 Yasak — hata sende.', c: '#fbbf24' },
  { code: '5xx', name: 'Sunucu Hatası', d: '500 — hata sunucu tarafında.', c: '#fb7185' },
];

const connTypes = [
  { name: 'DSL', icon: '☎️', speed: '1–100 Mbps', d: 'Mevcut bakır telefon hatları üzerinden. Ekonomik ama mesafeyle hız düşer.' },
  { name: 'Kablo', icon: '📺', speed: '50–1000 Mbps', d: 'Koaksiyel TV kablosu üzerinden. Mahalle komşularıyla hat paylaşılır.' },
  { name: 'Fiber', icon: '💡', speed: '100 Mbps–10 Gbps', d: 'Veriyi ışık olarak taşır. En hızlı ve en düşük gecikmeli seçenek.' },
  { name: 'Mobil', icon: '📡', speed: '10 Mbps–1 Gbps', d: '4G/5G baz istasyonları üzerinden kablosuz geniş bant.' },
  { name: 'Uydu', icon: '🛰️', speed: '25–250 Mbps', d: 'Yörüngedeki uydularla; kırsalda erişim sağlar, gecikmesi yüksek olabilir.' },
];

const quizQs = [
  { text: 'Bir alan adını (basementonfire.com) IP adresine çeviren sistem hangisidir?', opts: ['HTTP', 'DNS', 'TCP', 'MAC'], a: 1 },
  { text: 'OSI modelinde yönlendiriciler (router) hangi katmanda çalışır?', opts: ['Fiziksel (1)', 'Veri Bağı (2)', 'Ağ (3)', 'Taşıma (4)'], a: 2 },
  { text: 'Hangi protokol hız için güvenilirlikten ödün verir (video/oyun)?', opts: ['TCP', 'UDP', 'HTTPS', 'FTP'], a: 1 },
  { text: 'HTTPS\'teki "S" neyi sağlar?', opts: ['Daha hızlı yükleme', 'TLS ile şifreleme', 'Daha çok reklam', 'Sıkıştırma'], a: 1 },
  { text: 'MAC adresi neyi tanımlar?', opts: ['Ağdaki mantıksal konumu', 'Cihazın fiziksel ağ kartını', 'Web sitesini', 'Port numarasını'], a: 1 },
  { text: 'TCP bağlantısı kaç adımlı "el sıkışma" ile kurulur?', opts: ['1', '2', '3', '4'], a: 2 },
];

/* ════════════════════════ YARDIMCI: STEPPER ════════════════════════ */

function Stepper({ steps, accent, children }: { steps: { t: string; d: string }[]; accent: string; children: (i: number) => ReactNode }) {
  const [i, setI] = useState(0);
  return (
    <div className="net-stepper">
      <div className="net-stepper-viz">{children(i)}</div>
      <div className="net-stepper-panel">
        <div className="net-dots">
          {steps.map((_, k) => (
            <button key={k} className={`net-dot ${k === i ? 'on' : ''} ${k < i ? 'done' : ''}`} onClick={() => setI(k)} aria-label={`Adım ${k + 1}`}
              style={k <= i ? { background: accent, borderColor: accent } : undefined} />
          ))}
        </div>
        <div className="net-step-meta" style={{ color: accent }}>ADIM {i + 1} / {steps.length}</div>
        <h4 className="net-step-title">{steps[i].t}</h4>
        <p className="net-step-desc">{steps[i].d}</p>
        <div className="net-stepper-ctrl">
          <button className="net-ctrl-btn" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0}>← Geri</button>
          <button className="net-ctrl-btn net-ctrl-primary" style={{ background: accent, borderColor: accent }} onClick={() => setI(Math.min(steps.length - 1, i + 1))} disabled={i === steps.length - 1}>İleri →</button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════ ANA BİLEŞEN ════════════════════════ */

export default function InternetClient() {
  const [osiOpen, setOsiOpen] = useState<number | null>(4);

  // Quiz
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
    const isRight = sel === quizQs[quizQ].a;
    if (isRight) setScore((s) => s + 1);
    setAnswered((prev) => ({ ...prev, [quizQ]: sel }));
    setTimeout(() => {
      if (quizQ + 1 < quizQs.length) setQuizQ((q) => q + 1);
      else setDone(true);
    }, 900);
  }
  function restartQuiz() { setQuizQ(0); setScore(0); setAnswered({}); setDone(false); }

  return (
    <main className="main-content net-page">

      {/* ── Yapışkan üst bar ── */}
      <div className="net-topbar">
        <Link href="/" className="net-back" aria-label="Ana sayfa">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
        </Link>
        <span className="net-topbar-title">İnternet Nasıl Çalışır?</span>
      </div>

      {/* ── HERO ── */}
      <header className="net-hero">
        <div className="net-hero-grid" aria-hidden="true" />
        <div className="net-hero-eyebrow">PAKET · PROTOKOL · YÖNLENDİRME</div>
        <h1 className="net-hero-title">İnternet <span className="net-grad">Nasıl Çalışır?</span></h1>
        <p className="net-hero-sub">
          Bir adres yazdığında milisaniyeler içinde dünyanın öbür ucundaki bir sunucuyla konuşursun.
          Perde arkasında OSI katmanları, paketler, DNS, yönlendiriciler ve şifreleme devrededir.
          Bu rehber, o görünmez yolculuğu adım adım, diyagramlarla açıklar.
        </p>
        {/* Hero veri-akışı animasyonu */}
        <div className="net-flow" role="img" aria-label="Cihazdan sunucuya veri akışı">
          <svg viewBox="0 0 760 120" className="net-flow-svg">
            <defs>
              <linearGradient id="netFlowG" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#38bdf8" /><stop offset="0.5" stopColor="#34d399" /><stop offset="1" stopColor="#a78bfa" />
              </linearGradient>
            </defs>
            <line x1="90" y1="60" x2="670" y2="60" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
            {/* düğümler */}
            {[['Sen', 90, '💻'], ['Router', 250, '📶'], ['ISP', 415, '🏢'], ['Omurga', 540, '🌐'], ['Sunucu', 670, '🖥️']].map(([l, x, e]) => (
              <g key={l as string}>
                <circle cx={x as number} cy="60" r="22" fill="#0c1326" stroke="url(#netFlowG)" strokeWidth="2" />
                <text x={x as number} y="67" textAnchor="middle" fontSize="20">{e as string}</text>
                <text x={x as number} y="100" textAnchor="middle" fontSize="11" fill="#8b9bb4" fontWeight="600">{l as string}</text>
              </g>
            ))}
            {/* hareketli paketler */}
            <circle r="5" fill="#38bdf8" className="net-pkt"><animateMotion dur="3s" repeatCount="indefinite" path="M90,60 H670" /></circle>
            <circle r="5" fill="#34d399" className="net-pkt"><animateMotion dur="3s" begin="1s" repeatCount="indefinite" path="M90,60 H670" /></circle>
            <circle r="5" fill="#a78bfa" className="net-pkt"><animateMotion dur="3s" begin="2s" repeatCount="indefinite" path="M90,60 H670" /></circle>
          </svg>
        </div>
        <div className="net-hero-tags">
          {['OSI', 'TCP/IP', 'DNS', 'HTTP/HTTPS', 'SSL/TLS', 'Router', 'Switch', 'IP & MAC', 'UDP', 'ISP & DSL'].map((t) => (
            <span key={t} className="net-tag">{t}</span>
          ))}
        </div>
      </header>

      {/* ── 1. GENEL BAKIŞ ── */}
      <section className="net-section reveal">
        <div className="net-kicker">01 — Büyük Resim</div>
        <h2 className="net-h2">Bir adres yazınca ne olur?</h2>
        <p className="net-p">
          Tarayıcına <code className="net-code">basementonfire.com</code> yazıp Enter&apos;a bastığında, saniyenin çok küçük
          bir kısmında bir dizi olay zinciri tetiklenir. İşte sıralı özet — her birini aşağıda derinlemesine inceleyeceğiz:
        </p>
        <ol className="net-steps-list">
          {[
            ['DNS çözümleme', 'Alan adı bir IP adresine çevrilir (telefon rehberi gibi).'],
            ['TCP el sıkışma', 'Hedef sunucuyla güvenilir bir bağlantı kurulur (3 adım).'],
            ['TLS el sıkışma', 'HTTPS ise şifreli bir kanal açılır, sertifika doğrulanır.'],
            ['HTTP isteği', 'Tarayıcı "bana bu sayfayı ver" (GET) der.'],
            ['Yönlendirme', 'İstek; router\'lar üzerinden paket paket sunucuya ulaşır.'],
            ['Yanıt & render', 'Sunucu HTML/CSS/JS gönderir, tarayıcı sayfayı çizer.'],
          ].map(([t, d], i) => (
            <li key={i} className="net-step-li">
              <span className="net-step-num">{i + 1}</span>
              <div><strong className="net-step-h">{t}</strong><span className="net-step-p">{d}</span></div>
            </li>
          ))}
        </ol>
        <div className="net-callout">
          <span className="net-callout-icon">💡</span>
          <p>İnternet tek bir <Link href="/articles/bilgisayar" className="article-ilink">bilgisayar</Link> değil; <strong>ağların ağıdır</strong> (inter-network). Milyarlarca cihaz, ortak
          kurallar (protokoller) sayesinde marka ve ülke farkı gözetmeksizin birbiriyle konuşabilir.</p>
        </div>
      </section>

      {/* ── 2. AĞLARIN AĞI ── */}
      <section className="net-section reveal">
        <div className="net-kicker">02 — Temel Kavram</div>
        <h2 className="net-h2">İnternet: Ağların Ağı</h2>
        <p className="net-p">
          Evindeki cihazlar bir <strong>yerel ağ (LAN)</strong> oluşturur. Bu yerel ağ, modem aracılığıyla servis
          sağlayıcına (ISP) bağlanır. ISP&apos;ler birbirine ve büyük <strong>omurga (backbone)</strong> hatlarına
          bağlanır. Sonuçta her cihaz, devasa bir örümcek ağının bir düğümü hâline gelir.
        </p>

        <ArticleImage
          className="net-img mx-auto"
          src="/articles/internet/veri-merkezi.webp"
          ratio="1600 / 2408"
          priority
          alt="Veri merkezi koridoru: iki yanda tavana kadar uzanan sunucu dolapları, önlerinde renkli kablo demetleri."
          caption="Aşağıdaki diyagramda “veri merkezi” yazan kutunun gerçeği. Bulut dediğimiz şey burası: birinin elektriğini ödediği, soğuttuğu ve kablolarını çektiği raflar."
          credit="Derrick Coetzee · CC0"
        />
        <div className="net-diagram">
          <svg viewBox="0 0 720 300" className="net-svg">
            {/* kümeler */}
            <g>
              <circle cx="120" cy="150" r="70" fill="rgba(56,189,248,0.05)" stroke="rgba(56,189,248,0.3)" strokeDasharray="4 4" />
              <text x="120" y="60" textAnchor="middle" fill="#38bdf8" fontSize="12" fontWeight="700">Yerel Ağ (LAN)</text>
              {[[90, 130], [150, 130], [90, 175], [150, 175], [120, 150]].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={i === 4 ? 10 : 7} fill={i === 4 ? '#38bdf8' : '#0c1326'} stroke="#38bdf8" strokeWidth="1.5" />
              ))}
            </g>
            <g>
              <circle cx="600" cy="150" r="70" fill="rgba(167,139,250,0.05)" stroke="rgba(167,139,250,0.3)" strokeDasharray="4 4" />
              <text x="600" y="60" textAnchor="middle" fill="#a78bfa" fontSize="12" fontWeight="700">Veri Merkezi</text>
              {[[570, 130], [630, 130], [570, 175], [630, 175], [600, 150]].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={i === 4 ? 10 : 7} fill={i === 4 ? '#a78bfa' : '#0c1326'} stroke="#a78bfa" strokeWidth="1.5" />
              ))}
            </g>
            {/* merkez omurga */}
            <circle cx="360" cy="150" r="34" fill="rgba(52,211,153,0.08)" stroke="#34d399" strokeWidth="2" />
            <text x="360" y="146" textAnchor="middle" fontSize="18">🌐</text>
            <text x="360" y="200" textAnchor="middle" fill="#34d399" fontSize="12" fontWeight="700">Omurga / IXP</text>
            {/* bağlantılar */}
            <line x1="190" y1="150" x2="326" y2="150" stroke="#34d399" strokeWidth="2" opacity="0.5" />
            <line x1="394" y1="150" x2="530" y2="150" stroke="#34d399" strokeWidth="2" opacity="0.5" />
            <line x1="360" y1="116" x2="360" y2="70" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" /><text x="360" y="55" textAnchor="middle" fontSize="16">☁️</text>
          </svg>
        </div>
      </section>

      {/* ── 3. OSI MODELİ ── */}
      <section className="net-section reveal">
        <div className="net-kicker">03 — Katman Modeli</div>
        <h2 className="net-h2">OSI Modeli — 7 Katman</h2>
        <p className="net-p">
          OSI (Open Systems Interconnection) modeli, ağ iletişimini 7 mantıksal katmana böler. Her katman bir
          öncekinin üzerine inşa edilir ve tek bir işten sorumludur. Bir katmana tıklayarak ne yaptığını gör:
        </p>
        <div className="net-osi">
          {osiLayers.map((L) => (
            <div key={L.n} className={`net-osi-row ${osiOpen === L.n ? 'open' : ''}`} style={{ '--lc': L.color } as CSSProperties}>
              <button className="net-osi-head" onClick={() => setOsiOpen(osiOpen === L.n ? null : L.n)} aria-expanded={osiOpen === L.n}>
                <span className="net-osi-num">{L.n}</span>
                <span className="net-osi-ico">{L.icon}</span>
                <span className="net-osi-name">{L.name}<span className="net-osi-en">{L.en}</span></span>
                <span className="net-osi-pdu">{L.pdu}</span>
                <span className="net-osi-chev">{osiOpen === L.n ? '−' : '+'}</span>
              </button>
              {osiOpen === L.n && (
                <div className="net-osi-body">
                  <p>{L.desc}</p>
                  <div className="net-osi-proto"><span>Örnek:</span> {L.proto}</div>
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="net-hint">📌 Hatırlatıcı: <em>“Pek Çok Ağ Tüm Oturumları Sunup Uygular”</em> — Fiziksel, Çerçeve(Veri Bağı), Ağ, Taşıma, Oturum, Sunum, Uygulama.</p>
      </section>

      {/* ── 4. TCP/IP MODELİ ── */}
      <section className="net-section reveal">
        <div className="net-kicker">04 — Pratikteki Model</div>
        <h2 className="net-h2">TCP/IP Modeli & OSI ile Eşleşmesi</h2>
        <p className="net-p">
          OSI bir öğretim/referans modelidir; internet gerçekte daha sade <strong>TCP/IP</strong> modeliyle çalışır.
          TCP/IP, OSI&apos;nin 7 katmanını 4 pratik katmanda toplar:
        </p>
        <div className="net-map">
          <div className="net-map-col">
            <div className="net-map-h net-map-h-osi">OSI (7)</div>
            {osiLayers.map((L) => (
              <div key={L.n} className="net-map-cell" style={{ borderLeftColor: L.color }}>{L.n}. {L.name}</div>
            ))}
          </div>
          <div className="net-map-col">
            <div className="net-map-h net-map-h-tcp">TCP/IP (4)</div>
            <div className="net-map-tcp" style={{ flex: 3, background: 'rgba(56,189,248,0.1)', borderColor: '#38bdf8' }}>Uygulama<small>HTTP, DNS, TLS…</small></div>
            <div className="net-map-tcp" style={{ flex: 1, background: 'rgba(52,211,153,0.1)', borderColor: '#34d399' }}>Taşıma<small>TCP, UDP</small></div>
            <div className="net-map-tcp" style={{ flex: 1, background: 'rgba(251,191,36,0.1)', borderColor: '#fbbf24' }}>İnternet<small>IP</small></div>
            <div className="net-map-tcp" style={{ flex: 2, background: 'rgba(251,113,133,0.1)', borderColor: '#fb7185' }}>Ağ Erişimi<small>Ethernet, Wi-Fi</small></div>
          </div>
        </div>
      </section>

      {/* ── 5. PAKETLER & KAPSÜLLEME ── */}
      <section className="net-section reveal">
        <div className="net-kicker">05 — Veri Nasıl Taşınır</div>
        <h2 className="net-h2">Paketler & Kapsülleme (Encapsulation)</h2>
        <p className="net-p">
          Büyük veriler tek parça gönderilmez; küçük <strong>paketlere</strong> bölünür. Her paket bağımsız yol
          alabilir ve hedefte yeniden birleştirilir. Bir paket aşağı inerken her katman kendi başlığını ekler —
          buna <strong>kapsülleme</strong> denir. Aşağıdaki adımları ilerlet:
        </p>
        <Stepper steps={encapSteps} accent="#34d399">
          {(i) => (
            <svg viewBox="0 0 460 150" className="net-svg net-encap-svg">
              {/* katman katman sarmalama */}
              {[
                { x: 175, w: 110, label: 'Veri', c: '#38bdf8' },
                { x: 130, w: 45, label: 'TCP', c: '#34d399' },
                { x: 90, w: 40, label: 'IP', c: '#fbbf24' },
                { x: 50, w: 40, label: 'Eth', c: '#fb923c' },
              ].map((b, k) => {
                const show = i >= k && i < 4;
                return (
                  <g key={k} opacity={show ? 1 : 0.12} style={{ transition: 'opacity .3s' }}>
                    <rect x={b.x} y="45" width={k === 0 ? b.w : b.w} height="50" rx="5" fill={`${b.c}22`} stroke={b.c} strokeWidth={i === k ? 3 : 1.5} />
                    <text x={b.x + b.w / 2} y="74" textAnchor="middle" fontSize="12" fontWeight="700" fill={b.c}>{b.label}</text>
                  </g>
                );
              })}
              {/* sağ FCS (frame'de) */}
              <g opacity={i >= 3 && i < 4 ? 1 : 0.12}>
                <rect x="285" y="45" width="34" height="50" rx="5" fill="#fb923c22" stroke="#fb923c" strokeWidth="1.5" />
                <text x="302" y="74" textAnchor="middle" fontSize="10" fontWeight="700" fill="#fb923c">FCS</text>
              </g>
              {/* bitler */}
              {i === 4 && (
                <text x="230" y="74" textAnchor="middle" fontSize="14" fontWeight="700" fill="#fb7185" fontFamily="monospace">01001010 11010 0110…</text>
              )}
              <text x="230" y="125" textAnchor="middle" fontSize="12" fontWeight="700" fill={encapSteps[i].color}>{encapSteps[i].layer}</text>
            </svg>
          )}
        </Stepper>

        <h3 className="net-h3">Bir paketin anatomisi</h3>
        <div className="net-diagram">
          <svg viewBox="0 0 700 130" className="net-svg">
            <rect x="20" y="40" width="150" height="50" rx="6" fill="rgba(251,191,36,0.12)" stroke="#fbbf24" />
            <text x="95" y="62" textAnchor="middle" fontSize="12" fontWeight="700" fill="#fbbf24">IP Başlığı</text>
            <text x="95" y="78" textAnchor="middle" fontSize="9" fill="#8b9bb4">kaynak/hedef IP · TTL</text>
            <rect x="170" y="40" width="140" height="50" rx="6" fill="rgba(52,211,153,0.12)" stroke="#34d399" />
            <text x="240" y="62" textAnchor="middle" fontSize="12" fontWeight="700" fill="#34d399">TCP Başlığı</text>
            <text x="240" y="78" textAnchor="middle" fontSize="9" fill="#8b9bb4">port · sıra no · checksum</text>
            <rect x="310" y="40" width="370" height="50" rx="6" fill="rgba(56,189,248,0.12)" stroke="#38bdf8" />
            <text x="495" y="68" textAnchor="middle" fontSize="13" fontWeight="700" fill="#38bdf8">Yük (Payload) — Asıl Veri</text>
            <text x="350" y="25" fontSize="11" fill="#8b9bb4">← Başlıklar (adresleme & kontrol)</text>
            <text x="495" y="115" textAnchor="middle" fontSize="11" fill="#8b9bb4">Göndermek istediğin gerçek içerik</text>
          </svg>
        </div>
      </section>

      {/* ── 6. IP ADRESLERİ ── */}
      <section className="net-section reveal">
        <div className="net-kicker">06 — Adresleme</div>
        <h2 className="net-h2">IP Adresleri</h2>
        <p className="net-p">
          Her cihazın ağdaki <strong>mantıksal</strong> adresi IP&apos;dir — tıpkı evinin posta adresi gibi.
          Paketler bu adres sayesinde doğru hedefe yönlendirilir. En yaygın biçim <strong>IPv4</strong>: noktayla
          ayrılmış dört sayı (oktet), her biri 8 bit (0–255).
        </p>
        <div className="net-diagram">
          <svg viewBox="0 0 700 150" className="net-svg">
            {[['192', 60], ['168', 230], ['1', 400], ['42', 560]].map(([n, x], i) => (
              <g key={i}>
                <rect x={x as number} y="40" width="110" height="46" rx="8" fill="rgba(56,189,248,0.1)" stroke="#38bdf8" strokeWidth="1.5" />
                <text x={(x as number) + 55} y="70" textAnchor="middle" fontSize="22" fontWeight="800" fill="#dbe4f0" fontFamily="monospace">{n as string}</text>
                <text x={(x as number) + 55} y="106" textAnchor="middle" fontSize="10" fill="#8b9bb4" fontFamily="monospace">{(Number(n)).toString(2).padStart(8, '0')}</text>
                <text x={(x as number) + 55} y="124" textAnchor="middle" fontSize="9" fill="#5a6b85">8 bit (oktet)</text>
                {i < 3 && <text x={(x as number) + 117} y="70" textAnchor="middle" fontSize="22" fontWeight="800" fill="#38bdf8">.</text>}
              </g>
            ))}
            <text x="350" y="22" textAnchor="middle" fontSize="12" fill="#8b9bb4">IPv4 = 4 oktet × 8 bit = 32 bit → ~4.3 milyar adres</text>
          </svg>
        </div>
        <div className="net-grid2">
          <div className="net-mini">
            <h4>IPv4 vs IPv6</h4>
            <p><strong>IPv4</strong> (32 bit) adresleri tükendi. <strong>IPv6</strong> (128 bit) neredeyse sınırsız adres sunar:
            <code className="net-code">2001:0db8:85a3::8a2e:0370:7334</code>.</p>
          </div>
          <div className="net-mini">
            <h4>Genel vs Özel</h4>
            <p><strong>Özel</strong> IP&apos;ler (192.168.x.x, 10.x.x.x) yerel ağda kullanılır. Dışarı çıkarken
            <strong> NAT</strong> ile tek bir <strong>genel</strong> IP&apos;ye çevrilir.</p>
          </div>
        </div>
      </section>

      {/* ── 7. MAC ADRESLERİ ── */}
      <section className="net-section reveal">
        <div className="net-kicker">07 — Fiziksel Kimlik</div>
        <h2 className="net-h2">MAC Adresleri & ARP</h2>
        <p className="net-p">
          MAC (Media Access Control) adresi, cihazın ağ kartına üreticide kazınan <strong>fiziksel</strong> kimliktir.
          IP değişebilir ama MAC genelde sabittir. 48 bittir ve onaltılık (hex) yazılır:
        </p>

        <ArticleImage
          className="net-img"
          src="/articles/internet/ag-karti.webp"
          ratio="1600 / 1200"
          alt="Yeşil devre kartı: üzerinde yongalar, bir ethernet soketi ve metal braket bulunuyor."
          caption="Bir ağ kartı. MAC adresi tam olarak bu karta, üretim sırasında kazınır — işletim sisteminden bağımsız, donanımın kendi kimliği."
          credit="Wikimedia Commons · kamu malı"
        />
        <div className="net-diagram">
          <svg viewBox="0 0 700 130" className="net-svg">
            <rect x="60" y="45" width="280" height="48" rx="8" fill="rgba(167,139,250,0.1)" stroke="#a78bfa" strokeWidth="1.5" />
            <text x="200" y="75" textAnchor="middle" fontSize="18" fontWeight="800" fill="#a78bfa" fontFamily="monospace">00:1A:2B</text>
            <text x="200" y="112" textAnchor="middle" fontSize="10" fill="#8b9bb4">OUI — Üretici Kodu</text>
            <rect x="360" y="45" width="280" height="48" rx="8" fill="rgba(52,211,153,0.1)" stroke="#34d399" strokeWidth="1.5" />
            <text x="500" y="75" textAnchor="middle" fontSize="18" fontWeight="800" fill="#34d399" fontFamily="monospace">3C:4D:5E</text>
            <text x="500" y="112" textAnchor="middle" fontSize="10" fill="#8b9bb4">NIC — Cihaza Özel</text>
            <text x="350" y="28" textAnchor="middle" fontSize="11" fill="#8b9bb4">48 bit MAC = 24 bit üretici + 24 bit seri</text>
          </svg>
        </div>
        <div className="net-callout">
          <span className="net-callout-icon">🔁</span>
          <p><strong>ARP (Address Resolution Protocol):</strong> Yerel ağda bir cihaz, hedefin IP&apos;sini bilir ama
          çerçeveyi göndermek için MAC&apos;ine ihtiyaç duyar. “192.168.1.5 kimde?” diye ağa sorar; ilgili cihaz MAC&apos;ini söyler.</p>
        </div>
        <div className="net-cmp">
          <div className="net-cmp-col"><div className="net-cmp-h" style={{ color: '#fbbf24' }}>IP Adresi</div><ul><li>Mantıksal, atanır</li><li>Ağ katmanı (3)</li><li>Konuma göre değişir</li><li>Ağlar arası yönlendirme</li></ul></div>
          <div className="net-cmp-col"><div className="net-cmp-h" style={{ color: '#a78bfa' }}>MAC Adresi</div><ul><li>Fiziksel, kazınır</li><li>Veri bağı katmanı (2)</li><li>Cihazla birlikte sabit</li><li>Yerel ağ içi teslim</li></ul></div>
        </div>
      </section>

      {/* ── 8. ROUTER & SWITCH ── */}
      <section className="net-section reveal">
        <div className="net-kicker">08 — Ağ Donanımı</div>
        <h2 className="net-h2">Yönlendiriciler & Anahtarlar</h2>
        <p className="net-p">
          <strong>Switch (anahtar)</strong> aynı yerel ağdaki cihazları birbirine bağlar ve MAC adreslerine göre
          çerçeve iletir. <strong>Router (yönlendirici)</strong> ise <em>farklı</em> ağları birbirine bağlar ve
          paketleri IP adreslerine göre en iyi yoldan dış dünyaya taşır.
        </p>

        <ArticleImage
          className="net-img"
          src="/articles/internet/ethernet-switch.webp"
          ratio="1600 / 1200"
          alt="Rafa monte edilmiş ince metal kutu: ön yüzünde sıra sıra ethernet portu ve durum ışıkları."
          caption="Bir ethernet anahtarı. Aşağıdaki şemada SWITCH yazan kutu fiziksel olarak böyle görünüyor: portlara takılan her cihaz, MAC adresiyle bu tablonun bir satırı oluyor."
          credit="Wikimedia Commons · kamu malı"
        />
        <div className="net-diagram">
          <svg viewBox="0 0 700 260" className="net-svg">
            {/* cihazlar */}
            {[['💻', 70], ['📱', 170], ['🖨️', 270]].map(([e, x], i) => (
              <g key={i}>
                <rect x={(x as number) - 26} y="20" width="52" height="42" rx="8" fill="#0c1326" stroke="#38bdf8" strokeWidth="1.5" />
                <text x={x as number} y="48" textAnchor="middle" fontSize="20">{e as string}</text>
                <line x1={x as number} y1="62" x2="170" y2="110" stroke="rgba(56,189,248,0.4)" strokeWidth="1.5" />
              </g>
            ))}
            {/* switch */}
            <rect x="90" y="110" width="160" height="44" rx="8" fill="rgba(52,211,153,0.12)" stroke="#34d399" strokeWidth="2" />
            <text x="170" y="138" textAnchor="middle" fontSize="13" fontWeight="700" fill="#34d399">SWITCH (MAC)</text>
            <line x1="250" y1="132" x2="400" y2="132" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
            {/* router */}
            <rect x="400" y="110" width="160" height="44" rx="8" fill="rgba(251,191,36,0.12)" stroke="#fbbf24" strokeWidth="2" />
            <text x="480" y="138" textAnchor="middle" fontSize="13" fontWeight="700" fill="#fbbf24">ROUTER (IP)</text>
            {/* internet */}
            <line x1="480" y1="154" x2="480" y2="200" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
            <text x="480" y="228" textAnchor="middle" fontSize="30">☁️</text>
            <text x="480" y="250" textAnchor="middle" fontSize="11" fill="#8b9bb4" fontWeight="600">İnternet</text>
            <text x="170" y="180" textAnchor="middle" fontSize="10" fill="#8b9bb4">Yerel ağ (LAN)</text>
          </svg>
        </div>
        <div className="net-cmp net-cmp-3">
          <div className="net-cmp-col"><div className="net-cmp-h" style={{ color: '#fb7185' }}>Hub</div><ul><li>Katman 1</li><li>Veriyi herkese yollar</li><li>“Aptal”, verimsiz</li></ul></div>
          <div className="net-cmp-col"><div className="net-cmp-h" style={{ color: '#34d399' }}>Switch</div><ul><li>Katman 2 (MAC)</li><li>Sadece doğru porta yollar</li><li>Yerel ağ içi</li></ul></div>
          <div className="net-cmp-col"><div className="net-cmp-h" style={{ color: '#fbbf24' }}>Router</div><ul><li>Katman 3 (IP)</li><li>Ağları birbirine bağlar</li><li>En iyi yolu seçer</li></ul></div>
        </div>
      </section>

      {/* ── 9. PROTOKOLLER ── */}
      <section className="net-section reveal">
        <div className="net-kicker">09 — Ortak Dil</div>
        <h2 className="net-h2">Protokoller & Portlar</h2>
        <p className="net-p">
          <strong>Protokol</strong>, iki tarafın anlaşması gereken kurallar bütünüdür. <strong>Port</strong> ise bir
          cihazdaki belirli bir servise açılan numaralı kapıdır. Bir IP&apos;ye gelen trafik, port numarasıyla doğru
          uygulamaya dağıtılır (web → 443, e-posta → 25…).
        </p>
        <div className="net-table-wrap">
          <table className="net-table">
            <thead><tr><th>Protokol</th><th>Port</th><th>Katman</th><th>Taşıma</th><th>Ne işe yarar</th></tr></thead>
            <tbody>
              {protocols.map((p) => (
                <tr key={p.name}>
                  <td><strong className="net-proto-name">{p.name}</strong></td>
                  <td><code className="net-code">{p.port}</code></td>
                  <td>{p.layer}</td>
                  <td><span className={`net-pill ${p.tp.includes('UDP') ? 'udp' : 'tcp'}`}>{p.tp}</span></td>
                  <td>{p.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 10. DNS ── */}
      <section className="net-section reveal">
        <div className="net-kicker">10 — İnternetin Telefon Rehberi</div>
        <h2 className="net-h2">DNS — Alan Adı Çözümleme</h2>
        <p className="net-p">
          İnsanlar isimleri (<code className="net-code">basementonfire.com</code>) hatırlar, bilgisayarlar sayıları
          (IP). <strong>DNS</strong> ikisi arasında çeviri yapar. Bir adı çözmek hiyerarşik bir sorgu zinciridir —
          adım adım izle:
        </p>
        <Stepper steps={dnsSteps} accent="#38bdf8">
          {(i) => (
            <svg viewBox="0 0 480 180" className="net-svg">
              {[
                { x: 60, y: 40, l: 'Tarayıcı', e: '💻' },
                { x: 240, y: 40, l: 'Çözücü', e: '🔎' },
                { x: 420, y: 30, l: 'Kök', e: '🌳' },
                { x: 420, y: 90, l: 'TLD .com', e: '🏷️' },
                { x: 420, y: 150, l: 'Yetkili', e: '✅' },
              ].map((n, k) => {
                const active = (i === 0 && k <= 1) || (i === 1 && k === 2) || (i === 2 && k === 3) || (i === 3 && k === 4) || (i === 4 && k <= 1);
                return (
                  <g key={k} opacity={active ? 1 : 0.3} style={{ transition: 'opacity .3s' }}>
                    <circle cx={n.x} cy={n.y} r="18" fill="#0c1326" stroke="#38bdf8" strokeWidth={active ? 2.5 : 1} />
                    <text x={n.x} y={n.y + 6} textAnchor="middle" fontSize="16">{n.e}</text>
                    <text x={n.x} y={n.y + 34} textAnchor="middle" fontSize="9" fill="#8b9bb4">{n.l}</text>
                  </g>
                );
              })}
              <line x1="78" y1="40" x2="222" y2="40" stroke="#38bdf8" strokeWidth="1.5" opacity={i === 0 || i === 4 ? 0.8 : 0.2} />
              <line x1="258" y1="36" x2="402" y2="30" stroke="#38bdf8" strokeWidth="1.5" opacity={i === 1 ? 0.8 : 0.15} />
              <line x1="258" y1="42" x2="402" y2="90" stroke="#38bdf8" strokeWidth="1.5" opacity={i === 2 ? 0.8 : 0.15} />
              <line x1="258" y1="48" x2="402" y2="150" stroke="#38bdf8" strokeWidth="1.5" opacity={i === 3 ? 0.8 : 0.15} />
            </svg>
          )}
        </Stepper>
        <div className="net-table-wrap">
          <table className="net-table">
            <thead><tr><th>Kayıt</th><th>Görevi</th></tr></thead>
            <tbody>
              <tr><td><strong className="net-proto-name">A</strong></td><td>Alan adını bir IPv4 adresine eşler</td></tr>
              <tr><td><strong className="net-proto-name">AAAA</strong></td><td>Alan adını bir IPv6 adresine eşler</td></tr>
              <tr><td><strong className="net-proto-name">CNAME</strong></td><td>Bir adı başka bir ada (takma ad) yönlendirir</td></tr>
              <tr><td><strong className="net-proto-name">MX</strong></td><td>E-postaların gideceği posta sunucusunu belirtir</td></tr>
              <tr><td><strong className="net-proto-name">TXT</strong></td><td>Doğrulama/SPF gibi metin bilgileri tutar</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 11. TCP vs UDP ── */}
      <section className="net-section reveal">
        <div className="net-kicker">11 — Taşıma Katmanı</div>
        <h2 className="net-h2">TCP vs UDP</h2>
        <p className="net-p">
          Taşıma katmanının iki yıldızı vardır. <strong>TCP</strong> güvenilirdir: her paketin ulaştığını doğrular,
          sırayı korur. <strong>UDP</strong> hızlıdır: doğrulama yapmaz, “gönder ve unut” mantığıyla çalışır.
        </p>
        <div className="net-table-wrap">
          <table className="net-table">
            <thead><tr><th>Özellik</th><th style={{ color: '#34d399' }}>TCP</th><th style={{ color: '#fbbf24' }}>UDP</th></tr></thead>
            <tbody>
              {tcpUdp.map((r) => (<tr key={r.f}><td><strong>{r.f}</strong></td><td>{r.tcp}</td><td>{r.udp}</td></tr>))}
            </tbody>
          </table>
        </div>
        <h3 className="net-h3">TCP Üçlü El Sıkışma (3-Way Handshake)</h3>
        <Stepper steps={tcpSteps} accent="#34d399">
          {(i) => (
            <svg viewBox="0 0 460 170" className="net-svg">
              <text x="70" y="24" textAnchor="middle" fontSize="22">💻</text>
              <text x="70" y="44" textAnchor="middle" fontSize="10" fill="#8b9bb4">İstemci</text>
              <text x="390" y="24" textAnchor="middle" fontSize="22">🖥️</text>
              <text x="390" y="44" textAnchor="middle" fontSize="10" fill="#8b9bb4">Sunucu</text>
              <line x1="70" y1="50" x2="70" y2="160" stroke="rgba(255,255,255,0.1)" />
              <line x1="390" y1="50" x2="390" y2="160" stroke="rgba(255,255,255,0.1)" />
              {/* SYN */}
              <g opacity={i >= 0 ? 1 : 0.2}>
                <line x1="80" y1="75" x2="380" y2="90" stroke="#34d399" strokeWidth={i === 0 ? 3 : 1.5} markerEnd="url(#arrG)" />
                <text x="230" y="74" textAnchor="middle" fontSize="11" fontWeight="700" fill="#34d399">SYN →</text>
              </g>
              {/* SYN-ACK */}
              <g opacity={i >= 1 ? 1 : 0.2}>
                <line x1="380" y1="110" x2="80" y2="125" stroke="#38bdf8" strokeWidth={i === 1 ? 3 : 1.5} markerEnd="url(#arrB)" />
                <text x="230" y="110" textAnchor="middle" fontSize="11" fontWeight="700" fill="#38bdf8">← SYN-ACK</text>
              </g>
              {/* ACK */}
              <g opacity={i >= 2 ? 1 : 0.2}>
                <line x1="80" y1="145" x2="380" y2="150" stroke="#a78bfa" strokeWidth={i === 2 ? 3 : 1.5} markerEnd="url(#arrP)" />
                <text x="230" y="143" textAnchor="middle" fontSize="11" fontWeight="700" fill="#a78bfa">ACK →</text>
              </g>
              <defs>
                <marker id="arrG" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="#34d399" /></marker>
                <marker id="arrB" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="#38bdf8" /></marker>
                <marker id="arrP" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="#a78bfa" /></marker>
              </defs>
            </svg>
          )}
        </Stepper>
      </section>

      {/* ── 12. HTTP & HTTPS ── */}
      <section className="net-section reveal">
        <div className="net-kicker">12 — Web&apos;in Dili</div>
        <h2 className="net-h2">HTTP & HTTPS</h2>
        <p className="net-p">
          <strong>HTTP</strong>, tarayıcı ile sunucu arasındaki istek-yanıt protokolüdür. Tarayıcı bir
          <strong> istek</strong> (request) yollar, sunucu bir <strong>yanıt</strong> (response) döner. Bağlantı
          durumsuzdur (stateless): her istek bağımsızdır.
        </p>
        <div className="net-reqres">
          <div className="net-rr-box net-rr-req">
            <div className="net-rr-h">İSTEK</div>
            <code className="net-rr-line"><span style={{ color: '#34d399' }}>GET</span> /index.html <span style={{ color: '#8b9bb4' }}>HTTP/1.1</span></code>
            <code className="net-rr-line">Host: basementonfire.com</code>
            <code className="net-rr-line">Accept: text/html</code>
          </div>
          <div className="net-rr-arrow">→</div>
          <div className="net-rr-box net-rr-res">
            <div className="net-rr-h">YANIT</div>
            <code className="net-rr-line"><span style={{ color: '#8b9bb4' }}>HTTP/1.1</span> <span style={{ color: '#34d399' }}>200 OK</span></code>
            <code className="net-rr-line">Content-Type: text/html</code>
            <code className="net-rr-line">&lt;html&gt;…&lt;/html&gt;</code>
          </div>
        </div>
        <h3 className="net-h3">Metodlar</h3>
        <div className="net-chips">
          {httpMethods.map((m) => (
            <div key={m.m} className="net-chip" style={{ borderColor: `${m.c}55` }}>
              <span className="net-chip-m" style={{ color: m.c }}>{m.m}</span>
              <span className="net-chip-d">{m.d}</span>
            </div>
          ))}
        </div>
        <h3 className="net-h3">Durum Kodları</h3>
        <div className="net-status">
          {httpStatus.map((s) => (
            <div key={s.code} className="net-status-row">
              <span className="net-status-code" style={{ background: `${s.c}22`, color: s.c, borderColor: `${s.c}55` }}>{s.code}</span>
              <strong className="net-status-name">{s.name}</strong>
              <span className="net-status-d">{s.d}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 13. SSL / TLS ── */}
      <section className="net-section reveal">
        <div className="net-kicker">13 — Güvenlik</div>
        <h2 className="net-h2">SSL / TLS — Şifreli Bağlantı</h2>
        <p className="net-p">
          HTTPS&apos;teki kilit 🔒, <strong>TLS</strong> (eski adıyla SSL) sayesinde gelir. TLS üç şey sağlar:
          <strong> gizlilik</strong> (şifreleme), <strong>bütünlük</strong> (veri değişmedi) ve
          <strong> kimlik doğrulama</strong> (karşı taraf gerçekten o site). Bağlantı, bir el sıkışmayla başlar:
        </p>
        <Stepper steps={tlsSteps} accent="#a78bfa">
          {(i) => (
            <svg viewBox="0 0 460 170" className="net-svg">
              <text x="70" y="24" textAnchor="middle" fontSize="22">💻</text>
              <text x="70" y="44" textAnchor="middle" fontSize="10" fill="#8b9bb4">İstemci</text>
              <text x="390" y="24" textAnchor="middle" fontSize="22">🔐</text>
              <text x="390" y="44" textAnchor="middle" fontSize="10" fill="#8b9bb4">Sunucu</text>
              <line x1="70" y1="50" x2="70" y2="160" stroke="rgba(255,255,255,0.1)" />
              <line x1="390" y1="50" x2="390" y2="160" stroke="rgba(255,255,255,0.1)" />
              <g opacity={i >= 0 ? 1 : 0.2}><line x1="80" y1="70" x2="380" y2="78" stroke="#a78bfa" strokeWidth={i === 0 ? 3 : 1.5} /><text x="230" y="68" textAnchor="middle" fontSize="10" fontWeight="700" fill="#a78bfa">ClientHello →</text></g>
              <g opacity={i >= 1 ? 1 : 0.2}><line x1="380" y1="95" x2="80" y2="103" stroke="#38bdf8" strokeWidth={i === 1 ? 3 : 1.5} /><text x="230" y="94" textAnchor="middle" fontSize="10" fontWeight="700" fill="#38bdf8">← Hello + 📜 Sertifika</text></g>
              <g opacity={i >= 3 ? 1 : 0.2}><line x1="80" y1="122" x2="380" y2="128" stroke="#34d399" strokeWidth={i === 3 ? 3 : 1.5} /><text x="230" y="120" textAnchor="middle" fontSize="10" fontWeight="700" fill="#34d399">🔑 Anahtar değişimi</text></g>
              <g opacity={i >= 4 ? 1 : 0.2}><rect x="170" y="140" width="120" height="22" rx="11" fill="rgba(52,211,153,0.15)" stroke="#34d399" /><text x="230" y="155" textAnchor="middle" fontSize="10" fontWeight="700" fill="#34d399">🔒 Şifreli kanal</text></g>
            </svg>
          )}
        </Stepper>
      </section>

      {/* ── 14. ISP & DSL ── */}
      <section className="net-section reveal">
        <div className="net-kicker">14 — İnternete Çıkış</div>
        <h2 className="net-h2">ISP, DSL & Son Kilometre</h2>
        <p className="net-p">
          Evini internete bağlayan şirket <strong>ISP</strong>&apos;dir (İnternet Servis Sağlayıcı). Evden ISP&apos;ye
          uzanan bağlantıya <strong>“son kilometre” (last mile)</strong> denir. İsteğin oradan büyük omurga hatlarına,
          oradan da hedef sunucuya ulaşır:
        </p>

        <div className="net-img-pair">
          <ArticleImage
            className="net-img"
            src="/articles/internet/ev-router.webp"
            ratio="1600 / 1067"
            alt="Masaüstünde duran, antenli beyaz ev tipi yönlendirici; ön yüzünde gösterge ışıkları var."
            caption="Zincirin ilk halkası: evdeki yönlendirici. Aşağıdaki şemada 📶 ile gösterilen düğüm bu kutu."
            credit="Hayden Schiff · CC BY 4.0"
          />
          <ArticleImage
            className="net-img"
            src="/articles/internet/ixp-anahtar-rafi.webp"
            ratio="1600 / 1195"
            alt="Veri merkezinde raf dolusu ağ anahtarı; yüzlerce renkli fiber kablo portlara takılı."
            caption="Bir internet değişim noktasındaki (IXP) anahtar rafı. Farklı sağlayıcıların ağları fiziksel olarak burada buluşuyor — şemadaki 🔀 düğümünün gerçeği."
            credit="Wikimedia Commons · CC BY-SA"
          />
        </div>
        <div className="net-diagram">
          <svg viewBox="0 0 720 170" className="net-svg">
            {[
              { l: 'Ev', e: '🏠', x: 50, c: '#38bdf8' },
              { l: 'Modem', e: '📦', x: 185, c: '#34d399' },
              { l: 'ISP', e: '🏢', x: 320, c: '#fbbf24' },
              { l: 'IXP', e: '🔀', x: 455, c: '#fb923c' },
              { l: 'Omurga', e: '🌐', x: 585, c: '#a78bfa' },
              { l: 'Sunucu', e: '🖥️', x: 690, c: '#fb7185' },
            ].map((n, k, arr) => (
              <g key={k}>
                <rect x={n.x - 30} y="55" width="60" height="50" rx="10" fill={`${n.c}18`} stroke={n.c} strokeWidth="1.5" />
                <text x={n.x} y="86" textAnchor="middle" fontSize="22">{n.e}</text>
                <text x={n.x} y="125" textAnchor="middle" fontSize="10" fill="#8b9bb4" fontWeight="600">{n.l}</text>
                {k < arr.length - 1 && <line x1={n.x + 30} y1="80" x2={arr[k + 1].x - 30} y2="80" stroke="rgba(255,255,255,0.18)" strokeWidth="2" />}
              </g>
            ))}
            <rect x="20" y="30" width="300" height="115" rx="12" fill="none" stroke="rgba(56,189,248,0.25)" strokeDasharray="5 4" />
            <text x="170" y="22" textAnchor="middle" fontSize="11" fill="#38bdf8" fontWeight="700">← Son Kilometre (Last Mile) →</text>
          </svg>
        </div>
        <div className="net-conn">
          {connTypes.map((c) => (
            <div key={c.name} className="net-conn-card">
              <div className="net-conn-ico">{c.icon}</div>
              <h4 className="net-conn-name">{c.name}</h4>
              <div className="net-conn-speed">{c.speed}</div>
              <p className="net-conn-d">{c.d}</p>
            </div>
          ))}
        </div>

        <div className="net-img-pair">
          <ArticleImage
            className="net-img"
            src="/articles/internet/fiber-optik-kablo.webp"
            ratio="1600 / 1000"
            alt="Kesitten görünen fiber optik demet: uçlarından parlak ışık çıkan çok sayıda ince cam lif."
            caption="Fiber optik lifler. “Veriyi ışık olarak taşır” cümlesi mecaz değil: her lifin içinden geçen ışık darbeleri, saniyede milyarlarca bit anlamına geliyor."
            credit="Geek3 · CC BY-SA 4.0"
          />
          <ArticleImage
            className="net-img"
            src="/articles/internet/baz-istasyonu.webp"
            ratio="1600 / 1977"
            alt="Gökyüzüne karşı yükselen kafes kule; üstünde dikdörtgen anten panelleri ve çanaklar var."
            caption="Mobil baz istasyonu. Telefonun “kablosuz” bağlantısı yalnızca buraya kadar kablosuz; kulenin arkasında yine fiber var."
            credit="Obsidian Soul · CC0"
          />
        </div>

        <div className="net-callout">
          <span className="net-callout-icon">☎️</span>
          <p><strong>DSL</strong> (Digital Subscriber Line), var olan bakır telefon hatlarını kullanarak internet
          taşır — telefon konuşması düşük frekansı, veri yüksek frekansı kullandığından ikisi aynı anda çalışabilir.</p>
        </div>
      </section>

      {/* ── 15. TAM YOLCULUK ── */}
      <section className="net-section reveal">
        <div className="net-kicker">15 — Hepsi Bir Arada</div>
        <h2 className="net-h2">Bir İsteğin Tam Yolculuğu</h2>
        <p className="net-p">Tüm parçaları birleştirelim. Bir bağlantıya tıkladığında olanların tam zinciri:</p>
        <div className="net-journey">
          {[
            ['🔎', 'DNS', 'Alan adı IP\'ye çevrilir'],
            ['🤝', 'TCP', 'Sunucuyla 3 adımlı el sıkışma'],
            ['🔒', 'TLS', 'Şifreli kanal kurulur (HTTPS)'],
            ['📤', 'HTTP GET', 'Tarayıcı sayfayı ister'],
            ['📦', 'Paketler', 'Veri parçalara bölünür'],
            ['🧭', 'Yönlendirme', 'Router\'lar paketi taşır'],
            ['🖥️', 'Sunucu', 'İsteği işler, yanıt üretir'],
            ['🎨', 'Render', 'Tarayıcı sayfayı çizer'],
          ].map(([e, t, d], i) => (
            <div key={i} className="net-jrow">
              <div className="net-jnum">{i + 1}</div>
              <div className="net-jemoji">{e}</div>
              <div className="net-jbody"><strong>{t}</strong><span>{d}</span></div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 16. QUIZ ── */}
      <section className="net-section reveal">
        <div className="net-kicker">16 — Bilgini Test Et</div>
        <h2 className="net-h2">Mini Quiz</h2>
        <div className="net-quiz">
          {!done ? (
            <>
              <div className="net-quiz-top">
                <span className="net-quiz-prog">Soru {quizQ + 1} / {quizQs.length}</span>
                <span className="net-quiz-score">Puan: {score}</span>
              </div>
              <h3 className="net-quiz-q">{quizQs[quizQ].text}</h3>
              <div className="net-quiz-opts">
                {quizQs[quizQ].opts.map((o, oi) => {
                  const sel = answered[quizQ];
                  const isAnswered = sel !== undefined;
                  const correct = quizQs[quizQ].a;
                  let cls = 'net-opt';
                  if (isAnswered) {
                    if (oi === correct) cls += ' correct';
                    else if (oi === sel) cls += ' wrong';
                    else cls += ' dim';
                  }
                  return (
                    <button key={oi} className={cls} onClick={() => answerQ(oi)} disabled={isAnswered}>
                      <span className="net-opt-letter">{String.fromCharCode(65 + oi)}</span>{o}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="net-quiz-result">
              <div className="net-quiz-emoji">{score >= 5 ? '🏆' : score >= 3 ? '🎉' : '📚'}</div>
              <h3 className="net-quiz-rtitle">{score} / {quizQs.length} doğru</h3>
              <p className="net-quiz-rdesc">{score >= 5 ? 'Ağ uzmanısın! Paketler senden kaçamaz.' : score >= 3 ? 'İyi iş! Temelleri sağlam kavradın.' : 'Fena değil — yukarı kaydırıp bir kez daha gözden geçir.'}</p>
              <button className="net-ctrl-btn net-ctrl-primary" style={{ background: '#38bdf8', borderColor: '#38bdf8' }} onClick={restartQuiz}>↺ Tekrar dene</button>
            </div>
          )}
        </div>
      </section>

      {/* ── Footer ── */}
      <ArticleBibliography items={refs} accent="#38bdf8" />

      <footer className="net-footer">
        <div className="net-footer-mark">BASEMENTS</div>
        <p>İnternet, ortak protokoller üzerinde anlaşmış milyarlarca cihazın oluşturduğu, kendi kendini yönlendiren devasa bir orkestradır. 🌐</p>
        <Link href="/discover" className="net-footer-link">← Diğer içerikleri keşfet</Link>
      </footer>

      <style>{`
        /* ArticleImage'ın slate varsayılanlarını makalenin gökyüzü mavisine bağla. */
        .net-img {
          --ai-caption: #cbd5e1;
          --ai-credit: #6f8ba3;
          --ai-border: rgba(56,189,248,0.22);
          --ai-fill: rgba(56,189,248,0.05);
          --ai-mark: rgba(56,189,248,0.28);
        }
        .net-img-pair { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; align-items: start; margin: 18px 0; }
        @media (max-width: 700px) { .net-img-pair { grid-template-columns: 1fr; } }
        .net-page {
          --c1:#38bdf8; --c2:#34d399; --c3:#a78bfa; --c4:#fbbf24; --c5:#fb7185;
          --bg:#070b16; --panel:rgba(255,255,255,0.03); --line:rgba(255,255,255,0.1);
          --ink:#dbe4f0; --muted:#8b9bb4;
          background: var(--bg);
          color: var(--ink);
          min-height: 100vh;
          font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
          line-height: 1.6;
          overflow-x: clip;
        }
        .net-page code, .net-page .net-code { font-family: "SF Mono", "Consolas", monospace; }

        /* Topbar */
        .net-topbar {
          position: sticky; top: 0; z-index: 40;
          background: rgba(7,11,22,0.92); backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--line);
          padding: 10px 16px; display: flex; align-items: center; gap: 10px;
        }
        .net-back { color: var(--ink); display: flex; padding: 6px; border-radius: 50%; transition: background .15s; }
        .net-back:hover { background: rgba(255,255,255,0.08); }
        .net-topbar-title { font-weight: 700; font-size: .92rem; color: var(--c1); }

        /* Hero */
        .net-hero {
          position: relative; text-align: center; padding: 56px 20px 44px;
          overflow: hidden;
          background: radial-gradient(ellipse at 50% -10%, rgba(56,189,248,0.14), transparent 60%);
        }
        .net-hero-grid {
          position: absolute; inset: 0; opacity: .4; pointer-events: none;
          background-image: linear-gradient(rgba(56,189,248,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.07) 1px, transparent 1px);
          background-size: 32px 32px;
          mask-image: radial-gradient(ellipse at 50% 0%, #000, transparent 70%);
          -webkit-mask-image: radial-gradient(ellipse at 50% 0%, #000, transparent 70%);
        }
        .net-hero-eyebrow { position: relative; font-size: .66rem; font-weight: 800; letter-spacing: .3em; color: var(--c2); margin-bottom: 14px; }
        .net-hero-title { position: relative; font-size: clamp(2rem, 7vw, 4rem); font-weight: 900; margin: 0 0 16px; letter-spacing: -.02em; line-height: 1.05; }
        .net-grad { background: linear-gradient(100deg, var(--c1), var(--c2), var(--c3)); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .net-hero-sub { position: relative; max-width: 600px; margin: 0 auto 28px; color: var(--muted); font-size: clamp(.9rem, 2vw, 1.02rem); }
        .net-flow { position: relative; max-width: 640px; margin: 0 auto 26px; }
        .net-flow-svg { width: 100%; height: auto; }
        .net-pkt { filter: drop-shadow(0 0 6px currentColor); }
        .net-hero-tags { position: relative; display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
        .net-tag { padding: 6px 13px; font-size: .76rem; font-weight: 600; color: var(--c1); background: rgba(56,189,248,0.08); border: 1px solid rgba(56,189,248,0.2); border-radius: 9999px; }

        /* Section */
        .net-section { max-width: 860px; margin: 0 auto; padding: 40px 16px; border-top: 1px solid rgba(255,255,255,0.05); }
        .net-kicker { font-size: .68rem; font-weight: 800; letter-spacing: .18em; color: var(--c2); margin-bottom: 8px; text-transform: uppercase; }
        .net-h2 { font-size: clamp(1.35rem, 4vw, 2rem); font-weight: 800; margin: 0 0 14px; letter-spacing: -.01em; }
        .net-h3 { font-size: 1.05rem; font-weight: 700; margin: 30px 0 14px; color: var(--c1); }
        .net-p { color: #b8c4d6; font-size: .98rem; margin: 0 0 18px; }
        .net-p strong, .net-callout strong, .net-mini strong { color: var(--ink); font-weight: 700; }
        .net-code { background: rgba(56,189,248,0.1); color: var(--c1); padding: 1px 7px; border-radius: 5px; font-size: .88em; }
        .net-hint { font-size: .85rem; color: var(--muted); margin-top: 16px; background: var(--panel); border: 1px dashed var(--line); border-radius: 10px; padding: 12px 14px; }

        /* reveal */
        .reveal { opacity: 0; transform: translateY(28px); transition: opacity .7s cubic-bezier(.2,.7,.2,1), transform .7s cubic-bezier(.2,.7,.2,1); }
        .reveal.visible { opacity: 1; transform: none; }

        /* Steps list */
        .net-steps-list { list-style: none; padding: 0; margin: 0 0 20px; display: flex; flex-direction: column; gap: 10px; }
        .net-step-li { display: flex; gap: 14px; align-items: flex-start; background: var(--panel); border: 1px solid var(--line); border-radius: 12px; padding: 14px 16px; }
        .net-step-num { flex-shrink: 0; width: 28px; height: 28px; border-radius: 8px; display: grid; place-items: center; font-weight: 800; font-size: .85rem; background: rgba(56,189,248,0.15); color: var(--c1); }
        .net-step-h { display: block; font-size: .95rem; color: var(--ink); }
        .net-step-p { display: block; font-size: .86rem; color: var(--muted); margin-top: 2px; }

        /* Callout */
        .net-callout { display: flex; gap: 12px; background: linear-gradient(90deg, rgba(56,189,248,0.08), transparent); border: 1px solid rgba(56,189,248,0.2); border-left: 3px solid var(--c1); border-radius: 12px; padding: 14px 16px; margin: 18px 0; }
        .net-callout-icon { font-size: 1.4rem; flex-shrink: 0; }
        .net-callout p { margin: 0; font-size: .9rem; color: #b8c4d6; }

        /* Diagram wrapper */
        .net-diagram { background: var(--panel); border: 1px solid var(--line); border-radius: 14px; padding: 16px; margin: 16px 0; }
        .net-svg { width: 100%; height: auto; display: block; }

        /* OSI */
        .net-osi { display: flex; flex-direction: column; gap: 6px; margin: 18px 0; }
        .net-osi-row { border: 1px solid var(--line); border-radius: 10px; overflow: hidden; background: var(--panel); border-left: 3px solid var(--lc); transition: background .2s; }
        .net-osi-row.open { background: color-mix(in srgb, var(--lc) 9%, transparent); }
        .net-osi-head { width: 100%; display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: none; border: none; color: var(--ink); cursor: pointer; text-align: left; font-size: .92rem; }
        .net-osi-num { width: 24px; height: 24px; border-radius: 6px; display: grid; place-items: center; font-weight: 800; font-size: .8rem; background: var(--lc); color: #07111f; flex-shrink: 0; }
        .net-osi-ico { font-size: 1.1rem; }
        .net-osi-name { font-weight: 700; flex: 1; display: flex; flex-direction: column; }
        .net-osi-en { font-size: .68rem; color: var(--muted); font-weight: 500; }
        .net-osi-pdu { font-size: .72rem; color: var(--lc); font-weight: 700; background: color-mix(in srgb, var(--lc) 14%, transparent); padding: 3px 9px; border-radius: 9999px; }
        .net-osi-chev { font-size: 1.2rem; color: var(--muted); width: 18px; text-align: center; }
        .net-osi-body { padding: 0 16px 14px 50px; }
        .net-osi-body p { margin: 0 0 8px; font-size: .88rem; color: #b8c4d6; }
        .net-osi-proto { font-size: .8rem; color: var(--lc); font-family: monospace; }
        .net-osi-proto span { color: var(--muted); font-family: system-ui; }

        /* OSI <-> TCP map */
        .net-map { display: flex; gap: 12px; margin: 18px 0; }
        .net-map-col { flex: 1; display: flex; flex-direction: column; gap: 4px; }
        .net-map-h { text-align: center; font-weight: 800; font-size: .8rem; padding: 8px; border-radius: 8px; letter-spacing: .05em; }
        .net-map-h-osi { background: rgba(255,255,255,0.05); color: var(--ink); }
        .net-map-h-tcp { background: rgba(56,189,248,0.12); color: var(--c1); }
        .net-map-cell { background: var(--panel); border: 1px solid var(--line); border-left: 3px solid; border-radius: 7px; padding: 9px 12px; font-size: .82rem; flex: 1; display: flex; align-items: center; }
        .net-map-tcp { border: 1px solid; border-radius: 7px; padding: 8px 12px; font-size: .85rem; font-weight: 700; display: flex; flex-direction: column; justify-content: center; }
        .net-map-tcp small { font-weight: 500; color: var(--muted); font-size: .68rem; margin-top: 2px; }

        /* Stepper */
        .net-stepper { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; align-items: stretch; background: var(--panel); border: 1px solid var(--line); border-radius: 14px; padding: 16px; margin: 16px 0; }
        .net-stepper-viz { display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.25); border-radius: 10px; padding: 10px; min-height: 180px; }
        .net-stepper-panel { display: flex; flex-direction: column; }
        .net-dots { display: flex; gap: 7px; margin-bottom: 12px; }
        .net-dot { width: 11px; height: 11px; border-radius: 50%; border: 1.5px solid var(--muted); background: transparent; cursor: pointer; padding: 0; transition: all .2s; }
        .net-dot.on { transform: scale(1.25); }
        .net-step-meta { font-size: .68rem; font-weight: 800; letter-spacing: .12em; margin-bottom: 6px; }
        .net-step-title { font-size: 1.05rem; font-weight: 800; margin: 0 0 8px; }
        .net-step-desc { font-size: .88rem; color: #b8c4d6; margin: 0 0 16px; flex: 1; }
        .net-stepper-ctrl { display: flex; gap: 8px; }
        .net-ctrl-btn { flex: 1; padding: 9px 14px; border-radius: 9px; border: 1px solid var(--line); background: rgba(255,255,255,0.04); color: var(--ink); font-weight: 700; font-size: .85rem; cursor: pointer; transition: opacity .2s, transform .1s; }
        .net-ctrl-btn:disabled { opacity: .35; cursor: not-allowed; }
        .net-ctrl-btn:not(:disabled):active { transform: scale(.96); }
        .net-ctrl-primary { color: #07111f; }

        /* grid2 / mini */
        .net-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0; }
        .net-mini { background: var(--panel); border: 1px solid var(--line); border-radius: 12px; padding: 14px 16px; }
        .net-mini h4 { margin: 0 0 8px; font-size: .92rem; color: var(--c1); }
        .net-mini p { margin: 0; font-size: .85rem; color: #b8c4d6; }
        .net-mini .net-code { display: inline-block; margin-top: 4px; font-size: .76rem; }

        /* compare */
        .net-cmp { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0; }
        .net-cmp-3 { grid-template-columns: repeat(3, 1fr); }
        .net-cmp-col { background: var(--panel); border: 1px solid var(--line); border-radius: 12px; padding: 14px; }
        .net-cmp-h { font-weight: 800; font-size: .95rem; margin-bottom: 10px; }
        .net-cmp-col ul { margin: 0; padding-left: 16px; }
        .net-cmp-col li { font-size: .82rem; color: #b8c4d6; margin-bottom: 5px; }

        /* table */
        .net-table-wrap { overflow-x: auto; margin: 16px 0; border: 1px solid var(--line); border-radius: 12px; }
        .net-table { width: 100%; border-collapse: collapse; font-size: .86rem; min-width: 460px; }
        .net-table th { background: rgba(255,255,255,0.04); text-align: left; padding: 11px 14px; font-size: .76rem; letter-spacing: .04em; color: var(--muted); text-transform: uppercase; font-weight: 700; }
        .net-table td { padding: 11px 14px; border-top: 1px solid var(--line); color: #b8c4d6; }
        .net-proto-name { color: var(--c1); }
        .net-pill { display: inline-block; padding: 2px 9px; border-radius: 9999px; font-size: .74rem; font-weight: 700; }
        .net-pill.tcp { background: rgba(52,211,153,0.14); color: var(--c2); }
        .net-pill.udp { background: rgba(251,191,36,0.14); color: var(--c4); }

        /* req/res */
        .net-reqres { display: flex; align-items: center; gap: 12px; margin: 16px 0; }
        .net-rr-box { flex: 1; background: rgba(0,0,0,0.3); border: 1px solid var(--line); border-radius: 12px; padding: 14px; }
        .net-rr-req { border-color: rgba(52,211,153,0.3); }
        .net-rr-res { border-color: rgba(56,189,248,0.3); }
        .net-rr-h { font-size: .68rem; font-weight: 800; letter-spacing: .15em; color: var(--muted); margin-bottom: 10px; }
        .net-rr-line { display: block; font-size: .8rem; color: #cdd8e8; margin-bottom: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .net-rr-arrow { color: var(--c1); font-size: 1.5rem; font-weight: 800; flex-shrink: 0; }

        /* chips */
        .net-chips { display: flex; flex-direction: column; gap: 8px; }
        .net-chip { display: flex; align-items: baseline; gap: 12px; background: var(--panel); border: 1px solid; border-radius: 10px; padding: 10px 14px; }
        .net-chip-m { font-family: monospace; font-weight: 800; font-size: .92rem; min-width: 64px; }
        .net-chip-d { font-size: .85rem; color: #b8c4d6; }

        /* status */
        .net-status { display: flex; flex-direction: column; gap: 8px; }
        .net-status-row { display: flex; align-items: center; gap: 12px; background: var(--panel); border: 1px solid var(--line); border-radius: 10px; padding: 10px 14px; flex-wrap: wrap; }
        .net-status-code { font-family: monospace; font-weight: 800; padding: 3px 10px; border-radius: 7px; border: 1px solid; font-size: .85rem; }
        .net-status-name { font-size: .9rem; min-width: 110px; }
        .net-status-d { font-size: .82rem; color: var(--muted); flex: 1; }

        /* connection cards */
        .net-conn { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; margin: 16px 0; }
        .net-conn-card { background: var(--panel); border: 1px solid var(--line); border-radius: 12px; padding: 14px; text-align: center; transition: border-color .2s, transform .2s; }
        .net-conn-card:hover { border-color: rgba(56,189,248,0.4); transform: translateY(-2px); }
        .net-conn-ico { font-size: 1.8rem; margin-bottom: 6px; }
        .net-conn-name { margin: 0 0 4px; font-size: .95rem; color: var(--c1); }
        .net-conn-speed { font-size: .74rem; font-weight: 700; color: var(--c2); margin-bottom: 8px; font-family: monospace; }
        .net-conn-d { margin: 0; font-size: .8rem; color: var(--muted); }

        /* journey */
        .net-journey { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 16px 0; }
        .net-jrow { display: flex; align-items: center; gap: 12px; background: var(--panel); border: 1px solid var(--line); border-radius: 12px; padding: 12px 14px; position: relative; }
        .net-jnum { position: absolute; top: 6px; right: 10px; font-size: .7rem; font-weight: 800; color: var(--muted); }
        .net-jemoji { font-size: 1.5rem; }
        .net-jbody { display: flex; flex-direction: column; }
        .net-jbody strong { font-size: .9rem; color: var(--c1); }
        .net-jbody span { font-size: .8rem; color: var(--muted); }

        /* quiz */
        .net-quiz { background: var(--panel); border: 1px solid var(--line); border-radius: 16px; padding: 20px; }
        .net-quiz-top { display: flex; justify-content: space-between; font-size: .78rem; font-weight: 700; color: var(--muted); margin-bottom: 12px; }
        .net-quiz-score { color: var(--c2); }
        .net-quiz-q { font-size: 1.08rem; font-weight: 700; margin: 0 0 16px; }
        .net-quiz-opts { display: flex; flex-direction: column; gap: 8px; }
        .net-opt { display: flex; align-items: center; gap: 12px; text-align: left; padding: 13px 15px; border-radius: 11px; border: 1px solid var(--line); background: rgba(255,255,255,0.03); color: var(--ink); font-size: .9rem; cursor: pointer; transition: all .18s; }
        .net-opt:not(:disabled):hover { border-color: var(--c1); background: rgba(56,189,248,0.07); }
        .net-opt-letter { width: 24px; height: 24px; border-radius: 6px; display: grid; place-items: center; font-weight: 800; font-size: .78rem; background: rgba(255,255,255,0.06); color: var(--muted); flex-shrink: 0; }
        .net-opt.correct { border-color: var(--c2); background: rgba(52,211,153,0.12); }
        .net-opt.correct .net-opt-letter { background: var(--c2); color: #07111f; }
        .net-opt.wrong { border-color: var(--c5); background: rgba(251,113,133,0.12); }
        .net-opt.wrong .net-opt-letter { background: var(--c5); color: #07111f; }
        .net-opt.dim { opacity: .5; }
        .net-opt:disabled { cursor: default; }
        .net-quiz-result { text-align: center; padding: 12px; }
        .net-quiz-emoji { font-size: 3rem; margin-bottom: 8px; }
        .net-quiz-rtitle { font-size: 1.4rem; font-weight: 800; margin: 0 0 6px; }
        .net-quiz-rdesc { color: var(--muted); font-size: .9rem; margin: 0 0 18px; }

        /* footer */
        .net-footer { max-width: 700px; margin: 0 auto; text-align: center; padding: 48px 20px 60px; border-top: 1px solid var(--line); }
        .net-footer-mark { font-family: monospace; font-weight: 800; letter-spacing: .3em; color: var(--c1); font-size: .85rem; margin-bottom: 14px; }
        .net-footer p { color: var(--muted); font-size: .9rem; max-width: 460px; margin: 0 auto 18px; }
        .net-footer-link { color: var(--c1); text-decoration: none; font-weight: 700; font-size: .9rem; }
        .net-footer-link:hover { text-decoration: underline; }

        /* Responsive */
        @media (max-width: 680px) {
          .net-section { padding: 32px 14px; }
          .net-stepper { grid-template-columns: 1fr; }
          .net-stepper-viz { min-height: 150px; }
          .net-grid2, .net-cmp, .net-journey { grid-template-columns: 1fr; }
          .net-cmp-3 { grid-template-columns: 1fr; }
          .net-map { flex-direction: column; }
          .net-reqres { flex-direction: column; }
          .net-rr-arrow { transform: rotate(90deg); }
          .net-status-row { flex-direction: column; align-items: flex-start; gap: 4px; }
          .net-status-name { min-width: 0; }
        }
      `}</style>
    </main>
  );
}
