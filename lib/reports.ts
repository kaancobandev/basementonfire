// Şikayet (report) sistemi için ortak sabitler — modal, /api/report doğrulaması
// ve /yonetim/sikayetler kuyruğu hep buradan okur ki sebep/tür listeleri sapmasın.

export type ReportTargetType = 'post' | 'comment' | 'user' | 'article' | 'article_comment';
export type ReportReason =
  | 'spam' | 'taciz' | 'nefret' | 'uygunsuz' | 'siddet' | 'yanlis_bilgi' | 'diger';

export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'spam', label: 'Spam / yanıltıcı' },
  { value: 'taciz', label: 'Taciz veya zorbalık' },
  { value: 'nefret', label: 'Nefret söylemi' },
  { value: 'uygunsuz', label: 'Uygunsuz / cinsel içerik' },
  { value: 'siddet', label: 'Şiddet veya tehdit' },
  { value: 'yanlis_bilgi', label: 'Yanlış bilgi' },
  { value: 'diger', label: 'Diğer' },
];

export const REPORT_REASON_VALUES: ReportReason[] = REPORT_REASONS.map((r) => r.value);
export const REASON_LABEL: Record<string, string> = Object.fromEntries(
  REPORT_REASONS.map((r) => [r.value, r.label]),
);

export const REPORT_TARGET_TYPES: ReportTargetType[] = ['post', 'comment', 'user', 'article', 'article_comment'];
export const TARGET_LABEL: Record<ReportTargetType, string> = {
  post: 'Gönderi',
  comment: 'Yorum',
  user: 'Kullanıcı',
  article: 'Makale',
  article_comment: 'Makale yorumu',
};

export const REPORT_STATUS_LABEL: Record<string, string> = {
  open: 'Açık',
  reviewed: 'İncelendi',
  dismissed: 'Reddedildi',
};
