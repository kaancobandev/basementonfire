'use client';

import { type ReactNode } from 'react';
import Link from 'next/link';
import {
  ArticleShell, ArticleHero, ArticleLede, ArticleSection, CardGrid, HorizontalTimeline, ArticleQuiz, ArticleBibliography, ArticleFooter,
} from '@/app/components/article/ArticleBlocks';
import { FiveMotors, MovementExplorer, timeline, quizQs, refs } from './widgets';

const ACCENT = '#e11d48';
const HERO_COLORS: [[number, number, number], [number, number, number], [number, number, number], [number, number, number]] = [
  [0.05, 0.02, 0.06], [0.22, 0.05, 0.14], [0.75, 0.11, 0.28], [0.85, 0.55, 0.18],
];

function Story({ icon = '🎭', title, children }: { icon?: string; title: string; children: ReactNode }) {
  return (
    <div className="mt-5 rounded-xl border border-rose-400/25 bg-rose-500/[0.06] px-5 py-4">
      <div className="mb-1 flex items-center gap-2 text-sm font-bold text-rose-200"><span>{icon}</span><span>{title}</span></div>
      <p className="m-0 text-sm leading-relaxed text-slate-300">{children}</p>
    </div>
  );
}

const surprises = [
  { icon: '🖼️', title: 'İzlenimcilik bir hakaretti', text: "“İzlenimci” adı, eleştirmen Louis Leroy’un Monet’nin İzlenim, Gün Doğumu tablosuyla alay etmesinden geldi. Grup, alay adını gururla sahiplendi." },
  { icon: '🚽', title: 'Bir pisuar soruyu değiştirdi', text: "Duchamp 1917’de pisuarı Çeşme adıyla sergiye gönderdi. Artık soru “bu iyi mi?” değil, “bu neden sanat, kim karar veriyor?”du." },
  { icon: '⬛', title: 'Siyah Kare bir ikonaydı', text: "Maleviç, Siyah Kare’yi Rus evlerinde ikonanın asıldığı kutsal köşeye astı. Şaka değil: yeni, nesnesiz bir ikona iddiasıydı." },
  { icon: '🇬🇧', title: 'Pop’u önce İngilizler yaptı', text: "Andy Warhol’dan yıllar önce, Londra’daki Independent Group “pop art” terimini kullandı; Hamilton’ın 1956 kolajı Amerikan bolluğuna dışarıdan hasretle bakar." },
  { icon: '✈️', title: 'Merkezi göç taşıdı', text: "Sanatın Paris’ten New York’a geçişi estetik bir zafer değil, totaliter rejimlerden kaçan sanatçıların göç dalgasıydı: Avrupa’nın kaybı, Amerika’nın kazancı." },
  { icon: '⏱️', title: 'Türkiye 400 yılı 80 yıla sığdırdı', text: "Avrupa’nın dört asırda kat ettiği yol, Türkiye’de yaklaşık 80 yılda alındı — akımlar burada grup ve kuşak olarak, hızlandırılmış işledi." },
];

