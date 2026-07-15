import type { Metadata } from 'next';
import { breadcrumbJsonLd, jsonLdScript, articleJsonLd } from '@/lib/seo';
import AugustusClient from './AugustusClient';
import { refs } from './refs';

const title = 'Augustus — Tacı Reddederek Kral Olan Adam';
const description =
  'Caesar tacı istediği için öldürüldü; Augustus istemiyormuş gibi yaparak her şeyi aldı ve yatağında öldü. Ankara’daki Res Gestae’nin zarif yalanından Cicero’nun kelime oyununa, sahte teslimden (MÖ 27) gücün gizli anatomisine, sönen vârislerden Teutoburg’un üç boş lejyon numarasına — Res Gestae "dediği/olan", TOLLENDUM cinası, sahte seçim (Rubicon’un tersi), gücün anatomisi diyagramı ve "alkışla" tuzağıyla interaktif. Caesar serisinin 2. parçası.';
const path = '/articles/augustus';

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'Augustus', 'Octavianus', 'Gaius Octavius', 'Res Gestae', 'Monumentum Ancyranum', 'Ankara Anıtı',
    'princeps', 'Principatus', 'Pax Romana', 'İkinci Triumvirlik', 'proscriptio', 'Actium', 'Agrippa',
    'Maecenas', 'Vergilius', 'Aeneis', 'Kleopatra', 'Marcus Antonius', 'Cicero', 'tollendum',
    'Livia', 'Tiberius', 'Julia', 'Teutoburg', 'Varus', 'Arminius', 'Lepidus', 'Divus Augustus',
    'Roma İmparatorluğu', 'Julius Caesar', 'Ağustos', 'Roma tarihi', 'antik Roma',
  ],
  alternates: { canonical: path },
  openGraph: { type: 'article', title: `${title} · Basements`, description, url: path },
  twitter: { card: 'summary_large_image', title: 'Augustus · Basements', description },
};

const jsonLd = articleJsonLd({
  title,
  description,
  path,
  datePublished: '2026-07-15',
  about: {
    type: 'Person',
    name: 'Augustus',
    sameAs: ['https://www.wikidata.org/wiki/Q1405', 'https://tr.wikipedia.org/wiki/Augustus'],
  },
  citation: refs.map((r) => ({ title: r.title, url: r.url })),
});

const breadcrumbLd = breadcrumbJsonLd([
  { name: 'Ana Sayfa', path: '/' },
  { name: 'Keşfet', path: '/discover' },
  { name: 'Augustus' },
]);

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbLd) }} />
      <AugustusClient />
    </>
  );
}
