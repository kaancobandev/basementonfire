'use client';

// Dünya makalesine ÖZEL interaktif widget'lar + içerik verisi.
// Genel şablon: @/app/components/article/ArticleBlocks
import { useState } from 'react';
export { refs } from './refs';

/* ════════════ VERİ (kart ızgaraları, timeline, quiz, kaynakça) ════════════ */

export const accretion = [
  { icon: '🌫️', title: 'Toz taneleri birleşir', text: "Diskteki mikroskobik toz ve buz tanecikleri statik elektrik ve zayıf kütleçekimle birbirine yapışır; kum, çakıl, derken kaya boyutuna ulaşır." },
  { icon: '🪨', title: 'Gezegenimsiler', text: "Kilometrelerce büyüyen cisimler artık çevresindeki maddeyi kendi kütleçekimiyle çeker. Erken Güneş Sistemi'nde milyonlarca gezegenimsi dolaşıyordu." },
  { icon: '💥', title: 'Embriyolar & çarpışmalar', text: "Gezegenimsiler çarpışıp birleşerek Ay–Mars büyüklüğünde embriyolar oluşturur. Kaotik dönemde yörüngesini süpüren birkaç büyük cisim hayatta kalır — biri Dünya." },
  { icon: '☀️', title: '“Doğru” uzaklık', text: "Güneş'e yakın bölgede uçucular buharlaşır; geriye kaya ve metal kalır. Bu yüzden iç gezegenler kayalık, dıştakiler dev gaz gezegenidir." },
];

export const heatSources = [
  { icon: '☄️', title: 'Çarpışma enerjisi', text: "Üzerine çarpan her gezegenimsi devasa miktarda ısı bırakır." },
  { icon: '⚛️', title: 'Radyoaktif bozunma', text: "Alüminyum-26 ve demir-60 gibi kısa ömürlü izotoplar bozunurken büyük ısı açığa çıkarır." },
  { icon: '🗜️', title: 'Sıkışma ısısı', text: "Gezegen büyüdükçe kendi ağırlığı altında sıkışması da ısı üretir." },
];

export const moonEvidence = [
  { icon: '🧪', title: 'İzotopik benzerlik', text: "Apollo'nun getirdiği Ay kayalarının oksijen izotop oranları Dünya'yla şaşırtıcı derecede benzer — Ay büyük ölçüde Dünya malzemesinden." },
  { icon: '🧲', title: 'Küçük demir çekirdeği', text: "Ay'ın yoğunluğu düşük, çekirdeği minik. Çünkü çarpışmada ağır çekirdek malzemesi Dünya'da kaldı, uzaya hafif kabuk/manto saçıldı." },
  { icon: '🌀', title: 'Açısal momentum', text: "Dünya–Ay sisteminin dönme enerjisi, dev bir teğet çarpışmayla tutarlıdır." },
  { icon: '💨', title: 'Uçucu element eksikliği', text: "Ay kayaları su ve uçucular açısından fakir — aşırı sıcak, buharlaşmış bir enkazdan oluştuklarına işaret eder." },
];

export const moonEffects = [
  { icon: '🎯', title: 'Eksen eğikliğini sabitler', text: "Ay'ın kütleçekimi 23,5°'lik eğikliği kararlı tutar; Ay olmasaydı eksen vahşice yalpalar, iklim felakete sürüklenirdi." },
  { icon: '🌊', title: 'Gelgitleri yaratır', text: "Okyanus gelgitleri esas olarak Ay'ın kütleçekiminin sonucudur; kıyı ekosistemlerini ve belki yaşamın karaya çıkışını şekillendirmiştir." },
  { icon: '⏱️', title: 'Dönüşü yavaşlatır', text: "Ay her yıl ~3,8 cm uzaklaşır; günler uzar. Çarpışmadan sonra bir gün birkaç saatti, bugün 24 saat." },
];

