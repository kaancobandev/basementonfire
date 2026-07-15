import type { BibItem } from '@/app/components/ArticleBibliography';

// Kaynakça — düz (client-olmayan) modül; page.tsx (JSON-LD citation) + Client ortak kaynağı.
//
// Bu makalenin omurgası dört antik kaynaktır ve dördü de taraflıdır:
// Caesar kendi propagandasını yazar; Suetonius dedikoduya bayılır; Plutarkhos
// ahlak dersi çıkarır; Appianos geç ve ikinci eldendir. Sayılar — özellikle
// Galya'daki ölü sayısı ve Alesia'daki ordu büyüklükleri — kaynakların kendi
// abartılarını taşır. Metinde bu çatlaklar gizlenmedi, gösterildi.
export const refs: BibItem[] = [
  {
    title: 'Commentarii de Bello Gallico (Galya Savaşları Hatıratı)',
    authors: 'Gaius Julius Caesar',
    year: 'MÖ ~58–50',
    source: 'Perseus Digital Library (Latince + İngilizce)',
    url: 'https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.02.0001',
  },
  {
    title: 'Commentarii de Bello Civili (İç Savaş)',
    authors: 'Gaius Julius Caesar',
    year: 'MÖ ~47',
    source: 'Perseus Digital Library',
    url: 'https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.02.0074',
  },
  {
    title: 'De Vita Caesarum — Divus Iulius (On İki Caesar: Julius)',
    authors: 'Gaius Suetonius Tranquillus',
    year: 'MS ~121',
    source: 'LacusCurtius (Loeb çevirisi)',
    url: 'https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Suetonius/12Caesars/Julius*.html',
  },
  {
    title: 'Paralel Hayatlar — Caesar',
    authors: 'Plutarkhos',
    year: 'MS ~110',
    source: 'LacusCurtius (Loeb çevirisi)',
    url: 'https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Lives/Caesar*.html',
  },
  {
    title: 'Paralel Hayatlar — Brutus, Crassus, Pompeius, Antonius, Cicero',
    authors: 'Plutarkhos',
    year: 'MS ~110',
    source: 'LacusCurtius',
    url: 'https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Lives/home.html',
  },
  {
    title: 'Roma Tarihi — İç Savaşlar, Kitap 2 (suikast ve komplocu listesi)',
    authors: 'Appianos',
    year: 'MS ~160',
    source: 'LacusCurtius',
    url: 'https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Appian/Bella_Civilia/2*.html',
  },
  {
    title: 'Roma Tarihi, Kitap 40–44 (Alesia, Lupercalia, İdus)',
    authors: 'Cassius Dio',
    year: 'MS ~230',
    source: 'LacusCurtius',
    url: 'https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Cassius_Dio/home.html',
  },
  {
    title: 'Bios Kaisaros (Augustus’un Hayatı) — suikastın en erken tam anlatımı; 23 değil 35 yara der',
    authors: 'Şamlı Nikolaos (Nicolaus of Damascus)',
    year: 'MÖ ~14',
    source: 'attalus.org (İngilizce çeviri)',
    url: 'https://www.attalus.org/translate/nicolaus4.html',
  },
  {
    title: 'Roma Tarihi 2.47 ve 2.87 (Galya’da 400.000+ ölü; Cassius Parmensis son ölen suikastçı)',
    authors: 'Velleius Paterculus',
    year: 'MS ~30',
    source: 'LacusCurtius',
    url: 'https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Velleius_Paterculus/home.html',
  },
  {
    title: 'Ad Atticum 8.16 — Caesar’ın merhametini "insidiosa clementia" (sinsi merhamet) diye niteleyen mektup',
    authors: 'Marcus Tullius Cicero',
    year: 'MÖ 49',
    source: 'Perseus Digital Library',
    url: 'https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.02.0008',
  },
  {
    title: 'He came, he saw, we counted: the historiography and demography of Caesar’s Gallic numbers',
    authors: 'David Henige',
    year: '1998',
    source: 'Annales de Démographie Historique 1998/1, 215–242',
    url: 'https://www.persee.fr/doc/adh_0066-2062_1998_num_1998_1_2162',
  },
  {
    title: 'Caesar and Genocide: Confronting the Dark Side of Caesar’s Gallic Wars',
    authors: 'Kurt A. Raaflaub',
    year: '2021',
    source: 'New England Classical Journal 48.1, 54–80',
    url: 'https://crossworks.holycross.edu/necj/vol48/iss1/6/',
  },
  {
    title: 'Alésia. Fouilles et recherches franco-allemandes sur les travaux militaires romains autour du Mont-Auxois (1991–1997)',
    authors: 'Michel Reddé & Siegmar von Schnurbein (ed.)',
    year: '2001',
    source: 'Académie des Inscriptions et Belles-Lettres, 3 cilt — kuşatma hatlarının arkeolojisi',
  },
  {
    title: 'Caesar: Life of a Colossus',
    authors: 'Adrian Goldsworthy',
    year: '2006',
    source: 'Yale University Press',
  },
  {
    title: 'SPQR: A History of Ancient Rome',
    authors: 'Mary Beard',
    year: '2015',
    source: 'Profile Books',
  },
];
