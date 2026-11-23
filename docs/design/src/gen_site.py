import sys, json, random, os; sys.path.insert(0, '.')
from lib import *

ICONS = json.load(open('icons.json'))

# ---------- generated mountain art (slowly drifting layers) ----------
def ridge(seed, W, base, amp, rough, n=7):
    random.seed(seed)
    pts = [(0, base + random.uniform(-amp, amp) * .3), (W, base + random.uniform(-amp, amp) * .3)]
    d = amp
    for _ in range(n):
        new = []
        for (x1, y1), (x2, y2) in zip(pts, pts[1:]):
            new.append((x1, y1)); new.append(((x1 + x2) / 2, (y1 + y2) / 2 + random.uniform(-d, d)))
        new.append(pts[-1]); pts = new; d *= rough
    return pts

def poly(pts, H):
    return "M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in pts) + f" L{pts[-1][0]} {H} L0 {H}Z"

W, H = 1800, 900
layers = [(3, 430, 200, .55, '#2c2c2c', 70), (8, 540, 150, .55, '#1f1f1f', 50), (15, 650, 110, .52, '#141414', 35), (22, 760, 70, .5, '#0a0a0a', 20)]
mt = ''.join(
    f'<g class="drift" style="--dx:{dx}px;animation-duration:{90 - dx}s"><path transform="translate(-100 0)" d="{poly(ridge(s, W, b, a, r), H)}" fill="{c}"/></g>'
    for s, b, a, r, c, dx in layers)
hero_svg = f'''<svg class="hero-art" viewBox="0 0 1600 {H}" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a5a5a"/><stop offset=".55" stop-color="#2a2a2a"/><stop offset="1" stop-color="#0b0b0b"/></linearGradient></defs>
<rect width="1600" height="{H}" fill="url(#sky)"/>{mt}</svg>'''

sprite = '<svg xmlns="http://www.w3.org/2000/svg" style="display:none">' + ''.join(
    f'<symbol id="i-{n}" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square" stroke-linejoin="miter">{b}</symbol>'
    for n, b in ICONS.items()) + '</svg>'

def ico(n): return f'<svg class="ico" viewBox="0 0 48 48" aria-hidden="true"><use href="#i-{n}"/></svg>'
logo = inline_logo('currentColor', 'STUDIO', h=44)

faq = [
 ("Can you build a custom website?", "Yes. Every site is designed and built around how your business actually works: custom themes, custom templates, and a CMS your team can run without calling us."),
 ("Do you build e-commerce websites?", "Yes. Storefronts, checkout flows, payments, shipping and inventory, built to fit your catalog and your operations rather than a template."),
 ("Can you integrate with our existing systems?", "Yes. We connect platforms through APIs, custom middleware and automation so orders, inventory, billing and reporting stay in sync."),
 ("Do you work with existing websites?", "Yes. We take over, repair and modernize existing sites, from WordPress themes to legacy platforms, without starting from zero."),
 ("What technologies do you use?", "Modern, maintainable stacks: WordPress and custom themes, JavaScript and Node, REST and GraphQL APIs, and cloud hosting chosen for the job."),
]
faq_html = ''.join(f'<details><summary>{q}<span class="pm" aria-hidden="true"></span></summary><p>{a}</p></details>' for q, a in faq)

PRESETS = [("Signal Blue", "#3D7BFF"), ("Cyan", "#22D3EE"), ("Green", "#2BD67B"), ("Amber", "#FFB020"), ("Orange", "#FF5B2E"), ("Violet", "#8B5CF6")]
presets_html = ''.join(f'<button type="button" class="swb" data-c="{c}" style="--c:{c}" aria-label="{n} accent" title="{n}"></button>' for n, c in PRESETS)

