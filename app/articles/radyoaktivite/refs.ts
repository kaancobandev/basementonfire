import type { BibItem } from '@/app/components/ArticleBibliography';

// Kaynakça — düz (client-olmayan) modül; widgets.tsx + page.tsx ortak kaynağı.
// URL'ler çok ajanlı araştırma turunda erişilebilirlik için kontrol edildi.
export const refs: BibItem[] = [
  { title: 'Sur les radiations émises par phosphorescence (radyoaktivitenin keşfi)', authors: 'Henri Becquerel', year: '1896', source: 'Comptes Rendus de l’Académie des Sciences 122, 420', url: 'https://www.academie-sciences.fr/pdf/dossiers/Becquerel/Becquerel_pdf/CR1896_p420.pdf' },
  { title: 'Recherches sur les substances radioactives (doktora tezi; “radyoaktivite” teriminin kaynağı)', authors: 'Marie Skłodowska Curie', year: '1903', source: 'Gauthier-Villars, Paris', url: 'https://www.gutenberg.org/ebooks/43233' },
  { title: 'Zur Quantentheorie des Atomkernes (alfa bozunmasının kuantum tünellemesi)', authors: 'George Gamow', year: '1928', source: 'Zeitschrift für Physik 51, 204', url: 'https://doi.org/10.1007/BF01343196' },
  { title: 'Age Determinations by Radiocarbon Content: Checks with Samples of Known Age', authors: 'J. R. Arnold & W. F. Libby', year: '1949', source: 'Science 110, 678', url: 'https://pubmed.ncbi.nlm.nih.gov/15407879/' },
  { title: 'Retrospective Birth Dating of Cells in Humans (bomba tepesiyle hücre yaşı)', authors: 'K. L. Spalding, R. D. Bhardwaj, J. Frisén ve ark.', year: '2005', source: 'Cell 122(1), 133', url: 'https://pubmed.ncbi.nlm.nih.gov/16009139/' },
  { title: 'The Workings of an Ancient Nuclear Reactor (Oklo)', authors: 'Alex P. Meshik', year: '2005', source: 'Scientific American', url: 'https://www.scientificamerican.com/article/ancient-nuclear-reactor/' },
  { title: 'Partial Radiogenic Heat Model for Earth Revealed by Geoneutrino Measurements', authors: 'KamLAND Collaboration', year: '2011', source: 'Nature Geoscience 4, 647', url: 'https://www.nature.com/articles/ngeo1205' },
  { title: 'NuDat 3 — Chart of Nuclides (izotop yarılanma süreleri ve bozunma modları)', authors: 'National Nuclear Data Center', source: 'Brookhaven National Laboratory', url: 'https://www.nndc.bnl.gov/nudat3/' },
  { title: 'Sources and Effects of Ionizing Radiation — UNSCEAR 2008 Report, Vol. I (doğal fon ve dozlar)', authors: 'UNSCEAR', year: '2008', source: 'Birleşmiş Milletler', url: 'https://www.unscear.org/unscear/en/publications/2008_1.html' },
  { title: 'Radiation Dose in X-Ray and CT Exams', authors: 'RadiologyInfo.org', source: 'RSNA / ACR', url: 'https://www.radiologyinfo.org/en/info/safety-xray' },
  { title: 'Health Risk of Radon', authors: 'US Environmental Protection Agency', source: 'EPA', url: 'https://www.epa.gov/radon/health-risk-radon' },
  { title: 'Banana Equivalent Dose (kavramın kökeni ve eleştirisi)', authors: 'Health Physics Society', source: 'HPS / Wikipedia', url: 'https://en.wikipedia.org/wiki/Banana_equivalent_dose' },
  { title: 'The Radioactivity of the Normal Adult Body (vücut aktivitesi türevi)', authors: 'R. E. Rowland', source: 'rerowland.com', url: 'http://www.rerowland.com/bodyactivity.htm' },
  { title: 'X-Ray Mass Attenuation Coefficients — Lead (Z=82)', authors: 'NIST', source: 'physics.nist.gov', url: 'https://physics.nist.gov/PhysRefData/XrayMassCoef/ElemTab/z82.html' },
  { title: 'Voyager 1 — Mission Status (Pu-238 RTG)', authors: 'NASA / JPL', year: '2025', source: 'science.nasa.gov', url: 'https://science.nasa.gov/mission/voyager/voyager-1/' },
  { title: 'The Radium Girls: The Dark Story of America’s Shining Women', authors: 'Kate Moore', year: '2017', source: 'Sourcebooks', url: 'https://archive.org/details/radiumgirlsdarks0000moor_k0f0' },
];
