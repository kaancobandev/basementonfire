'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import type { BicimFarki, DiffRow, FieldChange } from '@/lib/articleDiff';

type Item = { id: number; slug: string; title: string; summary: string; created_at: string; author: string; username: string };

type Edit = {
  id: number; slug: string; title: string; yeniTitle: string; pending_at: string;
  author: string; username: string;
  alanlar: FieldChange[]; govde: DiffRow[]; kaynak: DiffRow[]; degisenSatir: number;
  /** Metni ayni kalip yalnizca bicimi degisen bloklar (renk, kalinlik...). */
  bicim: BicimFarki[];
};

const RENK = {
  add: { bg: 'rgba(22,163,74,0.14)', fg: '#4ade80', bar: '#16a34a' },
  del: { bg: 'rgba(239,68,68,0.14)', fg: '#fca5a5', bar: '#ef4444' },
};

/* ── fark satiri ──────────────────────────────────────────── */

function Satir({ r }: { r: DiffRow }) {
  const kutu = (renk: typeof RENK.add, ic: React.ReactNode, isaret: string) => (
    <div style={{ display: 'flex', gap: 8, padding: '4px 8px', background: renk.bg, borderLeft: `3px solid ${renk.bar}`, borderRadius: 4 }}>
      <span aria-hidden style={{ color: renk.fg, fontWeight: 800, flexShrink: 0, fontFamily: 'monospace' }}>{isaret}</span>
      <span style={{ color: 'var(--color-text)', minWidth: 0, wordBreak: 'break-word' }}>{ic}</span>
    </div>
  );

  if (r.t === 'same') {
    return (
      <div style={{ display: 'flex', gap: 8, padding: '4px 8px', opacity: 0.45 }}>
        <span aria-hidden style={{ flexShrink: 0, fontFamily: 'monospace' }}>&nbsp;</span>
        <span style={{ color: 'var(--color-text-muted)', minWidth: 0, wordBreak: 'break-word' }}>{r.text}</span>
      </div>
    );
  }
  if (r.t === 'add') return kutu(RENK.add, r.text, '+');
  if (r.t === 'del') return kutu(RENK.del, <s>{r.text}</s>, '−');

  // 'mod' — tek satirda kelime duzeyinde: degisen kelime nerede, hemen gorunur
  return (
    <div style={{ display: 'flex', gap: 8, padding: '4px 8px', background: 'rgba(234,179,8,0.10)', borderLeft: '3px solid #eab308', borderRadius: 4 }}>
      <span aria-hidden style={{ color: '#fbbf24', fontWeight: 800, flexShrink: 0, fontFamily: 'monospace' }}>~</span>
      <span style={{ color: 'var(--color-text)', minWidth: 0, wordBreak: 'break-word' }}>
        {r.parts.map((p, i) =>
          p.s === 'same' ? <span key={i}>{p.text} </span>
          : p.s === 'add' ? <mark key={i} style={{ background: RENK.add.bg, color: RENK.add.fg, fontWeight: 700, borderRadius: 3, padding: '0 3px' }}>{p.text} </mark>
          : <s key={i} style={{ background: RENK.del.bg, color: RENK.del.fg, borderRadius: 3, padding: '0 3px' }}>{p.text} </s>,
        )}
      </span>
    </div>
  );
}

/**
 * Fark listesi. Varsayilan olarak YALNIZCA degisen satirlar (+ birer satir
 * baglam) cizilir: 300 paragrafli bir makalede degismeyen her satiri basmak
 * degiseni gizlerdi. "Tümünü göster" tam metni acar.
 */
