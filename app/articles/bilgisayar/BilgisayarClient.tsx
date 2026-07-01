'use client';

import { type ReactNode } from 'react';
import {
  ArticleShell, ArticleHero, ArticleLede, ArticleSection, CardGrid, HorizontalTimeline, ArticleQuiz, ArticleBibliography, ArticleFooter,
} from '@/app/components/article/ArticleBlocks';
import {
  BinaryPlayground, CommandCycle, Compare, CPU_GPU, SSD_HDD, RgbMixer,
  ddrGens, motherboardParts, otherParts, journey, gameFlow, quizQs, refs,
} from './widgets';

const ACCENT = '#22d3ee';
const HERO_COLORS: [[number, number, number], [number, number, number], [number, number, number], [number, number, number]] = [
  [0.02, 0.04, 0.09], [0.05, 0.13, 0.30], [0.13, 0.6, 0.74], [0.5, 0.34, 0.86],
];

function Analogy({ children }: { children: ReactNode }) {
  return <div className="mt-5 flex gap-3 rounded-xl border-l-4 border-cyan-400/60 bg-cyan-400/[0.06] px-5 py-4 text-slate-200"><span>💡</span><p className="m-0 leading-relaxed">{children}</p></div>;
}

export default function BilgisayarClient() {
  return (
    <ArticleShell accent={ACCENT} title="Bilgisayar Nasıl Çalışır?">
      <ArticleHero
        title="Bilgisayar"
        fullTitle="Bilgisayar Nasıl Çalışır? Parçaların Tam Rehberi"
        eyebrow="PARÇALARIN TAM REHBERİ · İNTERAKTİF DOSYA"
        subtitle={<>Ekranda gördüğün her şey, milyarlarca minik elektrik anahtarının <strong className="font-semibold text-cyan-300">(1 ve 0)</strong> inanılmaz bir hızda <em className="not-italic text-violet-300">işbirliği yapmasından</em> ibarettir. Aşağı kaydır, parça parça çözelim.</>}
        colors={HERO_COLORS}
      />

      <ArticleLede points={[
        'CPU düşünür · GPU paralel çizer · RAM hızlı geçici hafıza · SSD/HDD kalıcı depo',
        'Anakart hepsini bağlar · PSU besler · sistem kristali ritmi tutar',
        'Mikrofon sesi elektriğe, hoparlör elektriği sese çevirir — biri diğerinin tersi',
      ]}>
        Bir bilgisayar, temelde milyarlarca minik elektrik anahtarının (“açık/kapalı”, yani 1 ve 0) çok hızlı işbirliği yapmasından ibarettir. Bu basit fikir katman katman üst üste yığılınca CPU, GPU, RAM, depolama ve ekran gibi parçalar ortaya çıkar ve birlikte akıllı, etkileşimli bir makine oluştururlar.
      </ArticleLede>

      <ArticleSection center>
        <p className="text-2xl font-medium leading-relaxed text-slate-200 sm:text-3xl">
          Ekranda gördüğün her şey, duyduğun her ses, bastığın her tuş — hepsi <span className="text-cyan-300">bu basit fikrin</span> katman katman üst üste yığılmasıyla ortaya çıkar.
        </p>
      </ArticleSection>

      {/* İnteraktif: bit oyun alanı */}
      <ArticleSection kicker="İNTERAKTİF · DENE" title="Önce temel: 1'ler ve 0'lar nasıl anlam kazanır?">
        <p className="mb-6 text-slate-400">Anahtarlara tıkla; sekiz “açık/kapalı” bir sayıya, sayı da bir harfe dönüşsün.</p>
        <BinaryPlayground />
      </ArticleSection>

      {/* 1. CPU */}
      <ArticleSection title="1. CPU (İşlemci) — Bilgisayarın beyni" max="max-w-4xl">
        <p className="mb-4 leading-relaxed text-slate-300">
          CPU, bilgisayarın düşünen kısmıdır; tüm hesaplamalar, kararlar ve komutlar burada işlenir. Temelinde <strong className="text-cyan-300">transistör</strong> denen minik anahtarlar vardır: akımı ya geçirir (1) ya geçirmez (0). Tek başına aptalca, ama modern bir işlemcide <strong className="text-cyan-300">milyarlarcası</strong> doğru birleştirilince toplama, karşılaştırma gibi mantık işlemleri ortaya çıkar.
        </p>
        <p className="mb-6 leading-relaxed text-slate-300">
          İşlemci her saniye milyarlarca kez <strong className="text-cyan-300">komut döngüsünü</strong> tekrarlar. Aşağıda kendin adımla:
        </p>
        <CommandCycle />
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[['⏱️', 'Saat hızı (GHz)', '3 GHz ≈ saniyede 3 milyar adım. Ritmi sistem kristali verir.'], ['🧩', 'Çekirdek (core)', 'Modern işlemciler çok çekirdekli (4/8/16...); her çekirdek bağımsız bir mini işlemci gibi paralel çalışır.'], ['⚡', 'Önbellek (cache)', "İşlemcinin yanında, RAM'den bile hızlı L1/L2/L3 katmanları; en sık veriyi tutar."]].map(([i, t, d]) => (
            <div key={t} className="rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur"><div className="mb-1 text-2xl">{i}</div><h4 className="font-bold text-white">{t}</h4><p className="text-sm leading-relaxed text-slate-400">{d}</p></div>
          ))}
        </div>
        <Analogy>CPU, çok zeki ama az sayıda çalışanı olan bir ofis gibidir — her çalışan karmaşık problemleri çözebilir, ama hepsi sıraya girerek çalışır.</Analogy>
      </ArticleSection>

      {/* 2. GPU */}
      <ArticleSection title="2. GPU (Ekran kartı) — Paralel işlem canavarı" max="max-w-4xl">
        <p className="mb-4 leading-relaxed text-slate-300">
          En önemli fark şu: CPU'da <strong className="text-cyan-300">az sayıda çok güçlü</strong> çekirdek varken, GPU'da <strong className="text-violet-300">binlerce basit</strong> çekirdek vardır. Ekranda milyonlarca piksel var ve her birinin rengini hesaplamak birbirinden bağımsız, aynı türde bir iş — bu yüzden binlerce çekirdek hepsini aynı anda hesaplar. Buna <strong className="text-violet-300">paralel işleme</strong> denir.
        </p>
        <p className="mb-6 leading-relaxed text-slate-300">
          Yapay zekânın temelinde de devasa matris çarpımları yatar; bu tam olarak GPU'nun en iyi yaptığı iştir. ChatGPT gibi modellerin eğitildiği makineler binlerce GPU içerir.
        </p>
        <Compare items={CPU_GPU} />
        <Analogy>CPU birkaç dâhi profesörse, GPU binlerce öğrencinin aynı anda kolay çarpım yapmasıdır. Tek karmaşık problem için profesör, milyonlarca basit işlem için ordu lazımdır.</Analogy>
      </ArticleSection>

      {/* 3. Sistem kristali */}
      <ArticleSection title="3. Sistem kristali — Bilgisayarın kalp atışı" max="max-w-4xl">
        <p className="mb-4 leading-relaxed text-slate-300">
          Anakart üzerindeki minik <strong className="text-cyan-300">kuvars kristali</strong>, tüm parçaları senkronize eden zamanlama sinyalini üretir. Üzerine elektrik uygulandığında son derece kararlı ve kesin bir frekansta titreşir (<strong className="text-cyan-300">piezoelektrik etki</strong> — eski kol saatlerinin de prensibi).
        </p>
        <p className="leading-relaxed text-slate-300">
          Bu titreşim bir <strong className="text-cyan-300">metronom</strong> gibidir: her “tık”ta bir işlem adımı gerçekleşir, böylece tüm parçalar aynı tempoda çalışır. Kristalin temel frekansı düşüktür; anakarttaki <strong className="text-cyan-300">PLL</strong> devreleri onu çarparak işlemcinin GHz'lik hızlarını elde eder.
        </p>
      </ArticleSection>

      {/* 4. PSU */}
      <ArticleSection title="4. PSU (Güç kaynağı) — Elektriği evcilleştiren parça" max="max-w-4xl">
        <p className="mb-4 leading-relaxed text-slate-300">
          Prizden <strong className="text-amber-300">220V alternatif akım (AC)</strong> gelir — yönü saniyede defalarca değişir. Ama bilgisayar parçaları düşük voltajlı, sabit yönlü <strong className="text-cyan-300">doğru akıma (DC)</strong> ihtiyaç duyar. PSU bunu üç adımda yapar: voltajı düşürür (transformatör), AC'yi DC'ye çevirir (doğrultma), voltajı kararlı tutar (regülasyon).
        </p>
        <p className="leading-relaxed text-slate-300">Farklı parçalar farklı voltaj ister: anakart ve işlemci genellikle <strong className="text-cyan-300">12V, 5V ve 3.3V</strong> raylarını birlikte kullanır. Sistemin kararlılığı doğrudan iyi bir güç kaynağına bağlıdır.</p>
      </ArticleSection>

      {/* 5. RAM */}
      <ArticleSection title="5. RAM — Geçici ama çok hızlı hafıza" max="max-w-4xl">
        <p className="mb-4 leading-relaxed text-slate-300">
          RAM, bilgisayarın <em className="not-italic text-cyan-300">o anda</em> çalıştığı verileri ve açık programları tutar. DRAM'de her bit, <strong className="text-cyan-300">bir kapasitör + bir transistörden</strong> oluşur: kapasitör doluysa “1”, boşsa “0”. Ama kapasitörler yükü sızdırır; bu yüzden RAM veriyi kaybetmemek için saniyede binlerce kez kendini <strong className="text-cyan-300">tazeler (refresh)</strong> — “dinamik” adı buradan gelir.
        </p>
        <p className="leading-relaxed text-slate-300">
          RAM <strong className="text-amber-300">uçucudur (volatile)</strong>: elektrik kesilince her şey anında silinir. Kaydetmeden kapanırsan belgeni kaybedersin. Neden var? Diskler yavaş, işlemci hızlıdır; RAM ikisi arasındaki hızlı tampondur. “Random Access”: herhangi bir adrese, sırayla aramadan, doğrudan ve eşit hızda erişilir.
        </p>
      </ArticleSection>

      {/* 6. DDR */}
      <ArticleSection title="6. DDR nedir?" max="max-w-4xl">
        <p className="mb-6 leading-relaxed text-slate-300">
          <strong className="text-cyan-300">DDR (Double Data Rate)</strong>, modern RAM standardıdır. Eski bellekler veriyi yalnızca saat dalgasının <strong>yükselen</strong> kenarında aktarırdı; DDR ise hem yükselen hem <strong>alçalan</strong> kenarda aktarır — yani her tıkta iki kat veri. Nesiller birbiriyle <strong className="text-amber-300">uyumlu değildir</strong> (çentikleri bile farklı yerde — yanlış takmayı önleyen kasıtlı tasarım).
        </p>
        <CardGrid items={ddrGens} cols={3} />
      </ArticleSection>

      {/* 7. SSD vs HDD */}
      <ArticleSection title="7. SSD ile HDD farkları" max="max-w-4xl">
        <p className="mb-6 leading-relaxed text-slate-300">
          İkisi de veriyi <strong className="text-cyan-300">kalıcı</strong> saklar (elektrik kesilse de durur), ama çalışma şekilleri tamamen farklıdır. Sekmeleri karşılaştır:
        </p>
        <Compare items={SSD_HDD} />
        <p className="mt-6 leading-relaxed text-slate-300">Pratikte: işletim sistemini SSD'ye kurarsan bilgisayar saniyeler içinde açılır; HDD'de bu dakikaları bulabilir. Bu yüzden çoğu sistemde <strong className="text-cyan-300">SSD (işletim sistemi)</strong> + <strong className="text-amber-300">HDD (büyük depo)</strong> birlikte kullanılır.</p>
      </ArticleSection>

      {/* 8. Anakart */}
      <ArticleSection title="8. Anakart — Her şeyi birleştiren omurga" max="max-w-4xl">
        <p className="mb-6 leading-relaxed text-slate-300">Anakart, bütün parçaların üzerine takıldığı ve birbiriyle konuştuğu ana devre kartıdır. Tek başına “iş yapmaz” ama herkesi bir araya getirir.</p>
        <CardGrid items={motherboardParts} cols={3} />
        <Analogy>Anakart bir şehrin yol ve altyapı ağıdır; CPU, GPU ve RAM ise o şehirdeki binalar. Binalar ne kadar güçlü olursa olsun, onları bağlayan yollar olmadan hiçbir şey çalışmaz.</Analogy>
      </ArticleSection>

      {/* 9. LCD + RGB */}
      <ArticleSection title="9. LCD ekran — Işıkla renk yaratma" max="max-w-4xl">
        <p className="mb-4 leading-relaxed text-slate-300">
          LCD'nin sırrı: sıvı kristaller ışık <strong className="text-cyan-300">üretmez, kontrol eder</strong> — minik panjurlar gibi. Katmanlar: arka ışık (LED beyaz ışık) → sıvı kristal (elektriğe göre ışığı geçirir/engeller) → polarizör süzgeçler → renk filtreleri. Her pikselde üç <strong className="text-cyan-300">alt piksel</strong> vardır: kırmızı, yeşil, mavi (RGB). Her pikseli kontrol eden minik transistörlere <strong className="text-cyan-300">TFT</strong> denir.
        </p>
        <p className="mb-6 leading-relaxed text-slate-300">Alt piksellerin parlaklığını ayrı ayrı ayarlayarak milyonlarca renk çıkar. Kendin dene:</p>
        <RgbMixer />
      </ArticleSection>

      {/* 10. Mikrofon */}
      <ArticleSection title="10. Mikrofon — Sesi elektriğe çevirmek" max="max-w-4xl">
        <p className="mb-4 leading-relaxed text-slate-300">
          Ses, havanın basınç titreşimlerinden ibarettir. Mikrofonun içindeki ince <strong className="text-cyan-300">diyafram (zar)</strong> ses dalgalarıyla titreşir; iş bu titreşimi elektriğe çevirmektir:
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur"><h4 className="mb-1 font-bold text-cyan-300">Dinamik mikrofon</h4><p className="text-sm leading-relaxed text-slate-300">Zara bağlı bobin, mıknatısın alanında hareket edip akım <strong>üretir</strong> (elektromanyetik indüksiyon). Ses → titreşim → akım. İlginç: bu, hoparlörün <em className="not-italic text-amber-300">tam tersi</em> çalışması.</p></div>
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur"><h4 className="mb-1 font-bold text-cyan-300">Kondansatör mikrofon</h4><p className="text-sm leading-relaxed text-slate-300">Zar + sabit plaka bir kapasitör oluşturur; zar titreşince mesafe (ve kapasite) değişir, sinyal üretir. Daha hassastır ama elektrik gerektirir (telefon/stüdyo).</p></div>
        </div>
      </ArticleSection>

      {/* 11. Hoparlör */}
      <ArticleSection title="11. Hoparlör — Elektriği sese çevirmek" max="max-w-4xl">
        <p className="mb-4 leading-relaxed text-slate-300">
          Hoparlör mikrofonun tersini yapar. İçinde sabit mıknatıs, bir bobin ve bobine bağlı koni vardır: ses sinyali (değişen akım) bobinden geçince bobin geçici bir <strong className="text-cyan-300">elektromıknatısa</strong> dönüşür, sabit mıknatısla itişip çekişir, ileri-geri hareket eder; koni de havayı iterek <strong className="text-cyan-300">ses dalgaları</strong> oluşturur.
        </p>
        <Analogy>Elektrik → manyetik kuvvet → mekanik hareket → hava titreşimi → ses. Mikrofon ve hoparlör aynı fizik prensibinin iki yöne çalıştırılmış hâlidir — bir hoparlörü mikrofon gibi bile kullanabilirsin.</Analogy>
      </ArticleSection>

      {/* 12. Klavye → ekran yolculuğu (yatay timeline) */}
      <HorizontalTimeline kicker="KLAVYEDEN EKRANA · YOLCULUK" heading="“A” tuşuna basınca ne olur?" items={journey} />

      {/* 13. Diğer parçalar */}
      <ArticleSection title="13. Diğer önemli parçalar" max="max-w-4xl">
        <CardGrid items={otherParts} cols={3} />
      </ArticleSection>

      {/* 14. Hepsi bir arada */}
      <ArticleSection title="14. Hepsi bir arada: bir oyun açtığında" max="max-w-3xl">
        <p className="mb-6 text-slate-400">Parçaları birleştirelim — bir oyun açtığında saniyede onlarca kez tekrar eden zincir:</p>
        <ol className="space-y-3">
          {gameFlow.map((s, i) => (
            <li key={i} className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-cyan-400/15 font-mono text-sm font-bold text-cyan-300">{i + 1}</span>
              <span className="text-sm leading-relaxed text-slate-300">{s}</span>
            </li>
          ))}
        </ol>
      </ArticleSection>

      {/* Quiz */}
      <ArticleSection kicker="MİNİ TEST" title="Ne kadar anladın?">
        <ArticleQuiz questions={quizQs} />
      </ArticleSection>

      {/* Özet */}
      <ArticleSection center title="Kısa özet">
        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-300">
          Anahtar zincir şudur: <span className="text-cyan-300">elektrik → anahtarlar (1/0) → mantık → hesaplama → anlamlı çıktı.</span>
          CPU düşünür, GPU paralel çizer, RAM hızlı geçici hafıza tutar, SSD/HDD kalıcı saklar, anakart herkesi bağlar, güç kaynağı besler, sistem kristali ritmi tutar.
          Milyarlarca “aptal” anahtarın kusursuz uyumu, elindeki bu olağanüstü makineyi oluşturur.
        </p>
      </ArticleSection>

      <div className="relative z-10">
        <ArticleBibliography items={refs} accent={ACCENT} />
      </div>

      <ArticleFooter tagline="Elektrik → 1 ve 0 → mantık → koca bir dünya. Basit fiziğin katman katman büyüsü. 💻" />
    </ArticleShell>
  );
}
