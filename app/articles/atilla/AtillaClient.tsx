'use client';

import dynamic from 'next/dynamic';
import {
  ArticleShell, ArticleHero, ArticleLede, ArticleSection,
} from '@/app/components/article/ArticleBlocks';
import SourceCompare, { type CompareSource } from '@/app/components/article/SourceCompare';
import { ACCENT, BG, BONE, GARNET, GOLD, IRON, InView, MythNote, SourceNote, Stat, WidgetSkeleton, buyuk, tokenHex, tr } from './ui';
import { ReadingProgress, PerdeNav } from './chrome';
import {
  BozkirSeridi, KavimlerGocu, KaganlikSemasi, BarbarPanosu, IsimAgaci, KilicIfsa,
  HaracSayaci, SurKesiti, SayiDedektoru,
} from './widgets';
import { HonoriaKarar, ItalyaAnketi } from './decisions';
import { CatalaunumPoster } from './posters';
import {
  OTAG, GOC, KAGAN, BARBAR, ISIM, BLEDA, BLEDA_SOURCES, NUMBERS,
  SURLAR, HONORIA, AETIUS, CATALAUNUM, ITALYA, ITALYA_SOURCES,
} from './data';

// Tek ağır modül: CSS transition'lı SVG savaş animasyonu. InView + poster ile
// ekrana girene kadar indirilmiyor (bkz. [[article-interactive-heavy-pattern]]).
const CatalaunumSim = dynamic(() => import('./sim-catalaunum'), { ssr: false, loading: () => <WidgetSkeleton height={560} /> });

// Bozkır gecesi: yanık toprak siyahı → garnet → kor. Kanuni'nin kobalt gecesinden
// ve Fatih'in takıntı mavisinden BİLEREK uzak: bu bir saray makalesi değil.
const HERO_COLORS: [[number, number, number], [number, number, number], [number, number, number], [number, number, number]] = [
  [0.039, 0.027, 0.024], [0.176, 0.067, 0.078], [0.886, 0.384, 0.169], [0.851, 0.643, 0.255],
];

const PERDES = [
  { id: 'perde-0', label: 'Tahta kadeh' },
  { id: 'perde-1', label: 'Bozkırdan gelenler' },
  { id: 'perde-2', label: 'Kağan' },
  { id: 'perde-3', label: 'İsim' },
  { id: 'perde-4', label: 'İki kağan, bir taht' },
  { id: 'perde-5', label: 'Haraç ve surlar' },
  { id: 'perde-6', label: 'Yüzük' },
  { id: 'perde-7', label: 'Catalaunum' },
  { id: 'perde-8', label: 'İtalya ve Papa' },
];

const bledaSources: CompareSource[] = BLEDA_SOURCES.map((s) => ({
  name: s.name, role: s.role, text: s.text, color: tokenHex[s.color],
}));

const italyaSources: CompareSource[] = ITALYA_SOURCES.map((s) => ({
  name: s.name, role: s.role, text: s.text, color: tokenHex[s.color],
}));

