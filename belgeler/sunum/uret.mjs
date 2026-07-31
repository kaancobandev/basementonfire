// BTM sunumu üretici: içerik → HTML → Chrome print-to-PDF (orijinaliyle aynı yol).
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { TR, EN } from './icerik.mjs';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9270;
const LOGO = 'C:/Users/Kaan/Desktop/Kaan/basements-nextjs/public/brand/logo-512.png';
const CIKTI = 'C:/Users/Kaan/Desktop';
const PROFILE = path.join(process.env.TEMP, 'bof-deck');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const logoB64 = 'data:image/png;base64,' + fs.readFileSync(LOGO).toString('base64');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ── Slayt gövdeleri ────────────────────────────────────────────────────────
function kapak(s) {
  return `<section class="slide cover">
    <div class="glow"></div>
    <div class="brand"><img src="${logoB64}" alt=""><span>Basementonfire</span></div>
    <div class="badge">${esc(s.rozet)}</div>
    <h1>${s.baslik.map((l, i) => i === s.vurgu ? `<span class="am">${esc(l)}</span>` : esc(l)).join('<br>')}</h1>
    <p class="lede">${esc(s.alt)}</p>
    <div class="rule"></div>
    <div class="meta">${s.meta.map(([k, v]) => `<div><b>${esc(k)}</b><span>${esc(v)}</span></div>`).join('')}</div>
  </section>`;
}

function bas(s) {
  return `<div class="label"><i></i>${esc(s.etiket)}</div>
    <h2>${esc(s.baslik)}</h2>
    ${s.alt ? `<p class="sub">${esc(s.alt)}</p>` : ''}`;
}

function maddeler(s) {
  return `<section class="slide">${bas(s)}
    <div class="cards ${s.maddeler.length > 3 ? 'c4' : 'c3'}">
      ${s.maddeler.map(([b, m]) => `<div class="card"><b>${esc(b)}</b><p>${esc(m)}</p></div>`).join('')}
    </div>
    ${s.not ? `<div class="note">${esc(s.not)}</div>` : ''}</section>`;
}

function sayi(s) {
  return `<section class="slide">${bas(s)}
    <div class="statrow">
      <div class="statbox"><b>${esc(s.sayi)}</b><span>${esc(s.sayiAlt)}</span></div>
      <p class="statbody">${esc(s.govde)}</p>
    </div>
    ${s.not ? `<div class="note">${esc(s.not)}</div>` : ''}</section>`;
}