CSS = r'''
:root{--jet:#0B0B0B;--char:#1A1A1A;--slate:#333;--steel:#A7A7A7;--off:#F5F5F5;
 --accent:%%ACCENT%%;--accent-ink:%%INK%%;
 --accent-soft:color-mix(in srgb,var(--accent) 16%,transparent);
 --accent-line:color-mix(in srgb,var(--accent) 55%,transparent);
 --line:rgba(245,245,245,.14);--pad:clamp(20px,5vw,64px);--max:1360px}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:var(--jet);color:var(--off);font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;line-height:1.55;-webkit-font-smoothing:antialiased;overflow-x:clip}
a{color:inherit;text-decoration:none}
::selection{background:var(--accent);color:var(--accent-ink)}
.ico{width:1em;height:1em;display:block}
.mono{font-family:'JetBrains Mono',ui-monospace,Menlo,monospace}
:focus-visible{outline:2px solid var(--accent);outline-offset:3px}

/* progress + nav */
#prog{position:fixed;top:0;left:0;right:0;height:2px;background:var(--accent);transform:scaleX(0);transform-origin:left;z-index:40}
nav{position:fixed;top:0;left:0;right:0;z-index:30;display:flex;align-items:center;justify-content:space-between;padding:18px var(--pad);transition:background .3s,border-color .3s;border-bottom:1px solid transparent}
nav.solid{background:rgba(11,11,11,.8);backdrop-filter:blur(12px);border-color:var(--line)}
nav .logo svg{height:44px;width:auto;display:block}
nav ul{display:flex;gap:34px;list-style:none;font-size:12px;letter-spacing:.14em;text-transform:uppercase}
nav ul a{opacity:.75;transition:opacity .2s,color .2s}nav ul a:hover{opacity:1;color:var(--accent)}
.btn{display:inline-flex;align-items:center;gap:10px;font-size:12px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;padding:13px 20px;border:1px solid var(--off);transition:background .2s,color .2s,border-color .2s}
.btn .ico{width:14px;height:14px;transition:transform .2s}.btn:hover .ico{transform:translate(2px,-2px)}
.btn.pri{background:var(--accent);border-color:var(--accent);color:var(--accent-ink)}
.btn.pri:hover{background:transparent;color:var(--accent)}
.btn.ghost:hover{border-color:var(--accent);color:var(--accent)}
.btn.sm{padding:10px 16px;font-size:11px}
.cta{font-size:12px;letter-spacing:.14em;text-transform:uppercase;display:inline-flex;gap:10px;align-items:center;border-bottom:1px solid var(--off);padding-bottom:4px;transition:color .2s,border-color .2s}
.cta .ico{width:14px;height:14px;color:var(--accent);transition:transform .2s}.cta:hover{color:var(--accent);border-color:var(--accent)}.cta:hover .ico{transform:translate(3px,-3px)}
.menu-btn{display:none;background:none;border:1px solid var(--line);color:var(--off);font:inherit;font-size:11px;letter-spacing:.14em;text-transform:uppercase;padding:9px 14px;cursor:pointer}

/* hero */
.hero{position:relative;min-height:min(100svh,920px);display:flex;flex-direction:column;justify-content:flex-end;padding:150px var(--pad) 190px;overflow:hidden;isolation:isolate}
.hero-art,.bgvid{position:absolute;inset:0;width:100%;height:100%;z-index:-3}
.bgvid{object-fit:cover;opacity:.5;z-index:-2;filter:grayscale(1) contrast(1.05)}
.drift{animation:drift linear infinite alternate}
@keyframes drift{from{transform:translateX(calc(var(--dx)*-1))}to{transform:translateX(var(--dx))}}
.hero::before{content:"";position:absolute;inset:0;z-index:-1;background:
 linear-gradient(to bottom,rgba(11,11,11,.35),rgba(11,11,11,0) 30%,var(--jet) 96%),
 radial-gradient(60% 55% at 78% 100%,var(--accent-soft),transparent 70%)}
.grid-lines{position:absolute;inset:0;z-index:-1;pointer-events:none;background-image:linear-gradient(to right,rgba(245,245,245,.06) 1px,transparent 1px);background-size:calc((100% - 2*var(--pad))/6) 100%;background-position:var(--pad) 0;mask-image:linear-gradient(to bottom,transparent,#000 40%,transparent)}
.eyebrow{display:flex;align-items:center;gap:12px;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:var(--steel);margin-bottom:26px}
.eyebrow i{width:8px;height:8px;background:var(--accent);display:block;box-shadow:0 0 0 0 var(--accent-line);animation:pulse 2.4s infinite}
@keyframes pulse{70%{box-shadow:0 0 0 9px transparent}100%{box-shadow:0 0 0 0 transparent}}
h1,h2{font-weight:600;text-transform:uppercase;letter-spacing:-.035em;line-height:.95}
h1{font-size:clamp(40px,6.6vw,96px);max-width:none}
h1 em{font-style:normal;color:var(--accent)}
h2{font-size:clamp(32px,4.6vw,62px);max-width:13ch}
.hero .sub{max-width:46ch;color:#cfcfcf;font-size:clamp(15px,1.4vw,18px);margin:26px 0 34px}
.actions{display:flex;flex-wrap:wrap;gap:14px;align-items:center}
.cmd{display:inline-flex;align-items:center;gap:12px;border:1px solid var(--line);background:rgba(11,11,11,.6);backdrop-filter:blur(6px);padding:11px 14px;font-size:12px;color:#cfcfcf;cursor:pointer;transition:border-color .2s}
.cmd:hover{border-color:var(--accent-line)}.cmd b{color:var(--accent);font-weight:500}.cmd span{opacity:.6;font-size:10px;letter-spacing:.14em;text-transform:uppercase;border-left:1px solid var(--line);padding-left:12px}
.coord{position:absolute;right:var(--pad);bottom:200px;font-size:11px;letter-spacing:.14em;color:var(--steel);text-align:right}

/* hero mockup */
.stage{position:relative;z-index:2;max-width:var(--max);margin:-130px auto 0;padding:0 var(--pad) 30px}
.browser{border:1px solid var(--line);background:linear-gradient(180deg,#141414,#0d0d0d);box-shadow:0 40px 120px rgba(0,0,0,.7),0 0 0 1px rgba(0,0,0,.4),0 -30px 120px -40px var(--accent-soft)}
.browser .top{display:flex;align-items:center;gap:8px;padding:12px 16px;border-bottom:1px solid var(--line);font-size:11px;color:var(--steel)}
.browser .top i{width:9px;height:9px;border-radius:50%;background:#3a3a3a}.browser .top .url{margin:0 auto;border:1px solid var(--line);padding:4px 40px;border-radius:2px}
.bb{display:grid;grid-template-columns:220px 1fr 280px;min-height:340px}
.bb{align-items:stretch}.bb>div{padding:22px;border-right:1px solid var(--line);display:flex;flex-direction:column}.bb>div:last-child{border:0}
.bb h5{font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--steel);font-weight:500;margin-bottom:16px}
.steps{list-style:none;display:grid;gap:12px;font-size:12px}
.steps li{display:flex;align-items:center;gap:10px;color:#9a9a9a}.steps li.done{color:var(--off)}.steps li.now{color:var(--off)}
.steps i{width:14px;height:14px;border:1px solid var(--steel);display:block;position:relative;flex:none}
.steps .done i{background:var(--accent);border-color:var(--accent)}.steps .done i::after{content:"";position:absolute;left:4px;top:1px;width:4px;height:8px;border:solid var(--accent-ink);border-width:0 2px 2px 0;transform:rotate(40deg)}
.steps .now i{border-color:var(--accent)}.steps .now i::after{content:"";position:absolute;inset:3px;background:var(--accent)}
.page{background:#0a0a0a;border:1px solid var(--line);padding:22px;flex:1}
.page .l{height:7px;background:#2a2a2a;margin-bottom:10px}.page .l.h{height:20px;background:#e8e8e8;width:70%}.page .l.h2{height:20px;background:#e8e8e8;width:46%;margin-bottom:18px}
.page .b{display:inline-block;background:var(--accent);height:26px;width:104px;margin:10px 10px 18px 0}.page .b.o{background:transparent;border:1px solid var(--line)}
.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.cards i{display:block;height:54px;border:1px solid var(--line);background:#111}.cards i:first-child{border-color:var(--accent-line)}
.metric{margin-bottom:22px}.metric b{display:block;font-size:26px;font-weight:600;letter-spacing:-.03em;line-height:1}.metric span{font-size:11px;color:var(--steel)}
.meter{height:4px;background:#262626;margin-top:10px}.meter i{display:block;height:100%;background:var(--accent)}

/* numbered rows with scroll swipe */
section.row{position:relative;display:grid;grid-template-columns:1fr 1.15fr;gap:clamp(32px,6vw,96px);align-items:center;max-width:var(--max);margin:0 auto;padding:clamp(80px,11vw,140px) var(--pad);overflow-x:clip}
.rowwrap{border-top:1px solid var(--line)}
.rowwrap:first-of-type{border-top:0}
.tag{text-transform:uppercase;position:absolute;top:30px;left:var(--pad);right:var(--pad);display:flex;align-items:center;gap:16px;font-size:11px;letter-spacing:.18em;color:var(--steel)}
.tag .n{color:var(--accent);font-weight:500}.tag .ln{flex:1;height:1px;background:var(--accent-line);transform:scaleX(var(--p,1));transform-origin:left}
.row .txt{transform:translate3d(calc((1 - var(--p,1))*-120px),0,0);opacity:var(--p,1);will-change:transform,opacity}
.row .panel{transform:translate3d(calc((1 - var(--p,1))*160px),0,0);opacity:var(--p,1);will-change:transform,opacity}
.row p.lead{color:#cfcfcf;max-width:34ch;margin:26px 0 30px;font-size:15px}
.panel{border:1px solid var(--line);background:linear-gradient(180deg,#151515,#0e0e0e);box-shadow:9px 9px 0 0 var(--jet),10px 10px 0 0 var(--line),0 30px 80px rgba(0,0,0,.6);position:relative}
.panel::after{content:"";position:absolute;left:0;right:0;top:-1px;height:1px;background:linear-gradient(90deg,var(--accent),transparent 60%)}
.bar{display:flex;gap:7px;align-items:center;padding:10px 14px;border-bottom:1px solid var(--line);font-size:11px;color:var(--steel)}
.bar i{width:8px;height:8px;border-radius:50%;background:#444;display:block}
.panel pre{padding:22px 24px;font-size:13px;line-height:1.9;color:#d6d6d6;overflow:auto}
.k{color:var(--accent)}.s{color:#cfcfcf}.c{color:#6f6f6f}
.stack{padding:34px;font-size:clamp(22px,3vw,38px);font-weight:600;letter-spacing:-.03em;line-height:1.1;text-transform:uppercase;min-height:260px;display:flex;flex-direction:column;justify-content:center;background:linear-gradient(120deg,#1b1b1b,#0b0b0b)}
.stack span:first-child{color:var(--accent)}.stack span:nth-child(n+3){color:#6d6d6d}
.diagram{display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,auto);gap:22px 18px;padding:34px;position:relative}
.diagram div{border:1px solid var(--steel);padding:12px 8px;text-align:center;font-size:11px;letter-spacing:.16em;text-transform:uppercase;background:var(--jet);position:relative;z-index:1}
.diagram .hub{border-color:var(--accent);color:var(--accent);box-shadow:0 0 30px -6px var(--accent-line)}
.diagram::before{content:"";position:absolute;left:34px;right:34px;top:50%;height:1px;background:var(--accent-line)}
.diagram::after{content:"";position:absolute;top:34px;bottom:34px;left:50%;width:1px;background:var(--accent-line)}
.term pre .g{color:var(--accent)}

/* grids */
.band{max-width:var(--max);margin:0 auto;padding:clamp(64px,9vw,110px) var(--pad);position:relative}
.band::before{content:"";position:absolute;top:0;left:50%;width:100vw;transform:translateX(-50%);height:1px;background:var(--line)}
.band .lab{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--steel);margin-bottom:22px;display:flex;align-items:center;gap:12px}
.band .lab::before{content:"";position:static;transform:none;width:8px;height:8px;background:var(--accent)}
.band h2{max-width:14ch;margin-bottom:48px}
.cards4{display:grid;grid-template-columns:repeat(4,1fr);border:1px solid var(--line)}
.card{padding:28px 26px 30px;border-right:1px solid var(--line);position:relative;display:flex;flex-direction:column;gap:14px;min-height:280px;transition:background .25s}
.card:last-child{border-right:0}
.card::before{content:"";position:absolute;left:-1px;right:-1px;top:-1px;height:2px;background:var(--accent);transform:scaleX(0);transform-origin:left;transition:transform .35s}
.card:hover{background:var(--accent-soft)}.card:hover::before{transform:scaleX(1)}
.card>.ico{width:34px;height:34px;color:var(--accent)}
.card .cta{align-self:flex-start}
.card h3{font-size:18px;font-weight:600;letter-spacing:-.02em;text-transform:uppercase}
.card p{color:#bdbdbd;font-size:14px;flex:1}
.card .num{position:absolute;top:22px;right:24px;font-size:11px;color:var(--steel)}
.reveal{opacity:0;transform:translateY(24px);transition:opacity .7s,transform .7s cubic-bezier(.2,.7,.2,1);transition-delay:var(--d,0s)}
.reveal.in{opacity:1;transform:none}
.cap{display:grid;grid-template-columns:1fr 1.4fr;gap:clamp(32px,6vw,96px)}
.cap h2{margin-bottom:0}
details{border-bottom:1px solid var(--line)}
summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;padding:20px 0;font-size:12px;letter-spacing:.14em;text-transform:uppercase;transition:color .2s}
summary:hover,details[open] summary{color:var(--accent)}
summary::-webkit-details-marker{display:none}
.pm{width:12px;height:12px;position:relative;flex:none}
.pm::before,.pm::after{content:"";position:absolute;background:currentColor;transition:transform .2s}
.pm::before{left:0;right:0;top:5.5px;height:1px}.pm::after{top:0;bottom:0;left:5.5px;width:1px}
details[open] .pm::after{transform:scaleY(0)}
details p{color:#cfcfcf;font-size:14px;padding:0 0 22px;max-width:60ch}
.manifesto::after{content:"";position:absolute;left:50%;bottom:0;width:100vw;height:100%;transform:translateX(-50%);background:radial-gradient(45% 90% at 88% 100%,var(--accent-soft),transparent 70%);pointer-events:none;z-index:-1}
.manifesto{isolation:isolate}
.manifesto p.big{font-size:clamp(26px,4vw,54px);font-weight:600;letter-spacing:-.035em;line-height:1.05;text-transform:uppercase;max-width:20ch}
.manifesto p.big em{font-style:normal;color:var(--accent)}
.manifesto .actions{margin-top:38px}
.values{display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid var(--line)}
.values div{padding:34px var(--pad);border-right:1px solid var(--line);display:flex;gap:18px;align-items:flex-start}
.values div:last-child{border-right:0}.values .ico{width:32px;height:32px;flex:none;color:var(--accent)}
.values b{display:block;font-size:11px;letter-spacing:.2em;text-transform:uppercase;font-weight:600;margin-bottom:4px}
.values span{font-size:13px;color:#bdbdbd}

/* footer */
footer{border-top:1px solid var(--line);padding:56px var(--pad) 28px;display:grid;grid-template-columns:1.4fr 1fr 1fr 1.2fr;gap:36px;max-width:none}
footer .logo svg{height:44px;width:auto}footer p{color:var(--steel);font-size:13px;margin:18px 0;max-width:30ch}
footer h4{font-size:11px;letter-spacing:.2em;text-transform:uppercase;font-weight:500;color:var(--steel);margin-bottom:18px}
footer ul{list-style:none;font-size:13px;display:grid;gap:10px}footer ul a:hover{color:var(--accent)}
.legal{grid-column:1/-1;display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap;border-top:1px solid var(--line);padding-top:22px;margin-top:14px;font-size:11px;color:var(--steel);letter-spacing:.08em}
.legal a{margin-left:28px}.legal a:hover{color:var(--accent)}
.picker{display:flex;align-items:center;gap:10px}.picker>span{letter-spacing:.18em;text-transform:uppercase;font-size:10px;margin-right:4px}
.swb{width:18px;height:18px;border:1px solid var(--line);background:var(--c);cursor:pointer;padding:0;transition:transform .15s,outline-color .15s;outline:2px solid transparent;outline-offset:2px}
.swb:hover{transform:scale(1.15)}.swb.on{outline-color:var(--off)}
.picker input{width:22px;height:22px;border:0;padding:0;background:none;cursor:pointer}

@media (max-width:980px){
 .bb{grid-template-columns:1fr}.bb>div{border-right:0;border-bottom:1px solid var(--line)}.bb>div:last-child{border-bottom:0}
 .cards4{grid-template-columns:1fr 1fr}.card:nth-child(2){border-right:0}.card:nth-child(-n+2){border-bottom:1px solid var(--line)}
}
@media (max-width:860px){
 nav ul,nav>.btn{display:none}.menu-btn{display:block}
 nav.open ul{display:flex;position:absolute;top:100%;left:0;right:0;flex-direction:column;gap:0;background:var(--jet);border-bottom:1px solid var(--line)}nav.open ul a{display:block;padding:16px var(--pad)}
 section.row,.cap{grid-template-columns:1fr}
 .row .txt{transform:translate3d(calc((1 - var(--p,1))*-50px),0,0)}.row .panel{transform:translate3d(calc((1 - var(--p,1))*60px),0,0)}
 .values{grid-template-columns:1fr}.values div{border-right:0;border-bottom:1px solid var(--line)}
 footer{grid-template-columns:1fr 1fr}.coord{display:none}.hero{padding-bottom:170px}
}
@media (max-width:560px){.cards4{grid-template-columns:1fr}.card{border-right:0;border-bottom:1px solid var(--line)}.card:last-child{border-bottom:0}.legal a{margin:0 22px 0 0}}
@media (prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important;scroll-behavior:auto!important}.reveal{opacity:1;transform:none}}
'''

