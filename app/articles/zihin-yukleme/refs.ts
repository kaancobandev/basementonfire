import type { BibItem } from '@/app/components/ArticleBibliography';

// Kaynakça — düz (client-olmayan) modül; widgets.tsx + page.tsx ortak kaynağı.
//
// ⚠ BU LİSTENİN KURALI: her girdinin TÜRÜ yazılır (hakemli makale / ön baskı /
// teknik rapor / haber). Sebebi makalenin kendi tezi: iddianın ne olduğu kadar
// KİMİN, NEREDE söylediği de bilgidir. Kaynak kalitesini konu edinen bir yazı,
// en çok yaslandığı kaynağın hakemsiz olduğunu saklayamaz.
//
// ⚠ Wikipedia hiçbir yerde taşıyıcı kaynak DEĞİL. Kültür yapıtları (film, dizi,
// oyun, roman) kaynakçaya girmez — metinde ad + yıl ile anılır; onlar için
// akademik atıf gerekmez ve akademik atıf gibi göstermek yanıltıcı olur.
export const refs: BibItem[] = [
  // ── Haritalama: nerede olduğumuz ────────────────────────────────────────
  {
    title: 'A petavoxel fragment of human cerebral cortex reconstructed at nanoscale resolution',
    authors: 'Shapson-Coe A, Januszewski M, Berger DR, Pope A, … Jain V, Lichtman JW',
    year: '2024',
    source: 'Hakemli makale · Science 384(6696):eadk4858 · DOI 10.1126/science.adk4858',
    url: 'https://doi.org/10.1126/science.adk4858',
  },
  {
    title: 'Neuronal wiring diagram of an adult brain (FlyWire)',
    authors: 'Dorkenwald S, Matsliah A, Sterling AR, Schlegel P, ve ark.; FlyWire Konsorsiyumu',
    year: '2024',
    source: 'Hakemli makale · Nature 634(8032):124–138 · DOI 10.1038/s41586-024-07558-y',
    url: 'https://doi.org/10.1038/s41586-024-07558-y',
  },
  {
    title: 'Functional connectomics spanning multiple areas of mouse visual cortex',
    authors: 'The MICrONS Consortium',
    year: '2025',
    source: 'Hakemli makale · Nature 640(8058):435–447 · DOI 10.1038/s41586-025-08790-w',
    url: 'https://doi.org/10.1038/s41586-025-08790-w',
  },
  {
    title: 'Nondestructive X-ray tomography of brain tissue ultrastructure',
    authors: 'Bosch C, Aidukas T, Holler M, ve ark. (Wanner AA, Schaefer AT)',
    year: '2025',
    source: 'Hakemli makale · Nature Methods 22(12) · DOI 10.1038/s41592-025-02891-0',
    url: 'https://doi.org/10.1038/s41592-025-02891-0',
  },

  // ── Çalıştırma: haritanın yetmediği yer ─────────────────────────────────
  {
    title: 'Neural signal propagation atlas of Caenorhabditis elegans',
    authors: 'Randi F, Sharma AK, Dvali S, Leifer AM',
    year: '2023',
    source: 'Hakemli makale · Nature 623(7986):406–414 · DOI 10.1038/s41586-023-06683-4',
    url: 'https://doi.org/10.1038/s41586-023-06683-4',
  },
  {
    title: 'Connectome-constrained networks predict neural activity across the fly visual system',
    authors: 'Lappalainen JK, Tschopp FD, Prakhya S, ve ark. (Macke JH, Turaga SC)',
    year: '2024',
    source: 'Hakemli makale · Nature 634(8036):1132–1140 · DOI 10.1038/s41586-024-07939-3',
    url: 'https://doi.org/10.1038/s41586-024-07939-3',
  },
  {
    title: 'OpenWorm: overview and recent advances in integrative biological simulation of Caenorhabditis elegans',
    authors: 'Sarma GP, Lee CW, Portegys T, … Larson SD',
    year: '2018',
    source: 'Hakemli makale · Phil Trans R Soc B 373(1758):20170382 · DOI 10.1098/rstb.2017.0382',
    url: 'https://doi.org/10.1098/rstb.2017.0382',
  },
  {
    title: 'Single cortical neurons as deep artificial neural networks',
    authors: 'Beniaguev D, Segev I, London M',
    year: '2021',
    source: 'Hakemli makale · Neuron 109(17):2727–2739.e3 · DOI 10.1016/j.neuron.2021.07.002',
    url: 'https://doi.org/10.1016/j.neuron.2021.07.002',
  },
  {
    title: 'Connectomes across development reveal principles of brain maturation',
    authors: 'Witvliet D, ve ark.',
    year: '2021',
    source: 'Hakemli makale · Nature 596(7871):257–261 · DOI 10.1038/s41586-021-03778-8',
    url: 'https://doi.org/10.1038/s41586-021-03778-8',
  },
  {
    title: 'Could a Neuroscientist Understand a Microprocessor?',
    authors: 'Jonas E, Kording KP',
    year: '2017',
    source: 'Hakemli makale · PLoS Computational Biology 13(1):e1005268 · DOI 10.1371/journal.pcbi.1005268',
    url: 'https://doi.org/10.1371/journal.pcbi.1005268',
  },
  {
    title: 'The structure of the nervous system of the nematode Caenorhabditis elegans',
    authors: 'White JG, Southgate E, Thomson JN, Brenner S',
    year: '1986',
    source: 'Hakemli makale · Phil Trans R Soc Lond B 314(1165):1–340 · DOI 10.1098/rstb.1986.0056',
    url: 'https://doi.org/10.1098/rstb.1986.0056',
  },
  {
    title: 'Whole-animal connectomes of both Caenorhabditis elegans sexes',
    authors: 'Cook SJ, ve ark.',
    year: '2019',
    source: 'Hakemli makale · Nature 571(7763):63–71 · DOI 10.1038/s41586-019-1352-7',
    url: 'https://doi.org/10.1038/s41586-019-1352-7',
  },

  // ── Sayılar ve düzeltmeleri ─────────────────────────────────────────────
  {
    title: 'Equal Numbers of Neuronal and Nonneuronal Cells Make the Human Brain an Isometrically Scaled-Up Primate Brain',
    authors: 'Azevedo FAC, Carvalho LRB, Grinberg LT, ve ark., Herculano-Houzel S',
    year: '2009',
    source: 'Hakemli makale · J Comp Neurol 513(5):532–541 · DOI 10.1002/cne.21974',
    url: 'https://doi.org/10.1002/cne.21974',
  },
  {
    title: 'Eighty-six billion and counting: do we know the number of neurons in the human brain?',
    authors: 'Goriely A',
    year: '2025',
    source: 'Hakemli makale · Brain 148(3):689–691 · DOI 10.1093/brain/awae390',
    url: 'https://doi.org/10.1093/brain/awae390',
  },
  {
    title: 'The search for true numbers of neurons and glial cells in the human brain: A review of 150 years of cell counting',
    authors: 'von Bartheld CS, Bahney J, Herculano-Houzel S',
    year: '2016',
    source: 'Hakemli makale · J Comp Neurol 524(18):3865–3895 · DOI 10.1002/cne.24040',
    url: 'https://doi.org/10.1002/cne.24040',
  },

  // ── Alanın kendi tahmini + çıkar beyanı ─────────────────────────────────
  {
    title: 'What are memories made of? A survey of neuroscientists on the structural basis of long-term memory',
    authors: 'Zeleznikow-Johnston A, Kendziorra EF, McKenzie AT',
    year: '2025',
    source:
      'Hakemli makale · PLoS ONE · DOI 10.1371/journal.pone.0326920 — ⚠ Çıkar beyanı: yazarlar beyin koruma sektöründe görevli/hissedar; çalışma CryoDAO hibesiyle fonlandı (makalede anlatılıyor)',
    url: 'https://doi.org/10.1371/journal.pone.0326920',
  },

  // ── Bilinç: ölçülen ve ölçülemeyen ──────────────────────────────────────
  {
    title: 'What makes a theory of consciousness unscientific?',
    authors: 'IIT-Concerned; Klincewicz M, Cheng T, Schmitz M, Sebastián MÁ, Snyder JS',
    year: '2025',
    source: 'Hakemli makale · Nature Neuroscience 28(4):689–693 · DOI 10.1038/s41593-025-01881-x',
    url: 'https://doi.org/10.1038/s41593-025-01881-x',
  },
  {
    title: 'Consciousness or pseudo-consciousness? A clash of two paradigms (üstteki eleştiriye yanıt — aynı sayı, ardışık sayfalar)',
    authors: 'Tononi G, Albantakis L, Barbosa L, Boly M, Cirelli C, … Koch C, Massimini M, Tsuchiya N',
    year: '2025',
    source: 'Hakemli makale · Nature Neuroscience 28(4):694–702 · DOI 10.1038/s41593-025-01880-y',
    url: 'https://doi.org/10.1038/s41593-025-01880-y',
  },
  {
    title: 'Adversarial testing of global neuronal workspace and integrated information theories of consciousness',
    authors: 'Cogitate Consortium (Ferrante O, Gorska-Klimowska U, Henin S, Hirschhorn R; Pitts M, Mudrik L, Melloni L)',
    year: '2025',
    source: 'Hakemli makale · Nature 642(8066):133–142 · DOI 10.1038/s41586-025-08888-1',
    url: 'https://doi.org/10.1038/s41586-025-08888-1',
  },

  // ── Büyük projeler ve eleştirisi ────────────────────────────────────────
  {
    title: 'Reconstruction and Simulation of Neocortical Microcircuitry (Blue Brain’in en çok atıf alan amiral yayını — juvenil sıçan korteksi)',
    authors: 'Markram H, Muller E, Ramaswamy S, Reimann MW, ve ark.',
    year: '2015',
    source: 'Hakemli makale · Cell 163:456–492 · DOI 10.1016/j.cell.2015.09.029',
    url: 'https://doi.org/10.1016/j.cell.2015.09.029',
  },
  {
    title: 'Neuroscience: Where is the brain in the Human Brain Project?',
    authors: 'Frégnac Y, Laurent G',
    year: '2014',
    source: 'Hakemli makale (yorum) · Nature 513:27–29 · DOI 10.1038/513027a',
    url: 'https://doi.org/10.1038/513027a',
  },

  // ── Beyin koruma ────────────────────────────────────────────────────────
  {
    title: 'Structural brain preservation: a potential bridge to future medical technologies',
    authors: 'McKenzie AT, Zeleznikow-Johnston A, … Church GM, de Magalhães JP, Kendziorra EF',
    year: '2024',
    source: 'Hakemli makale · Frontiers in Medical Technology 6:1400615 · DOI 10.3389/fmedt.2024.1400615',
    url: 'https://doi.org/10.3389/fmedt.2024.1400615',
  },

  // ── Beyin-bilgisayar arayüzü ────────────────────────────────────────────
  {
    title: 'Neuralink’s brain-computer interfaces: medical innovations and ethical challenges',
    authors: 'Lavazza A, Balconi M, Ienca M, ve ark.',
    year: '2025',
    source: 'Hakemli makale · Frontiers in Human Dynamics 7:1553905 · DOI 10.3389/fhumd.2025.1553905',
    url: 'https://doi.org/10.3389/fhumd.2025.1553905',
  },

  // ── Kuantum itirazı: iki taraf da ───────────────────────────────────────
  {
    title: 'The importance of quantum decoherence in brain processes',
    authors: 'Tegmark M',
    year: '2000',
    source: 'Hakemli makale · Physical Review E 61:4194–4206 · DOI 10.1103/PhysRevE.61.4194',
    url: 'https://doi.org/10.1103/PhysRevE.61.4194',
  },
  {
    title: 'Consciousness in the universe: A review of the Orch OR theory (azınlık hipotezi — karşı taraf)',
    authors: 'Hameroff S, Penrose R',
    year: '2014',
    source: 'Hakemli makale · Physics of Life Reviews 11(1):39–78 · DOI 10.1016/j.plrev.2013.08.002',
    url: 'https://doi.org/10.1016/j.plrev.2013.08.002',
  },

  // ── Nöro-mitler ─────────────────────────────────────────────────────────
  {
    title: 'Neuromythologies in education (öğretmenlerde nöro-mit yaygınlığı)',
    authors: 'Dekker S, Lee NC, Howard-Jones P, Jolles J',
    year: '2012',
    source: 'Hakemli makale · Frontiers in Psychology 3:429 · DOI 10.3389/fpsyg.2012.00429',
    url: 'https://doi.org/10.3389/fpsyg.2012.00429',
  },
  {
    title: 'Dispelling the Myth: Training in Education or Neuroscience Decreases but Does Not Eliminate Beliefs in Neuromyths',
    authors: 'Macdonald K, Germine L, Anderson A, Christodoulou J, McGrath LM',
    year: '2017',
    source: 'Hakemli makale · Frontiers in Psychology 8:1314 · DOI 10.3389/fpsyg.2017.01314',
    url: 'https://doi.org/10.3389/fpsyg.2017.01314',
  },

  // ── Felsefe ─────────────────────────────────────────────────────────────
  {
    title: 'Uploading: A Philosophical Analysis',
    authors: 'Chalmers DJ',
    year: '2014',
    source:
      'Kitap bölümü · Broderick D & Blackford R (ed.), Intelligence Unbound: The Future of Uploaded and Machine Minds, Blackwell — ⚠ aynı kitaptaki Pigliucci bölümü KARŞIT görüştür, karıştırmayın',
    url: 'https://consc.net/papers/uploading.pdf',
  },
  {
    title: 'Mind Uploading: A Philosophical Counter-Analysis (karşı görüş)',
    authors: 'Pigliucci M',
    year: '2014',
    source: 'Kitap bölümü · Intelligence Unbound, Blackwell',
  },
  {
    title: 'Personal Identity',
    authors: 'Parfit D',
    year: '1971',
    source: 'Hakemli makale · The Philosophical Review 80(1):3–27',
  },
  {
    title: 'Reasons and Persons',
    authors: 'Parfit D',
    year: '1984',
    source: 'Kitap · Oxford: Clarendon Press · DOI 10.1093/019824908X.001.0001',
  },
  {
    title: 'Personal Identity (animalist karşı konum: yükleme sen değilsin)',
    authors: 'Olson ET',
    year: '2023',
    source: 'Ansiklopedi maddesi (hakem denetimli) · Stanford Encyclopedia of Philosophy, esaslı revizyon 30.06.2023',
    url: 'https://plato.stanford.edu/entries/identity-personal/',
  },
  {
    title: 'The Matrix as Metaphysics',
    authors: 'Chalmers DJ',
    year: '2005',
    source: 'Kitap bölümü · Grau C (ed.), Philosophers Explore the Matrix, Oxford University Press',
    url: 'https://consc.net/papers/matrix.pdf',
  },
  {
    title: 'Mind Children: The Future of Robot and Human Intelligence',
    authors: 'Moravec H',
    year: '1988',
    source: 'Kitap · Harvard University Press · ISBN 0674576160',
  },

  // ── HAKEMLİ DEĞİL — tür etiketi zorunlu ─────────────────────────────────
  {
    title: 'Whole Brain Emulation: A Roadmap',
    authors: 'Sandberg A, Bostrom N',
    year: '2008',
    source:
      '⚠ HAKEMLİ DEĞİL — kurumsal teknik rapor #2008-3, Future of Humanity Institute, Oxford (FHI 16.04.2024’te kapandı). Alanın kanonik metni.',
    url: 'https://ora.ox.ac.uk/objects/uuid:a6880196-34c7-47a0-80f1-74d32ab98788',
  },
  {
    title: 'State of Brain Emulation Report 2025',
    authors: 'Zanichelli N, Schons M, Freeman I, Shiu P, Arkhipov A',
    year: '2025',
    source:
      '⚠ HAKEMLİ DEĞİL — arXiv ön baskısı (arXiv:2510.15745) · Fieldcrest Foundation fonladı · Raporun kendi çıkar beyanı: yazarlardan biri bir beyin emülasyonu şirketinde hissedar',
    url: 'https://arxiv.org/abs/2510.15745',
  },

  // ── Gazetecilik — tür etiketi zorunlu ───────────────────────────────────
  {
    title: 'A startup is pitching a mind-uploading service that is “100 percent fatal”',
    authors: 'Regalado A',
    year: '2018',
    source: 'Haber · MIT Technology Review, 13 Mart 2018',
    url: 'https://www.technologyreview.com/s/610456/',
  },
  {
    title: 'MIT severs ties to company promoting fatal brain uploading',
    authors: 'Regalado A',
    year: '2018',
    source: 'Haber · MIT Technology Review, 3 Nisan 2018',
    url: 'https://www.technologyreview.com/2018/04/03/104546/',
  },
  {
    title: 'Why the Human Brain Project Went Wrong—and How to Fix It',
    authors: 'Theil S',
    year: '2015',
    source: 'Haber · Scientific American, 1 Ekim 2015',
  },
  {
    title: 'Human Brain Project kapanış bildirisi',
    authors: 'Human Brain Project',
    year: '2023',
    source: 'Kurumsal bildiri · humanbrainproject.eu, 28 Eylül 2023',
    url: 'https://www.humanbrainproject.eu/',
  },
];