export const uniqueFeatures = [
  { icon: '💧', title: 'Sıvı su & yaşanabilir bölge', text: "Ne fazla sıcak ne fazla soğuk “Goldilocks” uzaklığı. Yüzeyin ~%71'i sıvı suyla kaplı tek bilinen gezegen." },
  { icon: '🧩', title: 'Levha tektoniği', text: "Aktif levha tektoniği bulunan bilinen tek gezegen. Karbon–iklim döngüsünü çevirerek iklimi milyarlarca yıl yaşanabilir tuttu." },
  { icon: '🫁', title: 'Oksijenli atmosfer', text: "%78 azot, %21 oksijen. Bu kadar serbest oksijen başka hiçbir yerde yok — bizzat yaşam (siyanobakteriler) tarafından üretildi." },
  { icon: '🛡️', title: 'Güçlü manyetik alan', text: "İç gezegenler arasında en güçlü, en istikrarlı kalkan. Atmosferi ve yüzeydeki yaşamı kozmik ışınımdan korur." },
  { icon: '🌕', title: 'Büyük ve yakın uydu', text: "Ana gezegenine oranla olağanüstü büyük bir uydu. Dünya–Ay neredeyse bir “çift gezegen” gibi davranır." },
];

export const nicheFacts = [
  { icon: '🥚', title: 'Tam küre değil', text: "Dönüşü yüzünden ekvatorda şişkin (basık küre). Merkeze en uzak nokta Everest değil, ekvatordaki Chimborazo'nun zirvesidir." },
  { icon: '🔄', title: 'İç çekirdek ayrı döner', text: "Sıvı dış çekirdekle yalıtılan katı iç çekirdek bağımsız dönebilir; son araştırmalar dönüşünün yavaşladığını, hatta geri kaydığını öne sürüyor." },
  { icon: '☄️', title: 'Yaş göktaşlarından okunur', text: "~4,54 milyar yıl. En eski kabuk tektonik+erozyonla yok olduğundan yaş, değişmeden kalmış göktaşları tarihlenerek bulunur." },
  { icon: '🔥', title: 'Hadeyan: cehennem çağı', text: "İlk yarım milyar yıl; sürekli bombardıman, volkanlar ve erimiş kaya okyanuslarıyla tam anlamıyla cehennemiydi." },
  { icon: '🚿', title: 'Suyun gizemi', text: "Suyun bir kısmının dış bölgelerden gelen su açısından zengin asteroitlerce taşınmış olabileceği düşünülüyor — içtiğimiz su uzayda yolculuk etmiş olabilir." },
];

export const timeline = [
  { year: "4,6 milyar yıl önce", title: "Güneş bulutsusu çöker", text: "Devasa bir gaz–toz bulutu kütleçekimiyle çöker; dönerek yassılaşıp gezegenimsi disk olur." },
  { year: "4,6 milyar", title: "Güneş doğar", text: "Merkezde basınç ve sıcaklık füzyonu ateşler. Geriye kalan %0,1'lik maddeden gezegenler oluşacaktır." },
  { year: "İlk milyonlarca yıl", title: "Yığışma", text: "Toz → çakıl → gezegenimsi → embriyo. Çarpışa birleşe Dünya şekillenir." },
  { year: "Erken Dünya", title: "Demir felaketi", text: "Gezegen erir; ağır demir–nikel merkeze batar, hafif silikatlar yükselir. Katmanlı yapı doğar." },
  { year: "~4,5 milyar", title: "Theia çarpışması", text: "Mars büyüklüğünde Theia, Dünya'ya teğet çarpar; saçılan enkazdan Ay oluşur." },
  { year: "Hadeyan eon", title: "Cehennem çağı", text: "Sürekli bombardıman, volkanlar ve erimiş kaya okyanusları. Mavi Dünya bu şiddetten doğar." },
  { year: "~2,4 milyar", title: "Büyük Oksitlenme", text: "Siyanobakterilerin fotosentezi atmosfere oksijen pompalar; gökyüzü ve kimya kalıcı değişir." },
  { year: "~780.000 yıl önce", title: "Son kutup dönüşü", text: "Manyetik kuzey ile güney yer değiştirir (Brunhes–Matuyama). Kayıt okyanus bazaltlarında donmuş." },
  { year: "Bugün", title: "Mavi gezegen", text: "Sıvı çekirdek, manyetik kalkan, levhalar, oksijen ve dengeleyici bir Ay — yaşam dolu tek dünya." },
];