export default function AtillaClient() {
  return (
    <ArticleShell accent={ACCENT} bg={BG} title="Atilla">
      <style>{`
        @keyframes atilla-fade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        html { scroll-behavior: smooth; }
        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior: auto; }
          [style*="atilla-fade"] { animation: none !important; }
        }
      `}</style>

      <ReadingProgress />
      <PerdeNav items={PERDES} />

      <ArticleHero
        title="Atilla"
        fullTitle="Atilla — Bozkırdan Gelen Kağan"
        eyebrow="449 · OTAĞ · TAHTA BİR KADEH"
        gradientText="Atilla"
        colors={HERO_COLORS}
        object3d="sword"
        subtitle={<>Bozkırdan geldi, öldü, geriye efsanesi kaldı. Ve Batı Roma&rsquo;yı &mdash; herkesin sandığının aksine &mdash; o yıkmadı.</>}
      />

      <ArticleLede
        points={[
          'Merkez soru: geriye hiçbir şey bırakmayan adam neden unutulmadı?',
          `${tr(NUMBERS.olum)}’te öldü, imparatorluk ${tr(NUMBERS.imparatorlukSonu)}’da bitti — ama adı bin yıl boyunca hanedanlar arasında paylaşılamadı`,
        ]}
      >
        Bu sayfada Atilla’yı bir korku hikâyesi olarak değil, bir <strong>devlet</strong> olarak okuyacaksın: nasıl kurulduğu,
        neyle işlediği ve neden sahibiyle birlikte durduğu. Kaynaklar çelişince hangisinin doğru olduğunu sana söylemeyeceğiz —
        ikisini yan yana koyup kararı sana bırakacağız. Kural: <strong>sıfat değil, sayı.</strong>
      </ArticleLede>

      {/* ══════════ PERDE 0 — Cold open: tahta kadeh ══════════ */}
      <div id="perde-0" className="scroll-mt-16">
        <ArticleSection kicker={`PERDE 0 · COLD OPEN · ${OTAG.year} · ${buyuk(OTAG.place)}`} title="Tahta kadeh">
          <p className="leading-relaxed text-slate-300">
            Doğu Roma’dan bir elçilik heyeti Tuna’nın kuzeyine geliyor. Heyetin kâtibi {OTAG.witness} — ve bugün
            Atilla hakkında elimizdeki <strong>tek görgü tanığı</strong> o. Akşam ziyafete çağrılıyorlar. Priskos gördüğü
            her şeyi yazıyor, çünkü işi bu.
          </p>

          <ul className="mt-5 space-y-2">
            {OTAG.scene.map((s, i) => (
              <li key={i} className="flex gap-3 leading-relaxed text-slate-300">
                <span className="mt-1 font-mono text-xs" style={{ color: ACCENT }}>{String(i + 1).padStart(2, '0')}</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>

          <p className="mt-5 leading-relaxed text-slate-300">{OTAG.dress}</p>

          <div className="my-7 grid grid-cols-3 gap-2.5">
            <Stat value={tr(NUMBERS.haracZirve)} label="libre altın · yıllık haraç" color={GOLD} />
            <Stat value="1" label="tahta kadeh" color={ACCENT} />
            <Stat value="1" label="görgü tanığı" color={IRON} />
          </div>

          <p className="mt-6 text-lg font-semibold leading-relaxed text-slate-100">{OTAG.punch}</p>

          <div className="mt-5 rounded-xl border p-4" style={{ borderColor: `${GARNET}44`, background: `color-mix(in srgb, ${GARNET} 8%, transparent)` }}>
            <p className="leading-relaxed" style={{ color: BONE }}>{OTAG.thesis}</p>
          </div>

          <SourceNote>
            Priskos’un eseri <em>kayıp</em>. Elimizdeki bu sahne, başkalarının onun metninden yaptığı alıntılardan geliyor —
            yani Atilla’yı üç kat cam ardından görüyoruz. Bu makale boyunca hangi camdan baktığımızı sana söyleyeceğiz.
          </SourceNote>
        </ArticleSection>
      </div>

      {/* ══════════ PERDE 1 — Bozkırdan gelenler ══════════ */}
      <div id="perde-1" className="scroll-mt-16">
        <ArticleSection kicker="PERDE 1 · ONDAN ÖNCEKİLER" title="Bozkırdan gelenler">
          <p className="leading-relaxed text-slate-300">
            Atilla’yı anlatan çoğu metin 434’te başlar: tahta çıkıyor, Avrupa titriyor. Bu, hikâyenin ortasından
            başlamaktır. Çünkü 434’te devraldığı şey bir çadır ve bir kılıç değildi — <strong>işleyen bir devletti.</strong>
          </p>

          <div className="my-7">
            <BozkirSeridi />
          </div>

          <p className="leading-relaxed text-slate-300">
            Ve bu zincirin arkasında çok daha eski bir şey var: MÖ 209’da Mete Han’ın kurduğu teşkilat. Orduyu onluk
            birimlere bölen, tebaa boyları tek bir siyasî çatı altında toplayan o kalıp, altı yüzyıl sonra Tuna
            boyunda hâlâ çalışıyordu.
          </p>

          <MythNote title="Peki Avrupa Hunları ile Asya Hunları aynı mı?">
            Bu soru uzun süre yalnız filolojiyle tartışıldı: ~313 tarihli Sogd Mektupları Luoyang’ı basanlara Sogdca
            &laquo;xwn&raquo; diyor ve bu, iki ad arasındaki en güçlü köprü. 2025’te {tr(NUMBERS.genom)} antik genomluk bir çalışma
            tartışmaya kemik ekledi: Karpat Havzası’ndaki bazı <strong>elit</strong> gömülerle Asya Hun elitleri arasında
            doğrudan soy bağı bulundu. Aynı çalışma ikinci bir şey daha söylüyor ve o da önemli: nüfusun tamamı için
            kitlesel bir göç <em>yok</em> — çeşitlilik yüksek. İkisi birlikte okununca çıkan tablo şu:
            soyu bozkırdan gelen bir hanedan, çok halklı bir federasyonun başında.
          </MythNote>

          <div className="my-7">
            <KavimlerGocu />
          </div>

          <p className="leading-relaxed text-slate-300">{GOC.punch}</p>
        </ArticleSection>
      </div>

      {/* ══════════ PERDE 2 — Kağan ══════════ */}
      <div id="perde-2" className="scroll-mt-16">
        <ArticleSection kicker="PERDE 2 · DEVLET" title="Kağan">
          <p className="leading-relaxed text-slate-300">
            Roma kaynakları Atilla için &laquo;kral&raquo; anlamına gelen kelimeleri kullanır, çünkü ellerinde başka kelime yok.
            Ama oturduğu koltuk bir Roma tahtı değil. Kendi mantığı, kendi meşruiyet kaynağı ve kendi
            arıza noktaları olan bir yapı — ve o yapıyı bilmeden Atilla’nın yaptıklarının çoğu keyfî görünür.
          </p>

          <div className="my-7">
            <KaganlikSemasi />
          </div>

          <p className="leading-relaxed text-slate-300">
            Şemadaki en önemli kutu <strong>{KAGAN.ikili.ad}</strong>. Onu şimdi aklında tut: Perde 4’te Atilla’nın
            kardeşiyle olan meselesi, bu kutunun içinden çıkacak.
          </p>

          <h3 className="mt-10 text-xl font-bold text-white">Şimdi de bir kelimeyi kaldıralım</h3>
          <p className="mt-3 leading-relaxed text-slate-300">
            Bu halk hakkında yazılmış metinlerin çoğunda tek bir kelime bütün açıklamanın yerine geçer.
            O kelimeyi kullanmayacağız — ama nereden geldiğini ve neyi gizlediğini göstereceğiz.
            Çünkü onu çürüten kanıtların hepsi, tuhaf biçimde, kelimeyi kullanan tarafın kendi arşivinde duruyor.
          </p>

          <div className="my-7">
            <BarbarPanosu />
          </div>

          <p className="mt-6 text-lg font-semibold leading-relaxed text-slate-100">{BARBAR.punch}</p>
        </ArticleSection>
      </div>

      {/* ══════════ PERDE 3 — İsim ══════════ */}
      <div id="perde-3" className="scroll-mt-16">
        <ArticleSection kicker="PERDE 3 · KELİMENİN KÖKÜ" title="Atilla ne demek?">
          <p className="leading-relaxed text-slate-300">
            Dünyanın en çok bilinen adlarından biri ve kökeni tartışmalı. Sebebi basit ve rahatsız edici:
            <strong> Hun dilinden elimizde üç kelime var.</strong> Üçü de yabancı kaynakların içine düşmüş
            tek tük kelimeler ve etimolojileri bile çekişmeli. Yani adın hangi dilden geldiğini,
            o dili tanımadan tartışıyoruz.
          </p>

          <div className="my-7">
            <IsimAgaci />
          </div>

          <p className="leading-relaxed text-slate-300">
            Dikkat çeken şey şu: {ISIM.okumalar[0].hat.toLowerCase()} ile {ISIM.okumalar[1].hat.toLowerCase()} farklı
            köklerden yola çıkıyor ama benzer bir anlam alanında buluşuyor. Adın hangi dilden geldiği belirsiz;
            ne söylediği konusunda kaynaklar şaşırtıcı biçimde yakın.
          </p>
        </ArticleSection>
      </div>

      {/* ══════════ PERDE 4 — İki kağan, bir taht ══════════ */}
      <div id="perde-4" className="scroll-mt-16">
        <ArticleSection kicker={`PERDE 4 · ${BLEDA.baslangic}-${BLEDA.bitis}`} title="İki kağan, bir taht">
          <p className="leading-relaxed text-slate-300">{BLEDA.devir}</p>
          <p className="mt-4 leading-relaxed text-slate-300">{BLEDA.son}</p>

          <div className="my-7 rounded-xl border p-5" style={{ borderColor: `${ACCENT}40`, background: `color-mix(in srgb, ${ACCENT} 7%, transparent)` }}>
            <div className="mb-2 text-[0.62rem] font-bold tracking-[0.2em]" style={{ color: ACCENT }}>ASIL MESELE</div>
            <p className="leading-relaxed text-slate-200">{BLEDA.kirilma}</p>
          </div>

          <p className="leading-relaxed text-slate-300">{BLEDA.punch}</p>

          <div className="my-8">
            <SourceCompare
              accent={ACCENT}
              event="445 · Bleda’nın ölümü"
              question="Atilla kardeşini öldürttü mü?"
              bottom="Üç sütun da aynı boşluğu gösteriyor: olayı gören kimse yazmadı. Elimizdeki en kesin cümle, olaydan yüz yıl sonra ve karşı taraftan geliyor."
              sources={bledaSources}
            />
          </div>

          <h3 className="mt-10 text-xl font-bold text-white">Ve aynı yıllarda bir çoban bir kılıç buluyor</h3>

          <div className="my-7">
            <KilicIfsa />
          </div>
        </ArticleSection>
      </div>

      {/* ══════════ PERDE 5 — Haraç ve surlar ══════════ */}
      <div id="perde-5" className="scroll-mt-16">
        <ArticleSection kicker="PERDE 5 · MAKİNE" title="Haraç ve surlar">
          <p className="leading-relaxed text-slate-300">
            Şimdi devletin nasıl <em>beslendiğine</em> geliyoruz. Atilla’nın Roma’yla ilişkisi bir yağma ilişkisi değil,
            bir <strong>ödeme planıdır</strong>: tutarı pazarlıkla belirlenen, gecikince birikmiş borç olarak hesaplanan,
            metne bağlanan bir akış.
          </p>

          <div className="my-7">
            <HaracSayaci />
          </div>

          <p className="leading-relaxed text-slate-300">
            Ve bu, Atilla’nın en çok yanlış anlaşılan tarafını açıklıyor: neden Konstantinopolis’i almadı?
            Cevabı 447’de, surların önünde duruyor.
          </p>

          <MythNote title="Depremin günü bile tartışmalı">
            {SURLAR.deprem.tarihTartismasi}
          </MythNote>

          <div className="my-7">
            <SurKesiti />
          </div>

          <div className="my-7 rounded-xl border p-5" style={{ borderColor: `${GOLD}44`, background: `color-mix(in srgb, ${GOLD} 7%, transparent)` }}>
            <div className="mb-2 text-[0.62rem] font-bold tracking-[0.2em]" style={{ color: GOLD }}>BİN YIL SONRA</div>
            <p className="leading-relaxed text-slate-200">{SURLAR.köprü}</p>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              O ikinci sınavı ayrıntısıyla anlatan ayrı bir makale var:{' '}
              <a href="/articles/fatih" className="article-ilink">Fatih Sultan Mehmed</a> — aynı duvar, bu kez düşüyor.
            </p>
          </div>
        </ArticleSection>
      </div>

      {/* ══════════ PERDE 6 — Yüzük ══════════ */}
      <div id="perde-6" className="scroll-mt-16">
        <ArticleSection kicker={`PERDE 6 · ${HONORIA.yil}`} title="Yüzük">
          <p className="leading-relaxed text-slate-300">
            {HONORIA.kisi} — {HONORIA.kim}. Hikâyenin bundan sonrası, bir kadının kendi hayatı üzerindeki
            kontrolünü geri alma girişiminin bir kıta ölçeğinde nasıl okunduğuyla ilgili.
          </p>

          <div className="my-7">
            <HonoriaKarar />
          </div>
        </ArticleSection>
      </div>

      {/* ══════════ PERDE 7 — Catalaunum ══════════ */}
      <div id="perde-7" className="scroll-mt-16">
        <ArticleSection kicker={`PERDE 7 · ${CATALAUNUM.yil}`} title="Catalaunum">
          <p className="leading-relaxed text-slate-300">
            451’de Galya’da karşılaşan iki ordunun komutanları birbirine yabancı değildi.
            Roma tarafında <strong>{AETIUS.ad}</strong> vardı — {AETIUS.unvan} ve Roma’nın Hunları içeriden tanıyan tek adamı.
          </p>

          <div className="my-7">
            <InView poster={<CatalaunumPoster />} minHeight={560}>
              <CatalaunumSim />
            </InView>
          </div>

          <p className="leading-relaxed text-slate-300">
            Muharebeyi anlatan kaynak, ölü sayısını da veriyor. Ve tam burada makalenin kuralı devreye giriyor:
            bir sayıyı beğenmemek yetmez, <strong>sınamak</strong> gerekir.
          </p>

          <div className="my-7">
            <SayiDedektoru />
          </div>

          <SourceNote>
            Rakamın kaynağı {CATALAUNUM.sayi.kaynak}. Abartılı ölü sayıları antik ve ortaçağ kroniklerinde
            kural sayılacak kadar yaygındır: sayı bir ölçüm değil, olayın büyüklüğüne dair bir <em>iddiadır</em>.
          </SourceNote>
        </ArticleSection>
      </div>

      {/* ══════════ PERDE 8 — İtalya ve Papa ══════════ */}
      <div id="perde-8" className="scroll-mt-16">
        <ArticleSection kicker={`PERDE 8 · ${ITALYA.yil}`} title="İtalya ve Papa">
          <p className="leading-relaxed text-slate-300">{ITALYA.aquileia}</p>

          <div className="my-7 rounded-xl border p-5" style={{ borderColor: `${GARNET}44`, background: `color-mix(in srgb, ${GARNET} 7%, transparent)` }}>
            <div className="mb-2 text-[0.62rem] font-bold tracking-[0.2em]" style={{ color: GARNET }}>{buyuk(ITALYA.milano.baslik)}</div>
            <p className="leading-relaxed text-slate-200">{ITALYA.milano.metin}</p>
            <p className="mt-3 leading-relaxed" style={{ color: BONE }}>{ITALYA.milano.yorum}</p>
          </div>

          <p className="leading-relaxed text-slate-300">{ITALYA.mincio.olay}</p>
          <p className="mt-4 text-lg font-semibold leading-relaxed text-slate-100">{ITALYA.mincio.soru}</p>

          <div className="my-7">
            <ItalyaAnketi />
          </div>

          <div className="my-8">
            <SourceCompare
              accent={GARNET}
              event={`${ITALYA.yil} · Mincio ırmağı`}
              question="Atilla İtalya’dan neden döndü?"
              bottom="Dördü de aynı olayı anlatıyor ve dördü de farklı bir şeye bakıyor. Birini seçip ötekileri silmek, elimizdeki kaynaklardan fazlasını bildiğimizi iddia etmek olurdu."
              sources={italyaSources}
            />
          </div>
        </ArticleSection>
      </div>

      {/* ── Perde 9-11 bir sonraki adımda: otağ karar modülü + üç tabut,
           efsane karşılaştırıcı, kapanış (476 ve Orestes). ── */}
    </ArticleShell>
  );
}
