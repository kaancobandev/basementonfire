import type { BibItem } from '@/app/components/ArticleBibliography';

// Kaynakça — düz (client-olmayan) modül; widgets.tsx + page.tsx ortak kaynağı.
//
// ⚠ TÜR ETİKETİ ZORUNLU. Bu makale kuruntu ile bilimi ayırmayı konu ediyor;
// hakemli bir makaleyle bir haberi aynı biçimde göstermek tutarsızlık olurdu.
//
// ⚠ "KÜNYE ONLY" notu olan kaynaklardan makalede TIRNAK İÇİ ALINTI YAPILMADI:
// tam metinleri araştırma sırasında açılamadı, yalnız künyeleri doğrulandı.
// Alıntı serbest olanlar tek tek işaretli.
//
// ⚠ Kuruntu satan siteler (Ekşi Şeyler, İndigo Dergisi, Üsküdar Ü. haber
// sayfası, Walach ve ark. E-LOGOS, What the Bleep, The Secret) BU LİSTEDE YOK.
// Onlar gövdede yalnızca "yalanlanan iddianın kaynağı" olarak, etiketlenerek
// anıldı — kaynak olarak kullanılmadılar.
export const refs: BibItem[] = [
  // ── Kurucu metinler ─────────────────────────────────────────────────────
  {
    title: 'Discussion of Probability Relations between Separated Systems (“dolanıklık” terimini koyan makale)',
    authors: 'Erwin Schrödinger',
    year: '1935',
    source: 'Hakemli · Math. Proc. Camb. Phil. Soc. 31(4):555–563 · DOI 10.1017/S0305004100013554 · tam metin okundu',
    url: 'https://doi.org/10.1017/S0305004100013554',
  },
  {
    title: 'Can Quantum-Mechanical Description of Physical Reality Be Considered Complete? (EPR)',
    authors: 'Albert Einstein, Boris Podolsky, Nathan Rosen',
    year: '1935',
    source: 'Hakemli · Physical Review 47:777–780 · DOI 10.1103/PhysRev.47.777 · künye doğrulandı, tam metin açılamadı',
    url: 'https://doi.org/10.1103/PhysRev.47.777',
  },
  {
    title: 'On the Einstein Podolsky Rosen Paradox (Bell eşitsizliği)',
    authors: 'John S. Bell',
    year: '1964',
    source: 'Hakemli · Physics Physique Fizika 1(3):195–200 · DOI 10.1103/PhysicsPhysiqueFizika.1.195 · künye doğrulandı',
    url: 'https://doi.org/10.1103/PhysicsPhysiqueFizika.1.195',
  },
  {
    title: 'Bertlmann’s Socks and the Nature of Reality (çorap mecazının kaynağı)',
    authors: 'John S. Bell',
    year: '1981',
    source: 'Hakemli · J. Phys. Colloques 42(C2):C2-41–C2-62 · DOI 10.1051/jphyscol:1981202 · tam metin okundu, alıntılar buradan',
    url: 'https://doi.org/10.1051/jphyscol:1981202',
  },
  {
    title: 'Bringing home the atomic world: Quantum mysteries for anybody (üç düğmeli kutular)',
    authors: 'N. David Mermin',
    year: '1981',
    source: 'Hakemli · Am. J. Phys. 49(10):940–943 · DOI 10.1119/1.12594 · tam metin okundu',
    url: 'https://doi.org/10.1119/1.12594',
  },

  // ── Deneyler ────────────────────────────────────────────────────────────
  {
    title: 'Experimental Test of Bell’s Inequalities Using Time-Varying Analyzers',
    authors: 'Alain Aspect, Jean Dalibard, Gérard Roger',
    year: '1982',
    source: 'Hakemli · Phys. Rev. Lett. 49:1804–1807 · DOI 10.1103/PhysRevLett.49.1804',
    url: 'https://doi.org/10.1103/PhysRevLett.49.1804',
  },
  {
    title: 'Violation of Bell’s Inequality under Strict Einstein Locality Conditions',
    authors: 'Gregor Weihs, Thomas Jennewein, Christoph Simon, Harald Weinfurter, Anton Zeilinger',
    year: '1998',
    source: 'Hakemli · Phys. Rev. Lett. 81:5039–5043 · arXiv:quant-ph/9810080 · tam metin okundu',
    url: 'https://arxiv.org/abs/quant-ph/9810080',
  },
  {
    title: 'Loophole-free Bell inequality violation using electron spins separated by 1.3 kilometres',
    authors: 'Bas Hensen ve ark. (Delft)',
    year: '2015',
    source: 'Hakemli · Nature 526:682–686 · DOI 10.1038/nature15759',
    url: 'https://doi.org/10.1038/nature15759',
  },
  {
    title: 'Significant-Loophole-Free Test of Bell’s Theorem with Entangled Photons (Viyana)',
    authors: 'Marissa Giustina ve ark.',
    year: '2015',
    source: 'Hakemli · Phys. Rev. Lett. 115:250401 · DOI 10.1103/PhysRevLett.115.250401',
    url: 'https://doi.org/10.1103/PhysRevLett.115.250401',
  },
  {
    title: 'Strong Loophole-Free Test of Local Realism (NIST/Boulder)',
    authors: 'Lynden K. Shalm ve ark.',
    year: '2015',
    source: 'Hakemli · Phys. Rev. Lett. 115:250402 · DOI 10.1103/PhysRevLett.115.250402',
    url: 'https://doi.org/10.1103/PhysRevLett.115.250402',
  },
  {
    title: 'Satellite-based entanglement distribution over 1200 kilometers (Micius)',
    authors: 'Juan Yin ve ark.',
    year: '2017',
    source: 'Hakemli · Science 356:1140–1144 · DOI 10.1126/science.aan3211',
    url: 'https://doi.org/10.1126/science.aan3211',
  },
  {
    title: 'Entanglement-based secure quantum cryptography over 1,120 kilometres',
    authors: 'Juan Yin ve ark.',
    year: '2020',
    source: 'Hakemli · Nature 582:501–505 · DOI 10.1038/s41586-020-2401-y',
    url: 'https://doi.org/10.1038/s41586-020-2401-y',
  },
  {
    title: 'Experimentally generated randomness certified by the impossibility of superluminal signals',
    authors: 'Peter Bierhorst, Emanuel Knill, Scott Glancy ve ark. (NIST)',
    year: '2018',
    source: 'Hakemli · Nature 556:223–226 · DOI 10.1038/s41586-018-0019-0',
    url: 'https://doi.org/10.1038/s41586-018-0019-0',
  },
  {
    title: 'Testing the speed of “spooky action at a distance” (⚠ makalede YANLIŞ OKUNAN kaynak — koşullu bir alt sınır verir, hız ölçmez)',
    authors: 'Daniel Salart, Augustin Baas, Cyril Branciard, Nicolas Gisin, Hugo Zbinden',
    year: '2008',
    source: 'Hakemli · Nature 454:861–864 · DOI 10.1038/nature07121 · ayrıca Kofler ve ark. arXiv:0810.4452 ve ekibin cevabı arXiv:0810.4607',
    url: 'https://doi.org/10.1038/nature07121',
  },

  // ── Kuram ve uygulama ───────────────────────────────────────────────────
  {
    title: 'Teleporting an Unknown Quantum State via Dual Classical and Einstein-Podolsky-Rosen Channels',
    authors: 'Charles H. Bennett, Gilles Brassard, Claude Crépeau, Richard Jozsa, Asher Peres, William K. Wootters',
    year: '1993',
    source: 'Hakemli · Phys. Rev. Lett. 70(13):1895–1899 · DOI 10.1103/PhysRevLett.70.1895 · künye doğrulandı (başlıktaki “dual” şartı esastır)',
    url: 'https://doi.org/10.1103/PhysRevLett.70.1895',
  },
  {
    title: 'Quantum cryptography based on Bell’s theorem',
    authors: 'Artur K. Ekert',
    year: '1991',
    source: 'Hakemli · Phys. Rev. Lett. 67:661–663 · künye doğrulandı',
    url: 'https://doi.org/10.1103/PhysRevLett.67.661',
  },
  {
    title: 'Experimental Entanglement Swapping: Entangling Photons That Never Interacted',
    authors: 'Jian-Wei Pan, Dik Bouwmeester, Harald Weinfurter, Anton Zeilinger',
    year: '1998',
    source: 'Hakemli · Phys. Rev. Lett. 80:3891–3894 · künye doğrulandı',
    url: 'https://doi.org/10.1103/PhysRevLett.80.3891',
  },
  {
    title: 'Distributed Entanglement (dolanıklığın tek eşliliği)',
    authors: 'Valerie Coffman, Joydip Kundu, William K. Wootters',
    year: '2000',
    source: 'Hakemli · Phys. Rev. A 61:052306 · arXiv:quant-ph/9907047',
    url: 'https://arxiv.org/abs/quant-ph/9907047',
  },
  {
    title: 'Importance of quantum decoherence in brain processes',
    authors: 'Max Tegmark',
    year: '2000',
    source: 'Hakemli · Phys. Rev. E 61:4194–4206 · DOI 10.1103/PhysRevE.61.4194',
    url: 'https://doi.org/10.1103/PhysRevE.61.4194',
  },
  {
    title: 'Decoherence, einselection, and the quantum origins of the classical',
    authors: 'Wojciech H. Zurek',
    year: '2003',
    source: 'Hakemli · Rev. Mod. Phys. 75:715 · DOI 10.1103/RevModPhys.75.715',
    url: 'https://doi.org/10.1103/RevModPhys.75.715',
  },
  {
    title: 'Quantum Computing in the NISQ era and beyond (abartıya karşı ölçülü kaynak)',
    authors: 'John Preskill',
    year: '2018',
    source: 'Hakemli · Quantum 2:79 · DOI 10.22331/q-2018-08-06-79',
    url: 'https://doi.org/10.22331/q-2018-08-06-79',
  },
  {
    title: 'Spooky action at a distance? A two-phase study into learners’ views of quantum entanglement',
    authors: 'Malte Brang, Hannah Franke, Fabian Greinert, Malte S. Ubben, Friederike Hennig, Philipp Bitzenbauer',
    year: '2024',
    source: 'Hakemli · EPJ Quantum Technology 11:33 · açık erişim (ayrıca Brang ve ark., EPJ QT 12:96, 2025)',
    url: 'https://doi.org/10.1140/epjqt/s40507-024-00246-w',
  },

  // ── Kurum / ansiklopedi ─────────────────────────────────────────────────
  {
    title: 'The Nobel Prize in Physics 2022 — basın bülteni ve popüler bilim metni',
    authors: 'The Royal Swedish Academy of Sciences',
    year: '2022',
    source: 'Kurum · nobelprize.org, 4 Ekim 2022 (Aspect, Clauser, Zeilinger)',
    url: 'https://www.nobelprize.org/prizes/physics/2022/press-release/',
  },
  {
    title: 'Quantum Science Explained: Entanglement (Thomas Vidick’in “iletişim olmadan korelasyon” sözü buradan)',
    authors: 'Caltech Science Exchange',
    year: 'erişim 2026',
    source: 'Kurum · California Institute of Technology',
    url: 'https://scienceexchange.caltech.edu/topics/quantum-science-explained/entanglement',
  },
  {
    title: 'Bell’s Theorem',
    authors: 'Wayne Myrvold, Marco Genovese, Abner Shimony',
    year: 'rev. 2024',
    source: 'Ansiklopedi (hakem denetimli) · Stanford Encyclopedia of Philosophy',
    url: 'https://plato.stanford.edu/entries/bell-theorem/',
  },
  {
    title: 'Quantum Entanglement and Information · The Einstein-Podolsky-Rosen Argument · Holism and Nonseparability in Physics · The Role of Decoherence in Quantum Mechanics · Al-Ghazali · Leibniz on Causation',
    authors: 'Çeşitli yazarlar',
    year: 'rev. 2024–2025',
    source: 'Ansiklopedi (hakem denetimli) · Stanford Encyclopedia of Philosophy',
    url: 'https://plato.stanford.edu/',
  },
  {
    title: 'Radyasyon yayan “negatif iyon” ürünlerinin satışının yasaklanması (aralarında “Quantum Pendant” da var)',
    authors: 'ANVS — Hollanda Nükleer Güvenlik ve Radyasyondan Korunma Kurumu',
    year: '2021',
    source: 'Kurum · resmî duyuru, 16 Aralık 2021',
    url: 'https://www.autoriteitnvs.nl/',
  },

  // ── Kitap ───────────────────────────────────────────────────────────────
  {
    title: 'Physics and Philosophy: The Revolution in Modern Science (Heisenberg’in “potentia” benzetmesi, Böl. 2–3)',
    authors: 'Werner Heisenberg',
    year: '1958',
    source: 'Kitap · Harper & Row',
  },
  {
    title: 'Second Explanation of the New System (iki saat mecazı, ss. 459–460)',
    authors: 'Gottfried Wilhelm Leibniz',
    year: '1696',
    source: 'Kitap · Loemker (ed.), Philosophical Papers and Letters, 2. bs., D. Reidel, 1976',
  },
  {
    title: 'Tehâfütü’l-Felâsife — 17. Mesele, nedensellik (ss. 166–167)',
    authors: 'Ebû Hâmid el-Gazâlî',
    year: '11. yüzyıl',
    source: 'Kitap · çev. Michael E. Marmura, 2. bs., Brigham Young University Press, 2000',
  },
  {
    title: 'An Enquiry Concerning Human Understanding — Böl. VII, nedensellik (§§7.26–7.29)',
    authors: 'David Hume',
    year: '1748',
    source: 'Kitap',
  },
  {
    title: 'Helgoland (Türkçe basımı olan, dolanıklığı “ilişki” üzerinden okuyan popüler kitap)',
    authors: 'Carlo Rovelli',
    year: '2022 (TR)',
    source: 'Kitap · çev. Tolga Esmer, Tellekt, 176 s., ISBN 9786257118736',
  },

  // ── Gazetecilik ─────────────────────────────────────────────────────────
  {
    title: 'The Science of 3 Body Problem: What’s Fact and What’s Fiction? (dizinin bilim danışmanı sofonların ışıktan hızlı haberleşemeyeceğini söylüyor)',
    authors: 'Sumeet Kulkarni',
    year: '2024',
    source: 'Haber · Scientific American, 30 Nisan 2024',
  },
  {
    title: 'Spiros Michalakis: a scientist in Hollywood (Ant-Man’in dolanıklık fikrini öneren fizikçi)',
    authors: 'Sarah Tesh',
    year: '2019',
    source: 'Haber · Physics World, 1 Kasım 2019',
  },
  {
    title: '“Bleep” of faith (filmde görüşleri tersine çevrilen fizikçi David Albert’in açıklaması)',
    authors: 'John Gorenfeld',
    year: '2004',
    source: 'Haber · Salon, 16 Eylül 2004',
  },
];
