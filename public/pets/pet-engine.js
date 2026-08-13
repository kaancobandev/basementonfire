/*
 * pet-engine.js — sayfanın alt kenarında yaşayan piksel-sanat maskot motoru.
 *
 * KÖKEN: kullanıcının "basement-panda.js" dosyası (sürüm 10). Davranış grafiği,
 * zamanlamalar ve animasyon mantığı AYNEN korundu; İngilizce yorumlar özgün
 * hâlinde bırakıldı. Siteye bağlarken eklenen/değişen yerlerin gerekçesi
 * Türkçe yazıldı (repo kuralı) ve "· BOF:" ile işaretlendi.
 *
 * NEDEN public/ ALTINDA DÜZ JS (webpack modülü değil):
 *   · Ana bundle'a SIFIR bayt ekler — parse/execute maliyeti yalnızca maskot
 *     gerçekten istendiğinde ve boşta zamanda ödenir.
 *   · URL'i SABİT. Hash'li bir Next parçası olsaydı, bayat HTML servis eden bir
 *     ziyaretçide (bkz. memory: perf-teshis-2026-08-07) silinmiş bir parçaya
 *     işaret edip 404 olurdu. Burada dosya adı deploy'dan deploy'a değişmez.
 *   · Tek başına açılabilir (panda-demo.html) — davranışı sitede denemeden test
 *     edebilirsin.
 *
 * KULLANIM (site: app/components/SitePet.tsx yapar):
 *   <script src="/pets/pet-engine.js?v=1" async></script>
 *   BasementPet.start({ path: '/pets/red-panda/' })
 *
 * YENİ HAYVAN EKLEMEK: sprite klasörünü public/pets/<id>/ altına koy ve
 * lib/pets.ts'e bir kayıt ekle. Kare boyutları farklıysa `sheets` ile geç.
 * Motor eksik sayfayı (404) sessizce devre dışı bırakır — o davranış grafikten
 * düşer, maskot kırılmaz. Yani yeni hayvanın 6 sayfanın hepsini vermesi şart
 * değil; en azından `idle` yeterlidir.
 *
 * Behaviour comes from a weighted transition graph rather than a single dice roll,
 * so the panda repeats itself far less. Weights are expressed by repeating an entry:
 * ['walk','walk','sit'] makes walking twice as likely as sitting.
 */