export const quizQs = [
  { text: "Dünya yaklaşık kaç yaşında?", opts: ["4,54 milyon yıl", "4,54 milyar yıl", "454 milyon yıl", "45,4 milyar yıl"], a: 1, exp: "Yaş, değişmeden kalmış göktaşları radyometrik tarihlenerek ~4,54 milyar yıl bulunur." },
  { text: "Demir ve nikel neden gezegenin merkezinde toplandı?", opts: ["Manyetik çekim onları çekti", "Gezegen eridi, ağır metaller dibe battı (demir felaketi)", "Volkanlar onları içeri pompaladı", "Hep oradaydılar"], a: 1, exp: "Erimiş kaya okyanusunda yoğun demir/nikel merkeze battı, hafif silikatlar yükseldi — gezegensel farklılaşma." },
  { text: "İç çekirdek, dış çekirdekten sıcak olmasına rağmen neden KATIDIR?", opts: ["Daha soğuk olduğu için", "Muazzam basınç demir atomlarını katı tutar", "Farklı bir metal olduğu için", "Manyetik alan dondurur"], a: 1, exp: "Sıcaklık eritmek ister ama atmosferin ~3,5 milyon katı basınç katı tutar; basınç kazanır." },
  { text: "Dünya'nın manyetik alanını ne üretir?", opts: ["Çekirdekteki dev bir çubuk mıknatıs", "Sıvı dış çekirdekteki demirin dönerek akması (jeodinamo)", "Güneş rüzgârı", "Atmosferdeki elektrik"], a: 1, exp: "Elektriği ileten erimiş demirin dönüşü akım üretir; akım alanı, alan akımı besler — jeodinamo." },
  { text: "En geniş kabul gören açıklamaya göre Ay nasıl oluştu?", opts: ["Dünya tarafından yakalandı", "Mars büyüklüğünde Theia'nın Dünya'ya çarpmasıyla", "Dünya'yla aynı anda yan yana oluştu", "Bir asteroit kümesinin birleşmesiyle"], a: 1, exp: "Dev Çarpışma Hipotezi: Theia teğet çarptı, saçılan enkaz halkasından Ay birleşti." },
  { text: "Bilinen gezegenler arasında yalnızca Dünya'da olan özellik hangisidir?", opts: ["Manyetik alan", "Aktif levha tektoniği", "Atmosfer", "Uydu"], a: 1, exp: "Aktif levha tektoniği yalnızca Dünya'da bilinir; karbon–iklim döngüsünü çevirir." },
];

// refs yukarıda './refs' düz modülünden re-export edilir.

/* ════════════ İNTERAKTİF 1: Dünya'nın iç yapısı ════════════ */

const EARTH_LAYERS = [
  { key: 'kabuk', name: 'Kabuk', r: 95, color: '#94a3b8', comp: 'Granit, bazalt (silikatlar)', size: '5–70 km', state: 'Katı', temp: '~15–1000 °C', note: "Üzerinde yaşadığımız ince dış kabuk; dev levhalara bölünmüş." },
  { key: 'manto', name: 'Manto', r: 94, color: '#9a3412', comp: 'Demir-magnezyumca zengin silikatlar', size: '~2.900 km', state: 'Katı ama akışkan', temp: '~500–4000 °C', note: "Levha tektoniğini süren çok yavaş konveksiyon burada olur." },
  { key: 'dis', name: 'Dış çekirdek', r: 50, color: '#f97316', comp: 'Sıvı demir-nikel', size: '~2.200 km', state: 'Sıvı', temp: '~4000–5000 °C', note: "Akışkan demirin dönüşü jeodinamoyu ve manyetik alanı üretir." },
  { key: 'ic', name: 'İç çekirdek', r: 18, color: '#fde047', comp: 'Katı demir-nikel', size: '~1.220 km yarıçap', state: 'Katı', temp: '~5.200–5.700 °C', note: "Güneş yüzeyi kadar sıcak; ama muazzam basınç onu katı tutar." },
];

