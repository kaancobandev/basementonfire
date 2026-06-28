'use client';

import { useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { uploadToStorage } from '@/lib/upload';
import {
  ARTICLE_CATEGORIES, FONT_OPTIONS, TEXT_COLORS, HIGHLIGHT_COLORS, EMBED_LIBS, LIMITS,
  buildEmbedSrcDoc, clampHeight, type ArticleBlock,
} from '@/lib/userArticles';

type TextB = { cid: string; type: 'text'; html: string };
type ImageB = { cid: string; type: 'image'; file?: File; previewUrl?: string; url?: string; alt: string; caption: string };
type EmbedB = { cid: string; type: 'embed'; html: string; css: string; js: string; libs: string[]; height: number; caption: string };
type EB = TextB | ImageB | EmbedB;

type Source = { title: string; authors: string; year: string; source: string; url: string };

interface Initial {
  id: number; slug: string; title: string; summary: string; cover_url: string | null;
  category: string | null; doc: ArticleBlock[]; sources: any[]; status: string;
}

let cidSeq = 1;
const newCid = () => `b${cidSeq++}`;

function docToBlocks(doc: ArticleBlock[]): EB[] {
  return (doc ?? []).map((b): EB => {
    if (b.type === 'text') return { cid: newCid(), type: 'text', html: b.html };
    if (b.type === 'image') return { cid: newCid(), type: 'image', url: b.url, alt: b.alt ?? '', caption: b.caption ?? '' };
    return { cid: newCid(), type: 'embed', html: b.html, css: b.css, js: b.js, libs: b.libs ?? [], height: b.height, caption: b.caption ?? '' };
  });
}

export default function ArticleEditor({ initial }: { initial: Initial | null }) {
  const router = useRouter();
  const editing = !!initial;

  const [title, setTitle] = useState(initial?.title ?? '');
  const [summary, setSummary] = useState(initial?.summary ?? '');
  const [category, setCategory] = useState<string>(initial?.category ?? '');
  const [cover, setCover] = useState<{ file?: File; previewUrl?: string; url?: string }>(
    initial?.cover_url ? { url: initial.cover_url } : {},
  );
  const [blocks, setBlocks] = useState<EB[]>(
    initial ? docToBlocks(initial.doc) : [{ cid: newCid(), type: 'text', html: '' }],
  );
  const [sources, setSources] = useState<Source[]>(
    (initial?.sources ?? []).map((s: any) => ({ title: s.title ?? '', authors: s.authors ?? '', year: s.year ?? '', source: s.source ?? '', url: s.url ?? '' })),
  );
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [error, setError] = useState('');

  // contentEditable DOM referanslari + secim takibi (tek toolbar, aktif blogu uygular)
  const editableRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const activeCid = useRef<string | null>(null);
  const savedRange = useRef<Range | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pendingImageCid = useRef<string | null>(null);

  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const r = sel.getRangeAt(0);
    const el = activeCid.current ? editableRefs.current.get(activeCid.current) : null;
    if (el && el.contains(r.commonAncestorContainer)) savedRange.current = r.cloneRange();
  }, []);

  const applyCmd = useCallback((cmd: string, val?: string) => {
    const el = activeCid.current ? editableRefs.current.get(activeCid.current) : null;
    if (!el) { toast('Önce bir metin bloğuna tıkla'); return; }
    el.focus();
    if (savedRange.current) {
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(savedRange.current);
    }
    try { document.execCommand('styleWithCSS', false, 'true'); } catch {}
    try { document.execCommand(cmd, false, val); } catch {}
    saveSelection();
  }, [saveSelection]);

  function setEditableRef(cid: string, el: HTMLDivElement | null) {
    editableRefs.current.set(cid, el);
    // ilk mount'ta icerigi tek sefer bas (controlled degil -> imlec ziplamaz)
    if (el && el.dataset.seeded !== '1') {
      const b = blocks.find((x) => x.cid === cid);
      if (b && b.type === 'text') el.innerHTML = b.html || '';
      el.dataset.seeded = '1';
    }
  }

  // ---- blok islemleri ----
  function addBlock(type: EB['type'], after?: string) {
    const nb: EB =
      type === 'text' ? { cid: newCid(), type: 'text', html: '' }
        : type === 'image' ? { cid: newCid(), type: 'image', alt: '', caption: '' }
          : { cid: newCid(), type: 'embed', html: '<div id="sahne"></div>', css: '#sahne{display:grid;place-items:center;height:100%;color:#54d6e8;font:600 20px system-ui}', js: 'document.getElementById("sahne").textContent="Merhaba 👋";', libs: [], height: LIMITS.embedHeightDefault, caption: '' };
    setBlocks((prev) => {
      if (!after) return [...prev, nb];
      const i = prev.findIndex((b) => b.cid === after);
      const copy = [...prev];
      copy.splice(i + 1, 0, nb);
      return copy;
    });
  }
  function removeBlock(cid: string) {
    setBlocks((prev) => prev.filter((b) => b.cid !== cid));
    editableRefs.current.delete(cid);
  }
  function moveBlock(cid: string, dir: -1 | 1) {
    setBlocks((prev) => {
      const i = prev.findIndex((b) => b.cid === cid);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const copy = [...prev];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
  }
  function patchBlock<T extends EB>(cid: string, patch: Partial<T>) {
    setBlocks((prev) => prev.map((b) => (b.cid === cid ? { ...b, ...patch } as EB : b)));
  }

  // ---- gorsel secimi ----
  function onCoverPick(file?: File) {
    if (!file) return;
    if (cover.previewUrl) URL.revokeObjectURL(cover.previewUrl);
    setCover({ file, previewUrl: URL.createObjectURL(file) });
  }
  function onImagePick(file?: File) {
    const cid = pendingImageCid.current;
    if (!file || !cid) return;
    patchBlock<ImageB>(cid, { file, previewUrl: URL.createObjectURL(file), url: undefined });
    pendingImageCid.current = null;
  }

  // ---- kaynaklar ----
  function addSource() { setSources((p) => [...p, { title: '', authors: '', year: '', source: '', url: '' }]); }
  function patchSource(i: number, patch: Partial<Source>) { setSources((p) => p.map((s, idx) => (idx === i ? { ...s, ...patch } : s))); }
  function removeSource(i: number) { setSources((p) => p.filter((_, idx) => idx !== i)); }

  // ---- gonderim ----
  async function handleSubmit() {
    setError('');
    if (title.trim().length < 3) { setError('⚠ Başlık en az 3 karakter olmalı.'); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }

    // metin bloklarini DOM'dan oku
    const liveBlocks: EB[] = blocks.map((b) => {
      if (b.type === 'text') {
        const el = editableRefs.current.get(b.cid);
        return { ...b, html: el ? el.innerHTML : b.html };
      }
      return b;
    });

    const hasContent = liveBlocks.some((b) =>
      (b.type === 'text' && b.html.replace(/<[^>]*>/g, '').trim().length > 0) ||
      (b.type === 'image' && (b.file || b.url)) ||
      (b.type === 'embed' && (b.html.trim() || b.js.trim())));
    if (!hasContent) { setError('⚠ Makale boş. En az bir içerik bloğu ekle.'); return; }

    setSubmitting(true);
    try {
      // 1) kapak + gorselleri yukle
      let coverPath: string | undefined;
      let coverUrl: string | undefined = cover.url;
      if (cover.file) {
        setProgress('Kapak yükleniyor…');
        coverPath = (await uploadToStorage(cover.file, 'media')).path;
        coverUrl = undefined;
      }

      const doc: any[] = [];
      let imgN = 0;
      const totalImgs = liveBlocks.filter((b) => b.type === 'image' && b.file).length;
      for (const b of liveBlocks) {
        if (b.type === 'text') {
          if (b.html.replace(/<[^>]*>/g, '').trim().length > 0) doc.push({ type: 'text', html: b.html });
        } else if (b.type === 'image') {
          if (b.file) {
            imgN++;
            setProgress(`Görsel yükleniyor ${imgN}/${totalImgs}…`);
            const { path } = await uploadToStorage(b.file, 'media');
            doc.push({ type: 'image', path, alt: b.alt, caption: b.caption });
          } else if (b.url) {
            doc.push({ type: 'image', url: b.url, alt: b.alt, caption: b.caption });
          }
        } else if (b.type === 'embed') {
          if (b.html.trim() || b.js.trim()) {
            doc.push({ type: 'embed', html: b.html, css: b.css, js: b.js, libs: b.libs, height: clampHeight(b.height), caption: b.caption });
          }
        }
      }

      setProgress('Kaydediliyor…');
      const payload = {
        title: title.trim(),
        summary: summary.trim(),
        category: category || undefined,
        coverPath,
        coverUrl,
        doc,
        sources: sources.filter((s) => s.title.trim() || s.url.trim()),
      };

      const res = await fetch(editing ? `/api/user-articles/${initial!.id}` : '/api/user-articles', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error ?? 'Bir hata oluştu.'); setSubmitting(false); setProgress(''); return; }

      toast('Makalen incelemeye gönderildi ✅', { description: 'Onaylanınca yayına girecek.' });
      router.push(editing ? `/makale/${initial!.slug}` : `/makale/${data.slug}`);
    } catch (e: any) {
      setError(e?.message ?? 'Bağlantı hatası. Tekrar dene.');
      setSubmitting(false);
      setProgress('');
    }
  }

  return (
    <main className="main-content ed-main">
      <div className="feed-header" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link href="/" className="back-btn" aria-label="Geri">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
        </Link>
        <span>{editing ? 'Makaleyi Düzenle' : 'Makale Yaz'}</span>
      </div>

      <div className="ed-wrap">
        {error && <div className="ed-error">{error}</div>}

        {/* Kapak */}
        <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={(e) => { onCoverPick(e.target.files?.[0]); if (coverInputRef.current) coverInputRef.current.value = ''; }} />
        <button type="button" className="ed-cover" onClick={() => coverInputRef.current?.click()}>
          {cover.previewUrl || cover.url
            ? <img src={cover.previewUrl || cover.url} alt="" />
            : <span className="ed-cover-empty">＋ Kapak görseli ekle (isteğe bağlı)</span>}
        </button>

        {/* Baslik / ozet / kategori */}
        <input className="ed-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Makale başlığı" maxLength={LIMITS.title} />
        <textarea className="ed-summary" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Kısa özet (kartlarda ve aramada görünür)" maxLength={LIMITS.summary} rows={2} />
        <select className="ed-cat" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Kategori seç (isteğe bağlı)</option>
          {ARTICLE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Bicim cubugu (aktif metin blogunu uygular) */}
        <div className="ed-toolbar" onMouseDown={(e) => { if ((e.target as HTMLElement).tagName !== 'SELECT' && (e.target as HTMLElement).tagName !== 'INPUT') e.preventDefault(); }}>
          <button type="button" onClick={() => applyCmd('bold')} title="Kalın"><b>B</b></button>
          <button type="button" onClick={() => applyCmd('italic')} title="İtalik"><i>I</i></button>
          <button type="button" onClick={() => applyCmd('underline')} title="Altı çizili"><u>U</u></button>
          <button type="button" onClick={() => applyCmd('strikeThrough')} title="Üstü çizili"><s>S</s></button>
          <span className="ed-sep" />
          <button type="button" onClick={() => applyCmd('formatBlock', '<h2>')} title="Başlık">H2</button>
          <button type="button" onClick={() => applyCmd('formatBlock', '<h3>')} title="Alt başlık">H3</button>
          <button type="button" onClick={() => applyCmd('formatBlock', '<blockquote>')} title="Alıntı">❝</button>
          <button type="button" onClick={() => applyCmd('formatBlock', '<p>')} title="Normal metin">¶</button>
          <span className="ed-sep" />
          <button type="button" onClick={() => applyCmd('insertUnorderedList')} title="Madde listesi">• ⁝</button>
          <button type="button" onClick={() => applyCmd('insertOrderedList')} title="Numaralı liste">1.</button>
          <span className="ed-sep" />
          <button type="button" onClick={() => { const u = window.prompt('Bağlantı (https://…)'); if (u && /^https?:\/\//i.test(u)) applyCmd('createLink', u); else if (u) toast('Yalnızca http(s) bağlantı'); }} title="Bağlantı ekle">🔗</button>
          <button type="button" onClick={() => applyCmd('unlink')} title="Bağlantıyı kaldır">⛓️‍💥</button>
          <span className="ed-sep" />
          <select className="ed-font" defaultValue="" onChange={(e) => { applyCmd('fontName', e.target.value); e.target.selectedIndex = 0; }} title="Yazı tipi">
            <option value="" disabled>Yazı tipi</option>
            {FONT_OPTIONS.filter((f) => f.value).map((f) => <option key={f.label} value={f.value}>{f.label}</option>)}
          </select>
          <span className="ed-sep" />
          <span className="ed-swatches" title="Metin rengi">
            <span className="ed-swatch-label">A</span>
            {TEXT_COLORS.map((c) => <button key={c} type="button" className="ed-swatch" style={{ background: c }} onClick={() => applyCmd('foreColor', c)} aria-label={`Renk ${c}`} />)}
          </span>
          <span className="ed-swatches" title="Vurgu rengi">
            <span className="ed-swatch-label">🖍</span>
            {HIGHLIGHT_COLORS.map((c) => <button key={c} type="button" className="ed-swatch" style={{ background: c }} onClick={() => applyCmd('hiliteColor', c)} aria-label={`Vurgu ${c}`} />)}
          </span>
          <span className="ed-sep" />
          <button type="button" onClick={() => applyCmd('removeFormat')} title="Biçimi temizle">⌫</button>
        </div>

        {/* Bloklar */}
        <div className="ed-blocks">
          {blocks.map((b, i) => (
            <div key={b.cid} className="ed-block">
              <div className="ed-block-bar">
                <span className="ed-block-tag">{b.type === 'text' ? 'Metin' : b.type === 'image' ? 'Görsel' : 'İnteraktif'}</span>
                <span style={{ flex: 1 }} />
                <button type="button" onClick={() => moveBlock(b.cid, -1)} disabled={i === 0} aria-label="Yukarı">↑</button>
                <button type="button" onClick={() => moveBlock(b.cid, 1)} disabled={i === blocks.length - 1} aria-label="Aşağı">↓</button>
                <button type="button" onClick={() => removeBlock(b.cid)} aria-label="Sil" className="ed-del">✕</button>
              </div>

              {b.type === 'text' && (
                <div
                  className="ed-edit"
                  contentEditable
                  suppressContentEditableWarning
                  data-placeholder="Buraya yaz… (yukarıdaki çubukla biçimlendir)"
                  ref={(el) => setEditableRef(b.cid, el)}
                  onFocus={() => { activeCid.current = b.cid; }}
                  onKeyUp={saveSelection}
                  onMouseUp={saveSelection}
                  onBlur={saveSelection}
                />
              )}

              {b.type === 'image' && (
                <div className="ed-img">
                  {b.previewUrl || b.url
                    ? <img src={b.previewUrl || b.url} alt="" className="ed-img-prev" />
                    : <button type="button" className="ed-img-pick" onClick={() => { pendingImageCid.current = b.cid; imageInputRef.current?.click(); }}>＋ Görsel seç</button>}
                  {(b.previewUrl || b.url) && (
                    <div className="ed-img-fields">
                      <button type="button" className="ed-img-change" onClick={() => { pendingImageCid.current = b.cid; imageInputRef.current?.click(); }}>Değiştir</button>
                      <input placeholder="Alt metin (erişilebilirlik/SEO)" value={b.alt} onChange={(e) => patchBlock<ImageB>(b.cid, { alt: e.target.value })} />
                      <input placeholder="Açıklama (görselin altında)" value={b.caption} onChange={(e) => patchBlock<ImageB>(b.cid, { caption: e.target.value })} />
                    </div>
                  )}
                </div>
              )}

              {b.type === 'embed' && <EmbedEditor block={b} onChange={(patch) => patchBlock<EmbedB>(b.cid, patch)} />}
            </div>
          ))}
        </div>

        <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={(e) => { onImagePick(e.target.files?.[0]); if (imageInputRef.current) imageInputRef.current.value = ''; }} />

        {/* Blok ekleme */}
        <div className="ed-add">
          <button type="button" onClick={() => addBlock('text')}>＋ Metin</button>
          <button type="button" onClick={() => addBlock('image')}>＋ Görsel</button>
          <button type="button" onClick={() => addBlock('embed')}>＋ İnteraktif (kod)</button>
        </div>

        {/* Kaynakca */}
        <div className="ed-sources">
          <div className="ed-sources-h">📚 Kaynakça <span>(isteğe bağlı ama önerilir)</span></div>
          {sources.map((s, i) => (
            <div key={i} className="ed-source">
              <input placeholder="Başlık / kaynak adı" value={s.title} onChange={(e) => patchSource(i, { title: e.target.value })} />
              <input placeholder="Bağlantı (https://…)" value={s.url} onChange={(e) => patchSource(i, { url: e.target.value })} />
              <input placeholder="Yazar(lar)" value={s.authors} onChange={(e) => patchSource(i, { authors: e.target.value })} />
              <input placeholder="Yıl" value={s.year} onChange={(e) => patchSource(i, { year: e.target.value })} style={{ maxWidth: 90 }} />
              <button type="button" onClick={() => removeSource(i)} aria-label="Sil">✕</button>
            </div>
          ))}
          <button type="button" className="ed-source-add" onClick={addSource}>＋ Kaynak ekle</button>
        </div>

        {/* Gonder */}
        <button type="button" className="ed-submit" onClick={handleSubmit} disabled={submitting}>
          {submitting ? (progress || 'Gönderiliyor…') : (editing ? 'Güncelle ve incelemeye gönder' : 'İncelemeye gönder')}
        </button>
        <p className="ed-note">Makalen önce yöneticiler tarafından incelenir, sonra yayına girer. İnteraktif kod, ana siteden yalıtılmış güvenli bir kutuda (sandbox) çalışır.</p>
      </div>

      <style>{`
        .ed-main { min-height: 100vh; background: var(--color-bg); }
        .ed-wrap { max-width: 820px; margin: 0 auto; width: 100%; padding: 18px 16px 64px; display: flex; flex-direction: column; gap: 14px; }
        .ed-error { background: #fee2e2; color: #dc2626; padding: 10px 14px; border-radius: 12px; font-size: 0.88rem; }
        .ed-cover { width: 100%; aspect-ratio: 16/7; border: 2px dashed var(--color-border); border-radius: 16px; overflow: hidden; background: var(--color-surface); cursor: pointer; display: grid; place-items: center; padding: 0; }
        .ed-cover img { width: 100%; height: 100%; object-fit: cover; }
        .ed-cover-empty { color: var(--color-text-muted); font-weight: 600; font-size: 0.92rem; }
        .ed-title { border: none; border-bottom: 2px solid var(--color-border); background: transparent; font-size: 1.7rem; font-weight: 800; padding: 6px 2px; outline: none; color: var(--color-text); font-family: inherit; }
        .ed-title:focus { border-color: var(--color-primary); }
        .ed-summary { border: 1.5px solid var(--color-border); border-radius: 12px; padding: 10px 12px; font-size: 0.95rem; font-family: inherit; resize: vertical; outline: none; background: var(--color-surface); color: var(--color-text); }
        .ed-cat { border: 1.5px solid var(--color-border); border-radius: 10px; padding: 9px 12px; font-family: inherit; font-size: 0.9rem; background: var(--color-surface); color: var(--color-text); max-width: 280px; }

        .ed-toolbar { position: sticky; top: 0; z-index: 20; display: flex; flex-wrap: wrap; align-items: center; gap: 4px; padding: 8px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 12px; }
        .ed-toolbar > button { min-width: 32px; height: 32px; border: 1px solid var(--color-border); background: var(--color-bg); border-radius: 8px; cursor: pointer; font-size: 0.85rem; color: var(--color-text); padding: 0 7px; font-family: inherit; }
        .ed-toolbar > button:hover { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }
        .ed-sep { width: 1px; height: 22px; background: var(--color-border); margin: 0 3px; }
        .ed-font { height: 32px; border: 1px solid var(--color-border); border-radius: 8px; background: var(--color-bg); color: var(--color-text); font-size: 0.8rem; font-family: inherit; max-width: 130px; }
        .ed-swatches { display: inline-flex; align-items: center; gap: 2px; }
        .ed-swatch-label { font-size: 0.78rem; color: var(--color-text-muted); margin-right: 2px; }
        .ed-swatch { width: 17px; height: 17px; border-radius: 4px; border: 1px solid rgba(0,0,0,0.15); cursor: pointer; padding: 0; }
        .ed-swatch:hover { transform: scale(1.15); }

        .ed-blocks { display: flex; flex-direction: column; gap: 12px; }
        .ed-block { border: 1px solid var(--color-border); border-radius: 14px; overflow: hidden; background: var(--color-surface); }
        .ed-block-bar { display: flex; align-items: center; gap: 4px; padding: 6px 8px; background: var(--color-bg); border-bottom: 1px solid var(--color-border); }
        .ed-block-tag { font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted); }
        .ed-block-bar button { width: 26px; height: 26px; border: 1px solid var(--color-border); background: var(--color-surface); border-radius: 7px; cursor: pointer; color: var(--color-text); font-size: 0.8rem; }
        .ed-block-bar button:disabled { opacity: 0.35; cursor: default; }
        .ed-del:hover { background: #ef4444 !important; color: #fff; border-color: #ef4444 !important; }

        .ed-edit { min-height: 90px; padding: 12px 14px; outline: none; font-size: 1.02rem; line-height: 1.7; color: var(--color-text); }
        .ed-edit:empty:before { content: attr(data-placeholder); color: var(--color-text-muted); }
        .ed-edit h2 { font-size: 1.45rem; font-weight: 800; margin: 0.6rem 0 0.4rem; }
        .ed-edit h3 { font-size: 1.2rem; font-weight: 700; margin: 0.5rem 0 0.3rem; }
        .ed-edit blockquote { border-left: 3px solid var(--color-primary); margin: 0.6rem 0; padding-left: 0.8rem; color: var(--color-text-muted); }
        .ed-edit a { color: var(--color-primary); text-decoration: underline; }

        .ed-img { padding: 10px; }
        .ed-img-prev { width: 100%; border-radius: 10px; display: block; }
        .ed-img-pick { width: 100%; padding: 30px; border: 2px dashed var(--color-border); border-radius: 10px; background: var(--color-bg); cursor: pointer; color: var(--color-text-muted); font-weight: 600; }
        .ed-img-fields { display: flex; flex-direction: column; gap: 6px; margin-top: 8px; }
        .ed-img-fields input { border: 1px solid var(--color-border); border-radius: 8px; padding: 7px 10px; font-size: 0.85rem; font-family: inherit; background: var(--color-bg); color: var(--color-text); }
        .ed-img-change { align-self: flex-start; border: 1px solid var(--color-border); background: var(--color-bg); border-radius: 8px; padding: 5px 12px; cursor: pointer; font-size: 0.8rem; color: var(--color-text); }

        .ed-add { display: flex; gap: 8px; flex-wrap: wrap; }
        .ed-add button { flex: 1; min-width: 120px; padding: 12px; border: 1.5px dashed var(--color-border); border-radius: 12px; background: var(--color-surface); cursor: pointer; font-weight: 700; font-size: 0.9rem; color: var(--color-text); font-family: inherit; }
        .ed-add button:hover { border-color: var(--color-primary); color: var(--color-primary); }

        .ed-sources { border: 1px solid var(--color-border); border-radius: 14px; padding: 14px; background: var(--color-surface); display: flex; flex-direction: column; gap: 8px; }
        .ed-sources-h { font-weight: 800; font-size: 0.95rem; color: var(--color-text); }
        .ed-sources-h span { font-weight: 500; color: var(--color-text-muted); font-size: 0.8rem; }
        .ed-source { display: flex; gap: 6px; flex-wrap: wrap; }
        .ed-source input { flex: 1; min-width: 120px; border: 1px solid var(--color-border); border-radius: 8px; padding: 7px 10px; font-size: 0.84rem; font-family: inherit; background: var(--color-bg); color: var(--color-text); }
        .ed-source button { width: 32px; border: 1px solid var(--color-border); border-radius: 8px; background: var(--color-bg); cursor: pointer; color: var(--color-text); }
        .ed-source-add { align-self: flex-start; border: 1px dashed var(--color-border); background: transparent; border-radius: 9px; padding: 7px 14px; cursor: pointer; font-size: 0.85rem; color: var(--color-text-muted); font-weight: 600; }

        .ed-submit { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; font-weight: 800; font-size: 1rem; padding: 15px; border: none; border-radius: 14px; cursor: pointer; }
        .ed-submit:disabled { opacity: 0.7; cursor: default; }
        .ed-note { font-size: 0.78rem; color: var(--color-text-muted); text-align: center; margin: 0; line-height: 1.5; }

        @media (max-width: 480px) { .ed-wrap { padding: 14px 12px 64px; } .ed-title { font-size: 1.4rem; } }
      `}</style>
    </main>
  );
}

// ---- Interaktif blok editoru (HTML/CSS/JS + kutuphaneler + canli onizleme) ----
function EmbedEditor({ block, onChange }: { block: EmbedB; onChange: (patch: Partial<EmbedB>) => void }) {
  const [tab, setTab] = useState<'html' | 'css' | 'js'>('js');
  const [previewKey, setPreviewKey] = useState(0);
  const srcDoc = buildEmbedSrcDoc(block);

  function toggleLib(id: string) {
    onChange({ libs: block.libs.includes(id) ? block.libs.filter((x) => x !== id) : [...block.libs, id] });
  }

  return (
    <div className="emb">
      <div className="emb-libs">
        {Object.entries(EMBED_LIBS).map(([id, l]) => (
          <label key={id} className={`emb-lib ${block.libs.includes(id) ? 'on' : ''}`}>
            <input type="checkbox" checked={block.libs.includes(id)} onChange={() => toggleLib(id)} />
            {l.label}
          </label>
        ))}
      </div>
      <div className="emb-tabs">
        {(['html', 'css', 'js'] as const).map((t) => (
          <button key={t} type="button" className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t.toUpperCase()}</button>
        ))}
        <span style={{ flex: 1 }} />
        <label className="emb-h">Yükseklik
          <input type="number" min={LIMITS.embedHeightMin} max={LIMITS.embedHeightMax} value={block.height} onChange={(e) => onChange({ height: clampHeight(e.target.value) })} />
        </label>
      </div>
      <textarea
        className="emb-code"
        spellCheck={false}
        value={tab === 'html' ? block.html : tab === 'css' ? block.css : block.js}
        onChange={(e) => onChange(tab === 'html' ? { html: e.target.value } : tab === 'css' ? { css: e.target.value } : { js: e.target.value })}
        placeholder={tab === 'html' ? '<canvas id="c"></canvas>' : tab === 'css' ? '#c{width:100%}' : '// Three.js, GSAP… seçtiğin kütüphaneler hazır'}
        rows={8}
      />
      <input className="emb-cap" placeholder="Açıklama (isteğe bağlı)" value={block.caption} onChange={(e) => onChange({ caption: e.target.value })} />
      <div className="emb-prev-bar">
        <span>Önizleme (güvenli sandbox)</span>
        <button type="button" onClick={() => setPreviewKey((k) => k + 1)}>↻ Çalıştır</button>
      </div>
      <iframe key={previewKey} srcDoc={srcDoc} sandbox="allow-scripts" referrerPolicy="no-referrer" title="Önizleme" style={{ width: '100%', height: clampHeight(block.height), border: '1px solid var(--color-border)', borderRadius: 10, background: '#06070f', display: 'block' }} />
      <style>{`
        .emb { padding: 10px; display: flex; flex-direction: column; gap: 8px; }
        .emb-libs { display: flex; flex-wrap: wrap; gap: 6px; }
        .emb-lib { display: inline-flex; align-items: center; gap: 5px; font-size: 0.78rem; padding: 4px 9px; border: 1px solid var(--color-border); border-radius: 9999px; cursor: pointer; color: var(--color-text); }
        .emb-lib.on { background: color-mix(in srgb, var(--color-primary) 14%, transparent); border-color: var(--color-primary); color: var(--color-primary); }
        .emb-lib input { margin: 0; }
        .emb-tabs { display: flex; align-items: center; gap: 5px; }
        .emb-tabs > button { padding: 5px 12px; border: 1px solid var(--color-border); background: var(--color-bg); border-radius: 8px; cursor: pointer; font-size: 0.78rem; font-weight: 700; color: var(--color-text-muted); font-family: inherit; }
        .emb-tabs > button.on { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }
        .emb-h { font-size: 0.74rem; color: var(--color-text-muted); display: inline-flex; align-items: center; gap: 5px; }
        .emb-h input { width: 64px; border: 1px solid var(--color-border); border-radius: 7px; padding: 4px 6px; font-family: inherit; background: var(--color-bg); color: var(--color-text); }
        .emb-code { width: 100%; font-family: ui-monospace, "Space Mono", monospace; font-size: 0.82rem; line-height: 1.5; border: 1px solid var(--color-border); border-radius: 10px; padding: 10px 12px; background: #0c0e1d; color: #e9ecf8; resize: vertical; outline: none; }
        .emb-cap { border: 1px solid var(--color-border); border-radius: 8px; padding: 7px 10px; font-size: 0.84rem; font-family: inherit; background: var(--color-bg); color: var(--color-text); }
        .emb-prev-bar { display: flex; align-items: center; justify-content: space-between; font-size: 0.78rem; color: var(--color-text-muted); }
        .emb-prev-bar button { border: 1px solid var(--color-border); background: var(--color-bg); border-radius: 8px; padding: 4px 12px; cursor: pointer; font-weight: 700; color: var(--color-text); font-family: inherit; }
      `}</style>
    </div>
  );
}