BODY = r'''
%%SPRITE%%
<div id="prog"></div>
<nav id="nav"><a class="logo" href="#top" aria-label="Dash 10 Studio home">%%LOGO%%</a>
<ul id="links"><li><a href="#work">Work</a></li><li><a href="#services">Services</a></li><li><a href="#process">Process</a></li><li><a href="#about">About</a></li><li><a href="#blog">Blog</a></li></ul>
<a class="btn pri sm" href="mailto:justin@dash10.studio">Let's talk %%ARROW%%</a>
<button class="menu-btn" aria-expanded="false" aria-controls="links" id="mb">Menu</button></nav>

<header class="hero" id="top">
%%HERO%%
<video class="bgvid" autoplay muted loop playsinline preload="metadata" aria-hidden="true"><source src="assets/dash-10-video-bg-slowed.mp4" type="video/mp4" onerror="this.closest('video').remove()"></video>
<div class="grid-lines"></div>
<div class="eyebrow"><i></i>Veteran owned · Milwaukee, WI</div>
<h1>Websites and systems that <em>move forward.</em></h1>
<p class="sub">Custom websites, e-commerce platforms and the integrations behind them. Built around how your business actually works, without the agency bloat.</p>
<div class="actions">
 <a class="btn pri" href="mailto:justin@dash10.studio">Start a project %%ARROW%%</a>
 <a class="btn ghost" href="#process">See how we work</a>
 <button class="cmd mono" id="copy" type="button" aria-label="Copy email address"><b>$</b> justin@dash10.studio <span id="copyl">Copy</span></button>
</div>
<div class="coord mono">43.0389° N<br>87.9065° W</div>
</header>

<div class="stage"><div class="browser">
 <div class="top"><i></i><i></i><i></i><span class="url mono">yourbusiness.com / project</span></div>
 <div class="bb">
  <div><h5>Project</h5><ul class="steps"><li class="done"><i></i>Discovery</li><li class="done"><i></i>Strategy</li><li class="done"><i></i>Design</li><li class="now"><i></i>Development</li><li><i></i>Deployment</li></ul></div>
  <div><h5>Preview</h5><div class="page"><div class="l h"></div><div class="l h2"></div><div class="l" style="width:80%"></div><div class="l" style="width:62%"></div><span class="b"></span><span class="b o"></span><div class="cards"><i></i><i></i><i></i></div></div></div>
  <div><h5>Status</h5><div class="metric"><b>94</b><span>Performance score</span><div class="meter"><i style="width:94%"></i></div></div><div class="metric"><b>12</b><span>Integrations connected</span><div class="meter"><i style="width:72%"></i></div></div><div class="metric" style="margin:0"><b>Live</b><span>Deploys on every push</span></div></div>
 </div></div></div>

<div class="rowwrap"><section class="row" id="services"><div class="tag mono"><span class="n">001</span><i class="ln"></i><span>UI</span></div>
<div class="txt"><h2>Built for the real world.</h2><p class="lead">Custom websites, e-commerce platforms and digital experiences built around how your business actually works.</p><a class="cta" href="#process">Explore services %%ARROW%%</a></div>
<div class="panel"><div class="bar"><i></i><i></i><i></i></div><div class="stack"><span>Strategy.</span><span>Design.</span><span>Development.</span><span>Deployment.</span></div></div></section></div>

<div class="rowwrap"><section class="row" id="work"><div class="tag mono"><span class="n">002</span><i class="ln"></i><span>Code</span></div>
<div class="txt"><h2>Web development without the agency bloat.</h2><p class="lead">Clean code. Modern stacks. Scalable architectures. We build fast, secure, and maintainable solutions.</p><a class="cta" href="#process">View our process %%ARROW%%</a></div>
<div class="panel"><div class="bar mono">project.js</div><pre class="mono"><span class="c">// a site, built on purpose</span>
<span class="k">import</span> { buildSite } <span class="k">from</span> <span class="s">'dash10'</span>

<span class="k">export default function</span> Website() {
  <span class="k">return</span> buildSite({
    strategy:    <span class="s">'custom'</span>,
    design:      <span class="s">'intentional'</span>,
    development: <span class="s">'scalable'</span>,
    deploy:      <span class="s">'performance'</span>
  })
}</pre></div></section></div>

<div class="rowwrap"><section class="row" id="integrations"><div class="tag mono"><span class="n">003</span><i class="ln"></i><span>Systems</span></div>
<div class="txt"><h2>Your systems should talk to each other.</h2><p class="lead">API integrations, custom middleware, databases, analytics, and automation that connect the dots.</p><a class="cta" href="#faq">See integrations %%ARROW%%</a></div>
<div class="panel"><div class="diagram"><div style="grid-area:1/2">Ecommerce</div><div style="grid-area:2/1">Databases</div><div class="hub" style="grid-area:2/2">Your platform</div><div style="grid-area:2/3">Analytics</div><div style="grid-area:3/1">Payments</div><div style="grid-area:3/2">Inventory</div><div style="grid-area:3/3">Shipping</div></div></div></section></div>

<div class="rowwrap"><section class="row" id="process"><div class="tag mono"><span class="n">004</span><i class="ln"></i><span>Terminal</span></div>
<div class="txt"><h2>We build. We fix. We connect.</h2><p class="lead">From greenfield projects to legacy rescues, we help businesses move forward with technology that works.</p><a class="cta" href="mailto:justin@dash10.studio">Start a project %%ARROW%%</a></div>
<div class="panel term"><div class="bar mono">dash10-studio — zsh</div><pre class="mono"><span class="c">&gt; Problem found.</span>
<span class="c">&gt; Solution architected.</span>
<span class="c">&gt; Code written.</span>
<span class="c">&gt; Tested.</span>
<span class="c">&gt; Deployed.</span>

<span class="g">&gt; Business moving forward.</span></pre></div></section></div>

<section class="band" id="what"><div class="lab mono">What we build</div><h2>One studio. Every layer.</h2>
<div class="cards4">
 <a class="card reveal" href="mailto:justin@dash10.studio"><span class="num mono">01</span>%%I_CODE%%<h3>Custom websites</h3><p>Hand-built themes and templates with a CMS your team can actually run.</p><span class="cta">Learn more %%ARROW%%</span></a>
 <a class="card reveal" style="--d:.08s" href="mailto:justin@dash10.studio"><span class="num mono">02</span>%%I_ECOM%%<h3>E-commerce</h3><p>Storefronts, checkout, payments and fulfillment wired to how you sell.</p><span class="cta">Learn more %%ARROW%%</span></a>
 <a class="card reveal" style="--d:.16s" href="mailto:justin@dash10.studio"><span class="num mono">03</span>%%I_INT%%<h3>Integrations</h3><p>APIs, middleware and automation that keep your systems in sync.</p><span class="cta">Learn more %%ARROW%%</span></a>
 <a class="card reveal" style="--d:.24s" href="mailto:justin@dash10.studio"><span class="num mono">04</span>%%I_SUP%%<h3>Rescue &amp; support</h3><p>Take over, repair and modernize existing sites without starting from zero.</p><span class="cta">Learn more %%ARROW%%</span></a>
</div></section>

<section class="band cap" id="faq"><div><div class="lab mono">Capabilities</div><h2>The technical side, handled.</h2></div><div>%%FAQ%%</div></section>

<section class="band manifesto" id="blog"><p class="big reveal">No templates. No bloat. Just systems that <em>work</em> and keep moving forward.</p>
<div class="actions reveal" style="--d:.1s"><a class="btn pri" href="mailto:justin@dash10.studio">Start a project %%ARROW%%</a><a class="btn ghost" href="#faq">Read the FAQ</a></div></section>

<div class="values" id="about"><div>%%I_MIL%%<p style="margin:0"><b>Built in Milwaukee</b><span>Local, accountable, easy to reach.</span></p></div><div>%%I_SHIELD%%<p style="margin:0"><b>Veteran owned</b><span>Discipline, clear communication, follow-through.</span></p></div><div>%%I_CROSS%%<p style="margin:0"><b>Focused on what matters</b><span>No bloat. Just the work that moves you forward.</span></p></div></div>

<footer><div><a class="logo" href="#top" aria-label="Dash 10 Studio">%%LOGO%%</a><p>Web development, e-commerce and digital systems for businesses that need more than templates.</p><a class="cta" href="mailto:justin@dash10.studio">Let's talk %%ARROW%%</a></div>
<div><h4>Services</h4><ul><li><a href="#services">Web Development</a></li><li><a href="#what">E-Commerce</a></li><li><a href="#integrations">Integrations</a></li><li><a href="#faq">Technical Support</a></li></ul></div>
<div><h4>Company</h4><ul><li><a href="#about">About</a></li><li><a href="#process">Process</a></li><li><a href="#blog">Blog</a></li><li><a href="mailto:justin@dash10.studio">Contact</a></li></ul></div>
<div><h4>Contact</h4><ul><li><a href="mailto:justin@dash10.studio">justin@dash10.studio</a></li><li>Milwaukee, WI</li></ul></div>
<div class="legal"><span>© 2026 Dash 10 Studio. All rights reserved.</span>
<div class="picker" role="group" aria-label="Accent color"><span>Accent</span>%%PRESETS%%<input type="color" id="custom" value="%%ACCENT%%" aria-label="Custom accent color"></div>
<span><a href="#">Privacy</a><a href="#">Terms</a></span></div></footer>
'''

