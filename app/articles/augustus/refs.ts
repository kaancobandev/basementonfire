import type { BibItem } from '@/app/components/ArticleBibliography';

// Kaynakça — düz (client-olmayan) modül; page.tsx (JSON-LD citation) + Client ortak kaynağı.
//
// Ana kaynaklar taraflıdır: Augustus kendi propagandasını yazdı (ama Ankara'daki
// kopya sayesinde neredeyse eksiksiz); Suetonius dedikoduya bayılır; Cassius Dio
// geç ve ikinci el; Tacitus Principatus'un en zeki eleştirmeni ama karamsar.
// Livia'nın vârisleri zehirlediği iddiası KANITLANMAMIŞ bir söylentidir.
export const refs: BibItem[] = [
  {
    title: 'Res Gestae Divi Augusti (Tanrısal Augustus’un Yaptıkları) — Monumentum Ancyranum',
    authors: 'Augustus',
    year: 'MS 14',
    source: 'Ankara, Hacı Bayram / LacusCurtius (Latince + İngilizce)',
    url: 'https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Augustus/Res_Gestae/home.html',
  },
  {
    title: 'De Vita Caesarum — Divus Augustus (On İki Caesar: Augustus)',
    authors: 'Gaius Suetonius Tranquillus',
    year: 'MS ~121',
    source: 'LacusCurtius (Loeb çevirisi) — sağlık, son sözler, Varus',
    url: 'https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Suetonius/12Caesars/Augustus*.html',
  },
  {
    title: 'Roma Tarihi, Kitap 45–56 (MÖ 27 sahnesi, İskender’in mezarı, Actium)',
    authors: 'Cassius Dio',
    year: 'MS ~230',
    source: 'LacusCurtius',
    url: 'https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Cassius_Dio/home.html',
  },
  {
    title: 'Annales (Yıllıklar) — açılış bölümleri: Principatus’un en zeki eleştirisi; Livia şüphesi',
    authors: 'Publius Cornelius Tacitus',
    year: 'MS ~117',
    source: 'Perseus Digital Library',
    url: 'https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.02.0077',
  },
  {
    title: 'Roma Tarihi 2.59–2.123 (Tiberius yanlısı — dikkatli okunmalı)',
    authors: 'Velleius Paterculus',
    year: 'MS ~30',
    source: 'LacusCurtius',
    url: 'https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Velleius_Paterculus/home.html',
  },
  {
    title: 'Roma Tarihi — İç Savaşlar, Kitap 3–5 (İkinci Triumvirlik, proscriptio)',
    authors: 'Appianos',
    year: 'MS ~160',
    source: 'LacusCurtius',
    url: 'https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Appian/Bella_Civilia/home.html',
  },
  {
    title: 'Aeneis (Aeneas destanı — Maecenas çevresinde sipariş edilen kuruluş miti)',
    authors: 'Publius Vergilius Maro',
    year: 'MÖ 29–19',
    source: 'Perseus Digital Library (Latince)',
    url: 'https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.02.0055',
  },
  {
    title: 'Augustus (modern standart biyografi)',
    authors: 'Adrian Goldsworthy',
    year: '2014',
    source: 'Yale University Press',
  },
  {
    title: 'Augustus: The Life of Rome’s First Emperor',
    authors: 'Anthony Everitt',
    year: '2006',
    source: 'Random House',
  },
  {
    title: 'The Roman Revolution (Principatus’un klasik çözümlemesi)',
    authors: 'Ronald Syme',
    year: '1939',
    source: 'Oxford University Press',
  },
  {
    title: 'SPQR: A History of Ancient Rome',
    authors: 'Mary Beard',
    year: '2015',
    source: 'Profile Books',
  },
];