export default function SanatClient() {
  return (
    <ArticleShell accent={ACCENT} title="Sanat Akımları">
      <ArticleHero
        title="Sanat Akımları"
        fullTitle="Sanat Akımları: Rönesans'tan Bugüne Kronolojik ve Coğrafi Harita"
        eyebrow="SANAT TARİHİ · İNTERAKTİF HARİTA"
        subtitle={<>Rönesans'tan yapay zekâya: hangi akım, nerede, kim tarafından, <em className="not-italic text-rose-300">neden</em>. Bir liste değil — <strong className="font-semibold text-white">aranabilir, filtrelenebilir bir harita</strong>.</>}
        colors={HERO_COLORS}
      />

      <ArticleLede points={[
        'Hiçbir akım "birileri farklı resim yapmak istedi" diye çıkmaz',
        'Beş motor: para (hamilik), teknoloji, siyasi kırılma, kurum reddi, paradigma kayması',
        'Merkez, para + matbaa + göçmenin toplandığı yerdir: Floransa → Paris → New York → ağ',
      ]}>
        Sanat akımları, birbirinden kopuk üsluplar değil; para, teknoloji, siyaset, kurum ve fikir değişimlerinin kesişiminde doğan yanıtlardır. Bu dosya 60'tan fazla akımı — Bizans'tan üretken yapay zekâya — “neden çıktı?” sorusuyla, aranıp filtrelenebilen bir harita olarak sunar.
      </ArticleLede>

      {/* Beş motor */}
      <ArticleSection kicker="NASIL OKUNMALI" title="Akımları doğuran beş motor" max="max-w-4xl">
        <p className="mb-6 leading-relaxed text-slate-300">Neredeyse her akım şu beş motordan en az ikisinin kesişiminde doğar. Aşağıda her akımı okurken kendine sor: <em className="not-italic text-rose-300">hangi motor çalıştı?</em> (Kartlara tıkla, örnek gör.)</p>
        <FiveMotors />
      </ArticleSection>

      {/* Kâşif — CENTERPIECE */}
      <ArticleSection kicker="İNTERAKTİF · KEŞFET" title="Akım Kâşifi" max="max-w-4xl">
        <p className="mb-6 leading-relaxed text-slate-300">İşte tüm harita — 60'tan fazla akım. <strong className="text-rose-300">Ara</strong> (sanatçı, sebep, şehir), <strong className="text-rose-300">döneme</strong> ya da <strong className="text-rose-300">bölgeye</strong> göre süz, bir akıma tıklayıp “neden çıktığını” gör. Okumak yerine keşfet:</p>
        <MovementExplorer />
      </ArticleSection>

      {/* Büyük yay — kısa anlatı */}
      <ArticleSection title="Kısa büyük yay: 600 yıl, altı kırılma" max="max-w-3xl">
        <p className="mb-4 leading-relaxed text-slate-300">
          <strong className="text-rose-300">Rönesans</strong>, antikiteyi yeniden keşfetti: Floransa <Link href="/articles/rome" className="article-ilink">antik Roma'yı</Link>, sonra Neoklasizm doğrudan <Link href="/articles/greece" className="article-ilink">antik Yunan'ı</Link> diriltti. <strong className="text-rose-300">Barok</strong>, Karşı-Reform'un görsel silahıydı; ama aynı yüzyılda Protestan Hollanda'da kilise müşteriyken çekilince <em className="not-italic text-white">açık sanat piyasası</em> doğdu.
        </p>
        <p className="mb-4 leading-relaxed text-slate-300">
          <strong className="text-rose-300">19. yüzyılda fotoğraf</strong> (1839) “benzerlik üretme” işini makineye devretti; resim ne yapacağına yeniden karar vermek zorunda kaldı — Realizm ve İzlenimcilik bu krizin çocuklarıdır. <strong className="text-rose-300">1907–1917</strong> arası, temsilin dört yüzyıllık temeli terk edildi: Kübizm, soyutlama, hazır-nesne. Sonra iki dünya savaşı ve totaliter rejimler <strong className="text-rose-300">merkezi Paris'ten New York'a</strong> taşıdı.
        </p>
        <p className="leading-relaxed text-slate-300">
          1960'larda Pop yüksek/alçak ayrımını çökertti; 1968'den sonra sanat “nesne”den “fikre” kaydı (kavramsal, arazi, beden, feminist sanat). Bugün tek bir merkez yok: <strong className="text-rose-300">biyenal ağı, dekolonizasyon ve yapay zekâ</strong> Duchamp'ın sorusunu yineliyor — yazarlık kimde?
        </p>
        <Story icon="🎨" title="Fotoğraf resmi öldürmedi — özgürleştirdi">
          Fotoğraf gelince “resim bitti” dendi. Tam tersi oldu: benzerlik zorunluluğundan kurtulan resim, ışığı (İzlenimcilik), duyguyu (Ekspresyonizm), yapıyı (Kübizm) ve sonunda saf soyutu keşfetti. Bir teknoloji, bir sanatı yok etmez; ona “senin asıl işin ne?” diye sorar.
        </Story>
      </ArticleSection>

      {/* Şaşırtıcı hikâyeler */}
      <ArticleSection kicker="SIKILMA" title="Altı şaşırtıcı hikâye" max="max-w-4xl">
        <CardGrid items={surprises} cols={3} />
      </ArticleSection>

      {/* Batı-dışı + Türkiye */}
      <ArticleSection title="Harita Batı merkezli — ama tek harita değil" max="max-w-3xl">
        <p className="mb-4 leading-relaxed text-slate-300">
          “Akım” (manifestolu, adlandırılmış, kopuşçu grup) kavramı Batı modernliğinin bir icadıdır. Başka geleneklerde dönüşüm <strong className="text-rose-300">okul, atölye ve hanedan</strong> üzerinden yürür: Çin'de edebiyatçı resmi, Japonya'da <em className="not-italic text-white">ukiyo-e</em> (ki 1854'te açılınca Avrupa'yı sarstı), Osmanlı nakkaşhanesi, Fars ve Babür minyatürü, Nijerya'nın Ife-Benin bronzları.
        </p>
        <p className="leading-relaxed text-slate-300">
          <strong className="text-rose-300">Türkiye'de</strong> Batı'nın 400 yılı yaklaşık 80 yıla sığdı: asker ressamlardan (Osman Hamdi) 1914 Kuşağı'na, D Grubu'ndan soyut kuşağa ve İstanbul Bienali'yle (1987) küresel ağa. Kâşifte “Türkiye” ve “Batı-dışı” süzgeçlerini seç, bu paralel kronolojiyi gör.
        </p>
      </ArticleSection>

      {/* Zaman çizelgesi */}
      <HorizontalTimeline kicker="KRONOLOJİK ÖZET · 1400 → 2022" heading="Altı yüzyıl, tek bir çizgide" items={timeline} />

      {/* Quiz */}
      <ArticleSection kicker="MİNİ TEST" title="Ne kadar yakaladın?">
        <ArticleQuiz questions={quizQs} />
      </ArticleSection>

      {/* Özet */}
      <ArticleSection center title="Kısaca">
        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-300">
          Sanat tarihini ezberlenecek bir isim listesi olarak değil, <span className="text-rose-300">bir kuvvetler haritası</span> olarak oku: kim ödüyor, hangi teknoloji çıktı, hangi kurum reddetti, hangi fikir dünyayı yeniden tanımladı. Bunu bilirsen Bizans ikonasından yapay zekâ görüntüsüne kadar her kırılmayı aynı dille açıklayabilirsin. Akım değişir; motorlar aynı kalır.
        </p>
      </ArticleSection>

      <div className="relative z-10">
        <ArticleBibliography items={refs} accent={ACCENT} />
      </div>

      <ArticleFooter tagline="Kim ödüyor · hangi teknoloji · hangi ret · hangi fikir. Akım değişir, motorlar aynı. 🎨" />
    </ArticleShell>
  );
}