JS = r'''
(function(){
 var root=document.documentElement,nav=document.getElementById('nav'),mb=document.getElementById('mb'),bar=document.getElementById('prog');
 /* ---- accent: one value. Change --accent in :root above, or use ?accent=ff5b2e, or the picker in the footer ---- */
 function lum(h){var c=[1,3,5].map(function(i){var v=parseInt(h.substr(i,2),16)/255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});return .2126*c[0]+.7152*c[1]+.0722*c[2]}
 function setAccent(h,save){
  if(!/^#[0-9a-f]{6}$/i.test(h))return;
  root.style.setProperty('--accent',h);root.style.setProperty('--accent-ink',lum(h)>.1866?'#0B0B0B':'#FFFFFF');
  document.getElementById('custom').value=h;
  [].forEach.call(document.querySelectorAll('.swb'),function(b){b.classList.toggle('on',b.dataset.c.toLowerCase()===h.toLowerCase())});
  if(save){try{localStorage.setItem('d10-accent',h)}catch(e){}}
 }
 var q=new URLSearchParams(location.search).get('accent'),saved=null;try{saved=localStorage.getItem('d10-accent')}catch(e){}
 if(q)setAccent('#'+q.replace('#',''),false);else if(saved)setAccent(saved,false);else setAccent('%%ACCENT%%',false);
 [].forEach.call(document.querySelectorAll('.swb'),function(b){b.addEventListener('click',function(){setAccent(b.dataset.c,true)})});
 document.getElementById('custom').addEventListener('input',function(e){setAccent(e.target.value,true)});

 /* ---- scroll-linked swipe-in for numbered rows ---- */
 var rows=[].slice.call(document.querySelectorAll('section.row')),reduce=matchMedia('(prefers-reduced-motion:reduce)').matches,tk=false;
 function ease(t){return 1-Math.pow(1-t,3)}
 function tick(){
  var vh=innerHeight;
  rows.forEach(function(r){var t=r.getBoundingClientRect().top,p=Math.max(0,Math.min(1,(vh*.92-t)/(vh*.5)));r.style.setProperty('--p',reduce?1:ease(p).toFixed(3))});
  var max=root.scrollHeight-vh;bar.style.transform='scaleX('+(max>0?scrollY/max:0)+')';
  nav.classList.toggle('solid',scrollY>40);tk=false;
 }
 addEventListener('scroll',function(){if(!tk){tk=true;requestAnimationFrame(tick)}},{passive:true});addEventListener('resize',tick);tick();

 /* ---- reveal cards ---- */
 var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.15});
 [].forEach.call(document.querySelectorAll('.reveal'),function(el){io.observe(el)});

 /* ---- misc ---- */
 mb.addEventListener('click',function(){var o=nav.classList.toggle('open');mb.setAttribute('aria-expanded',o)});
 [].forEach.call(document.querySelectorAll('#links a'),function(a){a.addEventListener('click',function(){nav.classList.remove('open');mb.setAttribute('aria-expanded','false')})});
 var cp=document.getElementById('copy'),cl=document.getElementById('copyl');
 cp.addEventListener('click',function(){var t='justin@dash10.studio';(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(function(){cl.textContent='Copied'},function(){location.href='mailto:'+t});setTimeout(function(){cl.textContent='Copy'},1800)});
 var v=document.querySelector('.bgvid');if(v&&reduce){v.pause()}
})();
'''

