// Ana sayfa landing'inin KÜRATÖRLÜK verisi (tasarım: "Merak Kapısı").
// Düz modül → sunucu bileşeni build'de okur, sıfır istemci maliyeti.
//
// SORULAR ARTIK BURADA YAZILMIYOR → lib/questions.ts (2026-07-16).
// Sebep: aynı soru paylaşım kartında da lazım (lib/og.tsx). İki kopya vardı ve
// sessizce ayrışabilirdi — landing'de bir soru, Instagram'da başka bir soru.
// Bu dosya artık KÜRATÖRLÜK yapıyor: HANGİ makale, HANGİ sırada, HANGİ accent'le.
// Soru metnini değiştirmek istiyorsan lib/questions.ts'i düzenle.
// (Yazım kuralı — "soru makalenin içinden çıkar, uydurulmaz" — oraya taşındı.)
//
// Not: string'ler backtick — içindeki düz kesme (') kaçış istemez.

import { ARTICLES, ARTICLE_MAP, type ArticleCategory } from './articles';
import { QUESTIONS } from './questions';

/* ══════════ HERO DESTESİ (8 kart, sırayla, kategori dönüşümlü) ══════════ */
// İlk basış menzili anında kanıtlasın diye kategoriler dönüşümlü.
// 0. kart Fatih: sitenin en iyi cümlesi, fatih/data.ts TROY.question'dan birebir.
// `accent`: hero'daki meta satırının rengi — makalenin imza gradyanının açık
// ucundan türetildi (koyu hero zemininde okunur olsun diye aydınlatılmış).
export type DeckCard = { slug: string; q: string; accent: string };

export const HERO_DECK: DeckCard[] = [
  { slug: `fatih`, q: QUESTIONS.fatih, accent: `#8fa9ff` },
  { slug: `radyoaktivite`, q: QUESTIONS.radyoaktivite, accent: `#b6f36a` },
  { slug: `bagirsak`, q: QUESTIONS.bagirsak, accent: `#ff9ab0` },
  { slug: `internet`, q: QUESTIONS.internet, accent: `#7fd4f0` },
  { slug: `newton`, q: QUESTIONS.newton, accent: `#ffc078` },
  { slug: `sezar`, q: QUESTIONS.sezar, accent: `#ff8fa8` },
  { slug: `tardigrad`, q: QUESTIONS.tardigrad, accent: `#7ef0c0` },
  { slug: `cift-yarik`, q: QUESTIONS[`cift-yarik`], accent: `#c9a0ff` },
];

/* ══════════ SORU DUVARI (6 kart = 6 kategorinin TAMAMI) ══════════ */
// Genişlik iddia edilmez, yapıyla gösterilir. Destedeki 8 ve kapılardaki 3 ile
// çakışmaz → sayfa 17 farklı makaleye kanca atar.
export type WallCard = { slug: string; q: string };

export const WALL: WallCard[] = [
  { slug: `black-hole`, q: QUESTIONS[`black-hole`] },
  { slug: `mol`, q: QUESTIONS.mol },
  { slug: `pirus`, q: QUESTIONS.pirus },
  { slug: `dogal-secilim`, q: QUESTIONS[`dogal-secilim`] },
  { slug: `bilgisayar`, q: QUESTIONS.bilgisayar },
  { slug: `sanat-akimlari`, q: QUESTIONS[`sanat-akimlari`] },
];

/* ══════════ ÜÇ KAPI (konuya göre değil, NİYETE göre) ══════════ */
export type Gate = { label: string; slug: string; blurb: string };

