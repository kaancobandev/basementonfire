// "Ayna Nöronları" — bespoke immersive makale (einstein-rosen deseni).
// CSS/HTML/JS string olarak page.tsx'e verilir; ArticleRuntime three.js CDN'ini
// yükleyip JS'i çalıştırır ve unmount'ta window.__articleCleanup ile temizler.
// Kapsam sınıfı: .ayn-root. Fontlar page.tsx'te Google Fonts ile yüklenir.

export const CSS = `
.ayn-root{
  --ink:#0a0d16; --ink2:#0d1120; --panel:#111726; --panel2:#151b2c;
  --line:rgba(255,255,255,.09); --line2:rgba(255,255,255,.05);
  --bone:#eef1f8; --dim:#c6ccdf; --muted:#939cbb; --faint:#5f6789;
  --self:#ff7a5c; --self2:#ffb454; --mirror:#43e8c9; --mirror2:#48b8ff; --seam:#f2eeff;
  --serif:"Fraunces",Georgia,serif; --body:"Manrope",system-ui,sans-serif; --mono:"Space Mono",ui-monospace,monospace;
  --maxw:1060px; --readw:680px;
  margin:0; background:var(--ink); color:var(--bone);
  font-family:var(--body); font-size:17px; line-height:1.68; -webkit-font-smoothing:antialiased; overflow-x:hidden;
}
.ayn-root a{ color:inherit; }
.ayn-root .shell{ max-width:var(--maxw); margin:0 auto; padding:0 24px; }
.ayn-root .read{ max-width:var(--readw); margin:0 auto; }
.ayn-root .kick{ font-family:var(--mono); font-size:.7rem; letter-spacing:.32em; text-transform:uppercase; color:var(--muted); }
.ayn-root .ayn-progress{ position:fixed; top:0; left:0; right:0; height:3px; z-index:130; background:linear-gradient(90deg,var(--self),var(--seam),var(--mirror)); transform:scaleX(0); transform-origin:0 50%; }
html.reduced .ayn-root .ayn-progress{ display:none; }

/* brandbar */
.ayn-root .brandbar{ position:relative; z-index:30; display:flex; align-items:center; gap:12px; max-width:var(--maxw); margin:0 auto; padding:24px 24px 0; }
.ayn-root .brandbar .mark{ font-family:var(--mono); font-size:.72rem; letter-spacing:.28em; text-transform:uppercase; }
.ayn-root .brandbar .mark b{ background:linear-gradient(90deg,var(--self),var(--mirror)); -webkit-background-clip:text; background-clip:text; color:transparent; font-weight:700; }
.ayn-root .brandbar .rule{ flex:1; height:1px; background:var(--line); }
.ayn-root .brandbar .tag{ font-family:var(--mono); font-size:.64rem; letter-spacing:.2em; text-transform:uppercase; color:var(--faint); }

/* hero */
.ayn-root .hero{ position:relative; min-height:100vh; min-height:100svh; overflow:hidden; display:flex; flex-direction:column; justify-content:flex-end; }
.ayn-root #ayn-3d{ position:absolute; inset:0; width:100%; height:100%; display:block; z-index:1; }
.ayn-root .hero-fallback{ position:absolute; inset:0; z-index:0; background:radial-gradient(60% 50% at 30% 40%,rgba(255,122,92,.14),transparent 60%),radial-gradient(60% 50% at 70% 40%,rgba(67,232,201,.14),transparent 60%); }
.ayn-root .hero-grad{ position:absolute; inset:0; z-index:2; pointer-events:none; background:linear-gradient(to top,var(--ink) 3%,rgba(10,13,22,.5) 30%,transparent 60%); }
.ayn-root .hero-in{ position:relative; z-index:3; max-width:var(--maxw); margin:0 auto; width:100%; padding:0 24px 58px; }
.ayn-root h1{ font-family:var(--serif); font-weight:400; font-size:clamp(2.7rem,8.4vw,5.6rem); line-height:.96; letter-spacing:-.018em; margin:.3em 0 .2em; max-width:14ch; }
.ayn-root h1 em{ font-style:italic; background:linear-gradient(92deg,var(--self),var(--mirror)); -webkit-background-clip:text; background-clip:text; color:transparent; }
.ayn-root .lede{ font-size:1.16rem; color:var(--dim); max-width:50ch; margin:0; }
.ayn-root .lede em{ font-style:normal; color:var(--bone); font-weight:600; }
.ayn-root .legend{ display:flex; gap:20px; margin-top:16px; font-family:var(--mono); font-size:.68rem; letter-spacing:.05em; flex-wrap:wrap; }
.ayn-root .legend span{ display:inline-flex; align-items:center; gap:8px; color:var(--muted); }
.ayn-root .legend i{ width:9px; height:9px; border-radius:50%; }
.ayn-root .legend .cs{ background:var(--self); box-shadow:0 0 10px var(--self); }
.ayn-root .legend .cm{ background:var(--mirror); box-shadow:0 0 10px var(--mirror); }
.ayn-root .scrollhint{ font-family:var(--mono); font-size:.64rem; letter-spacing:.22em; text-transform:uppercase; color:var(--faint); margin-top:20px; }

/* sections */
.ayn-root .sec{ padding:64px 0; }
.ayn-root .sec.tinted{ background:linear-gradient(180deg,var(--ink),var(--ink2)); border-top:1px solid var(--line2); border-bottom:1px solid var(--line2); }
.ayn-root .eyebrow{ display:flex; align-items:center; gap:12px; margin-bottom:14px; }
.ayn-root .eyebrow .ln{ flex:1; height:1px; background:var(--line); }
.ayn-root h2{ font-family:var(--serif); font-weight:400; font-size:clamp(1.8rem,4.6vw,2.7rem); line-height:1.04; letter-spacing:-.012em; margin:0 0 14px; }
.ayn-root h2 em{ font-style:italic; color:var(--mirror); }
.ayn-root h3{ font-family:var(--serif); font-weight:600; font-size:1.24rem; margin:34px 0 8px; }
.ayn-root .read p{ margin:0 0 20px; color:var(--dim); }
.ayn-root .read p:first-of-type{ font-size:1.05rem; }
.ayn-root .read p strong{ color:var(--bone); font-weight:600; }
.ayn-root .lead-cap::first-letter{ font-family:var(--serif); font-size:3.4em; line-height:.8; float:left; padding:6px 12px 0 0; color:var(--self); font-weight:600; }
.ayn-root .ayn-ilink{ color:var(--mirror); text-decoration:none; border-bottom:1px solid rgba(67,232,201,.35); transition:border-color .15s; }
.ayn-root .ayn-ilink:hover{ border-bottom-color:var(--mirror); }
.ayn-root .pull{ font-family:var(--serif); font-size:clamp(1.4rem,3.6vw,2rem); line-height:1.25; color:var(--bone); margin:38px 0; padding-left:20px; border-left:2px solid; border-image:linear-gradient(var(--self),var(--mirror)) 1; font-style:italic; }
.ayn-root .fig{ font-family:var(--mono); font-size:.72rem; color:var(--faint); margin-top:8px; letter-spacing:.03em; }

/* reveal */
.ayn-root .reveal{ opacity:0; transform:translateY(22px); transition:opacity .7s cubic-bezier(.22,1,.36,1),transform .7s cubic-bezier(.22,1,.36,1); }
.ayn-root .reveal.in{ opacity:1; transform:none; }
html.reduced .ayn-root .reveal{ opacity:1; transform:none; transition:none; }
html:not(.js) .ayn-root .reveal{ opacity:1; transform:none; }

/* interaktif kart tabanı */
.ayn-root .lab{ background:var(--panel); border:1px solid var(--line); border-radius:20px; padding:24px; margin:30px 0; }
.ayn-root .lab .lab-h{ font-family:var(--mono); font-size:.66rem; letter-spacing:.16em; text-transform:uppercase; color:var(--muted); display:flex; align-items:center; gap:8px; margin-bottom:4px; }
.ayn-root .lab .lab-t{ font-family:var(--serif); font-size:1.25rem; margin:0 0 4px; }
.ayn-root .lab .lab-d{ font-size:.92rem; color:var(--muted); margin:0 0 18px; max-width:56ch; }
.ayn-root .lab .lab-note{ font-size:.82rem; color:var(--faint); margin-top:16px; }
.ayn-root .btn{ font-family:var(--mono); font-size:.76rem; letter-spacing:.05em; border:none; border-radius:999px; padding:11px 20px; cursor:pointer; font-weight:700; color:#0a0d16; background:linear-gradient(92deg,var(--self),var(--mirror)); }
.ayn-root .btn.ghost{ background:transparent; color:var(--bone); border:1px solid var(--line); }
.ayn-root .btn.ghost.on{ border-color:var(--mirror); color:var(--mirror); }
.ayn-root .btn:focus-visible, .ayn-root .btn.ghost:focus-visible{ outline:2px solid var(--mirror); outline-offset:2px; }

/* INT1 nöronu ateşle */
.ayn-root .fire-row{ display:grid; grid-template-columns:1fr auto 1fr; gap:16px; align-items:center; }
.ayn-root .brainbox{ border:1px solid var(--line); border-radius:16px; padding:16px; text-align:center; background:rgba(255,255,255,.02); transition:box-shadow .25s; }
.ayn-root .brainbox.fire.self{ box-shadow:0 0 0 1px var(--self),0 0 40px -8px var(--self); }
.ayn-root .brainbox.fire.mir{ box-shadow:0 0 0 1px var(--mirror),0 0 40px -8px var(--mirror); }
.ayn-root .brainbox .bl{ font-family:var(--mono); font-size:.64rem; letter-spacing:.14em; text-transform:uppercase; color:var(--muted); }
.ayn-root .bars{ display:flex; gap:4px; justify-content:center; align-items:flex-end; height:58px; margin-top:12px; }
.ayn-root .bars i{ width:7px; border-radius:3px 3px 0 0; height:8px; transition:height .16s; }
.ayn-root .brainbox.self .bars i{ background:linear-gradient(var(--self2),var(--self)); }
.ayn-root .brainbox.mir .bars i{ background:linear-gradient(var(--mirror2),var(--mirror)); }
.ayn-root .fire-arrow{ font-family:var(--mono); font-size:.68rem; color:var(--faint); text-align:center; white-space:nowrap; }
@media(max-width:560px){ .ayn-root .fire-row{ grid-template-columns:1fr; } .ayn-root .fire-arrow{ transform:rotate(90deg); } }

/* INT2 eylem vs gözlem */
.ayn-root .ao-btns{ display:flex; gap:10px; flex-wrap:wrap; margin-bottom:16px; }
.ayn-root .scope{ position:relative; height:120px; border:1px solid var(--line); border-radius:14px; background:radial-gradient(120% 100% at 50% 120%,rgba(67,232,201,.06),transparent); overflow:hidden; }
.ayn-root .scope canvas{ width:100%; height:100%; display:block; }
.ayn-root .ao-read{ font-family:var(--mono); font-size:.72rem; color:var(--muted); margin-top:10px; }
.ayn-root .ao-read b{ color:var(--mirror); }

/* INT3 bulaşma */
.ayn-root .cont-row{ display:grid; grid-template-columns:auto 1fr; gap:20px; align-items:center; }
@media(max-width:520px){ .ayn-root .cont-row{ grid-template-columns:1fr; } }
.ayn-root .face{ width:120px; height:120px; border-radius:50%; border:1px solid var(--line); background:radial-gradient(circle at 50% 40%,var(--panel2),var(--panel)); cursor:pointer; position:relative; margin:0 auto; }
.ayn-root .face svg{ width:100%; height:100%; }
.ayn-root .meter{ height:12px; border-radius:8px; background:rgba(255,255,255,.06); overflow:hidden; }
.ayn-root .meter i{ display:block; height:100%; width:0%; background:linear-gradient(90deg,var(--self2),var(--self)); transition:width .5s cubic-bezier(.22,1,.36,1); }
.ayn-root .meter-lab{ font-family:var(--mono); font-size:.7rem; color:var(--muted); display:flex; justify-content:space-between; margin-bottom:6px; }

/* INT4 öğrenme */
.ayn-root .learn-slider{ width:100%; margin:6px 0 4px; accent-color:var(--mirror); }
.ayn-root .learn-grid{ display:grid; grid-template-columns:1fr 1fr; gap:16px; align-items:center; margin-top:8px; }
@media(max-width:520px){ .ayn-root .learn-grid{ grid-template-columns:1fr; } }
.ayn-root .learn-bar{ height:70px; display:flex; align-items:flex-end; gap:0; }
.ayn-root .learn-bar .fillb{ width:100%; border-radius:8px 8px 0 0; background:linear-gradient(var(--mirror2),var(--mirror)); height:4%; transition:height .25s; }
.ayn-root .learn-num{ font-family:var(--mono); font-size:1.5rem; color:var(--mirror); }
.ayn-root .learn-cap{ font-family:var(--mono); font-size:.7rem; color:var(--muted); }

/* mirror-quote (tartışma iki yüz) */
.ayn-root .mirrorquote{ display:grid; grid-template-columns:1fr 1fr; gap:1px; background:var(--line); border-radius:18px; overflow:hidden; border:1px solid var(--line); margin:30px 0; }
@media(max-width:560px){ .ayn-root .mirrorquote{ grid-template-columns:1fr; } }
.ayn-root .mq{ padding:22px; background:var(--ink); }
.ayn-root .mq.self{ border-top:2px solid var(--self); }
.ayn-root .mq.mir{ border-top:2px solid var(--mirror); }
.ayn-root .mq .who{ font-family:var(--mono); font-size:.66rem; letter-spacing:.12em; text-transform:uppercase; color:var(--muted); margin-bottom:10px; }
.ayn-root .mq p{ font-family:var(--serif); font-size:1.06rem; line-height:1.5; margin:0; color:var(--dim); }

/* alakalı / footer */
.ayn-root .related{ display:flex; gap:14px; flex-wrap:wrap; margin-top:10px; }
.ayn-root .related a{ flex:1; min-width:200px; text-decoration:none; border:1px solid var(--line); border-radius:14px; padding:16px 18px; background:var(--panel); transition:border-color .15s,transform .15s; }
.ayn-root .related a:hover{ border-color:var(--mirror); transform:translateY(-2px); }
.ayn-root .related .rl-k{ font-family:var(--mono); font-size:.62rem; letter-spacing:.14em; text-transform:uppercase; color:var(--faint); }
.ayn-root .related .rl-t{ font-family:var(--serif); font-size:1.1rem; margin-top:4px; color:var(--bone); }

@media(max-width:640px){ .ayn-root{ font-size:16px; } .ayn-root .sec{ padding:48px 0; } }
`;

