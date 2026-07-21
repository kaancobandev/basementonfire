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
/* Skor panosu (game_scores liderlik tablosu) */
.arc-root .gx-board{ border-top:1px solid var(--line); padding-top:10px; display:flex; flex-direction:column; gap:4px; max-height:180px; overflow-y:auto; }
.arc-root .gx-board-t{ font-family:var(--pix); font-size:.55rem; letter-spacing:.08em; color:var(--cyan,#2ce6e6); margin-bottom:4px; text-align:center; }
.arc-root .gx-board-row{ display:flex; align-items:center; gap:10px; font-size:.82rem; color:var(--ink,#f4ecff); padding:2px 6px; }
.arc-root .gx-board-rank{ font-family:var(--pix); font-size:.55rem; color:var(--dim); width:18px; text-align:right; }
.arc-root .gx-board-name{ flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.arc-root .gx-board-sc{ font-family:var(--pix); font-size:.6rem; color:#36ff9e; }
.arc-root .gx-send{ display:flex; align-items:center; gap:8px; padding:4px 6px 8px; flex-wrap:wrap; }
.arc-root .gx-send-sc{ font-family:var(--pix); font-size:.6rem; color:#ffd23f; }
.arc-root .gx-send-name{ flex:1; min-width:110px; background:rgba(255,255,255,.06); border:1px solid var(--line); border-radius:6px; color:var(--ink,#f4ecff); font-size:.85rem; padding:6px 9px; outline:none; }
.arc-root .gx-send-name:focus{ border-color:var(--pink,#ff2e88); }
.arc-root .gx-send-btn{ font-family:var(--pix); font-size:.5rem; letter-spacing:.05em; color:#0b0712; background:#36ff9e; border:none; border-radius:6px; padding:8px 10px; cursor:pointer; }
.arc-root .gx-send-btn:disabled{ opacity:.6; cursor:default; }
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
  var overlay,titleEl,canvas,ctx,ctrlEl,hintEl,boardEl=null,curKey=null, current=null;
  function isOpen(){ return overlay && overlay.classList.contains('open'); }
  function buildModal(){
    overlay=document.createElement('div'); overlay.className='gx-overlay'; overlay.setAttribute('aria-hidden','true');
    overlay.innerHTML='<div class="gx-modal" role="dialog" aria-modal="true">'
      +'<div class="gx-bar"><span class="gx-title"></span><button class="gx-close" aria-label="Kapat">\\u2715</button></div>'
      +'<div class="gx-screen"><canvas class="gx-canvas" width="720" height="540"></canvas></div>'
      +'<div class="gx-hint"></div><div class="gx-controls"></div><div class="gx-board" hidden></div></div>';
    root.appendChild(overlay);
    titleEl=overlay.querySelector('.gx-title'); canvas=overlay.querySelector('.gx-canvas');
    ctx=canvas.getContext('2d'); ctrlEl=overlay.querySelector('.gx-controls'); hintEl=overlay.querySelector('.gx-hint');
    boardEl=overlay.querySelector('.gx-board');
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
    if(ctrlEl) ctrlEl.innerHTML=''; if(boardEl){ boardEl.innerHTML=''; boardEl.hidden=true; } curKey=null; }

  /* ---- skor panosu (game_scores liderlik tablosu) ----
     Panoyu API besler; tablo/kolon henüz yoksa uç available:false döner ve
     pano hiç görünmez (oyunlar aynen çalışır). İsimler kullanıcı verisi →
     innerHTML'e ASLA girmez, textContent ile basılır (XSS). */
  function loadBoard(){ if(!boardEl||!curKey) return; var key=curKey;
    fetch('/api/game-scores?game='+key).then(function(r){ return r.json(); }).then(function(d){
      if(curKey!==key||!boardEl) return;
      if(!d||!d.available){ boardEl.hidden=true; return; }
      var h='<div class="gx-board-t">SKOR TABLOSU</div>';
      if(!d.scores.length){ h+='<div class="gx-board-row"><span class="gx-board-name">Henüz skor yok — ilk sen ol!</span></div>'; }
      for(var i=0;i<d.scores.length;i++){ h+='<div class="gx-board-row"><span class="gx-board-rank">'+(i+1)+'</span><span class="gx-board-name"></span><span class="gx-board-sc">'+((d.scores[i].score|0))+'</span></div>'; }
      boardEl.innerHTML=h;
      var rows=boardEl.querySelectorAll('.gx-board-row');
      for(var m=0;m<d.scores.length;m++){ var nEl=rows[m]&&rows[m].querySelector('.gx-board-name'); if(nEl) nEl.textContent=d.scores[m].player_name; }
      boardEl.hidden=false;
    }).catch(function(){ if(boardEl) boardEl.hidden=true; });
  }
  function gxOver(score){ if(!boardEl||!curKey||!(score>0)) return;
    var old=boardEl.querySelector('.gx-send'); if(old) old.remove();
    var loggedIn=false; try{ loggedIn=document.documentElement.getAttribute('data-auth')==='in'; }catch(e){}
    var row=document.createElement('div'); row.className='gx-send';
    row.innerHTML='<span class="gx-send-sc">SKOR '+(score|0)+'</span>'
      +(loggedIn?'':'<input class="gx-send-name" maxlength="20" placeholder="rumuz" autocomplete="off">')
      +'<button type="button" class="gx-send-btn">PANOYA YAZ</button>';
    boardEl.insertBefore(row, boardEl.firstChild); boardEl.hidden=false;
    row.querySelector('.gx-send-btn').addEventListener('click', function(){
      var btn=this, nameIn=row.querySelector('.gx-send-name');
      var name=nameIn?nameIn.value.trim():'';
      if(!loggedIn && name.length<2){ if(nameIn) nameIn.focus(); return; }
      btn.disabled=true; btn.textContent='...';
      fetch('/api/game-scores',{ method:'POST', headers:{'Content-Type':'application/json'}, credentials:'same-origin',
        body:JSON.stringify({ game:curKey, score:(score|0), name:name }) })
        .then(function(r){ return r.json(); }).then(function(d){
          if(d&&d.ok){ row.remove(); loadBoard(); }
          else { btn.disabled=false; btn.textContent='PANOYA YAZ'; } })
        .catch(function(){ btn.disabled=false; btn.textContent='PANOYA YAZ'; });
    });
  }

  /* ---- global girdi (SENKRON init → ArticleRuntime temizler), modal açıkken aktif ---- */
  window.addEventListener('keydown', function(e){ if(!isOpen()) return;
    if(e.target&&e.target.tagName==='INPUT') return; // rumuz yazarken oyun tuşları çalışmasın
    if(e.key==='Escape'){ closeModal(); return; } if(current&&current.key) current.key(e,true); });
  window.addEventListener('keyup', function(e){ if(!isOpen()) return; if(e.target&&e.target.tagName==='INPUT') return; if(current&&current.key) current.key(e,false); });
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
        if(score>hi){ hi=score; try{ localStorage.setItem('arc_ast_hi',String(hi)); }catch(e){} } gxOver(score); }
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

  /* =====================================================
     GALAXIAN (1979) — formasyon + dalis yapan uzaylilar
  ===================================================== */
  function startGalaxian(){
    var W=canvas.width, H=canvas.height;
    var COLS=8, ROWS=4, DX=54, DY=40, FY=64, FW=(COLS-1)*54, FX0=(W-FW)/2;
    var PW=30, PH=16, PY=H-30, PSPD=5.2, PB_MAX=2, PB_SPD=9, FCD=12;
    var ROWCOL=['#ff4d6d','#c084fc','#36ff9e','#7fb0ff'], ROWPTS=[60,50,40,30];
    var player, pbul, ebul, aliens, stars, sway, swayDir, score, lives, wave, started, over, paused, fcd, diveTimer, resp, t;
    var hi; try{ hi=parseInt(localStorage.getItem('arc_gx_hi')||'0',10)||0; }catch(e){ hi=0; }
    var ctl={left:false,right:false,fire:false};

    hintEl.innerHTML='<b>\\u2190 \\u2192</b> hareket \\u00b7 <b>bo\\u015fluk</b> ate\\u015f \\u00b7 <b>P</b> duraklat \\u00b7 <b>Esc</b> \\u00e7\\u0131k';
    ctrlEl.innerHTML=''; mkBtn('left','\\u25C4','gx-dir'); mkBtn('right','\\u25BA','gx-dir'); mkBtn('fire','\\u25CF FIRE','gx-fire');

    function makeStars(){ stars=[]; for(var i=0;i<64;i++) stars.push({x:Math.random()*W,y:Math.random()*H,s:0.4+Math.random()*1.5}); }
    function buildFormation(){ aliens=[]; for(var r=0;r<ROWS;r++) for(var c=0;c<COLS;c++) aliens.push({c:c,r:r,alive:true,dive:false,x:FX0+c*DX,y:FY+r*DY,dt:0,vy:0}); }
    function reset(){ player={x:W/2}; pbul=[]; ebul=[]; score=0; lives=3; wave=1; over=false; paused=false; fcd=0; diveTimer=80; resp=0; t=0; sway=0; swayDir=1; makeStars(); buildFormation(); }
    function nextWave(){ wave++; buildFormation(); diveTimer=Math.max(34,70-wave*6); beep(660,0.12,'square',0.04); }
    function ensureStart(){ if(!started) started=true; else if(over){ reset(); started=true; } }
    function hX(a){ return FX0 + a.c*DX + sway; }
    function hY(a){ return FY + a.r*DY; }
    function ax(a){ return a.dive ? a.x : hX(a); }
    function ay(a){ return a.dive ? a.y : hY(a); }
    function aliveN(){ var n=0; for(var i=0;i<aliens.length;i++) if(aliens[i].alive) n++; return n; }
    function spawnDive(){ var pool=[]; for(var i=0;i<aliens.length;i++){ var a=aliens[i]; if(a.alive && !a.dive) pool.push(a); } if(!pool.length) return;
      var a=pool[(Math.random()*pool.length)|0]; a.dive=true; a.dt=0; a.x=hX(a); a.y=hY(a); a.vy=1.3; beep(440,0.06,'sawtooth',0.025); }
    function loseLife(){ lives--; beep(120,0.3,'sawtooth',0.05); if(lives<=0){ over=true; if(score>hi){ hi=score; try{ localStorage.setItem('arc_gx_hi',String(hi)); }catch(e){} } gxOver(score); } else { resp=110; player.x=W/2; } }

    function update(s){
      t+=s;
      for(var i=0;i<stars.length;i++){ var st=stars[i]; st.y+=st.s*s; if(st.y>H){ st.y=0; st.x=Math.random()*W; } }
      if(fcd>0) fcd-=s; if(resp>0) resp-=s;
      if(!started||over||paused) return;
      if(ctl.left) player.x-=PSPD*s; if(ctl.right) player.x+=PSPD*s;
      player.x=Math.max(PW/2, Math.min(W-PW/2, player.x));
      if(ctl.fire && fcd<=0 && pbul.length<PB_MAX){ pbul.push({x:player.x,y:PY-PH}); fcd=FCD; beep(900,0.04,'square',0.03); }
      for(var b=pbul.length-1;b>=0;b--){ pbul[b].y-=PB_SPD*s; if(pbul[b].y<-6) pbul.splice(b,1); }
      sway+=swayDir*0.4*s; if(sway>26){ sway=26; swayDir=-1; } else if(sway<-26){ sway=-26; swayDir=1; }
      for(var i=0;i<aliens.length;i++){ var a=aliens[i]; if(!a.alive||!a.dive) continue;
        a.dt+=s; a.vy=Math.min(a.vy+0.05*s,4.3); a.y+=a.vy*s;
        a.x+=(Math.sin(a.dt*0.09)*2.1 + (player.x>a.x?0.7:-0.7))*s;
        if(Math.random()<0.012*s && a.y<H-90) ebul.push({x:a.x,y:a.y+8});
        if(a.y>H+24){ a.dive=false; a.vy=0; } }
      diveTimer-=s; if(diveTimer<=0){ spawnDive(); diveTimer=Math.max(26,72-wave*7)+Math.random()*46; }
      for(var e=ebul.length-1;e>=0;e--){ ebul[e].y+=4.3*s; if(ebul[e].y>H+6) ebul.splice(e,1); }
      for(var b=pbul.length-1;b>=0;b--){ var bu=pbul[b]; for(var i=0;i<aliens.length;i++){ var a=aliens[i]; if(!a.alive) continue;
        if(Math.abs(bu.x-ax(a))<14 && Math.abs(bu.y-ay(a))<12){ a.alive=false; score+=ROWPTS[a.r]*(a.dive?2:1); pbul.splice(b,1); beep(a.dive?760:520,0.07,'square',0.035); break; } } }
      if(resp<=0){
        for(var e=ebul.length-1;e>=0;e--){ if(Math.abs(ebul[e].x-player.x)<PW/2 && Math.abs(ebul[e].y-PY)<PH){ ebul.splice(e,1); loseLife(); break; } }
        if(resp<=0) for(var i=0;i<aliens.length;i++){ var a=aliens[i]; if(a.alive&&a.dive && Math.abs(ax(a)-player.x)<PW/2+6 && Math.abs(ay(a)-PY)<PH+4){ a.alive=false; loseLife(); break; } }
      }
      if(aliveN()===0) nextWave();
    }

    function ctext(s2,y,size,col){ ctx.fillStyle=col; ctx.font=size+'px "Press Start 2P", monospace'; ctx.textAlign='center'; ctx.fillText(s2,W/2,y); }
    function drawAlien(x,y,col){ ctx.save(); ctx.translate(x,y); ctx.fillStyle=col; ctx.shadowColor=col; ctx.shadowBlur=6;
      ctx.fillRect(-3,-6,6,12); ctx.fillRect(-9,-2,18,4); ctx.fillRect(-11,0,4,3); ctx.fillRect(7,0,4,3);
      ctx.fillRect(-6,5,3,4); ctx.fillRect(3,5,3,4); ctx.restore(); }
    function drawPlayer(){ if(resp>0 && (Math.floor(t/4)%2)) return; ctx.save(); ctx.translate(player.x,PY); ctx.fillStyle='#cfe8ff'; ctx.shadowColor='#2ce6e6'; ctx.shadowBlur=8;
      ctx.beginPath(); ctx.moveTo(0,-PH); ctx.lineTo(PW/2,PH-2); ctx.lineTo(-PW/2,PH-2); ctx.closePath(); ctx.fill(); ctx.fillRect(-2,-PH-4,4,5); ctx.restore(); }
    function draw(){
      ctx.fillStyle='#05030c'; ctx.fillRect(0,0,W,H);
      for(var i=0;i<stars.length;i++){ var st=stars[i]; ctx.fillStyle='rgba(255,255,255,'+(0.25+st.s*0.4)+')'; ctx.fillRect(st.x,st.y,st.s,st.s); }
      for(var i=0;i<aliens.length;i++){ var a=aliens[i]; if(a.alive) drawAlien(ax(a),ay(a),ROWCOL[a.r]); }
      ctx.shadowBlur=0;
      ctx.fillStyle='#9af6ff'; for(var b=0;b<pbul.length;b++) ctx.fillRect(pbul[b].x-1.5,pbul[b].y,3,10);
      ctx.fillStyle='#ffd23f'; for(var e=0;e<ebul.length;e++) ctx.fillRect(ebul[e].x-1.5,ebul[e].y,3,9);
      if(started && !over) drawPlayer();
      ctx.fillStyle='#2ce6e6'; ctx.font='16px "Press Start 2P", monospace'; ctx.textAlign='left'; ctx.fillText(String(score),16,30);
      ctx.fillStyle='#b09ad6'; ctx.font='9px "Press Start 2P", monospace'; ctx.fillText('HI '+hi,16,46); ctx.fillText('DALGA '+wave,16,60);
      for(var li=0;li<lives;li++){ ctx.save(); ctx.translate(W-20-li*22,24); ctx.fillStyle='#36ff9e'; ctx.beginPath(); ctx.moveTo(0,-7); ctx.lineTo(8,7); ctx.lineTo(-8,7); ctx.closePath(); ctx.fill(); ctx.restore(); }
      if(!started){ ctext('GALAXIAN',H/2-26,22,'#f4ecff'); ctext('PRESS START',H/2+8,13,'#2ce6e6'); ctext('ate\\u015f / dokun',H/2+30,9,'#6b5a91'); }
      else if(over){ ctext('GAME OVER',H/2-10,20,'#ff5a6e'); ctext('tekrar i\\u00e7in ate\\u015f',H/2+18,10,'#9dffd0'); }
      else if(paused){ ctext('DURAKLATILDI',H/2,15,'#ffd23f'); }
    }

    function key(e,d){ var k=e.key;
      if(k==='ArrowLeft'||k==='a'||k==='A'){ ctl.left=d; e.preventDefault(); }
      else if(k==='ArrowRight'||k==='d'||k==='D'){ ctl.right=d; e.preventDefault(); }
      else if(k===' '){ if(d){ if(!started||over) ensureStart(); else ctl.fire=true; } else ctl.fire=false; e.preventDefault(); }
      else if(d && (k==='p'||k==='P')){ if(started&&!over) paused=!paused; }
      else if(d && k==='Enter'){ if(!started||over) ensureStart(); } }
    function down(act){ ensureStart(); if(act==='fire') ctl.fire=true; else ctl[act]=true; }
    function up(){ ctl.left=ctl.right=ctl.fire=false; }

    reset();
    var loop=makeLoop(function(s){ update(s); draw(); }); loop.start();
    return { stop:function(){ loop.stop(); }, key:key, down:down, up:up };
  }

  /* =====================================================
     ZIPZIP (Basementonfire orijinali) — level-tabanli pixel platform.
     Super Mario Bros DEGIL: ozgun karakter, ozgun harita, ozgun palet.
  ===================================================== */
  function startPlatformer(){
    var W=canvas.width, H=canvas.height, T=30;
    var GRAV=0.60, ACC=0.82, MAXV=4.5, FRIC=0.80, JUMP=12.6, JCUT=0.42, COYOTE=9, JBUF=9, STOMP=8.6, ESPD=1.1;
    var PW=20, PH=26, EW=24, EH=20;
    // --- ozgun bolum haritalari (# zemin  ? yildiz-blok  o altin  ^ diken  G kapi  P baslangic
    //     E slime  H zipzip-kurbaga  F ucan yarasa  S dikenli top(basma!) ) ---
    var LEVELS = [
      [ '','','','','','','','','','','',
        '                oooo                oooo        ',
        '      ? ?                                        ',
        '              ######               ######       ',
        '    o o o                                        ',
        '  P              E         ^^        H         G ',
        '##########   ##################   ##############',
        '##########   ##################   ##############' ],
      [ '','','','','','','','','','',
        '                oooo                 oooo        ',
        '        ? ?                                       ',
        '               ######                ######      ',
        '    oo        oo           oo                     ',
        '  P       H          E        ^^      H      E   G',
        '###########   ##################   #################',
        '###########   ##################   #################' ],
      [ '','','','','','','','','',
        '                 F                       F         ',
        '              oooo                oooo             ',
        '       ? ?                                          ',
        '             ######               ######           ',
        '   ooo                     ooo                      ',
        '  P       E        H     ^^   S           E         G   ',
        '############   ###################   ###################',
        '############   ###################   ###################' ],
      [ '','','','','','','','',
        '              F                  F                  F     ',
        '           oooo            oooo          oooo             ',
        '      ? ?                                                  ',
        '          ######           ######         ######          ',
        '    oo                                          oo         ',
        '  P     H         S       E          ^^  S   E        G',
        '############   ################   #############   ##########',
        '############   ################   #############   ##########' ],
      [ '','','','','','','',
        '            F              F              F               F   ',
        '          oooo          oooo          oooo          oooo       ',
        '      ? ?                        ? ?                            ',
        '         ######         ######         ######         ######    ',
        '   ooo                                              ooo         ',
        '  P    H        S     E   ^^      H    S   E       ^^    E    G',
        '############   ##############   ##############   ###############',
        '############   ##############   ##############   ###############' ]
    ];
    var LV, cols, rows, G, coins, foes, spikes, goal, spawn, pops, dust;
    var px,py,pvx,pvy,onGround,face,animT,coyote,jbuf,jheld;
    var score,coinCount,levelCoins,lives,started,over,won,dead,deadT,cleared,clearT,clearBonus,t,camX;
    var PS=2, pc=null, pctx=null, dc;
    var hi; try{ hi=parseInt(localStorage.getItem('arc_pf_hi')||'0',10)||0; }catch(e){ hi=0; }
    var ctl={left:false,right:false};

    hintEl.innerHTML='<b>\\u2190 \\u2192</b> hareket \\u00b7 <b>\\u2191 / SPACE</b> z\\u0131pla \\u00b7 d\\u00fc\\u015fmana \\u00fcstten bas \\u00b7 <b>Esc</b> \\u00e7\\u0131k';
    ctrlEl.innerHTML=''; mkBtn('left','\\u25C4','gx-dir'); mkBtn('right','\\u25BA','gx-dir'); mkBtn('jump','\\u25B2 Z\\u0130PLA','gx-fire');

    function isSolid(cx,cy){ if(cx<0) return true; if(cx>=cols) return true; if(cy<0) return false; if(cy>=rows) return false;
      var ch=G[cy][cx]; return ch==='#'||ch==='B'||ch==='?'||ch==='u'||ch==='='; }
    function loadLevel(idx){
      var map=LEVELS[idx]; rows=map.length; cols=0;
      for(var r=0;r<rows;r++){ if(map[r].length>cols) cols=map[r].length; }
      G=[]; coins=[]; foes=[]; spikes=[]; goal=null; spawn={x:T,y:T}; pops=[]; dust=[]; levelCoins=0;
      for(var r=0;r<rows;r++){ var row=[]; for(var c=0;c<cols;c++){ var ch=map[r].charAt(c)||' ';
        if(ch==='o'){ coins.push({x:c*T+T/2,y:r*T+T/2,got:false}); row.push(' '); }
        else if(ch==='E'){ foes.push({x:c*T+(T-EW)/2,y:r*T+(T-EH),vx:-ESPD,vy:0,type:'slime',alive:true,sq:0}); row.push(' '); }
        else if(ch==='H'){ foes.push({x:c*T+(T-EW)/2,y:r*T+(T-EH),vx:ESPD*0.7,vy:0,type:'hopper',hopT:30,alive:true,sq:0}); row.push(' '); }
        else if(ch==='F'){ foes.push({x:c*T+(T-EW)/2,y:r*T+(T-EH),vx:ESPD*1.3,vy:0,type:'flyer',homeX:c*T,baseY:r*T+(T-EH),range:3*T,wob:0,alive:true,sq:0}); row.push(' '); }
        else if(ch==='S'){ foes.push({x:c*T+(T-EW)/2,y:r*T+(T-EH),vx:-ESPD*0.85,vy:0,type:'spiky',alive:true,sq:0}); row.push(' '); }
        else if(ch==='^'){ spikes.push({x:c*T,y:r*T}); row.push(' '); }
        else if(ch==='G'){ goal={x:c*T,y:(r-1)*T}; row.push(' '); }
        else if(ch==='P'){ spawn={x:c*T+(T-PW)/2,y:r*T+(T-PH)}; row.push(' '); }
        else row.push(ch); }
        G.push(row); }
      px=spawn.x; py=spawn.y; pvx=0; pvy=0; onGround=false; face=1; coyote=0; jbuf=0; camX=0; dead=false; deadT=0; cleared=false; clearT=0;
    }
    function reset(){ LV=0; score=0; coinCount=0; lives=3; over=false; won=false; started=false; t=0; loadLevel(0); }
    function ensureStart(){ if(!started){ started=true; LV=0; score=0; coinCount=0; lives=3; over=false; won=false; loadLevel(0); }
      else if(over||won){ started=true; LV=0; score=0; coinCount=0; lives=3; over=false; won=false; loadLevel(0); } }
    function die(){ if(dead||cleared) return; dead=true; deadT=48; pvy=-8; beep(160,0.3,'sawtooth',0.05); }
    function bump(cx,cy){ if(cy<0||cy>=rows||cx<0||cx>=cols) return; var ch=G[cy][cx];
      if(ch==='?'){ G[cy][cx]='u'; score+=50; coinCount++; levelCoins++; pops.push({x:cx*T+T/2,y:cy*T,life:26}); beep(880,0.06,'square',0.04); }
      else if(ch==='B'){ G[cy][cx]=' '; beep(240,0.05,'square',0.04); } }
    function spawnDust(n){ for(var i=0;i<n;i++){ dust.push({x:px+PW/2+(Math.random()*10-5),y:py+PH-1,vx:(Math.random()*2-1)*1.3,vy:-Math.random()*0.9,life:15+Math.random()*8}); } }
    function advanceLevel(){ LV++; if(LV>=LEVELS.length){ won=true; if(score>hi){ hi=score; try{ localStorage.setItem('arc_pf_hi',String(hi)); }catch(e){} } gxOver(score); } else loadLevel(LV); cleared=false; }

    function step(ss){
      // yatay
      if(ctl.left){ pvx-=ACC*ss; face=-1; } if(ctl.right){ pvx+=ACC*ss; face=1; }
      if(!ctl.left&&!ctl.right){ pvx*=Math.pow(FRIC,ss); if(Math.abs(pvx)<0.05) pvx=0; }
      if(pvx>MAXV) pvx=MAXV; if(pvx<-MAXV) pvx=-MAXV;
      px+=pvx*ss;
      var top=Math.floor(py/T), bot=Math.floor((py+PH-1)/T), cy;
      if(pvx>0){ var rgt=Math.floor((px+PW-1)/T); for(cy=top;cy<=bot;cy++) if(isSolid(rgt,cy)){ px=rgt*T-PW; pvx=0; break; } }
      else if(pvx<0){ var lft=Math.floor(px/T); for(cy=top;cy<=bot;cy++) if(isSolid(lft,cy)){ px=(lft+1)*T; pvx=0; break; } }
      // dikey
      if(onGround) coyote=COYOTE; else if(coyote>0) coyote-=ss;
      if(jbuf>0){ jbuf-=ss; if(onGround||coyote>0){ pvy=-JUMP; onGround=false; coyote=0; jbuf=0; spawnDust(4); beep(660,0.07,'square',0.04); } }
      pvy+=GRAV*ss; if(pvy>15) pvy=15; py+=pvy*ss; onGround=false;
      var lf=Math.floor(px/T), rt=Math.floor((px+PW-1)/T), cx;
      if(pvy>0){ var bt=Math.floor((py+PH-1)/T); for(cx=lf;cx<=rt;cx++) if(isSolid(cx,bt)){ if(pvy>4.5) spawnDust(3); py=bt*T-PH; pvy=0; onGround=true; break; } }
      else if(pvy<0){ var tp=Math.floor(py/T); for(cx=lf;cx<=rt;cx++) if(isSolid(cx,tp)){ py=(tp+1)*T; pvy=0; bump(cx,tp); break; } }
    }
    function update(s){
      t+=s;
      for(var i=pops.length-1;i>=0;i--){ pops[i].y-=0.8*s; pops[i].life-=s; if(pops[i].life<=0) pops.splice(i,1); }
      if(dust) for(var i=dust.length-1;i>=0;i--){ var du=dust[i]; du.x+=du.vx*s; du.y+=du.vy*s; du.vy+=0.07*s; du.life-=s; if(du.life<=0) dust.splice(i,1); }
      if(!started||over||won) return;
      if(cleared){ clearT-=s; if(clearT<=0){ advanceLevel(); } return; }
      if(dead){ pvy+=GRAV*s; py+=pvy*s; deadT-=s; if(deadT<=0){ lives--; if(lives<=0){ over=true; if(score>hi){ hi=score; try{ localStorage.setItem('arc_pf_hi',String(hi)); }catch(e){} } gxOver(score); } else loadLevel(LV); } return; }
      var ss=Math.min(s,1.7); step(ss); animT+=Math.abs(pvx)*ss;
      camX=px+PW/2-W/2; var maxc=cols*T-W; if(maxc<0) maxc=0; if(camX<0) camX=0; else if(camX>maxc) camX=maxc;
      if(py>rows*T+40){ die(); return; }
      // altinlar
      for(var i=0;i<coins.length;i++){ var co=coins[i]; if(co.got) continue;
        if(px<co.x+9 && px+PW>co.x-9 && py<co.y+9 && py+PH>co.y-9){ co.got=true; score+=20; coinCount++; levelCoins++; beep(1040,0.05,'square',0.04); } }
      // dikenler
      for(var i=0;i<spikes.length;i++){ var sp=spikes[i]; if(px<sp.x+T-4 && px+PW>sp.x+4 && py+PH>sp.y+10 && py<sp.y+T){ die(); return; } }
      // dusmanlar (turlere gore)
      for(var i=0;i<foes.length;i++){ var f=foes[i]; if(!f.alive){ f.sq+=s; continue; }
        if(f.y>rows*T+60){ f.alive=false; continue; } // haritadan dusen dusmani yok et (sonsuz dusme engeli)
        if(f.type==='flyer'){
          f.x+=f.vx*ss; if(f.x<f.homeX-f.range||f.x>f.homeX+f.range) f.vx=-f.vx;
          var fwc=Math.floor((f.vx<0?f.x:f.x+EW-1)/T), fmy=Math.floor((f.y+EH/2)/T); if(isSolid(fwc,fmy)) f.vx=-f.vx;
          f.wob+=0.09*ss; f.y=f.baseY+Math.sin(f.wob)*11;
        } else {
          // yatay yuru + duvar donusu
          f.x+=f.vx*ss; var fwc2=Math.floor((f.vx<0?f.x:f.x+EW-1)/T), fmy2=Math.floor((f.y+EH/2)/T);
          if(isSolid(fwc2,fmy2)){ f.vx=-f.vx; f.x+=f.vx*ss; }
          // gravite
          f.vy=(f.vy||0)+0.55*ss; if(f.vy>11) f.vy=11; f.y+=f.vy*ss; f.onG=false;
          var fgl=Math.floor(f.x/T), fgr=Math.floor((f.x+EW-1)/T), fgb=Math.floor((f.y+EH-1)/T);
          for(var cc=fgl;cc<=fgr;cc++) if(isSolid(cc,fgb)){ f.y=fgb*T-EH; f.vy=0; f.onG=true; break; }
          // kenar donusu (zeminde VE inis sirasinda -> ucuruma dusup kaybolmaz)
          var ah=Math.floor((f.vx<0?f.x-1:f.x+EW)/T), bl=Math.floor((f.y+EH+1)/T); if(!isSolid(ah,bl) && (f.onG||f.vy>=0)) f.vx=-f.vx;
          // zipla (hopper)
          if(f.type==='hopper'){ f.hopT-=s; if(f.onG && f.hopT<=0){ f.vy=-9.4; f.hopT=34+Math.random()*30; } }
        }
        // oyuncu ile carpisma
        if(px<f.x+EW-3 && px+PW>f.x+3 && py<f.y+EH && py+PH>f.y){
          if(f.type!=='spiky' && pvy>0 && py+PH < f.y+EH*0.62){ f.alive=false; f.sq=0; pvy=-STOMP; score+=100; beep(520,0.08,'square',0.045); beep(760,0.06,'square',0.04); }
          else { die(); return; } } }
      // kapi
      if(goal && px+PW>goal.x+4 && px<goal.x+T-4 && py+PH>goal.y && py<goal.y+2*T){ cleared=true; clearT=300; clearBonus=lives*50+levelCoins*10+150; score+=clearBonus; beep(784,0.1,'square',0.05); beep(1046,0.12,'square',0.05); }
    }

    // ---------- CIZIM ----------
    function ctext(s2,y,size,col){ ctx.fillStyle=col; ctx.font=size+'px "Press Start 2P", monospace'; ctx.textAlign='center'; ctx.fillText(s2,W/2,y); }
    function drawCloud(x,y,sc){ dc.save(); dc.translate(x,y); dc.scale(sc,sc); dc.fillStyle='rgba(255,255,255,0.95)';
      dc.fillRect(-20,-5,40,11); dc.fillRect(-12,-13,26,10); dc.fillRect(5,-9,15,7); dc.fillRect(-24,-2,10,7); dc.fillStyle='rgba(210,235,255,0.9)'; dc.fillRect(-20,4,40,2); dc.restore(); }
    function star5(r){ dc.beginPath(); for(var i=0;i<10;i++){ var rr=(i%2)?r*0.45:r; var a=-Math.PI/2+i*Math.PI/5; var xx=Math.cos(a)*rr, yy=Math.sin(a)*rr; if(i===0) dc.moveTo(xx,yy); else dc.lineTo(xx,yy); } dc.closePath(); dc.fill(); }
    function drawFlower(x,y){ var col=['#ff6b8a','#ffd23f','#e77fff','#ff9a52'][(x*7)%4|0]; dc.fillStyle='#2f7d2a'; dc.fillRect(x,y-4,2,4);
      dc.fillStyle=col; dc.fillRect(x-2,y-7,2,2); dc.fillRect(x+2,y-7,2,2); dc.fillRect(x,y-9,2,2); dc.fillRect(x,y-5,2,2); dc.fillStyle='#fff2a8'; dc.fillRect(x,y-7,2,2); }
    function drawTuft(x,y){ dc.fillStyle='#3a9430'; dc.fillRect(x,y-3,2,3); dc.fillRect(x+3,y-4,2,4); dc.fillRect(x-3,y-3,2,3); }
    function drawBush(x,y,sc){ dc.save(); dc.translate(x,y); dc.scale(sc,sc); dc.fillStyle='#3a8f34'; dc.fillRect(-14,-8,28,9); dc.fillRect(-9,-13,18,8); dc.fillRect(4,-11,11,7); dc.fillStyle='#57b84a'; dc.fillRect(-12,-8,24,3); dc.restore(); }
    function drawHillLayer(baseY,par,col,topCol,amp,freq){ var ox=Math.floor(camX*par);
      for(var x=0;x<W+4;x+=4){ var wx=x+ox; var hh=Math.round((amp*(0.55+0.45*Math.sin(wx*freq))+amp*0.28*Math.sin(wx*freq*2.7+1.3))/4)*4; var ty=baseY-hh;
        dc.fillStyle=col; dc.fillRect(x,ty,4,H-ty); dc.fillStyle=topCol; dc.fillRect(x,ty,4,3); } }
    function panel(hp){ var wp=380; ctx.fillStyle='rgba(18,26,54,0.74)'; ctx.fillRect(W/2-wp/2,H/2-hp/2,wp,hp); ctx.strokeStyle='rgba(255,255,255,0.28)'; ctx.lineWidth=2; ctx.strokeRect(W/2-wp/2,H/2-hp/2,wp,hp); }
    function drawTile(ch,x,y){
      if(ch==='#'){ dc.fillStyle='#9b5a2a'; dc.fillRect(x,y,T,T); dc.fillStyle='#7a4420'; dc.fillRect(x+4,y+12,5,5); dc.fillRect(x+18,y+18,5,5);
        dc.fillStyle='#4fbf3f'; dc.fillRect(x,y,T,9); dc.fillStyle='#79e05f'; dc.fillRect(x,y,T,4); dc.fillStyle='#3a9430'; dc.fillRect(x,y+8,T,2); }
      else if(ch==='B'){ dc.fillStyle='#b5651d'; dc.fillRect(x,y,T,T); dc.fillStyle='#d98a3a'; dc.fillRect(x+1,y+1,T-2,5); dc.fillRect(x+1,y+15,13,5); dc.fillRect(x+16,y+15,13,5); dc.fillStyle='#8a4a14'; dc.fillRect(x,y+7,T,2); }
      else if(ch==='?'){ var g=0.5+0.5*Math.sin(t*0.2); dc.fillStyle='#e0a020'; dc.fillRect(x,y,T,T); dc.fillStyle='#ffcf3a'; dc.fillRect(x+2,y+2,T-4,T-4);
        dc.fillStyle='rgba(255,255,255,'+(0.6+g*0.4)+')'; dc.save(); dc.translate(x+T/2,y+T/2+1); star5(8); dc.restore(); }
      else if(ch==='u'){ dc.fillStyle='#a9812f'; dc.fillRect(x,y,T,T); dc.fillStyle='#c19a45'; dc.fillRect(x+2,y+2,T-4,T-4); }
      else if(ch==='='){ dc.fillStyle='#79e05f'; dc.fillRect(x,y,T,5); dc.fillStyle='#3a9430'; dc.fillRect(x,y+5,T,2); }
    }
    function drawFoe(f){ var x=f.x-camX, y=f.y; if(x<-44||x>W+44) return; var bob=Math.sin(t*0.25+f.x*0.1)*2;
      if(!f.alive){ var dcol=f.type==='spiky'?'#7a3f8f':(f.type==='flyer'?'#4a3f7a':(f.type==='hopper'?'#1f5f2a':'#7a2418')); dc.fillStyle=dcol; dc.fillRect(x,y+EH-6,EW,6); return; }
      if(f.type==='flyer') drawFlyer(x,y);
      else if(f.type==='hopper') drawHopper(x,y,f);
      else if(f.type==='spiky') drawSpiky(x,y,bob);
      else drawSlime(x,y,bob); }
    function drawSlime(x,y,bob){
      dc.fillStyle='#7a2418'; dc.fillRect(x,y+bob-1,EW,EH-bob+2);
      dc.fillStyle='#ff6f5e'; dc.fillRect(x+2,y+bob,EW-4,EH-bob-1);
      dc.fillStyle='#ffb09f'; dc.fillRect(x+2,y+4+bob,EW-4,3);
      dc.fillStyle='#fff'; dc.fillRect(x+6,y+7+bob,5,5); dc.fillRect(x+EW-11,y+7+bob,5,5);
      dc.fillStyle='#2a0f0a'; dc.fillRect(x+8,y+9+bob,3,3); dc.fillRect(x+EW-9,y+9+bob,3,3);
      dc.fillStyle='#7a2418'; dc.fillRect(x+4,y+EH-3,4,3); dc.fillRect(x+EW-8,y+EH-3,4,3); }
    function drawHopper(x,y,f){ var air=f.onG?0:-2;
      dc.fillStyle='#1f5f2a'; dc.fillRect(x,y+air,EW,EH-air);
      dc.fillStyle='#43b64a'; dc.fillRect(x+2,y+2+air,EW-4,EH-4-air);
      dc.fillStyle='#6fe06a'; dc.fillRect(x+2,y+3+air,EW-4,3);
      dc.fillStyle='#fff'; dc.fillRect(x+4,y+air,6,6); dc.fillRect(x+EW-10,y+air,6,6);
      dc.fillStyle='#0a2a0f'; dc.fillRect(x+6,y+2+air,3,3); dc.fillRect(x+EW-8,y+2+air,3,3);
      dc.fillStyle='#1f5f2a'; dc.fillRect(x+1,y+EH-4,5,4); dc.fillRect(x+EW-6,y+EH-4,5,4); }
    function drawFlyer(x,y){ var flap=Math.sin(t*0.5)*4;
      dc.fillStyle='#6a4fb0'; dc.beginPath(); dc.moveTo(x-6,y+EH/2-flap); dc.lineTo(x+5,y+4); dc.lineTo(x+5,y+EH-4); dc.closePath(); dc.fill();
      dc.beginPath(); dc.moveTo(x+EW+6,y+EH/2-flap); dc.lineTo(x+EW-5,y+4); dc.lineTo(x+EW-5,y+EH-4); dc.closePath(); dc.fill();
      dc.fillStyle='#4a3f7a'; dc.fillRect(x+4,y+3,EW-8,EH-6); dc.fillStyle='#8f7fd0'; dc.fillRect(x+5,y+4,EW-10,3);
      dc.fillStyle='#fff'; dc.fillRect(x+7,y+7,3,3); dc.fillRect(x+EW-10,y+7,3,3);
      dc.fillStyle='#1a0f2a'; dc.fillRect(x+8,y+8,2,2); dc.fillRect(x+EW-9,y+8,2,2); }
    function drawSpiky(x,y,bob){
      dc.fillStyle='#5a1f6a'; dc.fillRect(x+2,y+7+bob,EW-4,EH-9-bob);
      dc.fillStyle='#c13fd0'; dc.fillRect(x+4,y+9+bob,EW-8,EH-13-bob);
      dc.fillStyle='#e77fff'; for(var k=0;k<4;k++){ dc.beginPath(); dc.moveTo(x+3+k*5,y+9+bob); dc.lineTo(x+5.5+k*5,y+1+bob); dc.lineTo(x+8+k*5,y+9+bob); dc.closePath(); dc.fill(); }
      dc.fillStyle='#fff'; dc.fillRect(x+6,y+12+bob,4,4); dc.fillRect(x+EW-10,y+12+bob,4,4);
      dc.fillStyle='#2a0a2a'; dc.fillRect(x+8,y+13+bob,2,2); dc.fillRect(x+EW-8,y+13+bob,2,2); }
    function drawPlayer(){ var x=px-camX, y=py, w=PW, h=PH, walk=onGround&&Math.abs(pvx)>0.3?Math.sin(animT*0.35):0;
      // golge
      dc.fillStyle='rgba(0,0,0,0.22)'; dc.fillRect(x+2,y+h-1,w-4,3);
      // koyu siluet (aydinlik gokte okunurluk)
      dc.fillStyle='#241608'; dc.fillRect(x-4,y,w+8,4); dc.fillRect(x+2,y-5,w-4,7); dc.fillRect(x,y+9,w,h-9);
      // botlar (yuruyunce degisir)
      var lb=walk>0.25?-1:0, rb=walk<-0.25?-1:0;
      dc.fillStyle='#5a3212'; dc.fillRect(x+3,y+h-4+lb,6,4); dc.fillRect(x+w-9,y+h-4+rb,6,4);
      // tulum (denim)
      dc.fillStyle='#2f6bb0'; dc.fillRect(x+2,y+13,w-4,h-15);
      dc.fillStyle='#274f82'; dc.fillRect(x+w/2-1,y+16,2,h-18);
      // gomlek (kirmizi ekose)
      dc.fillStyle='#c0392b'; dc.fillRect(x+2,y+9,w-4,5);
      dc.fillStyle='#e0574a'; dc.fillRect(x+3,y+10,3,2); dc.fillRect(x+w-6,y+10,3,2);
      // askilar
      dc.fillStyle='#3f7fc9'; dc.fillRect(x+4,y+13,2,3); dc.fillRect(x+w-6,y+13,2,3);
      // yuz
      dc.fillStyle='#f0c088'; dc.fillRect(x+4,y+3,w-8,6);
      // goz
      dc.fillStyle='#2a1a0a'; var ex=face>0?x+w-8:x+5; dc.fillRect(ex,y+5,2,3);
      // hasir sapka
      dc.fillStyle='#e6c86e'; dc.fillRect(x+3,y-4,w-6,5); dc.fillStyle='#f0d98a'; dc.fillRect(x+5,y-4,w-10,2);
      dc.fillStyle='#8a5a2a'; dc.fillRect(x+3,y,w-6,1);
      dc.fillStyle='#e6c86e'; dc.fillRect(x-4,y+1,w+8,3); dc.fillStyle='#c79a3e'; dc.fillRect(x-4,y+3,w+8,1); }
    function drawGoal(){ if(!goal) return; var x=goal.x-camX+T/2, y=goal.y; var gl=0.5+0.5*Math.sin(t*0.15);
      // direk
      dc.fillStyle='#3a7d34'; dc.fillRect(x-2,y-T,4,3*T); dc.fillStyle='#2a5f26'; dc.fillRect(x+2,y-T,2,3*T);
      // dalgalanan bayrak
      dc.fillStyle='#ff5a8a'; var fw=Math.sin(t*0.2)*3;
      dc.beginPath(); dc.moveTo(x+2,y-T+2); dc.lineTo(x+30+fw,y-T+9); dc.lineTo(x+2,y-T+18); dc.closePath(); dc.fill();
      // tepe yildizi (parlak)
      dc.save(); dc.translate(x, y-T-2); dc.fillStyle='rgba(255,210,60,'+(0.6+gl*0.4)+')'; dc.shadowColor='#ffd23f'; dc.shadowBlur=14; star5(9); dc.restore(); dc.shadowBlur=0; }
    function draw(){
      if(!pc){ pc=document.createElement('canvas'); pc.width=Math.floor(W/PS); pc.height=Math.floor(H/PS); pctx=pc.getContext('2d'); }
      dc=pctx; dc.setTransform(1/PS,0,0,1/PS,0,0); dc.imageSmoothingEnabled=true; dc.clearRect(0,0,W,H);
      // aydinlik gunduz gokyuzu
      var gr=dc.createLinearGradient(0,0,0,H); gr.addColorStop(0,'#3aa0ff'); gr.addColorStop(1,'#bfe6ff'); dc.fillStyle=gr; dc.fillRect(0,0,W,H);
      // gunes
      dc.fillStyle='rgba(255,240,150,0.35)'; dc.beginPath(); dc.arc(W-86,72,40,0,TAU); dc.fill();
      dc.fillStyle='#fff2a8'; dc.beginPath(); dc.arc(W-86,72,25,0,TAU); dc.fill();
      // bulutlar (integer konum -> shimmer/yirtilma yok)
      for(var i=0;i<5;i++){ var clx=Math.floor(((i*230 - camX*0.25)%(W+200)+W+200)%(W+200))-100; drawCloud(clx,52+((i*61)%80),0.85+((i%3)*0.22)); }
      // bloklu tepeler (dikissiz: her kolon dunya-x fonksiyonu + integer kaydirma)
      drawHillLayer(H-44, 0.28, '#3f9a3a', '#57b84a', 20, 0.011);
      drawHillLayer(H-20, 0.5,  '#5bc052', '#7fe06a', 30, 0.017);
      // calilar (dunyaya sabit, integer kaydirma)
      var bstep=210, bp=Math.floor(camX*0.5), b0=Math.floor(bp/bstep)*bstep;
      for(var wbx=b0; wbx<bp+W+bstep; wbx+=bstep){ drawBush(wbx-bp+50, H-38, 0.8+((wbx/bstep)&1)*0.25); }
      if(started){
        var c0=Math.max(0,Math.floor(camX/T)-1), c1=Math.min(cols,Math.floor((camX+W)/T)+2);
        for(var cy=0;cy<rows;cy++) for(var cx=c0;cx<c1;cx++){ var ch=G[cy][cx]; if(!ch||ch===' ') continue; var tx=cx*T-camX, ty=cy*T; drawTile(ch,tx,ty);
          if(ch==='#' && (cy===0 || G[cy-1][cx]===' ')){ var dd=(cx*2654435761)>>>0; if(dd%5===0) drawFlower(tx+15,ty); else if(dd%3===0) drawTuft(tx+15,ty); } }
        for(var i=0;i<coins.length;i++){ var co=coins[i]; if(co.got) continue; var cw=Math.abs(Math.cos(t*0.18+co.x*0.05))*7+2;
          dc.fillStyle='#ffd23f'; dc.fillRect(co.x-camX-cw/2, co.y-8, cw, 16); dc.fillStyle='#fff6c2'; dc.fillRect(co.x-camX-1, co.y-6, 2, 12); }
        for(var i=0;i<spikes.length;i++){ var sp=spikes[i]; var sx=sp.x-camX; dc.fillStyle='#d94a4a';
          for(var k=0;k<3;k++){ dc.beginPath(); dc.moveTo(sx+k*10+2,sp.y+T); dc.lineTo(sx+k*10+7,sp.y+8); dc.lineTo(sx+k*10+12,sp.y+T); dc.closePath(); dc.fill(); } }
        drawGoal();
        for(var i=0;i<foes.length;i++) drawFoe(foes[i]);
        for(var i=0;i<dust.length;i++){ var du=dust[i]; dc.globalAlpha=Math.max(0,du.life/23); dc.fillStyle='#efe6cf'; dc.fillRect(du.x-camX-2,du.y-2,4,4); } dc.globalAlpha=1;
        if(!dead || (Math.floor(t/3)%2)) drawPlayer();
        dc.fillStyle='#ffe27a'; dc.font='9px "Press Start 2P", monospace'; dc.textAlign='center';
        for(var i=0;i<pops.length;i++){ dc.globalAlpha=Math.max(0,pops[i].life/26); dc.fillText('+50',pops[i].x-camX,pops[i].y); } dc.globalAlpha=1;
      }
      // pixel tamponunu ana ekrana net buyut
      ctx.setTransform(1,0,0,1,0,0); ctx.imageSmoothingEnabled=false; ctx.clearRect(0,0,W,H); ctx.drawImage(pc,0,0,pc.width,pc.height,0,0,W,H);
      // HUD (net metin, ust serit)
      ctx.fillStyle='rgba(16,24,50,0.34)'; ctx.fillRect(0,0,W,64);
      ctx.fillStyle='#ffffff'; ctx.font='14px "Press Start 2P", monospace'; ctx.textAlign='left'; ctx.fillText(String(score),16,28);
      ctx.fillStyle='#ffe27a'; ctx.font='9px "Press Start 2P", monospace'; ctx.fillText('x'+coinCount,16,44);
      ctx.fillStyle='#cfe0ff'; ctx.fillText('HI '+hi,16,58);
      ctx.textAlign='right'; ctx.fillStyle='#ffffff'; ctx.fillText('BOLUM '+(LV+1)+'/'+LEVELS.length, W-16,28);
      for(var li=0;li<lives;li++){ ctx.fillStyle='#0f3345'; ctx.fillRect(W-19-li*16,39,12,12); ctx.fillStyle='#35e0d8'; ctx.fillRect(W-18-li*16,40,10,10); }
      if(!started){ panel(150); ctext('ZIPZIP',H/2-42,26,'#ffffff'); ctext('ciftci platform',H/2-14,10,'#8fe3ff'); ctext('BASLA icin ZIPLA',H/2+22,12,'#ffe27a'); ctext('Basementonfire orijinali',H/2+46,8,'#a9c0e6'); }
      else if(over){ panel(96); ctext('OYUN BITTI',H/2-10,20,'#ff8a94'); ctext('tekrar icin ZIPLA',H/2+18,10,'#c9f5d8'); }
      else if(won){ panel(154); ctext('TEBRIKLER!',H/2-48,20,'#7dffb0'); ctext('tum bolumleri bitirdin',H/2-20,9,'#ffffff'); ctext('TOPLAM PUAN',H/2+4,9,'#a9c0e6'); ctext(String(score),H/2+30,16,'#ffe27a'); ctext('tekrar icin ZIPLA',H/2+54,8,'#c9f5d8'); }
      else if(cleared){ panel(160); ctext('BOLUM '+(LV+1)+' TAMAM',H/2-54,14,'#7dffb0'); ctext('ALTIN     x'+levelCoins,H/2-24,10,'#ffe27a'); ctext('BONUS   +'+clearBonus,H/2-1,10,'#8fe3ff'); ctext('PUAN     '+score,H/2+22,10,'#ffffff'); ctext('devam icin ZIPLA',H/2+50,8,'#a9c0e6'); }
    }

    function jumpDown(){ if(!started||over||won){ ensureStart(); return; } if(cleared){ advanceLevel(); return; } jbuf=JBUF; jheld=true; }
    function jumpUp(){ jheld=false; if(pvy<0) pvy*=JCUT; }
    function key(e,d){ var k=e.key;
      if(k==='ArrowLeft'||k==='a'||k==='A'){ ctl.left=d; e.preventDefault(); }
      else if(k==='ArrowRight'||k==='d'||k==='D'){ ctl.right=d; e.preventDefault(); }
      else if(k==='ArrowUp'||k==='w'||k==='W'||k===' '){ if(d) jumpDown(); else jumpUp(); e.preventDefault(); }
      else if(d && k==='Enter'){ ensureStart(); } }
    function down(act){ if(act==='left'){ ensureStart(); ctl.left=true; } else if(act==='right'){ ensureStart(); ctl.right=true; } else if(act==='jump'){ jumpDown(); } }
    function up(){ ctl.left=false; ctl.right=false; jumpUp(); }

    animT=0; reset();
    var loop=makeLoop(function(s){ update(s); draw(); }); loop.start();
    return { stop:function(){ loop.stop(); }, key:key, down:down, up:up };
  }

  /* ---- oyun kaydı + fame kartlarını bağla ---- */
  var GAMES = { 'Asteroids': { title:'ASTEROIDS \\u00b7 1979', start:startAsteroids, key:'ast' }, 'Galaxian': { title:'GALAXIAN \\u00b7 1979', start:startGalaxian, key:'gx' }, 'ZIPZIP': { title:'ZIPZIP \\u00b7 PLATFORM', start:startPlatformer, key:'pf' } };
  // bonus orijinal oyunun kartini fame gridine ekle (content.ts'e dokunmadan)
  (function(){ var fame=root.querySelector('.fame'); if(!fame) return;
    var card=document.createElement('div'); card.className='f';
    card.innerHTML='<svg class="ficon" viewBox="0 0 16 16" fill="#2ce6e6" aria-hidden="true"><rect x="6" y="2" width="4" height="3"/><rect x="5" y="5" width="6" height="4"/><rect x="4" y="9" width="2" height="2"/><rect x="10" y="9" width="2" height="2"/><rect x="7" y="12" width="2" height="1"/></svg>'
      +'<div class="y">BONUS</div><div class="n">ZIPZIP</div><div class="d">Basementonfire orijinali \\u00b7 level level pixel platform. Oyna!</div>';
    fame.appendChild(card);
  })();
  var cards = root.querySelectorAll('.fame .f');
  for(var i=0;i<cards.length;i++){ (function(card){
    var nEl=card.querySelector('.n'); if(!nEl) return; var g=GAMES[nEl.textContent.trim()]; if(!g) return;
    card.classList.add('f-playable'); card.setAttribute('role','button'); card.setAttribute('tabindex','0');
    var badge=document.createElement('div'); badge.className='f-play'; badge.innerHTML='\\u25B6 OYNA'; card.appendChild(badge);
    function launch(){ openModal(g.title); curKey=g.key||null; loadBoard(); current=g.start(); }
    card.addEventListener('click', launch);
    card.addEventListener('keydown', function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); launch(); } });
  })(cards[i]); }
})();
`;