function FarkListesi({ rows, hepsi }: { rows: DiffRow[]; hepsi: boolean }) {
  const gosterilecek = useMemo(() => {
    if (hepsi) return rows.map((r, i) => ({ r, i }));
    const tut = new Set<number>();
    rows.forEach((r, i) => {
      if (r.t === 'same') return;
      tut.add(i); tut.add(i - 1); tut.add(i + 1); // birer satir baglam
    });
    return rows.map((r, i) => ({ r, i })).filter(({ i }) => tut.has(i));
  }, [rows, hepsi]);

  if (!rows.length) return null;
  return (
    <div style={{ fontSize: '0.86rem', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {gosterilecek.map(({ r, i }, k) => {
        // Atlanan blok varsa arada oldugunu belli et.
        const bosluk = k > 0 && i - gosterilecek[k - 1].i > 1;
        return (
          <div key={i}>
            {bosluk && <div style={{ color: 'var(--color-text-muted)', fontFamily: 'monospace', fontSize: '0.75rem', padding: '2px 8px', opacity: 0.6 }}>⋯</div>}
            <Satir r={r} />
          </div>
        );
      })}
    </div>
  );
}

/* ── ana bilesen ──────────────────────────────────────────── */

export default function AdminClient({ items: initial, edits: initialEdits = [] }: { items: Item[]; edits?: Edit[] }) {
  const [items, setItems] = useState(initial);
  const [edits, setEdits] = useState(initialEdits);
  const [busy, setBusy] = useState<string | null>(null);
  const [acik, setAcik] = useState<number | null>(null);
  const [tamMetin, setTamMetin] = useState<Set<number>>(new Set());
  // Tarih yereli/saat dilimi server ile client'ta farkli olabilir -> hydration
  // uyusmazligi (React #418). Server'da ISO'nun gun kismini bas, mount sonrasi
  // yerellestir; ilk client render server ile AYNI olsun.
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const fmt = (iso: string) => (mounted ? new Date(iso).toLocaleString('tr-TR') : iso.slice(0, 10));

  async function cagir(id: number, action: string, anahtar: string) {
    let reason = '';
    if (action === 'reject' || action === 'reject_edit') {
      reason = window.prompt('Reddetme nedeni (kullanıcıya gösterilir, isteğe bağlı):') ?? '';
    }
    setBusy(anahtar);
    try {
      const res = await fetch(`/api/user-articles/${id}/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); toast(d.error ?? 'İşlem başarısız'); return; }
      if (action === 'approve' || action === 'reject') {
        setItems((p) => p.filter((x) => x.id !== id));
        toast(action === 'approve' ? 'Onaylandı ve yayına girdi ✅' : 'Reddedildi');
      } else {
        setEdits((p) => p.filter((x) => x.id !== id));
        toast(action === 'approve_edit' ? 'Düzenleme yayına alındı ✅' : 'Düzenleme reddedildi (makale yayında kaldı)');
      }
    } finally {
      setBusy(null);
    }
  }

  const btn = (bg: string): React.CSSProperties => ({
    padding: '8px 16px', borderRadius: 10, border: 'none', background: bg,
    color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
  });
  const btnDuz: React.CSSProperties = {
    padding: '8px 16px', borderRadius: 10, border: '1px solid var(--color-border)',
    color: 'var(--color-text)', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem',
    background: 'none', cursor: 'pointer',
  };
  const kart: React.CSSProperties = {
    border: '1px solid var(--color-border)', borderRadius: 14, padding: 16, background: 'var(--color-surface)',
  };
  return (
    <main className="main-content" style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <div className="feed-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span>Makale Yönetimi</span>
        <span style={{ display: 'flex', gap: 14 }}>
          <Link href="/yonetim/sikayetler" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', textDecoration: 'none' }}>Şikayetler →</Link>
          <Link href="/yonetim/istatistik" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', textDecoration: 'none' }}>İstatistik →</Link>
        </span>
      </div>

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '18px 16px 64px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* ── YAYINDAKI MAKALELERE ONERILEN DUZENLEMELER ──
            Once cizilir: makale ZATEN yayinda oldugu icin onaylanmamis bir
            degisiklik bekliyor demek degil — ama yazar cevap bekliyor. */}
        {edits.length > 0 && (
          <>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-text)', margin: '4px 0 0' }}>
              ✏️ Düzenleme onayı <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>({edits.length})</span>
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '0 0 4px' }}>
              Bu makaleler yayında ve yayında kalmaya devam ediyor. Aşağıdaki değişiklikler yalnızca onaylarsan geçerli olur.
            </p>
            {edits.map((e) => {
              const ack = acik === e.id;
              const tam = tamMetin.has(e.id);
              return (
                <div key={`e${e.id}`} style={{ ...kart, borderColor: 'rgba(234,179,8,0.35)' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-text)' }}>{e.title}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: '4px 0 8px' }}>
                    <Link href={`/u/${e.username}`} style={{ color: 'var(--color-primary)' }}>{e.author}</Link>
                    {' · '}{fmt(e.pending_at)}
                    {' · '}
                    <span style={{ color: '#fbbf24', fontWeight: 700 }}>
                      {[
                        e.degisenSatir > 0 && `${e.degisenSatir} satır değişti`,
                        // Bicim degisimi ayrica sayilmali: metin ayni kaldigi
                        // icin satir sayisina GIRMEZ ve eskiden "gövde aynı"
                        // diye raporlaniyordu — dogru ama yaniltici.
                        e.bicim.length > 0 && `${e.bicim.length} blokta biçim değişti`,
                        e.alanlar.length > 0 && `${e.alanlar.length} alan`,
                      ].filter(Boolean).join(' · ') || 'değişiklik saptanmadı'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: ack ? 14 : 0 }}>
                    <button type="button" onClick={() => setAcik(ack ? null : e.id)} style={btnDuz}>
                      {ack ? '▲ Farkı gizle' : '▼ Farkı gör'}
                    </button>
                    <Link href={`/makale/${e.slug}`} target="_blank" style={btnDuz}>👁 Yayındaki</Link>
                    <button type="button" disabled={busy === `e${e.id}`} onClick={() => cagir(e.id, 'approve_edit', `e${e.id}`)} style={btn('#16a34a')}>✓ Değişikliği yayına al</button>
                    <button type="button" disabled={busy === `e${e.id}`} onClick={() => cagir(e.id, 'reject_edit', `e${e.id}`)} style={btn('#ef4444')}>✕ Reddet</button>
                  </div>

                  {ack && (
                    <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {e.alanlar.length === 0 && e.degisenSatir === 0 && e.bicim.length === 0 && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
                          Görünür bir değişiklik bulunamadı — metin, biçim, görseller ve kaynakça aynı.
                        </p>
                      )}

                      {/* ── BICIM ──
                          Metin harfi harfine ayni, degisen yalnizca gorunum
                          (renk/kalinlik/hizalama). Etiketi yazıyla anlatmak
                          ise yaramaz; iki surumu RENDER EDIP yan yana koyuyoruz
                          ki yonetici degisikligi dogrudan gorsun. */}
                      {e.bicim.length > 0 && (
                        <div>
                          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
                            Biçim ({e.bicim.length})
                          </div>
                          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: '0 0 8px' }}>
                            Bu bloklarda yazının kendisi değişmedi, yalnızca görünümü değişti.
                          </p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {e.bicim.map((b) => (
                              <div key={b.sira} style={{ border: '1px solid var(--color-border)', borderRadius: 10, overflow: 'hidden' }}>
                                <div style={{ padding: '6px 10px', background: RENK.del.bg, color: RENK.del.fg, fontSize: '0.72rem', fontWeight: 800 }}>ÖNCE (yayındaki)</div>
                                <div className="ym-bicim" style={{ padding: '10px 12px' }} dangerouslySetInnerHTML={{ __html: b.eskiHtml }} />
                                <div style={{ padding: '6px 10px', background: RENK.add.bg, color: RENK.add.fg, fontSize: '0.72rem', fontWeight: 800, borderTop: '1px solid var(--color-border)' }}>SONRA (önerilen)</div>
                                <div className="ym-bicim" style={{ padding: '10px 12px' }} dangerouslySetInnerHTML={{ __html: b.yeniHtml }} />
                              </div>
                            ))}
                          </div>
                          <style>{`
                            /* Makale HTML'i panelde de okunakli dursun; kendi
                               font-size'ini panelin uzerine yikmasin. */
                            .ym-bicim { font-size: 0.88rem; line-height: 1.6; color: var(--color-text); overflow-wrap: break-word; }
                            .ym-bicim > *:first-child { margin-top: 0; }
                            .ym-bicim > *:last-child { margin-bottom: 0; }
                            .ym-bicim img { max-width: 100%; height: auto; }
                          `}</style>
                        </div>
                      )}

                      {e.alanlar.length > 0 && (
                        <div>
                          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>Alanlar</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {e.alanlar.map((a) => (
                              <div key={a.label} style={{ fontSize: '0.86rem' }}>
                                <div style={{ fontWeight: 700, color: 'var(--color-text)', marginBottom: 2 }}>{a.label}</div>
                                <div style={{ color: RENK.del.fg, wordBreak: 'break-word' }}>− <s>{a.onceki}</s></div>
                                <div style={{ color: RENK.add.fg, wordBreak: 'break-word' }}>+ {a.sonraki}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {e.govde.length > 0 && (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, gap: 8, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Gövde</span>
                            <button
                              type="button"
                              onClick={() => setTamMetin((p) => { const n = new Set(p); n.has(e.id) ? n.delete(e.id) : n.add(e.id); return n; })}
                              style={{ ...btnDuz, padding: '4px 10px', fontSize: '0.75rem' }}
                            >
                              {tam ? 'Yalnızca değişenler' : 'Tümünü göster'}
                            </button>
                          </div>
                          <FarkListesi rows={e.govde} hepsi={tam} />
                        </div>
                      )}

                      {e.kaynak.some((r) => r.t !== 'same') && (
                        <div>
                          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>Kaynakça</div>
                          <FarkListesi rows={e.kaynak} hepsi={tam} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}

        {/* ── ILK YAYIN KUYRUGU ── */}
        {edits.length > 0 && (
          <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-text)', margin: '18px 0 0' }}>
            📥 İnceleme kuyruğu <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>({items.length})</span>
          </h2>
        )}

        {items.length === 0 && edits.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 48 }}>
            <p style={{ fontWeight: 700, margin: '0 0 6px' }}>İncelenecek makale yok 🎉</p>
            <p style={{ fontSize: '0.85rem', margin: 0 }}>Yeni gönderiler ve düzenlemeler burada görünecek.</p>
          </div>
        )}
        {items.length === 0 && edits.length > 0 && (
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>Yeni gönderi yok.</p>
        )}

        {items.map((a) => (
          <div key={a.id} style={kart}>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-text)' }}>{a.title}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: '4px 0 8px' }}>
              <Link href={`/u/${a.username}`} style={{ color: 'var(--color-primary)' }}>{a.author}</Link>
              {' · '}{fmt(a.created_at)}
            </div>
            {a.summary && <p style={{ fontSize: '0.9rem', color: 'var(--color-text)', margin: '0 0 12px' }}>{a.summary}</p>}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {/* Kuyruktakiler 'pending' — ana rota (ISR, yalnız onaylılar) 404
                  verir; admin önizlemesi dinamik önizleme rotasından. */}
              <Link href={`/makale/onizleme/${a.id}`} target="_blank" style={btnDuz}>👁 Önizle</Link>
              <button type="button" disabled={busy === `a${a.id}`} onClick={() => cagir(a.id, 'approve', `a${a.id}`)} style={btn('#16a34a')}>✓ Onayla</button>
              <button type="button" disabled={busy === `a${a.id}`} onClick={() => cagir(a.id, 'reject', `a${a.id}`)} style={btn('#ef4444')}>✕ Reddet</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