export const HTML = `
<div class="ayn-progress" id="ayn-progress"></div>

<div class="brandbar">
  <span class="mark"><b>BASEMENTS</b></span>
  <span class="rule"></span>
  <span class="tag">Sinir Bilim · İnteraktif</span>
</div>

<header class="hero">
  <div class="hero-fallback"></div>
  <canvas id="ayn-3d" aria-hidden="true"></canvas>
  <div class="hero-grad"></div>
  <div class="hero-in">
    <div class="kick">Sinirsel Aynalama</div>
    <h1>Ayna <em>Nöronları</em></h1>
    <p class="lede">Sen bir fıstığı kavradığında beynindeki bir nöron ateşlendi. Peki başkasının kavradığını yalnızca <em>izlerken</em> aynı nöron neden yeniden ateşlendi?</p>
    <div class="legend">
      <span><i class="cs"></i> Sol — sen (eylem)</span>
      <span><i class="cm"></i> Sağ — ayna (gözlem)</span>
    </div>
    <div class="scrollhint">imleci gezdir · sağ taraf seni yankılar ↓</div>
  </div>
</header>

<main>
  <section class="sec"><div class="shell"><div class="read">
    <p class="lead-cap reveal">1990'ların başında, Parma'da bir laboratuvarda, bir makak maymununun beynine takılı elektrotlar tuhaf bir şey söylüyordu. Maymun bir üzüm tanesine uzanıp kavradığında, premotor korteksindeki (F5 denen bölge) belirli bir hücre ateşleniyordu — buraya kadar beklenen bir şey. Ama sonra araştırmacılardan biri aynı üzüme uzandı, maymun sadece <strong>izledi</strong> — ve o hücre yine ateşlendi. Sanki maymunun beyni, başkasının hareketini kendi içinde <strong>tekrar oynatıyordu</strong>.</p>
    <p class="reveal">Giacomo Rizzolatti, Vittorio Gallese, Leonardo Fogassi, Luciano Fadiga ve Giuseppe di Pellegrino'nun bulduğu bu hücreler <strong>ayna nöronları</strong> adını aldı: eylemi yapan sen de olsan, izleyen de olsan aynı şekilde tepki veriyorlar. İlk ölçümler 1992'de yayımlandı; dört yıl sonra <em>Brain</em> dergisindeki makale konuyu bilim dünyasına taşıdı. Ve ardından ortalık kopardı.</p>
    <p class="pull reveal">Bir hücre, "yapmak" ile "görmek" arasındaki sınırı umursamıyordu. Bu, beynin başkalarını nasıl anladığına dair devrimci bir ipucu gibiydi.</p>
  </div></div></section>

  <section class="sec tinted"><div class="shell"><div class="read">
    <div class="eyebrow reveal"><span class="kick">Nasıl çalışır</span><span class="ln"></span></div>
    <h2 class="reveal">Beynin <em>tekrar oynatması</em></h2>
    <p class="reveal">Ayna nöronunun mantığı basit ama şaşırtıcı: bir eylemi gözlemlemek, o eylemi yapmakla ilgili motor devreyi kısmen etkinleştirir. Birinin bardağı kavradığını gördüğünde, senin "bardağı kavra" programının bir kopyası sessizce çalışır — kolun kımıldamadan. Beyin, dışarıdaki hareketi kendi eylem sözlüğüne çevirir.</p>
    <p class="reveal">Aşağıdaki butona bas. Solda <strong>senin</strong> motor nöronların bir desen ateşler; sağdaki <strong>ayna</strong> tarafı, kısa bir gecikmeyle aynı deseni yankılar. İşte gözlemin, eylemin bir yankısına dönüşmesi.</p>

    <div class="lab reveal">
      <div class="lab-h"><span>▶</span> İnteraktif · 01</div>
      <div class="lab-t">Nöronu ateşle</div>
      <div class="lab-d">Sen ateşle, ayna yankılasın. Aynı ateşleme deseni gecikmeyle sağda tekrar çıkıyor — aynalamanın çekirdeği.</div>
      <div class="fire-row">
        <div class="brainbox self" id="ayn-self"><div class="bl">Sen · eylem</div><div class="bars" id="ayn-barsS"></div></div>
        <div class="fire-arrow">→ yankı →</div>
        <div class="brainbox mir" id="ayn-mir"><div class="bl">Ayna · gözlem</div><div class="bars" id="ayn-barsM"></div></div>
      </div>
      <button class="btn" id="ayn-fire" type="button">⚡ Nöronu ateşle</button>
    </div>

    <p class="reveal">Peki nöron gerçekten "kim yaptı" diye bakmıyor mu? Kendin dene: aynı hücrenin izini hem <em>yaptığında</em> hem <em>izlediğinde</em> çiz. İz neredeyse aynı çıkar — nöron, failin kim olduğuyla ilgilenmiyor.</p>

    <div class="lab reveal">
      <div class="lab-h"><span>▶</span> İnteraktif · 02</div>
      <div class="lab-t">Eylem mi, gözlem mi?</div>
      <div class="lab-d">İki düğmeye sırayla bas. Osiloskop, senin bir F5 ayna nöronunun ateşlemesini gösteriyor — "yap" ile "izle" izleri örtüşüyor.</div>
      <div class="ao-btns">
        <button class="btn ghost" id="ayn-ao-do" type="button">✊ Kavra (yap)</button>
        <button class="btn ghost" id="ayn-ao-see" type="button">👁 İzle (gözlemle)</button>
      </div>
      <div class="scope"><canvas id="ayn-scope"></canvas></div>
      <div class="ao-read" id="ayn-ao-read">Son ateşleme: <b>—</b></div>
    </div>
  </div></div></section>

  <section class="sec"><div class="shell"><div class="read">
    <div class="eyebrow reveal"><span class="kick">Patlama</span><span class="ln"></span></div>
    <h2 class="reveal">"Medeniyeti şekillendiren nöron"</h2>
    <p class="reveal">Keşif, popüler bilimin en sevdiği türden bir hikâyeydi: karmaşık insan yeteneklerine tek, zarif bir açıklama. Ünlü nörobilimci V. S. Ramachandran, ayna nöronlarının "psikoloji için DNA'nın biyoloji için yaptığını yapacağını" söyledi ve onları <strong>"medeniyeti şekillendiren nöronlar"</strong> ilan etti. Empati, taklit, dilin evrimi, kültürün aktarımı — hepsi bu hücrelere bağlandı.</p>
    <p class="reveal">İddialar hızla büyüdü. Ayna nöronları empatinin kaynağıydı: başkasının acısını "aynaladığın" için hissediyordun. Otizm, "kırık ayna" hipoteziyle açıklandı — sistemin bozuk olması sosyal güçlükleri doğuruyordu. Bir nöron türü, birdenbire insan olmanın neredeyse her yönünü açıklıyor gibiydi.</p>
    <p class="reveal">İnsan beyninde de bir "ayna sistemi" olduğu, fMRI çalışmalarıyla desteklendi. 2010'da Roy Mukamel ve ekibi, epilepsi ameliyatı olan hastalarda <strong>tek tek nöron</strong> kaydı alarak, hem eylem yaparken hem izlerken tepki veren hücreleri insanda ilk kez doğrudan gösterdi. Ama detay önemliydi: bu hücreler "saf" ayna nöronları değildi; tepkileri çok daha karmaşıktı. İşaretler çelişmeye başlamıştı.</p>
  </div></div></section>

  <section class="sec tinted"><div class="shell"><div class="read">
    <div class="eyebrow reveal"><span class="kick">Geri tepki</span><span class="ln"></span></div>
    <h2 class="reveal">Sonra bilim <em>itiraz etti</em></h2>
    <p class="reveal">2014'te dilbilimci-nörobilimci Gregory Hickok, <em>The Myth of Mirror Neurons</em> (Ayna Nöronları Miti) adlı kitabıyla balonu iğneledi. Mantığı keskin: eğer tek bir mekanizma hem bir eylemi <strong>üretmeyi</strong> hem <strong>anlamayı</strong> sağlıyorsa, o mekanizma hasar gördüğünde ikisi birden kaybolmalı. Oysa konuşmada bu böyle değil — konuşma üretimi bozulan hastalar konuşmayı anlamaya devam edebiliyor. "Yaparak anlama" hikâyesi çatlıyordu.</p>
    <p class="reveal">Oxford'dan Cecilia Heyes ise daha da temel bir soru sordu: ayna nöronları özel, doğuştan gelen bir <em>evrimsel uyarlama</em> mı, yoksa sadece <strong>öğrenilmiş</strong> bir çağrışım mı? Onun "çağrışımsal öğrenme" görüşüne göre bu hücreler doğuştan gelmiyor; hayat boyunca aynı anda hem <strong>yapıp hem görerek</strong> (kendi elini kavrarken izleyerek, aynada kendini görerek) kuruluyorlar. Kanıt çarpıcı: insanlara ters eğitim verirsen — bir hareketi görünce zıddını yaptırırsan — "karşı-ayna" nöronları oluşturabilirsin. Yani sistem esnek; deneyimle şekilleniyor.</p>

    <div class="mirrorquote reveal">
      <div class="mq self"><div class="who">Parma ekolü — keşfin heyecanı</div><p>"Bu hücreler eylemi <em>içeriden</em> anlamamızı sağlar; empatinin, taklidin, belki dilin nöral temeli."</p></div>
      <div class="mq mir"><div class="who">Hickok / Heyes — temkin</div><p>"Belki hiç özel değiller. Doğuştan değil, doğduktan sonra yap-gör tekrarıyla öğrenilmiş — ve 'anlama'yı tek başlarına açıklamıyorlar."</p></div>
    </div>

    <p class="reveal">Peki bu öğrenme fikri gerçekten işe yarar mı? Kaydırıcıyı çek: bir bebeğin "elini uzat + kendi elini gör" tekrarları arttıkça, o eylemi izlemeye verilen ayna tepkisi güçleniyor. Sıfır tekrar → sıfır ayna. Bu, mucize bir modül olmadan da aynalamanın nasıl doğabileceğini gösteriyor.</p>

    <div class="lab reveal">
      <div class="lab-h"><span>▶</span> İnteraktif · 03</div>
      <div class="lab-t">Öğrenilmiş mi? (Heyes deneyi)</div>
      <div class="lab-d">"Yap + gör" tekrar sayısını değiştir. Ayna tepkisi tekrarlarla güçlenir — doğuştan bir program yerine bir çağrışım gibi.</div>
      <div class="learn-grid">
        <div>
          <label class="learn-cap" for="ayn-learn">Yap + gör tekrarı</label>
          <input class="learn-slider" id="ayn-learn" type="range" min="0" max="100" value="0" aria-label="Yap ve gör tekrar sayısı">
          <div class="learn-num" id="ayn-learn-n">0</div>
          <div class="learn-cap">tekrar</div>
        </div>
        <div>
          <div class="learn-cap" style="margin-bottom:8px">Gözleme verilen ayna tepkisi</div>
          <div class="learn-bar"><div class="fillb" id="ayn-learn-bar"></div></div>
        </div>
      </div>
    </div>
  </div></div></section>

  <section class="sec"><div class="shell"><div class="read">
    <div class="eyebrow reveal"><span class="kick">Peki gerçek ne?</span><span class="ln"></span></div>
    <h2 class="reveal">Aynalama gerçek — ama sihir değil</h2>
    <p class="reveal">Tartışmanın tozu durulunca ortaya daha dürüst, daha nüanslı bir tablo çıktı. Beyin başkalarını gözlemlerken kendi devrelerinin bir kısmını gerçekten yeniden etkinleştiriyor — buna kimse itiraz etmiyor. Ama bu "aynalama", pek çok kişinin sandığı gibi otomatik bir <em>anlama</em> makinesi değil. 2024'te <em>Quanta</em>'nın özetlediği gibi: aşırı maruz kalma, bilimi çarpıttı. Empati ile ayna nöron etkinliği arasındaki bağ, meta-analizlerde <strong>zayıf</strong> çıkıyor.</p>
    <p class="reveal">Üstelik aynalama sadece motor değil. Birinin tiksindiğini gördüğünde, senin de tiksinti işleyen beyin bölgen (insula) uyanır; birinin acı çektiğini izlediğinde acı ağının duygusal kısmı devreye girer. Bu "paylaşılan devreler", empatinin bir parçası olabilir — ama empatinin tamamı değil. Gerçek empati, başkasının bakış açısını bilinçli kurmayı da gerektiren, çok daha geniş bir sosyal beynin işi.</p>
    <p class="reveal">Ayna nöronları hâlâ ilginç ve gerçek. Ama onları "insanlığın sırrı" ilan etmek yerine, sosyal beynin büyük orkestrasındaki bir enstrüman olarak görmek daha doğru. Bu arada beynin başkalarını yankıladığını her gün hissedersin — sıradan bir esneme bile bunu kanıtlar.</p>

    <div class="lab reveal">
      <div class="lab-h"><span>▶</span> İnteraktif · 04</div>
      <div class="lab-t">Bulaşma: sen de aynalıyorsun</div>
      <div class="lab-d">Yüze bas — esnesin. Sende "esneme dürtüsü" ölçeri yükselir. Esnemenin bulaşıcılığı, motor/duygusal aynalamanın gündelik kanıtı (ve empatiyle ilişkili).</div>
      <div class="cont-row">
        <div class="face" id="ayn-face" role="button" tabindex="0" aria-label="Esneyen yüz — tıkla">
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="42" cy="50" r="4" fill="#939cbb" id="ayn-eyeL"></circle>
            <circle cx="78" cy="50" r="4" fill="#939cbb" id="ayn-eyeR"></circle>
            <ellipse cx="60" cy="82" rx="10" ry="8" fill="#0a0d16" stroke="#43e8c9" stroke-width="1.5" id="ayn-mouth"></ellipse>
          </svg>
        </div>
        <div>
          <div class="meter-lab"><span>Sende esneme dürtüsü</span><span id="ayn-cont-pct">0%</span></div>
          <div class="meter"><i id="ayn-cont-bar"></i></div>
          <div class="lab-note" id="ayn-cont-msg">Yüze bakınca ne hissettiğine dikkat et…</div>
        </div>
      </div>
    </div>

    <p class="pull reveal">Belki de en güzel yanı bu: ayna nöronları "empati nöronu" olmasa bile, beynin başkalarında kendini görme eğilimi tartışmasız gerçek. Bilim, cevabı basitleştirmeyi değil, doğru sormayı öğretti.</p>
  </div></div></section>

  <section class="sec tinted"><div class="shell"><div class="read">
    <div class="eyebrow reveal"><span class="kick">İlgili konular</span><span class="ln"></span></div>
    <h2 class="reveal">İpi ucundan çek</h2>
    <p class="reveal">Ayna sisteminin bir <em>evrimsel uyarlama mı yoksa öğrenilmiş bir çağrışım mı</em> olduğu tartışması, doğrudan doğal seçilimin ne yapıp ne yapamayacağıyla ilgili. Ve "ikinci beyin" dediğimiz bağırsak sinir sistemi, beynin tek karar merkezi olmadığını hatırlatıyor.</p>
    <div class="related reveal">
      <a class="ayn-ilink-card" href="/articles/dogal-secilim"><div class="rl-k">Biyoloji</div><div class="rl-t">Doğal Seçilim →</div></a>
      <a class="ayn-ilink-card" href="/articles/bagirsak"><div class="rl-k">Biyoloji</div><div class="rl-t">Bağırsak — İkinci Beyin →</div></a>
    </div>
  </div></div></section>
</main>
`;