export function EarthLayers() {
  const [sel, setSel] = useState(0);
  const L = EARTH_LAYERS;
  const cur = L[sel];
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur sm:p-5">
      <div className="grid items-center gap-6 sm:grid-cols-2">
        <div className="mx-auto w-full max-w-[260px]">
          <svg viewBox="0 0 220 220" className="w-full">
            {L.map((l, i) => (
              <circle key={l.key} cx="110" cy="110" r={l.r} fill={l.color} stroke="rgba(0,0,0,0.3)" strokeWidth="1"
                style={{ cursor: 'pointer' }} onClick={() => setSel(i)} />
            ))}
            <circle cx="110" cy="110" r={cur.r} fill="none" stroke="#fff" strokeWidth="3" pointerEvents="none" style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.7))' }} />
          </svg>
        </div>
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            {L.map((l, i) => (
              <button key={l.key} onClick={() => setSel(i)} className={`rounded-full px-3 py-1 text-xs font-semibold transition ${sel === i ? 'text-slate-950' : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}`} style={sel === i ? { background: l.color } : undefined}>{l.name}</button>
            ))}
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="mb-1 text-lg font-bold text-white">{cur.name}</div>
            <p className="mb-3 text-sm leading-relaxed text-slate-300">{cur.note}</p>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div><dt className="text-xs text-slate-500">Bileşim</dt><dd className="text-slate-200">{cur.comp}</dd></div>
              <div><dt className="text-xs text-slate-500">Kalınlık</dt><dd className="text-slate-200">{cur.size}</dd></div>
              <div><dt className="text-xs text-slate-500">Hâl</dt><dd className="text-slate-200">{cur.state}</dd></div>
              <div><dt className="text-xs text-slate-500">Sıcaklık</dt><dd className="text-slate-200">{cur.temp}</dd></div>
            </dl>
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500">Bir katmana tıkla: bileşimini, kalınlığını, hâlini ve sıcaklığını gör.</p>
    </div>
  );
}

/* ════════════ İNTERAKTİF 2: Komşu gezegen karşılaştırması ════════════ */

const PLANETS = [
  { key: 'dunya', name: '🌍 Dünya', tint: '#38bdf8', rows: [['Manyetik alan', 'Güçlü, aktif kalkan'], ['Atmosfer', 'Yoğun · %21 oksijen'], ['Su', "Yüzeyin %71'i sıvı su"], ['Levha tektoniği', 'Var (bilinen tek)'], ['Sonuç', 'Yaşam dolu 🌱']] },
  { key: 'venus', name: '🟠 Venüs', tint: '#f59e0b', rows: [['Manyetik alan', 'Neredeyse yok'], ['Atmosfer', 'Çok yoğun CO₂ · sera etkisi'], ['Su', 'Yok (buharlaştı)'], ['Sıcaklık', '~460 °C (kurşun eritir)'], ['Sonuç', 'Cehennemi sıcak 🔥']] },
  { key: 'mars', name: '🔴 Mars', tint: '#ef4444', rows: [['Manyetik alan', 'Kaybetti (çekirdek soğudu)'], ['Atmosfer', 'İnce (rüzgârla söküldü)'], ['Su', 'Geçmişte vardı · şimdi donmuş'], ['Levha tektoniği', 'Yok'], ['Sonuç', 'Kuru, donmuş çöl 🏜️']] },
];

export function PlanetCompare() {
  const [sel, setSel] = useState(0);
  const p = PLANETS[sel];
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur sm:p-5">
      <div className="mb-4 flex flex-wrap gap-2">
        {PLANETS.map((pl, i) => (
          <button key={pl.key} onClick={() => setSel(i)} className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${sel === i ? 'text-slate-950' : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}`} style={sel === i ? { background: pl.tint } : undefined}>{pl.name}</button>
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border border-white/10">
        {p.rows.map((r, i) => (
          <div key={i} className={`flex items-start gap-3 px-4 py-2.5 text-sm ${i % 2 ? 'bg-white/[0.02]' : ''}`}>
            <span className="w-32 shrink-0 text-slate-500">{r[0]}</span>
            <span className="text-slate-200">{r[1]}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-500">Aynı bölgede oluşan üç kayalık gezegen, çok farklı kaderler. Fark çoğu zaman çekirdekte başlar.</p>
    </div>
  );
}
