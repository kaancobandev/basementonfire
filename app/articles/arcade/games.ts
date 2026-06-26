// Arcade — "Jeton yutan efsaneler" (Şöhretler Galerisi) kartlarına tıklayınca
// oyunun bir modalda açılıp OYNANMASINI sağlar. İlk oyun: ASTEROIDS (1979).
//
// Tasarım: content.ts'teki dev tek-satır string'lere DOKUNMADAN, bağımsız bir
// modül olarak page.tsx'te enjekte edilir. Kendi loop/ses/girdi altyapısı var
// (mevcut IIFE içindeki yardımcılara bağımlı değil). Yeni oyunlar GAMES kaydına
// eklenerek büyütülebilir. Pencere/dokuman dinleyicileri SENKRON init'te eklenir
// → ArticleRuntime SPA gezinmesinde otomatik temizler; rAF de izlenir.

export const GAME_CSS = `
/* Oynanabilir fame kartı */
.arc-root .fame .f.f-playable{ cursor:pointer; position:relative; transition:transform .12s ease, border-color .15s ease, box-shadow .15s ease; outline:none; }
.arc-root .fame .f.f-playable:hover, .arc-root .fame .f.f-playable:focus-visible{ transform:translateY(-3px); border-color:var(--pink); box-shadow:0 0 0 1px rgba(255,46,136,.5), 0 10px 26px rgba(255,46,136,.22); }
.arc-root .fame .f.f-playable .f-play{
  position:absolute; top:8px; right:8px; display:inline-flex; align-items:center; gap:5px;
  font-family:var(--pix); font-size:.42rem; letter-spacing:.06em; color:#0b0712;
  background:var(--pink); padding:5px 7px; border-radius:5px; line-height:1;
  box-shadow:0 2px 10px rgba(255,46,136,.5); animation:gx-badge 1.6s ease-in-out infinite;
}
@keyframes gx-badge{ 0%,100%{ transform:translateY(0); } 50%{ transform:translateY(-2px); } }
html.reduced .arc-root .fame .f.f-playable .f-play{ animation:none; }

/* Oyun modalı */
.arc-root .gx-overlay{ position:fixed; inset:0; z-index:1000; display:none; align-items:center; justify-content:center; padding:16px;
  background:rgba(4,2,10,.86); backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px); }
.arc-root .gx-overlay.open{ display:flex; }
.arc-root .gx-modal{ width:min(760px,100%); max-height:96vh; display:flex; flex-direction:column; gap:12px;
  background:linear-gradient(180deg,#160d28,#0d0719); border:1px solid var(--line); border-radius:16px; padding:16px;
  box-shadow:0 0 0 1px rgba(255,46,136,.18), 0 30px 80px rgba(0,0,0,.6); animation:gx-pop .22s ease; }
@keyframes gx-pop{ from{ transform:scale(.94); opacity:0; } to{ transform:scale(1); opacity:1; } }
html.reduced .arc-root .gx-modal{ animation:none; }
.arc-root .gx-bar{ display:flex; align-items:center; justify-content:space-between; gap:12px; }
.arc-root .gx-title{ font-family:var(--pix); font-size:.74rem; letter-spacing:.04em; color:var(--cyan); }
.arc-root .gx-close{ font-family:var(--pix); font-size:.7rem; color:var(--ink); background:rgba(255,255,255,.06);
  border:1px solid var(--line); border-radius:8px; width:34px; height:34px; cursor:pointer; line-height:1; }
.arc-root .gx-close:hover{ background:var(--pink); color:#0b0712; border-color:var(--pink); }
.arc-root .gx-screen{ position:relative; background:#05030c; border:1px solid var(--line); border-radius:10px; overflow:hidden; }
.arc-root .gx-canvas{ display:block; width:100%; height:auto; max-height:60vh; touch-action:none; image-rendering:auto; }
.arc-root .gx-hint{ text-align:center; font-size:.78rem; color:var(--dim); }
.arc-root .gx-hint b{ color:var(--ink); }
.arc-root .gx-controls{ display:flex; align-items:center; justify-content:center; gap:12px; flex-wrap:wrap; }
.arc-root .gx-btn{ font-family:var(--pix); font-size:.8rem; color:var(--ink); background:rgba(255,255,255,.05);
  border:1px solid var(--line); border-radius:12px; min-width:58px; height:54px; cursor:pointer; user-select:none;
  -webkit-user-select:none; display:inline-flex; align-items:center; justify-content:center; touch-action:none; }
.arc-root .gx-btn.on{ background:var(--pink); color:#0b0712; border-color:var(--pink); transform:translateY(1px); }
.arc-root .gx-btn.gx-fire{ min-width:74px; color:var(--pink); }
.arc-root .gx-btn.gx-fire.on{ color:#0b0712; }
@media (min-width:760px){ .arc-root .gx-controls{ display:none; } /* masaüstü: klavye yeter */ }
`;

