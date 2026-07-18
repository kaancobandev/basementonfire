import Img from '@/app/components/Img';
import Link from 'next/link';
import type { DidYouKnow } from '@/lib/types';

/**
 * "Bunu biliyor muydun?" bilgi karti. Feed'e serpistirilir (kind:'dyk').
 * Eglence (akista kaydirma) + bilgi (kisa gercek + kaynak + makaleye link)
 * fuzyonunun gorunur parcasi. Hiç hook yok -> client feed icinde sorunsuz render.
 */
export default function DidYouKnowCard({ item }: { item: DidYouKnow }) {
  return (
    <article style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
      {/* Vurgu basligi — kartlari "bilgi" olarak ayirir */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'linear-gradient(90deg, rgba(59,130,246,0.16), rgba(139,92,246,0.10))', borderBottom: '1px solid var(--color-border)' }}>
        <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>💡</span>
        <span style={{ fontSize: '0.74rem', fontWeight: 800, letterSpacing: '0.04em', color: 'var(--color-primary)', textTransform: 'uppercase' }}>Bunu biliyor muydun?</span>
      </div>

      {/* aspectRatio ŞART: kutu boyutsuzdu → ilk boyamada 0px yükseklikteydi,
          görsel inince ~340px'e açılıp altındaki tüm kartları (Günün Sorusu
          dahil) aşağı itiyordu (ölçülebilir CLS; kullanıcı o an bir kalp
          butonuna dokunuyorsa yanlış öğeye basıyordu). loading="lazy" de yoktu
          → ekranın çok altındaki kartların görselleri LCP ile yarışıyordu.
          Aynı akıştaki MediaCarousel ikisini de doğru yapıyor. */}
      {item.image_url && (
        <div style={{ width: '100%', background: '#000', lineHeight: 0, aspectRatio: '16 / 9' }}>
          <Img src={item.image_url} alt="" loading="lazy" sizes="(max-width:620px) 100vw, 600px" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      <div style={{ padding: '13px 16px 15px' }}>
        <h3 style={{ margin: '0 0 6px', fontSize: '1.02rem', fontWeight: 800, lineHeight: 1.3, color: 'var(--color-text)' }}>{item.title}</h3>
        <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--color-text)', whiteSpace: 'pre-wrap' }}>{item.body}</p>

        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginTop: 13 }}>
          {item.article_slug && (
            <Link
              href={`/articles/${item.article_slug}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontWeight: 700, color: '#fff', background: 'var(--color-primary)', padding: '7px 15px', borderRadius: '9999px', textDecoration: 'none' }}
            >
              Devamını oku →
            </Link>
          )}
          {(item.source_url || item.source_label) && (
            item.source_url ? (
              <a href={item.source_url} target="_blank" rel="noopener noreferrer nofollow" style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', textDecoration: 'none', overflowWrap: 'anywhere' }}>
                📚 Kaynak: {item.source_label || 'Bağlantı'}
              </a>
            ) : (
              <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>📚 {item.source_label}</span>
            )
          )}
        </div>
      </div>
    </article>
  );
}