export const GATES: Gate[] = [
  {
    label: `Hiç bilmiyorum`,
    slug: `fizik-101`,
    blurb: `Kuvvet, ivme, enerji — hiç fizik bilmeyenler için. Kuvvet laboratuvarını kendin çalıştır.`,
  },
  {
    label: `Bana hikâye anlat`,
    slug: `sezar`,
    blurb: `Kendisini öldürenleri affeden adam. Üç bölümlük serinin ilki: Sezar → Augustus → Fatih.`,
  },
  {
    label: `Kafamı karıştır`,
    slug: `kuantum-olumsuzlugu`,
    blurb: `Kendi ölümünü neden hiç deneyimlemeyebilirsin?`,
  },
];

/* ══════════ DÖRT FİİL (sitenin dört etkileşim türünün TAMAMI) ══════════ */
// Vaat değil, YANLIŞLANABİLİR MEYDAN OKUMA satar. `live` olan kart sayfada
// gerçekten çalışan modülü taşır (iddia → kanıt terfisi).
export type Verb = { label: string; title: string; desc: string; slug: string; live?: 'radio' };

export const VERBS: Verb[] = [
  { label: `Oyna`, title: `Kuşatma simülasyonu`, desc: `Surları sen de düşüremezsin. Dene.`, slug: `fatih` },
  { label: `Karar ver`, title: `Rubicon`, desc: `Ordunu dağıt, ya da nehri geç. Sonra ne olduğunu oku.`, slug: `sezar` },
  { label: `Ölç`, title: `Sen ne kadar radyoaktifsin?`, desc: ``, slug: `radyoaktivite`, live: `radio` },
  { label: `Kuşkulan`, title: `Res Gestae: dediği / olan`, desc: `Duvarda yazan bir cümle. Bir de gerçekte olan. Kaydırıcıyı çek.`, slug: `augustus` },
];

// Radyoaktivite modülünün SABİTİ — uydurma demo değil:
// app/articles/radyoaktivite/data.ts → k40 62 + c14 41 + eser 9 = 112 Bq/kg.
export const BQ_PER_KG = 112;

/* ══════════ KURAL (sessiz manifesto) ══════════ */
// "Apolitik" kelimesi BİLİNÇLİ olarak yazılmaz — o kelime kendisi bir iddia ve
// tartışma davetiyesidir. Onun yerine apolitikliği ÜRETEN mekanizma yazılır.
// Üçü de sitede doğrulanabilir → kontrol edilebilir bir söz, reklam değil.
export const RULES: { claim: string; proof: string }[] = [
  { claim: `Sıfat değil, sayı.`, proof: `«Muhteşem» yazmayız. Kaç kişi, kaç gün, kaç top yazarız.` },
  { claim: `Kaynak var.`, proof: `Her makalenin sonunda kaynakça var. İddia varsa, kimin iddiası olduğu yazar.` },
  { claim: `Emin değilsek söyleriz.`, proof: `Kaynaklar çelişiyorsa dördünü yan yana koyarız, kararı sana bırakırız.` },
];

/* ══════════ Türetilmiş sayılar — ASLA elle yazma ══════════ */
// Elle yazılırsa 33. makalede hero yalan söyler ve markanın kendi kuralını ilk
// çiğneyen sayfa landing olur.
export const CATEGORY_ORDER: ArticleCategory[] = ['Fizik', 'Tarih', 'Biyoloji', 'Kültür', 'Teknoloji', 'Kimya'];

export function categoryCounts(): { cat: ArticleCategory; n: number }[] {
  return CATEGORY_ORDER
    .map((cat) => ({ cat, n: ARTICLES.filter((a) => a.category === cat).length }))
    .filter((c) => c.n > 0)
    .sort((a, b) => b.n - a.n);
}

export const ARTICLE_COUNT = ARTICLES.length;
export const CATEGORY_COUNT = categoryCounts().length;

/** Kart verisi: kürate soru + registry'nin kendi başlığı/emojisi/açıklaması. */
export function cardFor(slug: string, q?: string) {
  const a = ARTICLE_MAP[slug];
  if (!a) return null;
  return { slug, q, title: a.title, emoji: a.emoji, desc: a.desc, category: a.category };
}
