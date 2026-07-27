import type { BibItem } from '@/app/components/ArticleBibliography';

// Kaynakça — düz (client-olmayan) modül; page.tsx (JSON-LD citation) + Client ortak kaynağı.
//
// Kaynaklar taraflıdır ve bilerek yan yana konur: Osmanlı kâtibi maaşını saraydan
// alır, Venedik balyosu bir rakibin envanterini tutar, Habsburg broşürü korku satar.
// Makalenin iki büyük belirsizliği de burada başlıyor: (1) ölümün kaç gün
// gizlendiği kaynaklarda değişir, (2) kardeş katli maddesinin Fatih’e aidiyeti
// hâlâ tartışmalıdır — elimizdeki kanunnâme nüshaları geç tarihlidir.
export const refs: BibItem[] = [
  {
    title: 'Kanunnâme-i Âl-i Osman — örfî hukukun kendi metni (cürm tarifeleri, tahrir esası)',
    authors: 'Osmanlı kanunnâmeleri',
    year: '16. yy',
    source: 'Süleyman dönemi derlemeleri',
  },
  {
    title: 'Tabakâtü’l-Memâlik ve Derecâtü’l-Mesâlik — dönemin içinden Osmanlı anlatısı',
    authors: 'Celâlzâde Mustafa (Koca Nişancı)',
    year: '16. yy',
    source: 'Saray nişancısının kendi kaleminden',
  },
  {
    title: 'Târih-i Peçevî — Mohaç ve Zigetvar dahil 16. yy olaylarının Osmanlı derlemesi',
    authors: 'Peçevi İbrahim Efendi',
    year: '17. yy',
    source: 'Sonraki kuşak derlemesi; olayların bir kısmına tanık değil',
  },
  {
    title: 'Venedik balyos raporları (relazioni) — rakip devletin İstanbul gözlemi',
    authors: 'Venedik balyosları',
    year: '16. yy',
    source: 'Senato’ya sunulan dönem raporları',
  },
  {
    title: 'Süleyman the Magnificent and the Representation of Power in the Context of Ottoman–Habsburg–Papal Rivalry — dört taçlı Venedik miğferi bölümünün dayanağı',
    authors: 'Gülru Necipoğlu',
    year: '1989',
    source: 'The Art Bulletin, 71(3)',
    url: 'https://www.jstor.org/stable/3051219',
  },
  {
    title: 'Studies in Old Ottoman Criminal Law — kanunnâmelerin ceza mantığı (tarifeli para cezası)',
    authors: 'Uriel Heyd',
    year: '1973',
    source: 'Oxford, Clarendon Press',
  },
  {
    title: 'Kanuni Sultan Süleyman Oğlu Şehzade Mustafa’yı 1553’te Neden Boğdurttu? — hâkim entrika anlatısına arşiv temelli itiraz',
    authors: 'Zahit Atçıl',
    year: '2016',
    source: 'Osmanlı Araştırmaları / The Journal of Ottoman Studies',
    url: 'https://osmanliarastirmalari.isam.org.tr/dergi/article/view/203',
  },
  {
    title: 'Osmanlı Devleti’nin Merkez ve Bahriye Teşkilâtı — kanunnâme, teşkilat ve kardeş katli tartışmasının klasik çerçevesi',
    authors: 'İsmail Hakkı Uzunçarşılı',
    year: '1948',
    source: 'Türk Tarih Kurumu',
  },
  {
    title: 'I. Süleyman — tarih, sefer ve idam tarihlerinin çapraz kontrolü için',
    authors: 'Vikipedi (Türkçe)',
    year: 'erişim 2026',
    source: 'tr.wikipedia.org',
    url: 'https://tr.wikipedia.org/wiki/I._S%C3%BCleyman',
  },
  {
    title: 'Kanunî’nin ölümü 42 gün gizlendi — Zigetvar sonrası gizleme operasyonu',
    authors: 'Erhan Afyoncu',
    year: '2018',
    source: 'Gazete köşesi: destekleyici kaynak, tek dayanak değil',
    url: 'https://www.sabah.com.tr/yazarlar/erhan-afyoncu/2018/09/09/kanunnin-olumu-42-gun-gizlendi',
  },
];
