import { renderCaption } from '@/lib/caption';

interface Props {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * #hashtag → /hashtag/tag linki (altın renk)
 * @mention → /u/username linki (mavi renk)
 *
 * Kullanıcı HTML'i önce escape edilir, sadece kendi <a> taglarımız eklenir.
 */
export default function Caption({ text, className, style }: Props) {
  return (
    <span
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: renderCaption(text) }}
    />
  );
}