(function (global) {
  'use strict';

  // · BOF: varsayılan sayfa tablosu = kızıl panda. Başka bir hayvan kendi
  //   tablosunu `opts.sheets` ile geçer; anahtar adları (idle/walk/sit/climb/
  //   swipe/drop) davranış motorunun sözleşmesidir, dosya adları serbesttir.
  var PANDA_SHEETS = {
    idle:  { file: 'panda-idle.png',  w: 48, h: 47, frames: 4 },
    walk:  { file: 'panda-walk.png',  w: 48, h: 47, frames: 4 },
    sit:   { file: 'panda-sit.png',   w: 48, h: 47, frames: 4 },
    // Tırmanma karesi ötekilerden DAR ve YÜKSEK — poz dikey ve duvara yapışık.
    // 40x58 (sürüm 12); önceden 33x48 idi ve karakter ızgaraya sığsın diye
    // küçültülmüştü, yani panda tırmanırken minicik oluyordu. Yükseklik farkı
    // sorun değil: sprite'ın kutusu `bottom:0`da çakılı, fazla yükseklik
    // YUKARI doğru büyür, ayaklar aynı zemin çizgisinde kalır.
    climb: { file: 'panda-climb.png', w: 40, h: 58, frames: 4 },
    swipe: { file: 'panda-swipe.png', w: 48, h: 47, frames: 4 },
    drop:  { file: 'panda-drop.png',  w: 48, h: 47, frames: 4 }
  };
  // drop sheet frame roles, reused for hopping
  var AIRBORNE = 0, SQUASH = 1, CROUCH = 2, STAND = 3;
  var REACH_LOW = 1, REACH_HIGH = 2;   // swipe sheet: paw rising, paw extended

  // An activity is what the panda is doing; several activities share one sheet.
  // run reuses the walk art at a faster cadence.
  var ACTS = {
    idle:  { sheet: 'idle',  ms: 260 },
    sit:   { sheet: 'sit',   ms: 400 },
    walk:  { sheet: 'walk',  ms: 130, speed: 1 },
    run:   { sheet: 'walk',  ms: 80,  speed: 2.2 },
    climb: { sheet: 'climb', ms: 300 },
    swipe: { sheet: 'swipe', ms: 90 },
    chase: { sheet: 'walk',  ms: 100, speed: 1.7 },  // trotting after the pointer
    hop:   { sheet: 'drop',  ms: 120 }               // frames driven by the arc
  };

  var GRAPH = {
    idle:  ['walk', 'walk', 'walk', 'run', 'sit', 'sit', 'sit', 'walk', 'climb', 'swipe'],
    sit:   ['idle', 'idle', 'walk', 'walk', 'sit'],
    walk:  ['idle', 'idle', 'idle', 'sit', 'walk', 'run'],
    run:   ['idle', 'idle', 'walk', 'sit'],
    climb: ['sit', 'idle', 'walk'],
    swipe: ['idle', 'idle', 'sit', 'walk'],
    chase: ['idle', 'sit', 'walk'],
    hop:   ['sit', 'sit', 'idle']
  };

  var DEFAULTS = {
    path: '',
    sheets: null,         // · BOF: null = PANDA_SHEETS
    bust: '',             // · BOF: sprite URL'lerine eklenen sürüm sorgusu
    scale: null,          // null = 1 on phones, 2 elsewhere. Integers only.
    speed: 46,            // base walking speed, CSS px per second
    speedJitter: 0.3,     // +/-30% per trip so it never moves like a metronome
    climbSpeed: 30,
    climbPauseMin: 1100,
    climbPauseMax: 2400,
    climbHoldFrame: 0,
    restMin: 1800,        // standing pause
    restMax: 5200,
    sitMin: 3500,         // sitting lasts longer than standing
    sitMax: 9000,
    maxTrip: 320,         // longest single stroll, CSS px
    zIndex: 30,           // · BOF: nav/dock (100) ALTINDA, içerik ÜSTÜNDE
    margin: 8,
    graph: null,          // pass your own to retune the behaviour
    followCursor: true,   // notice the pointer and go stand under it
    followRadius: 460,    // only reacts to a pointer within this many px
    followChance: 0.55,   // odds of reacting when the pointer settles nearby
    followCooldown: 6000, // minimum gap between reactions, ms
    chaseTimeout: 4200,   // gives up if the pointer keeps running away
    hopHeight: 46,        // apex of the hop in CSS px -- deliberately not enough
    hopMs: 520,           // duration of one hop arc
    hopRest: 260,         // pause between hops
    hopRecoverMs: 170,    // per frame of the get-up after the last hop
    hopTries: 3,          // hops per attempt before giving up
    interactive: true,    // click / tap the panda for a reaction
    swipeLoops: 2,        // how many times the swipe cycle plays per reaction
    fallSpeed: 260,       // CSS px per second when dropping off the wall
    landMs: 110,          // frame time for the squash-and-recover on landing
    sayings: ['!', '?', 'merhaba', 'hey', '<3', 'basementonfire'],
    speechMs: 1800
  };

  var CSS_ID = 'bof-pet-css';

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function between(a, b) { return a + Math.random() * (b - a); }

  // · BOF: stil bloğu bir KEZ basılır. Eskiden her start() yeni bir <style>
  //   ekliyordu; ayarlardan maskotu aç/kapa yapan kullanıcıda head sessizce
  //   şişiyordu (destroy() stili kaldırmıyordu). z-index artık burada değil,
  //   alan öğesinin inline stilinde — tek stil bloğu farklı z-index'li iki
  //   örneği aynı anda taşıyabilsin.
  function ensureCss() {
    if (document.getElementById(CSS_ID)) return;
    var css = document.createElement('style');
    css.id = CSS_ID;
    css.textContent =
      /* ALAN: maskotun yürüyebileceği şerit. Konumu siteden (globals.css)
         --pet-left / --pet-bottom ile gelir; geri düşüş değerleri sayesinde
         dosya tek başına (demo sayfası) da doğru çalışır.
         · sol: masaüstünde sabit kenar çubuğunun (z-index 100) sağından başlar,
           yoksa maskot onun ARKASINA yürüyüp kaybolur.
         · alt: telefonda cam dock'un ÜSTÜ; yoksa bacakları dock'un altında kalır.
         · env(safe-area-*): viewport-fit=cover açık (app/layout.tsx) → yatayda
           çentik kenarı düzenin içine giriyor. */
      '.bof-pet-field{position:fixed;height:0;pointer-events:none;' +
      'left:calc(var(--pet-left, 0px) + env(safe-area-inset-left, 0px));' +
      'right:env(safe-area-inset-right, 0px);' +
      'bottom:var(--pet-bottom, 0px)}' +
      /* not contain:paint — konuşma balonunu kırpar, o kutunun ÜSTÜNDE duruyor */
      '.bof-pet{position:absolute;left:0;bottom:0;will-change:transform;contain:layout style}' +
      '.bof-pet i{display:block;background-repeat:no-repeat;' +
      'image-rendering:pixelated;image-rendering:crisp-edges;transform-origin:50% 100%}' +
      '.bof-pet.is-interactive i{pointer-events:auto;cursor:pointer}' +
      '.bof-pet b{position:absolute;left:50%;bottom:100%;transform:translate(-50%,-6px);z-index:1;' +
      'display:none;white-space:nowrap;font:600 11px/1.35 ui-monospace,SFMono-Regular,Menlo,monospace;' +
      'background:#f6f3e6;color:#3a2318;border:2px solid #4c271a;border-radius:3px;' +
      'padding:2px 6px;pointer-events:none}' +
      '.bof-pet b:after{content:"";position:absolute;left:50%;top:100%;margin-left:-3px;' +
      'border:3px solid transparent;border-top-color:#4c271a}' +
      '.bof-pet b.show{display:block}';
    document.head.appendChild(css);
  }

  function Panda(opts) {
    this.o = Object.assign({}, DEFAULTS, opts || {});
    this.sheets = this.o.sheets || PANDA_SHEETS;
    // · BOF: ölçek verilmediyse ekrana göre seçilir VE yeniden boyutlandırmada
    //   yeniden seçilir (telefon → masaüstü penceresi, tablet döndürme).
    this.autoScale = this.o.scale == null;
    this.o.scale = Math.max(1, Math.round(this.autoScale ? this._autoScale() : this.o.scale));
    this.graph = this.o.graph || GRAPH;

    // · BOF: hangi sayfaların var sayılacağı artık sheets tablosundan türer.
    this.available = {};
    var self2 = this;
    Object.keys(this.sheets).forEach(function (k) { self2.available[k] = true; });

    this.pointer = null;      // {x, y} in CSS px, or null when it left
    this.followReady = 0;
    this._clock = 0;
    this.act = 'idle';
    this.sheet = null;
    this.frame = 0;
    this.frameAge = 0;
    this.facing = 1;
    this.y = 0;
    this.wait = 0;
    this.hold = 0;
    this.dir = 1;
    this.phase = null;
    this.speedNow = this.o.speed;
    this.tripHalf = null;
    this.running = false;
    this.raf = 0;
    this._loopBound = this._loop.bind(this);   // · BOF: kare başına bind YOK

    this._build();
    this.x = between(this._minX(), this._maxX());
    this._begin('idle');
  }

  // · BOF: 640px altında 1× — telefonda 2× panda ekranın ciddi bir bölümünü
  //   kaplıyor. Tam sayı ŞART: image-rendering:pixelated ondalık ölçekte
  //   pikselleri eşit olmayan bloklara böler.
  Panda.prototype._autoScale = function () {
    return (document.documentElement.clientWidth || global.innerWidth) < 640 ? 1 : 2;
  };

  Panda.prototype._build = function () {
    ensureCss();

    // · BOF: iki katman. Dış "alan" konumu CSS değişkenlerinden alır, iç öğe
    //   transform ile onun İÇİNDE gezer. Böylece maskotun yürüyebileceği
    //   genişlik alanın clientWidth'idir ve yalnız resize'da ölçülür —
    //   her karede düzen okuyup reflow tetiklemeye gerek kalmaz.
    this.field = document.createElement('div');
    this.field.className = 'bof-pet-field';
    this.field.style.zIndex = String(this.o.zIndex);
    this.field.setAttribute('aria-hidden', 'true');

    this.el = document.createElement('div');
    this.el.className = 'bof-pet';
    this.sprite = document.createElement('i');
    this.el.appendChild(this.sprite);
    this.bubble = document.createElement('b');
    this.el.appendChild(this.bubble);
    this.field.appendChild(this.el);
    document.body.appendChild(this.field);

    this.fieldW = this.field.clientWidth || global.innerWidth;

    if (this.o.interactive) {
      this.el.classList.add('is-interactive');
      var self0 = this;
      this._onPoke = function (e) { e.preventDefault(); self0.poke(); };
      this.sprite.addEventListener('click', this._onPoke);
    }

    // A missing sheet shouldn't break the panda: drop that activity instead.
    var self = this;
    Object.keys(this.sheets).forEach(function (k) {
      var img = new Image();
      img.onerror = function () { self.available[k] = false; };
      img.src = self._url(self.sheets[k].file);
    });

    // · BOF: resize alanı yeniden ölçer, ölçeği tazeler ve maskotu içeri çeker.
    //   Eskiden yalnız x kırpılıyordu: pencere daraldığında panda dışarıda
    //   kalıyor, telefon-masaüstü geçişinde ölçek eski değerde donuyordu.
    this._onResize = function () {
      self.fieldW = self.field.clientWidth || global.innerWidth;
      self._fLeft = null;             // kenar çubuğu genişliği kırılım noktasında değişir
      if (self.autoScale) {
        var s = self._autoScale();
        if (s !== self.o.scale) {
          // tripHalf yürüyüş yarı-genişliğidir ve ölçekle DOĞRU orantılı.
          // Oranla güncellenmezse kenar payı eski ölçekte kalır: telefona
          // küçülünce panda sağ kenardan bir gövde uzakta duruyordu (bir
          // sonraki _begin'e kadar). Etkin sayfayı bilmeye gerek yok.
          if (self.tripHalf != null) self.tripHalf = self.tripHalf * s / self.o.scale;
          self.o.scale = s;
          var cur = self.sheet;
          self.sheet = null;          // _setSheet erken çıkışını atlat
          if (cur) self._setSheet(cur);
        }
      }
      self._invalidate();
      self._clampX();
      self._draw();
    };
    global.addEventListener('resize', this._onResize, { passive: true });
    if (global.visualViewport) {
      // iOS'ta adres çubuğu/klavye yalnız visual viewport'u değiştirir; dock
      // gizlenince --pet-bottom değişir ama resize tetiklenmeyebilir.
      global.visualViewport.addEventListener('resize', this._onResize, { passive: true });
    }

    if (this.o.followCursor) {
      var self1 = this;
      this._onMove = function (e) {
        self1.pointer = { x: e.clientX, y: e.clientY, t: Date.now() };
      };
      this._onLeave = function () { self1.pointer = null; };
      // a coarse pointer means touch: there is no hover to follow
      var coarse = global.matchMedia &&
                   global.matchMedia('(pointer: coarse)').matches;
      if (!coarse) {
        global.addEventListener('pointermove', this._onMove, { passive: true });
        document.addEventListener('pointerleave', this._onLeave, { passive: true });
      }
    }
  };

  // · BOF: sprite URL'i — sürüm sorgusu ile (netlify.toml /pets/* 7 gün cache'ler,
  //   sprite değişirse ?v bump edilir).
  Panda.prototype._url = function (file) {
    return this.o.path + file + (this.o.bust ? '?v=' + this.o.bust : '');
  };

  Panda.prototype._halfW = function (sheet) {
    var sh = this.sheets[sheet || this.sheet || 'walk'] || this.sheets.idle;
    return (sh.w * this.o.scale) / 2;
  };
  Panda.prototype._trip = function () {
    return this.tripHalf != null ? this.tripHalf : this._halfW('walk');
  };
  Panda.prototype._minX = function () { return this.o.margin + this._trip(); };
  Panda.prototype._maxX = function () {
    // · BOF: innerWidth DEĞİL alanın kendi genişliği. innerWidth klasik kaydırma
    //   çubuğunu da sayar (Windows masaüstü) → maskot çubuğun altına giriyordu.
    return Math.max(this._minX(), this.fieldW - this.o.margin - this._trip());
  };
  Panda.prototype._clampX = function () {
    this.x = Math.min(this._maxX(), Math.max(this._minX(), this.x));
  };

  Panda.prototype._setSheet = function (name) {
    if (this.sheet === name) return;
    this.sheet = name;
    this.frame = 0;
    this.frameAge = 0;
    var sh = this.sheets[name], s = this.o.scale;
    this.sprite.style.width = sh.w * s + 'px';
    this.sprite.style.height = sh.h * s + 'px';
    this.sprite.style.backgroundImage = 'url("' + this._url(sh.file) + '")';
    this.sprite.style.backgroundSize = (sh.w * sh.frames * s) + 'px ' + (sh.h * s) + 'px';
    this._invalidate();
  };

  // set sheet and frame together: _setSheet resets the frame on its own
  Panda.prototype._show = function (sheet, frame) {
    this._setSheet(sheet);
    this.frame = frame;
  };

  // · BOF: _draw'ın yazma önbelleği. Sayfa/ölçek değişince önbellek geçersizdir.
  Panda.prototype._invalidate = function () {
    this._lastBg = this._lastFlip = this._lastTf = null;
  };

  // · BOF: DEĞİŞMEYEN stili YAZMA. Önceden her karede üç stil özelliği
  //   yazılıyordu; panda oturup beklerken bile saniyede 60 kez stil yeniden
  //   hesabı tetikleniyordu. Beklerken kare 260-400 ms'de bir değişiyor, yani
  //   yazma sayısı ~%99 düşüyor — telefonda ölçülebilir bir batarya farkı.
  Panda.prototype._draw = function () {
    var sh = this.sheets[this.sheet], s = this.o.scale;
    var bg = (-this.frame * sh.w * s) + 'px 0';
    if (bg !== this._lastBg) { this.sprite.style.backgroundPosition = bg; this._lastBg = bg; }
    var flip = this.facing < 0 ? 'scaleX(-1)' : 'none';
    if (flip !== this._lastFlip) { this.sprite.style.transform = flip; this._lastFlip = flip; }
    var tf = 'translate3d(' + Math.round(this.x - sh.w * s / 2) + 'px,' +
             Math.round(-this.y) + 'px,0)';
    if (tf !== this._lastTf) { this.el.style.transform = tf; this._lastTf = tf; }
  };

  /* ---------------- activities ---------------- */

  Panda.prototype._begin = function (act) {
    if (!ACTS[act] || !this.available[ACTS[act].sheet]) act = 'idle';
    this.act = act;
    this.phase = null;
    this.hold = 0;
    this.y = 0;

    if (act === 'idle' || act === 'sit') {
      this.tripHalf = this._halfW('walk');
      this._setSheet(ACTS[act].sheet);
      this.msNow = ACTS[act].ms;
      this.wait = act === 'sit'
        ? between(this.o.sitMin, this.o.sitMax)
        : between(this.o.restMin, this.o.restMax);

    } else if (act === 'swipe') {
      this.tripHalf = this._halfW('walk');
      this._setSheet('swipe');
      this.msNow = ACTS.swipe.ms;
      this.swipesLeft = Math.max(1, this.o.swipeLoops);
      this.frame = 0;
      this.frameAge = 0;

    } else if (act === 'chase') {
      // Walk to stand under the pointer. Only its x matters: the panda is on the
      // floor and cannot follow a y coordinate.
      this.tripHalf = this._halfW('walk');
      this._setSheet('walk');
      this.msNow = ACTS.chase.ms;
      this.speedNow = this.o.speed * ACTS.chase.speed * between(0.9, 1.1);
      this.target = this._pointerX();
      this.facing = this.target < this.x ? -1 : 1;
      this.chaseLeft = this.o.chaseTimeout;

    } else if (act === 'hop') {
      this.tripHalf = this._halfW('walk');
      this._setSheet('drop');
      this.msNow = 100000;          // frames are driven by the arc, not a timer
      this.frame = 0;
      this.frameAge = 0;
      this.hopsLeft = Math.max(1, this.o.hopTries);
      this.hopT = -this.o.hopRest;  // a beat of crouch before the first spring
      this.hopPhase = 'hopping';
      this.recoverT = 0;
      this.frame = CROUCH;
      this.y = 0;

    } else if (act === 'walk' || act === 'run') {
      this.tripHalf = this._halfW('walk');
      this._setSheet('walk');
      this.msNow = ACTS[act].ms;
      var j = this.o.speedJitter;
      this.speedNow = this.o.speed * ACTS[act].speed * between(1 - j, 1 + j);
      // Short hops, not full-width marches: crossing the whole viewport at walking
      // pace takes half a minute and drowns out every other behaviour.
      var lo = this._minX(), hi = this._maxX();
      var far = Math.min(this.o.maxTrip, hi - lo);
      var d = between(Math.min(90, far), far);
      var t = (Math.random() < 0.5) ? this.x - d : this.x + d;
      if (t < lo || t > hi) t = this.x - (t - this.x);      // bounce off the edge
      this.target = Math.min(hi, Math.max(lo, t));
      this.facing = this.target < this.x ? -1 : 1;

    } else if (act === 'climb') {
      this.tripHalf = this._halfW('climb');   // narrower, so it can hug the edge
      this._setSheet('walk');
      this.msNow = ACTS.run.ms;
      this.phase = 'approach';
      this.wall = Math.random() < 0.5 ? 'left' : 'right';
      this.target = this.wall === 'left' ? this._minX() : this._maxX();
      this.facing = this.target < this.x ? -1 : 1;
      this.speedNow = this.o.speed * ACTS.run.speed * between(0.85, 1.15);
      this.climbTo = 70 + Math.random() * Math.min(260, global.innerHeight * 0.35);
      this.dir = 1;
    }
    this._clampX();
  };

  Panda.prototype._pointerX = function () {
    // · BOF: imleç viewport koordinatında gelir, maskot ise alanın içinde
    //   yaşıyor → alanın sol kenarı kadar kaydır, yoksa masaüstünde kenar
    //   çubuğu genişliği kadar sağa nişan alır.
    var px = this.pointer ? this.pointer.x - this._fieldLeft() : this.x;
    return Math.min(this._maxX(), Math.max(this._minX(), px));
  };

  Panda.prototype._fieldLeft = function () {
    // resize'da bir kez ölçülür; getBoundingClientRect her karede çağrılmaz.
    if (this._fLeft == null) this._fLeft = this.field.getBoundingClientRect().left;
    return this._fLeft;
  };

  // Is the pointer worth walking over to? Near enough, not already underneath,
  // and not so soon after the last time that the panda looks obsessive.
  Panda.prototype._pointerInteresting = function (now) {
    if (!this.o.followCursor || !this.pointer) { return false; }
    if (now < this.followReady) { return false; }
    var dx = Math.abs((this.pointer.x - this._fieldLeft()) - this.x);
    if (dx > this.o.followRadius || dx < 40) { return false; }
    if (Date.now() - this.pointer.t > 1200) { return false; }  // pointer went idle
    return Math.random() < this.o.followChance;
  };

  Panda.prototype._next = function () {
    var self = this;
    if (this.available.walk && this._pointerInteresting(this._clock)) {
      this.followReady = this._clock + this.o.followCooldown;
      this._begin('chase');
      return;
    }
    var opts = (this.graph[this.act] || ['idle']).filter(function (a) {
      return ACTS[a] && self.available[ACTS[a].sheet];
    });
    this._begin(opts.length ? pick(opts) : 'idle');
  };

  Panda.prototype._tick = function (dt) {
    var o = this.o, sh = this.sheets[this.sheet];
    this._clock = (this._clock || 0) + dt;

    // Resting on the wall must look like resting, so freeze there. Coming back
    // down replays the cycle backwards so it reads as descending.
    if (this.phase === 'hang') {
      this.frame = o.climbHoldFrame % this.sheets.climb.frames;
      this.frameAge = 0;
    } else {
      var fstep = (this.phase === 'down') ? -1 : 1;
      var ms = this.msNow || ACTS[this.act].ms;
      this.frameAge += dt;
      while (this.frameAge >= ms) {
        this.frameAge -= ms;
        if (this.phase === 'land') {
          // squash-and-recover runs once and holds on the last frame
          if (this.frame < sh.frames - 1) { this.frame++; }
        } else {
          var wrapped = (this.frame + fstep + sh.frames) % sh.frames;
          if (this.act === 'swipe' && wrapped === 0 && this.frame !== 0) {
            this.swipesLeft--;
          }
          this.frame = wrapped;
        }
      }
    }

    if (this.act === 'chase') {
      // keep re-aiming: the pointer moves while the panda is on its way
      if (this.pointer) this.target = this._pointerX();
      this.chaseLeft -= dt;
      var cs = this.speedNow * dt / 1000;
      if (this.chaseLeft <= 0) {
        // the pointer kept moving; hop where it stands rather than chase forever
        this._begin((this.available.drop && this.available.swipe) ? 'hop' : 'idle');
      } else if (Math.abs(this.target - this.x) <= cs) {
        this.x = this.target;
        this._begin((this.available.drop && this.available.swipe) ? 'hop' : 'idle');
      } else {
        this.x += (this.target > this.x ? 1 : -1) * cs;
        this.facing = this.target > this.x ? 1 : -1;
      }

    } else if (this.act === 'hop') {
      if (this.hopPhase === 'recover') {
        // squash -> gather -> stand, each held long enough to actually register
        this.recoverT += dt;
        var stage = Math.floor(this.recoverT / o.hopRecoverMs);
        this.y = 0;
        this._show('drop', stage <= 0 ? SQUASH : (stage === 1 ? CROUCH : STAND));
        if (stage >= 3) { this._begin('sit'); }
        return this._draw();
      }
      // One arc: crouch, spring, apex, come down. It never gets near the pointer,
      // which is the whole joke -- hopHeight is far below any realistic cursor.
      this.hopT += dt;
      if (this.hopT < 0) {
        // just landed: squash for a moment, then gather for the next spring
        this._show('drop', (this.hopT < -o.hopRest + 90) ? SQUASH : CROUCH);
        this.y = 0;
      } else if (this.hopT <= o.hopMs) {
        var u = this.hopT / o.hopMs;          // 0..1 across the arc
        this.y = o.hopHeight * 4 * u * (1 - u);
        if (u < 0.15)      { this._show('drop',  CROUCH); }      // pushing off
        else if (u < 0.38) { this._show('swipe', REACH_LOW); }   // paw coming up
        else if (u < 0.68) { this._show('swipe', REACH_HIGH); }  // reaching, at the top
        else if (u < 0.88) { this._show('swipe', REACH_LOW); }   // paw dropping
        else               { this._show('drop',  CROUCH); }      // legs down to land
      } else {
        this.y = 0;
        this._show('drop', SQUASH);
        this.hopsLeft--;
        this.hopT = -o.hopRest;
        if (this.hopsLeft <= 0) {
          // Play the get-up properly instead of setting the frame and handing
          // off in the same tick, which showed it for exactly zero frames.
          this.hopPhase = 'recover';
          this.recoverT = 0;
          this.say(pick(['...', '?', 'hmf']));
        }
      }

    } else if (this.act === 'swipe') {
      if (this.swipesLeft <= 0) this._next();

    } else if (this.act === 'idle' || this.act === 'sit') {
      this.wait -= dt;
      if (this.wait <= 0) this._next();

    } else if (this.act === 'walk' || this.act === 'run') {
      var step = this.speedNow * dt / 1000;
      if (Math.abs(this.target - this.x) <= step) {
        this.x = this.target;
        this._next();
      } else {
        this.x += (this.target > this.x ? 1 : -1) * step;
      }

    } else if (this.act === 'climb') {
      if (this.phase === 'approach') {
        var s2 = this.speedNow * dt / 1000;
        if (Math.abs(this.target - this.x) <= s2) {
          this.x = this.target;
          this.facing = this.wall === 'left' ? -1 : 1;
          this._setSheet('climb');
          this.msNow = ACTS.climb.ms;
          this.phase = 'up';
        } else {
          this.x += (this.target > this.x ? 1 : -1) * s2;
        }

      } else if (this.phase === 'up') {
        this.y += o.climbSpeed * dt / 1000;
        if (this.y >= this.climbTo) {
          this.y = this.climbTo;
          this.phase = 'hang';
          this.hold = between(o.climbPauseMin, o.climbPauseMax);
          this.frame = o.climbHoldFrame % this.sheets.climb.frames;
          this.frameAge = 0;
        }

      } else if (this.phase === 'hang') {
        this.hold -= dt;
        if (this.hold <= 0) {
          if (this.available.drop) {
            this._setSheet('drop');   // frame 0 is the falling pose
            this.msNow = 100000;      // hold that pose for the whole fall
            this.frame = AIRBORNE;
            this.frameAge = 0;
            this.phase = 'fall';
          } else {
            this.phase = 'down';      // no drop art: climb back down instead
          }
        }

      } else if (this.phase === 'fall') {
        this.y -= o.fallSpeed * dt / 1000;
        if (this.y <= 0) {
          this.y = 0;
          this.phase = 'land';
          this.msNow = o.landMs;
          this.frame = 1;             // frames 1..3 are squash -> recover
          this.frameAge = 0;
        }

      } else if (this.phase === 'land') {
        // hold the recovered pose for a beat, otherwise the last frame advances
        // and hands off in the same tick and is never actually seen
        if (this.frame >= this.sheets.drop.frames - 1) {
          this.hold -= dt;
          if (this.hold <= 0) this._next();
        } else {
          this.hold = o.landMs * 3;
        }

      } else if (this.phase === 'down') {
        this.y -= o.climbSpeed * dt / 1000;
        if (this.y <= 0) {
          this.y = 0;
          this._next();
        }
      }
    }

    this._clampX();
    this._draw();
  };

  Panda.prototype._loop = function (now) {
    if (!this.running) return;
    var dt = Math.min(100, now - (this.last || now));
    this.last = now;
    if (!document.hidden) this._tick(dt);
    this.raf = global.requestAnimationFrame(this._loopBound);
  };

  Panda.prototype.start = function () {
    if (this.running) return this;
    var still = global.matchMedia &&
                global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Hareket azaltma açıksa maskot durur ama KAYBOLMAZ: oturan tek kare çizilir.
    if (still) { this._setSheet(this.available.sit ? 'sit' : 'idle'); this._draw(); return this; }
    this.running = true;
    this.last = 0;
    this.raf = global.requestAnimationFrame(this._loopBound);
    return this;
  };

  Panda.prototype.stop = function () {
    this.running = false;
    if (this.raf) { global.cancelAnimationFrame(this.raf); this.raf = 0; }
    return this;
  };

  Panda.prototype.say = function (msg, ms) {
    if (!this.bubble) return;
    this.bubble.textContent = msg;
    this.bubble.classList.add('show');
    clearTimeout(this._sayTimer);
    var b = this.bubble;
    this._sayTimer = setTimeout(function () { b.classList.remove('show'); },
                                ms || this.o.speechMs);
  };

  // Poking interrupts whatever it was doing. Mid-climb it just chirps, because
  // yanking it into a swipe would leave it hanging in mid-air.
  Panda.prototype.poke = function () {
    if (!this.running) return;
    this.say(pick(this.o.sayings));
    // off the ground: it can chirp back, but must not be yanked into a
    // ground animation while airborne
    if (this.y > 0 || this.act === 'climb' || this.act === 'hop') return;
    if (this.available.swipe) this._begin('swipe');
  };

  Panda.prototype.destroy = function () {
    this.stop();
    clearTimeout(this._sayTimer);
    if (this._onPoke && this.sprite) {
      this.sprite.removeEventListener('click', this._onPoke);
    }
    global.removeEventListener('resize', this._onResize);
    if (global.visualViewport) {
      global.visualViewport.removeEventListener('resize', this._onResize);
    }
    if (this._onMove) {
      global.removeEventListener('pointermove', this._onMove);
      document.removeEventListener('pointerleave', this._onLeave);
    }
    if (this.field && this.field.parentNode) this.field.parentNode.removeChild(this.field);
  };

  global.BasementPet = {
    start: function (opts) {
      if (global.__bofPet) global.__bofPet.destroy();
      global.__bofPet = new Panda(opts).start();
      return global.__bofPet;
    },
    stop: function () { if (global.__bofPet) global.__bofPet.stop(); },
    remove: function () {
      if (global.__bofPet) { global.__bofPet.destroy(); global.__bofPet = null; }
    },
    current: function () { return global.__bofPet || null; },
    defaults: DEFAULTS,
    sheets: PANDA_SHEETS,
    graph: GRAPH
  };
  // · BOF: eski ad — panda-demo.html ve yerel denemeler kırılmasın.
  global.BasementPanda = global.BasementPet;
})(window);