export const GAME_JS = `
;(function(){
  if (typeof document === 'undefined') return;
  var root = document.querySelector('.arc-root'); if(!root) return;
  var TAU = Math.PI*2;

  /* ---- ses (kendi AudioContext'i; gezinmede kapanır) ---- */
  var AC=null, SOUND=true;
  function ac(){ if(AC) return AC; try{ AC=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} return AC; }
  function beep(freq,dur,type,vol){ if(!SOUND) return; var a=ac(); if(!a) return; try{ if(a.state==='suspended')a.resume();
    var o=a.createOscillator(), g=a.createGain(); o.type=type||'square'; o.frequency.value=freq; var v=vol||0.03;
    o.connect(g); g.connect(a.destination); var t=a.currentTime; o.start(t); g.gain.setValueAtTime(v,t);
    g.gain.exponentialRampToValueAtTime(0.0001, t+(dur||0.1)); o.stop(t+(dur||0.1)+0.02); }catch(e){} }
  var prevCleanup = window.__articleCleanup;
  window.__articleCleanup = function(){ try{ if(prevCleanup) prevCleanup(); }catch(e){} try{ if(AC&&AC.close) AC.close(); }catch(e){} };

  /* ---- rAF loop (ArticleRuntime rAF'i izler → gezinmede iptal) ---- */
  function makeLoop(step){ var raf=null,last=0,run=false;
    function fr(ts){ if(!run) return; if(!last)last=ts; var dt=ts-last; last=ts; if(dt>50)dt=50; step(dt/16.6667); raf=requestAnimationFrame(fr); }
    return { start:function(){ if(run)return; run=true; last=0; raf=requestAnimationFrame(fr); },
             stop:function(){ run=false; if(raf)cancelAnimationFrame(raf); raf=null; } };
  }

  /* ---- modal (bir kez kurulur, .arc-root içine; gezinmede React kaldırır) ---- */
  var overlay,titleEl,canvas,ctx,ctrlEl,hintEl, current=null;
  function isOpen(){ return overlay && overlay.classList.contains('open'); }
  function buildModal(){
    overlay=document.createElement('div'); overlay.className='gx-overlay'; overlay.setAttribute('aria-hidden','true');
    overlay.innerHTML='<div class="gx-modal" role="dialog" aria-modal="true">'
      +'<div class="gx-bar"><span class="gx-title"></span><button class="gx-close" aria-label="Kapat">\\u2715</button></div>'
      +'<div class="gx-screen"><canvas class="gx-canvas" width="720" height="540"></canvas></div>'
      +'<div class="gx-hint"></div><div class="gx-controls"></div></div>';
    root.appendChild(overlay);
    titleEl=overlay.querySelector('.gx-title'); canvas=overlay.querySelector('.gx-canvas');
    ctx=canvas.getContext('2d'); ctrlEl=overlay.querySelector('.gx-controls'); hintEl=overlay.querySelector('.gx-hint');
    overlay.querySelector('.gx-close').addEventListener('click', closeModal);
    overlay.addEventListener('mousedown', function(e){ if(e.target===overlay) closeModal(); });
    // dokunmatik kontrol delegasyonu (modal düğmeleri)
    ctrlEl.addEventListener('pointerdown', function(e){ var b=e.target.closest('.gx-btn'); if(!b) return;
      if(e.cancelable)e.preventDefault(); b.classList.add('on'); if(current&&current.down) current.down(b.getAttribute('data-act')); });
  }
  function openModal(title){ if(!overlay) buildModal(); titleEl.textContent=title;
    overlay.classList.add('open'); overlay.setAttribute('aria-hidden','false');
    document.documentElement.style.overflow='hidden'; var a=ac(); if(a&&a.state==='suspended')a.resume(); }
  function closeModal(){ if(!overlay) return; if(current&&current.stop) current.stop(); current=null;
    overlay.classList.remove('open'); overlay.setAttribute('aria-hidden','true'); document.documentElement.style.overflow='';
    if(ctrlEl) ctrlEl.innerHTML=''; }

  /* ---- global girdi (SENKRON init → ArticleRuntime temizler), modal açıkken aktif ---- */
  window.addEventListener('keydown', function(e){ if(!isOpen()) return;
    if(e.key==='Escape'){ closeModal(); return; } if(current&&current.key) current.key(e,true); });
  window.addEventListener('keyup', function(e){ if(!isOpen()) return; if(current&&current.key) current.key(e,false); });
  window.addEventListener('pointerup', function(){ if(!isOpen()) return;
    if(ctrlEl){ var ons=ctrlEl.querySelectorAll('.gx-btn.on'); for(var i=0;i<ons.length;i++) ons[i].classList.remove('on'); }
    if(current&&current.up) current.up(); });

  function mkBtn(act,label,cls){ var b=document.createElement('button'); b.className='gx-btn '+(cls||'');
    b.setAttribute('data-act',act); b.setAttribute('aria-label',act); b.innerHTML=label; ctrlEl.appendChild(b); return b; }

  /* =====================================================
     ASTEROIDS (1979) — vektör grafik selamı
  ===================================================== */
  function startAsteroids(){
    var W=canvas.width, H=canvas.height;
    var ROT=0.072, ACC=0.16, FRIC=0.992, MAXV=7.2, BSPD=8.4, BLIFE=52, FCD=8;
    var ship, bullets, rocks, score, lives, level, started, over, paused, inv, fcd, t, hi;
    try{ hi=parseInt(localStorage.getItem('arc_ast_hi')||'0',10)||0; }catch(e){ hi=0; }
    var ctl={left:false,right:false,thrust:false,fire:false};

    hintEl.innerHTML='<b>\\u2190 \\u2192</b> d\\u00f6n \\u00b7 <b>\\u2191</b> it \\u00b7 <b>bo\\u015fluk</b> ate\\u015f \\u00b7 <b>P</b> duraklat \\u00b7 <b>Esc</b> \\u00e7\\u0131k';
    ctrlEl.innerHTML=''; mkBtn('left','\\u25C4','gx-dir'); mkBtn('thrust','\\u25B2','gx-dir'); mkBtn('right','\\u25BA','gx-dir'); mkBtn('fire','\\u25CF FIRE','gx-fire');

    function safePos(){ var x,y,tries=0; do{ x=Math.random()*W; y=Math.random()*H; tries++; } while(tries<40 && ship && Math.hypot(x-ship.x,y-ship.y)<160); return {x:x,y:y}; }
    function makeRock(x,y,r){ var k=9+((Math.random()*4)|0), verts=[]; for(var i=0;i<k;i++) verts.push(0.66+Math.random()*0.5);
      var sp=(0.5+Math.random()*0.7)*(r<18?2.0:(r<30?1.4:0.85)), dir=Math.random()*TAU;
      return {x:x,y:y,r:r,vx:Math.cos(dir)*sp,vy:Math.sin(dir)*sp,verts:verts,rot:Math.random()*TAU,vr:(Math.random()-0.5)*0.04}; }
    function spawnLevel(){ rocks=[]; var n=3+level; for(var i=0;i<n;i++){ var p=safePos(); rocks.push(makeRock(p.x,p.y,42)); } }
    function reset(){ ship={x:W/2,y:H/2,a:-Math.PI/2,vx:0,vy:0}; bullets=[]; score=0; lives=3; level=1; over=false; paused=false; inv=100; fcd=0; t=0; spawnLevel(); }
    function ensureStart(){ if(!started){ started=true; } else if(over){ reset(); started=true; } }
    function fire(){ if(!started||over||paused) return; if(fcd>0||bullets.length>=5) return;
      var nx=Math.cos(ship.a), ny=Math.sin(ship.a);
      bullets.push({x:ship.x+nx*15,y:ship.y+ny*15,vx:nx*BSPD+ship.vx*0.4,vy:ny*BSPD+ship.vy*0.4,life:BLIFE}); fcd=FCD; beep(880,0.04,'square',0.03); }
    function loseLife(){ lives--; beep(120,0.3,'sawtooth',0.05); if(lives<=0){ over=true;
        if(score>hi){ hi=score; try{ localStorage.setItem('arc_ast_hi',String(hi)); }catch(e){} } }
      else { ship.x=W/2; ship.y=H/2; ship.vx=0; ship.vy=0; ship.a=-Math.PI/2; inv=110; } }
    function splitRock(idx){ var r=rocks[idx]; score+=(r.r>30?20:(r.r>18?50:100)); beep(r.r>30?180:(r.r>18?300:520),0.08,'square',0.035);
      rocks.splice(idx,1); if(r.r>18){ var nr=(r.r>30?24:13); rocks.push(makeRock(r.x,r.y,nr)); rocks.push(makeRock(r.x,r.y,nr)); }
      if(rocks.length===0){ level++; inv=90; spawnLevel(); beep(660,0.12,'square',0.04); } }

    function wrap(o){ if(o.x<0)o.x+=W; else if(o.x>W)o.x-=W; if(o.y<0)o.y+=H; else if(o.y>H)o.y-=H; }

    function update(s){
      t+=s; if(fcd>0) fcd-=s; if(inv>0) inv-=s;
      if(!started||over||paused) return;
      if(ctl.left) ship.a-=ROT*s; if(ctl.right) ship.a+=ROT*s;
      if(ctl.thrust){ ship.vx+=Math.cos(ship.a)*ACC*s; ship.vy+=Math.sin(ship.a)*ACC*s; if((t|0)%6===0) beep(70,0.04,'sawtooth',0.02); }
      ship.vx*=Math.pow(FRIC,s); ship.vy*=Math.pow(FRIC,s);
      var v=Math.hypot(ship.vx,ship.vy); if(v>MAXV){ ship.vx*=MAXV/v; ship.vy*=MAXV/v; }
      ship.x+=ship.vx*s; ship.y+=ship.vy*s; wrap(ship);
      if(ctl.fire && fcd<=0) fire();
      for(var i=bullets.length-1;i>=0;i--){ var b=bullets[i]; b.x+=b.vx*s; b.y+=b.vy*s; b.life-=s; wrap(b); if(b.life<=0) bullets.splice(i,1); }
      for(var j=0;j<rocks.length;j++){ var r=rocks[j]; r.x+=r.vx*s; r.y+=r.vy*s; r.rot+=r.vr*s; wrap(r); }
      // mermi-kaya
      for(var bi=bullets.length-1;bi>=0;bi--){ var bb=bullets[bi]; for(var ri=0;ri<rocks.length;ri++){ var rr=rocks[ri];
        if(Math.hypot(bb.x-rr.x,bb.y-rr.y)<rr.r){ bullets.splice(bi,1); splitRock(ri); break; } } }
      // gemi-kaya
      if(inv<=0){ for(var k=0;k<rocks.length;k++){ var rk=rocks[k]; if(Math.hypot(ship.x-rk.x,ship.y-rk.y)<rk.r+9){ loseLife(); break; } } }
    }

    function ctext(s,y,size,col){ ctx.fillStyle=col; ctx.font=size+'px "Press Start 2P", monospace'; ctx.textAlign='center'; ctx.fillText(s,W/2,y); }
    function drawShipAt(x,y,a,sc,col){ ctx.save(); ctx.translate(x,y); ctx.rotate(a); ctx.scale(sc,sc);
      ctx.strokeStyle=col; ctx.lineWidth=2/sc; ctx.lineJoin='round'; ctx.beginPath();
      ctx.moveTo(15,0); ctx.lineTo(-11,-9); ctx.lineTo(-6,0); ctx.lineTo(-11,9); ctx.closePath(); ctx.stroke(); ctx.restore(); }
    function draw(){
      ctx.fillStyle='#05030c'; ctx.fillRect(0,0,W,H);
      ctx.save(); ctx.shadowColor='#a274ff'; ctx.shadowBlur=6;
      for(var j=0;j<rocks.length;j++){ var r=rocks[j]; ctx.save(); ctx.translate(r.x,r.y); ctx.rotate(r.rot);
        ctx.strokeStyle='#cabfe8'; ctx.lineWidth=2; ctx.beginPath();
        for(var i=0;i<r.verts.length;i++){ var ang=(i/r.verts.length)*TAU, rad=r.r*r.verts[i], px=Math.cos(ang)*rad, py=Math.sin(ang)*rad; if(i===0)ctx.moveTo(px,py); else ctx.lineTo(px,py); }
        ctx.closePath(); ctx.stroke(); ctx.restore(); }
      ctx.shadowColor='#2ce6e6'; ctx.fillStyle='#9af6ff';
      for(var bi=0;bi<bullets.length;bi++){ ctx.beginPath(); ctx.arc(bullets[bi].x,bullets[bi].y,2.4,0,TAU); ctx.fill(); }
      if(started && !over && !(inv>0 && (Math.floor(t/4)%2))){
        ctx.shadowColor='#2ce6e6'; ctx.shadowBlur=8; drawShipAt(ship.x,ship.y,ship.a,1,'#f4ecff');
        if(ctl.thrust && (Math.floor(t)%3)){ ctx.save(); ctx.translate(ship.x,ship.y); ctx.rotate(ship.a);
          ctx.strokeStyle='#ff2e88'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(-6,0); ctx.lineTo(-17,-4); ctx.lineTo(-13,0); ctx.lineTo(-17,4); ctx.closePath(); ctx.stroke(); ctx.restore(); } }
      ctx.restore();
      // HUD
      ctx.shadowBlur=0; ctx.fillStyle='#2ce6e6'; ctx.font='16px "Press Start 2P", monospace'; ctx.textAlign='left'; ctx.fillText(String(score),16,30);
      ctx.fillStyle='#b09ad6'; ctx.font='9px "Press Start 2P", monospace'; ctx.fillText('HI '+hi,16,46);
      for(var li=0;li<lives;li++){ drawShipAt(W-22-li*22,24,-Math.PI/2,0.8,'#36ff9e'); }
      if(!started){ ctext('ASTEROIDS',H/2-26,22,'#f4ecff'); ctext('PRESS START',H/2+8,13,'#2ce6e6'); ctext('ate\\u015f / dokun',H/2+30,9,'#6b5a91'); }
      else if(over){ ctext('GAME OVER',H/2-10,20,'#ff5a6e'); ctext('tekrar i\\u00e7in ate\\u015f',H/2+18,10,'#9dffd0'); }
      else if(paused){ ctext('DURAKLATILDI',H/2,15,'#ffd23f'); }
    }

    function key(e,d){ var k=e.key;
      if(k==='ArrowLeft'||k==='a'||k==='A'){ ctl.left=d; e.preventDefault(); }
      else if(k==='ArrowRight'||k==='d'||k==='D'){ ctl.right=d; e.preventDefault(); }
      else if(k==='ArrowUp'||k==='w'||k==='W'){ ctl.thrust=d; e.preventDefault(); }
      else if(k===' '){ if(d){ if(!started||over) ensureStart(); else { ctl.fire=true; fire(); } } else { ctl.fire=false; } e.preventDefault(); }
      else if(d && (k==='p'||k==='P')){ if(started&&!over) paused=!paused; }
      else if(d && k==='Enter'){ if(!started||over) ensureStart(); } }
    function down(act){ ensureStart(); if(act==='fire'){ ctl.fire=true; fire(); } else { ctl[act]=true; } }
    function up(){ ctl.left=ctl.right=ctl.thrust=ctl.fire=false; }

    reset();
    var loop=makeLoop(function(s){ update(s); draw(); }); loop.start();
    return { stop:function(){ loop.stop(); }, key:key, down:down, up:up };
  }

  /* ---- oyun kaydı + fame kartlarını bağla ---- */
  var GAMES = { 'Asteroids': { title:'ASTEROIDS \\u00b7 1979', start:startAsteroids } };
  var cards = root.querySelectorAll('.fame .f');
  for(var i=0;i<cards.length;i++){ (function(card){
    var nEl=card.querySelector('.n'); if(!nEl) return; var g=GAMES[nEl.textContent.trim()]; if(!g) return;
    card.classList.add('f-playable'); card.setAttribute('role','button'); card.setAttribute('tabindex','0');
    var badge=document.createElement('div'); badge.className='f-play'; badge.innerHTML='\\u25B6 OYNA'; card.appendChild(badge);
    function launch(){ openModal(g.title); current=g.start(); }
    card.addEventListener('click', launch);
    card.addEventListener('keydown', function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); launch(); } });
  })(cards[i]); }
})();
`;