function tablo(s, dar) {
  const bosBaslik = s.basliklar.every((h) => !h);
  return `<section class="slide">${bas(s)}
    <table class="${dar ? 'tight' : ''}">
      ${bosBaslik ? '' : `<thead><tr>${s.basliklar.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead>`}
      <tbody>${s.satirlar.map((r, i) => `<tr class="${i === s.satirlar.length - 1 && dar ? 'hi' : ''}">${
        r.map((c, j) => `<td class="${j === 0 ? 'k' : ''}">${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>
    ${s.not ? `<div class="note">${esc(s.not)}</div>` : ''}</section>`;
}

function zaman(s) {
  return `<section class="slide">${bas(s)}
    <div class="tl">${s.adimlar.map(([t, m]) => `<div class="tlrow"><b>${esc(t)}</b><p>${esc(m)}</p></div>`).join('')}</div>
    ${s.not ? `<div class="note">${esc(s.not)}</div>` : ''}</section>`;
}

function kapanis(s) {
  return `<section class="slide cover close">
    <div class="glow"></div>
    <div class="brand"><img src="${logoB64}" alt=""><span>Basementonfire</span></div>
    <h1 class="sm">${esc(s.baslik)}</h1>
    <p class="lede">${esc(s.alt)}</p>
    <div class="link">${esc(s.link)}</div>
    <div class="rule"></div>
    <div class="meta">${s.meta.map(([k, v]) => `<div><b>${esc(k)}</b><span>${esc(v)}</span></div>`).join('')}</div>
  </section>`;
}

function slayt(s) {
  switch (s.tip) {
    case 'cover': return kapak(s);
    case 'bullets': return maddeler(s);
    case 'stat': return sayi(s);
    case 'table': return tablo(s, false);
    case 'quadrant': return tablo(s, true);
    case 'timeline': return zaman(s);
    case 'closing': return kapanis(s);
    default: return '';
  }
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=DM+Sans:wght@400;500;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
:root{--ind:#5b2eef;--am:#ff9d0a;--ink:#0f1419;--gri:#5b6472;--lav:#f3f1fe;--cizgi:#e6e3f7}
html,body{background:#fff}
body{font-family:'DM Sans',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.slide{width:1280px;height:720px;padding:64px 76px;position:relative;overflow:hidden;
  page-break-after:always;break-after:page;display:flex;flex-direction:column;background:#fff}
.slide:last-child{page-break-after:auto;break-after:auto}
h1,h2,.statbox b{font-family:'Bricolage Grotesque',system-ui,sans-serif;letter-spacing:-.02em}

/* ── kapak ── */
.cover{background:radial-gradient(120% 130% at 72% 18%,#3a1e9e 0%,#231552 46%,#150e2e 100%);color:#fff;justify-content:center}
.cover .glow{position:absolute;right:-140px;top:-160px;width:620px;height:620px;border-radius:50%;
  background:radial-gradient(circle,rgba(245,40,142,.34),transparent 62%)}
.brand{position:absolute;top:56px;left:76px;display:flex;align-items:center;gap:14px}
.brand img{width:42px;height:42px}
.brand span{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:25px}
.badge{display:inline-block;align-self:flex-start;border:1px solid rgba(255,255,255,.26);
  background:rgba(255,255,255,.07);border-radius:99px;padding:9px 22px;font-size:15px;color:#d9d3f5;margin-bottom:26px}
.cover h1{font-size:78px;line-height:1.02;font-weight:800}
.cover h1.sm{font-size:54px;max-width:1000px}
.am{color:var(--am)}
.lede{margin-top:26px;font-size:21px;line-height:1.5;color:#cfc9ea;max-width:830px}
.link{margin-top:22px;font-size:22px;font-weight:700;color:var(--am)}
.rule{height:1px;background:rgba(255,255,255,.2);margin:38px 0 24px}
.meta{display:flex;gap:64px}
.meta b{display:block;font-size:11px;letter-spacing:.16em;color:#a79ed6;font-weight:500;margin-bottom:7px}
.meta span{font-size:17px;font-weight:700}

/* ── içerik ── */
.label{display:flex;align-items:center;gap:11px;font-size:13px;font-weight:700;
  letter-spacing:.16em;color:var(--ind);margin-bottom:16px}
.label i{width:26px;height:3px;background:var(--am);border-radius:2px}
h2{font-size:47px;line-height:1.08;font-weight:800;color:var(--ink)}
.sub{margin-top:16px;font-size:19px;line-height:1.52;color:var(--gri);max-width:1010px}
.cards{display:grid;gap:16px;margin-top:34px}
.cards.c3{grid-template-columns:repeat(3,1fr)}
.cards.c4{grid-template-columns:repeat(2,1fr)}
.card{background:var(--lav);border:1px solid var(--cizgi);border-radius:15px;padding:22px 24px}
.card b{display:block;font-size:18px;color:var(--ink);margin-bottom:9px}
.card p{font-size:15.5px;line-height:1.5;color:var(--gri)}
.note{margin-top:auto;background:#faf9ff;border-left:3px solid var(--ind);border-radius:0 11px 11px 0;
  padding:15px 20px;font-size:15px;line-height:1.5;color:#3d4452}

/* ── sayı ── */
.statrow{display:flex;gap:44px;align-items:center;margin-top:38px}
.statbox{background:var(--lav);border:1px solid var(--cizgi);border-radius:18px;padding:34px 44px;text-align:center;flex:0 0 auto}
.statbox b{display:block;font-size:76px;line-height:1;color:var(--ind);font-weight:800;font-variant-numeric:tabular-nums}
.statbox span{display:block;margin-top:12px;font-size:14px;color:var(--gri);max-width:250px}
.statbody{font-size:19px;line-height:1.58;color:#333a46}

/* ── tablo ── */
table{width:100%;border-collapse:collapse;margin-top:30px;font-size:16px}
th{text-align:left;font-size:12px;letter-spacing:.1em;color:var(--ind);font-weight:700;
  padding:0 14px 11px;border-bottom:2px solid var(--cizgi)}
td{padding:13px 14px;border-bottom:1px solid #eceaf6;color:var(--gri);line-height:1.42;vertical-align:top}
td.k{color:var(--ink);font-weight:700}
table.tight{font-size:16.5px}
table.tight td{text-align:center}
table.tight td.k{text-align:left}
tr.hi td{background:var(--lav);color:var(--ind);font-weight:700}
tr.hi td.k{color:var(--ind)}

/* ── zaman çizelgesi ── */
.tl{margin-top:34px;display:flex;flex-direction:column;gap:14px}
.tlrow{display:flex;gap:26px;align-items:flex-start;background:var(--lav);border:1px solid var(--cizgi);
  border-radius:15px;padding:20px 24px}
.tlrow b{flex:0 0 145px;font-size:17px;color:var(--ind)}
.tlrow p{font-size:16px;line-height:1.5;color:var(--gri)}

/* ── altbilgi ── */
.foot{position:absolute;left:76px;right:76px;bottom:34px;display:flex;justify-content:space-between;
  font-size:12.5px;color:#9aa1ae;border-top:1px solid #eeecf7;padding-top:13px}
.foot b{color:var(--ind);font-weight:700}
.cover .foot{display:none}
`;

function html(D) {
  const govde = D.slaytlar.map((s, i) => {
    const h = slayt(s);
    if (s.tip === 'cover' || s.tip === 'closing') return h;
    const no = String(i + 1).padStart(2, '0');
    return h.replace('</section>', `<div class="foot"><span><b>Basementonfire</b> · ${esc(D.altbilgi.split('·')[1].trim())}</span><span>${no}</span></div></section>`);
  }).join('\n');
  return `<!doctype html><html lang="${D.dil}"><head><meta charset="utf-8">
<title>Basementonfire — BTM</title><style>${CSS}</style></head><body>${govde}</body></html>`;
}

// ── Chrome ile PDF ─────────────────────────────────────────────────────────
async function cdpUrl() {
  for (let i = 0; i < 40; i++) {
    try { const r = await fetch(`http://127.0.0.1:${PORT}/json/version`); return (await r.json()).webSocketDebuggerUrl; }
    catch { await sleep(250); }
  }
  throw new Error('Chrome açılmadı');
}
function client(ws) {
  let id = 0; const bek = new Map();
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    if (m.id && bek.has(m.id)) { const { res, rej } = bek.get(m.id); bek.delete(m.id);
      m.error ? rej(new Error(m.error.message)) : res(m.result); }
  });
  return (method, params = {}, sessionId) => new Promise((res, rej) => {
    const i = ++id; bek.set(i, { res, rej });
    ws.send(JSON.stringify({ id: i, method, params, ...(sessionId ? { sessionId } : {}) }));
  });
}

const isler = [
  { D: TR, htmlDosya: path.join(PROFILE, 'deck-tr.html'), pdf: path.join(CIKTI, 'basementonfire-btm-sunum-TR.pdf') },
  { D: EN, htmlDosya: path.join(PROFILE, 'deck-en.html'), pdf: path.join(CIKTI, 'basementonfire-btm-deck-EN.pdf') },
];
fs.mkdirSync(PROFILE, { recursive: true });
for (const j of isler) fs.writeFileSync(j.htmlDosya, html(j.D), 'utf8');

const chrome = spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${path.join(PROFILE, 'prof')}`,
  '--no-first-run', '--font-render-hinting=none', 'about:blank',
], { stdio: 'ignore' });

try {
  const ws = new WebSocket(await cdpUrl());
  await new Promise((r) => ws.addEventListener('open', r, { once: true }));
  const send = client(ws);

  for (const j of isler) {
    const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
    await send('Page.enable', {}, sessionId);
    await send('Page.navigate', { url: 'file:///' + j.htmlDosya.replace(/\\/g, '/') }, sessionId);
    await sleep(6500);   // font indirilsin
    const { data } = await send('Page.printToPDF', {
      printBackground: true, paperWidth: 13.3333, paperHeight: 7.5,
      marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0, scale: 1,
    }, sessionId);
    fs.writeFileSync(j.pdf, Buffer.from(data, 'base64'));
    console.log(`${path.basename(j.pdf)}  ${j.D.slaytlar.length} slayt  ${(fs.statSync(j.pdf).size / 1024).toFixed(0)} KB`);
    await send('Target.closeTarget', { targetId });
  }
  ws.close();
} finally { chrome.kill(); }