arrow = ico('arrow-up-right')
body = (BODY.replace('%%SPRITE%%', sprite).replace('%%LOGO%%', logo).replace('%%ARROW%%', arrow).replace('%%HERO%%', hero_svg)
        .replace('%%FAQ%%', faq_html).replace('%%PRESETS%%', presets_html).replace('%%ACCENT%%', ACCENT)
        .replace('%%I_CODE%%', ico('code')).replace('%%I_ECOM%%', ico('ecommerce')).replace('%%I_INT%%', ico('integrations')).replace('%%I_SUP%%', ico('support'))
        .replace('%%I_MIL%%', ico('milwaukee')).replace('%%I_SHIELD%%', ico('shield-check')).replace('%%I_CROSS%%', ico('crosshair')))
css = CSS.replace('%%ACCENT%%', ACCENT).replace('%%INK%%', ACCENT_INK)
js = JS.replace('%%ACCENT%%', ACCENT)

html = f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Dash 10 Studio | Web development and digital systems, Milwaukee WI</title>
<meta name="description" content="Veteran-owned web development studio in Milwaukee. Custom websites, e-commerce platforms and system integrations built around how your business works.">
<meta name="theme-color" content="#0B0B0B">
<link rel="icon" href="logo/png/favicon-32.png"><link rel="apple-touch-icon" href="logo/png/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>{css}</style></head><body>{body}<script>{js}</script></body></html>'''
os.makedirs(OUT / 'website', exist_ok=True)
open(OUT / 'website' / 'index.html', 'w').write(html)