export const JS = `
(function(){
  var reduce = document.documentElement.classList.contains('reduced');
  var cleanups = [];
  function onCleanup(fn){ cleanups.push(fn); }

  // ---- ilerleme çubuğu ----
  var prog = document.getElementById('ayn-progress');
  function onScroll(){
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var p = h > 0 ? window.scrollY / h : 0;
    if(prog) prog.style.transform = 'scaleX(' + Math.max(0, Math.min(1, p)) + ')';
  }
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  // ---- reveal ----
  var reveals = document.querySelectorAll('.ayn-root .reveal');
  if(reduce || !('IntersectionObserver' in window)){
    reveals.forEach(function(el){ el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function(es){
      es.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold:0.12, rootMargin:'0px 0px -8% 0px' });
    reveals.forEach(function(el){ io.observe(el); });
    onCleanup(function(){ io.disconnect(); });
  }

  // ================= HERO: aynalanan iki nöron ağı (three.js) =================
  (function hero(){
    var canvas = document.getElementById('ayn-3d');
    if(!canvas || typeof THREE === 'undefined') return;
    var W = canvas.clientWidth, H = canvas.clientHeight;
    var renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas:canvas, alpha:true, antialias:true }); }
    catch(e){ return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, 2));
    renderer.setSize(W, H, false);
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(52, W/H, 0.1, 100);
    camera.position.set(0, 0, 7.2);
    var group = new THREE.Group(); scene.add(group);

    // yuvarlak nokta dokusu
    var sc = document.createElement('canvas'); sc.width = sc.height = 64;
    var sx = sc.getContext('2d');
    var g = sx.createRadialGradient(32,32,0,32,32,32);
    g.addColorStop(0,'rgba(255,255,255,1)'); g.addColorStop(0.35,'rgba(255,255,255,0.85)'); g.addColorStop(1,'rgba(255,255,255,0)');
    sx.fillStyle = g; sx.fillRect(0,0,64,64);
    var sprite = new THREE.CanvasTexture(sc);

    // düğümler: sol yarı üret, sağa aynala
    var seedv = 7; function rnd(){ seedv = (seedv*1103515245+12345) & 0x7fffffff; return seedv/0x7fffffff; }
    var half = 15;
    var nodes = []; // {x,y,z, side, ph, lvl, baseR}
    var mirrorIndex = []; // sol düğümün sağ eşi
    for(var i=0;i<half;i++){
      var x = -(0.6 + rnd()*2.6);
      var y = (rnd()*2-1) * 2.5;
      var z = (rnd()*2-1) * 1.4;
      nodes.push({ x:x, y:y, z:z, side:-1, ph:rnd()*6.28, lvl:0 });
    }
    for(var i=0;i<half;i++){
      var n = nodes[i];
      mirrorIndex[i] = nodes.length;
      nodes.push({ x:-n.x, y:n.y, z:n.z, side:1, ph:n.ph, lvl:0 });
    }
    var N = nodes.length;

    // bağlantılar (sadece aynı yarı içinde, yakın olanlar)
    var links = [];
    for(var a=0;a<N;a++) for(var b=a+1;b<N;b++){
      if(nodes[a].side !== nodes[b].side) continue;
      var dx=nodes[a].x-nodes[b].x, dy=nodes[a].y-nodes[b].y, dz=nodes[a].z-nodes[b].z;
      if(Math.sqrt(dx*dx+dy*dy+dz*dz) < 1.7) links.push([a,b]);
    }

    var SELF=[1.0,0.48,0.36], MIR=[0.26,0.91,0.79];
    function baseCol(side){ return side<0 ? SELF : MIR; }

    // points geometry
    var pos = new Float32Array(N*3), col = new Float32Array(N*3);
    for(var i=0;i<N;i++){ pos[i*3]=nodes[i].x; pos[i*3+1]=nodes[i].y; pos[i*3+2]=nodes[i].z; }
    var pgeo = new THREE.BufferGeometry();
    pgeo.setAttribute('position', new THREE.BufferAttribute(pos,3));
    pgeo.setAttribute('color', new THREE.BufferAttribute(col,3));
    var pmat = new THREE.PointsMaterial({ size:0.34, map:sprite, vertexColors:true, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, sizeAttenuation:true });
    var points = new THREE.Points(pgeo, pmat); group.add(points);

    // lines geometry
    var lpos = new Float32Array(links.length*6), lcol = new Float32Array(links.length*6);
    for(var k=0;k<links.length;k++){
      var a=nodes[links[k][0]], b=nodes[links[k][1]];
      lpos[k*6]=a.x; lpos[k*6+1]=a.y; lpos[k*6+2]=a.z;
      lpos[k*6+3]=b.x; lpos[k*6+4]=b.y; lpos[k*6+5]=b.z;
    }
    var lgeo = new THREE.BufferGeometry();
    lgeo.setAttribute('position', new THREE.BufferAttribute(lpos,3));
    lgeo.setAttribute('color', new THREE.BufferAttribute(lcol,3));
    var lmat = new THREE.LineBasicMaterial({ vertexColors:true, transparent:true, opacity:0.6, depthWrite:false, blending:THREE.AdditiveBlending });
    var lines = new THREE.LineSegments(lgeo, lmat); group.add(lines);

    // ateşleme
    var firings = []; // {i, t, side}
    function fireNode(i, delay){ firings.push({ i:i, t:performance.now()+(delay||0) }); }
    function autoPulse(){
      var i = Math.floor(rnd()*half);         // sol düğüm
      fireNode(i, 0);
      fireNode(mirrorIndex[i], 460);          // sağ eş yankılar
    }

    // fare etkisi
    var tx=0, ty=0, cx=0, cy=0;
    function onMove(e){
      var r = canvas.getBoundingClientRect();
      tx = ((e.clientX - r.left)/r.width - 0.5);
      ty = ((e.clientY - r.top)/r.height - 0.5);
      // sol tarafa yakınsa bir düğümü uyar
      if(tx < 0 && rnd() < 0.25){
        var i = Math.floor(rnd()*half); fireNode(i,0); fireNode(mirrorIndex[i], 420);
      }
    }
    canvas.addEventListener('pointermove', onMove);

    function updateColors(now){
      for(var i=0;i<N;i++) nodes[i].lvl *= 0.90;
      for(var f=firings.length-1; f>=0; f--){
        var fr = firings[f]; if(now < fr.t) continue;
        var age = now - fr.t; if(age > 620){ firings.splice(f,1); continue; }
        var e = 1 - age/620;
        if(nodes[fr.i].lvl < e) nodes[fr.i].lvl = e;
        for(var k=0;k<links.length;k++){
          if(links[k][0]===fr.i){ var o=links[k][1]; if(nodes[o].lvl < e*0.5) nodes[o].lvl=e*0.5; }
          if(links[k][1]===fr.i){ var o2=links[k][0]; if(nodes[o2].lvl < e*0.5) nodes[o2].lvl=e*0.5; }
        }
      }
      var cattr = pgeo.attributes.color.array;
      for(var i=0;i<N;i++){
        var nd = nodes[i]; var bc = baseCol(nd.side);
        var breathe = 0.42 + 0.28*Math.sin(now/1500 + nd.ph);
        var m = breathe + nd.lvl*2.4;
        cattr[i*3] = Math.min(1.6, bc[0]*m); cattr[i*3+1] = Math.min(1.6, bc[1]*m); cattr[i*3+2] = Math.min(1.6, bc[2]*m);
      }
      pgeo.attributes.color.needsUpdate = true;
      var lc = lgeo.attributes.color.array;
      for(var k=0;k<links.length;k++){
        var a=nodes[links[k][0]], b=nodes[links[k][1]];
        var bc = baseCol(a.side); var gl = Math.max(a.lvl,b.lvl);
        var m = 0.10 + gl*1.4;
        lc[k*6]=bc[0]*m; lc[k*6+1]=bc[1]*m; lc[k*6+2]=bc[2]*m;
        lc[k*6+3]=bc[0]*m; lc[k*6+4]=bc[1]*m; lc[k*6+5]=bc[2]*m;
      }
      lgeo.attributes.color.needsUpdate = true;
    }

    function resize(){
      W = canvas.clientWidth; H = canvas.clientHeight;
      renderer.setSize(W, H, false); camera.aspect = W/H; camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize);

    var raf, last=0;
    function frame(now){
      if(now-last > 2400){ autoPulse(); last=now; }
      cx += (tx - cx)*0.05; cy += (ty - cy)*0.05;
      group.rotation.y = cx*0.5; group.rotation.x = cy*0.35;
      updateColors(now);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    }
    if(reduce){
      fireNode(3,0); fireNode(mirrorIndex[3],0); fireNode(9,0); fireNode(mirrorIndex[9],0);
      updateColors(performance.now()+200); renderer.render(scene, camera);
    } else {
      raf = requestAnimationFrame(frame);
    }

    onCleanup(function(){
      try{ cancelAnimationFrame(raf); }catch(e){}
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointermove', onMove);
      try{ pgeo.dispose(); lgeo.dispose(); pmat.dispose(); lmat.dispose(); sprite.dispose(); renderer.dispose(); }catch(e){}
    });
  })();

  // ================= INT1: nöronu ateşle =================
  (function fireDemo(){
    function mk(id){ var el=document.getElementById(id); if(!el) return []; el.innerHTML=''; for(var i=0;i<9;i++){ el.appendChild(document.createElement('i')); } return el.querySelectorAll('i'); }
    var bs=mk('ayn-barsS'), bm=mk('ayn-barsM');
    var boxS=document.getElementById('ayn-self'), boxM=document.getElementById('ayn-mir'), btn=document.getElementById('ayn-fire');
    if(!btn) return;
    function pat(){ var a=[]; for(var i=0;i<9;i++) a.push(8+Math.round(Math.random()*46)); return a; }
    function play(bars, box, cls, p){
      box.classList.add('fire', cls);
      p.forEach(function(h,i){ setTimeout(function(){ if(bars[i]) bars[i].style.height=h+'px'; }, i*40); });
      setTimeout(function(){ p.forEach(function(_,i){ if(bars[i]) bars[i].style.height='8px'; }); box.classList.remove('fire', cls); }, 720);
    }
    btn.addEventListener('click', function(){
      var p=pat(); play(bs, boxS, 'self', p);
      setTimeout(function(){ play(bm, boxM, 'mir', p); }, reduce?0:460);
    });
  })();

  // ================= INT2: eylem vs gözlem (osiloskop) =================
  (function actObs(){
    var cv=document.getElementById('ayn-scope'); if(!cv) return; var ctx=cv.getContext('2d');
    var dpr=Math.min(window.devicePixelRatio||1,2);
    function size(){ cv.width=cv.clientWidth*dpr; cv.height=cv.clientHeight*dpr; }
    size(); window.addEventListener('resize', size);
    // aynı nöronun sabit "spike" izi (fail kim olursa olsun aynı)
    var spikes=[0.18,0.5,0.62,0.81];
    var trigger=-1, mode='';
    function draw(now){
      var w=cv.width, h=cv.height, mid=h*0.62; ctx.clearRect(0,0,w,h);
      ctx.strokeStyle='rgba(255,255,255,.08)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(0,mid); ctx.lineTo(w,mid); ctx.stroke();
      var age = trigger>0 ? (now-trigger) : 999999;
      var prog = Math.min(1, age/1100);
      var color = mode==='do' ? 'rgba(255,122,92,' : 'rgba(67,232,201,';
      ctx.strokeStyle=color+'0.95)'; ctx.lineWidth=2*dpr; ctx.shadowColor=color+'0.9)'; ctx.shadowBlur=8;
      ctx.beginPath();
      for(var x=0;x<=w;x+=2){
        var t=x/w; var y=mid;
        for(var s=0;s<spikes.length;s++){
          var d=Math.abs(t-spikes[s]);
          if(t<=prog){ y -= Math.exp(-d*d*900)*(h*0.34)*(1-Math.exp(-prog*4)); }
        }
        if(x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.stroke(); ctx.shadowBlur=0;
    }
    var raf;
    function loop(now){ draw(now); raf=requestAnimationFrame(loop); }
    if(reduce){ mode='do'; trigger=performance.now()-1100; draw(performance.now()); }
    else raf=requestAnimationFrame(loop);
    var read=document.getElementById('ayn-ao-read');
    function fire(m, label){ mode=m; trigger=performance.now(); if(read) read.innerHTML='Son ateşleme: <b>'+label+'</b> — aynı hücre, aynı iz.'; }
    var bd=document.getElementById('ayn-ao-do'), bs=document.getElementById('ayn-ao-see');
    if(bd) bd.addEventListener('click', function(){ fire('do','KENDİN YAPTIN'); bd.classList.add('on'); if(bs)bs.classList.remove('on'); });
    if(bs) bs.addEventListener('click', function(){ fire('see','İZLEDİN'); bs.classList.add('on'); if(bd)bd.classList.remove('on'); });
    onCleanup(function(){ try{cancelAnimationFrame(raf);}catch(e){} window.removeEventListener('resize', size); });
  })();

  // ================= INT3: bulaşma (esneme) =================
  (function contagion(){
    var face=document.getElementById('ayn-face'); if(!face) return;
    var mouth=document.getElementById('ayn-mouth'), eyeL=document.getElementById('ayn-eyeL'), eyeR=document.getElementById('ayn-eyeR');
    var bar=document.getElementById('ayn-cont-bar'), pct=document.getElementById('ayn-cont-pct'), msg=document.getElementById('ayn-cont-msg');
    var val=0;
    var msgs=['Yüze bakınca ne hissettiğine dikkat et…','İçinden bir kıpırtı… motor aynalama başladı.','Çeneni mi oynattın? Bu bulaşmadır.','Neredeyse dayanılmaz — beynin onu yankılıyor.'];
    function yawn(){
      mouth.setAttribute('ry','16'); mouth.setAttribute('rx','12');
      eyeL.setAttribute('r','1.5'); eyeR.setAttribute('r','1.5');
      setTimeout(function(){ mouth.setAttribute('ry','8'); mouth.setAttribute('rx','10'); eyeL.setAttribute('r','4'); eyeR.setAttribute('r','4'); }, 900);
      val = Math.min(100, val+22);
      if(bar) bar.style.width = val+'%';
      if(pct) pct.textContent = Math.round(val)+'%';
      if(msg) msg.textContent = msgs[Math.min(msgs.length-1, Math.floor(val/28))];
    }
    face.addEventListener('click', yawn);
    face.addEventListener('keydown', function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); yawn(); } });
  })();

  // ================= INT4: öğrenme (Heyes) =================
  (function learn(){
    var sl=document.getElementById('ayn-learn'); if(!sl) return;
    var num=document.getElementById('ayn-learn-n'), bar=document.getElementById('ayn-learn-bar');
    function upd(){
      var v=+sl.value; if(num) num.textContent=v;
      // doygunlaşan öğrenme eğrisi
      var resp = 100*(1-Math.exp(-v/32));
      if(bar) bar.style.height = Math.max(4, resp)+'%';
    }
    sl.addEventListener('input', upd); upd();
  })();

  // ---- birleşik temizlik (SPA'dan çıkınca) ----
  window.__articleCleanup = function(){
    window.removeEventListener('scroll', onScroll);
    cleanups.forEach(function(fn){ try{ fn(); }catch(e){} });
    cleanups = [];
    try{ delete window.__articleCleanup; }catch(e){}
  };
})();
`;
