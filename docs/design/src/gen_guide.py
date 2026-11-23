import sys, json, random; sys.path.insert(0,'.')
from lib import *
import re
ICONS=json.load(open('icons.json'))
def strip(svg, h=None, w=None, style=''):
    inner=re.sub(r'<svg([^>]*)>', lambda m: '<svg'+re.sub(r'\s(width|height)="[^"]*"','',m.group(1))+(f' style="{style}"' if style else '')+'>', svg, count=1)
    return inner
def logo(label='STUDIO',fg=JET,tag=None,style='height:90px'): return strip(primary(label,fg,None,tag),style=style)
def mono(fg=JET,style='height:90px',frame=True): return strip(monogram(fg,None,frame),style=style)
def wm(fg=JET,style='height:60px'): return strip(wordmark(fg),style=style)
def icon(n,color='currentColor',s=40): return f'<svg viewBox="0 0 48 48" width="{s}" height="{s}" fill="none" stroke="{color}" stroke-width="2.5" stroke-linecap="square" stroke-linejoin="miter">{ICONS[n]}</svg>'
# mountain art for cover
def ridge(seed,W,base,amp,rough,n=7):
    random.seed(seed); pts=[(0,base),(W,base+random.uniform(-amp,amp)*.3)]; d=amp
    for _ in range(n):
        new=[]
        for (x1,y1),(x2,y2) in zip(pts,pts[1:]):
            new.append((x1,y1)); new.append(((x1+x2)/2,(y1+y2)/2+random.uniform(-d,d)))
        new.append(pts[-1]); pts=new; d*=rough
    return pts
def poly(p,H): return "M"+" L".join(f"{x:.0f} {y:.0f}" for x,y in p)+f" L{p[-1][0]} {H} L0 {H}Z"
art=''.join(f'<path d="{poly(ridge(s,1056,b,a,r),816)}" fill="{c}"/>' for s,b,a,r,c in [(3,330,170,.55,'#262626'),(8,430,130,.55,'#1a1a1a'),(15,540,90,.52,'#111'),(22,650,60,.5,'#0b0b0b')])
cover_art=f'<svg class="art" viewBox="0 0 1056 816" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a4a4a"/><stop offset=".6" stop-color="#202020"/><stop offset="1" stop-color="#0b0b0b"/></linearGradient></defs><rect width="1056" height="816" fill="url(#g)"/>{art}</svg>'
def page(n,title,body,dark=False,num=None):
    return f'<section class="pg {"dk" if dark else ""}"><div class="hd"><span>{n:02d}</span><span>{title}</span><span>DASH 10 · BRAND GUIDELINES · V2.1</span></div>{body}<div class="ft"><span>Dash 10 Studio · Milwaukee, WI</span><span>{n}</span></div></section>'
sw=lambda name,hexv,use,dark=False: f'<div class="sw"><div class="chip" style="background:{hexv};{"border:1px solid #ccc" if hexv=="#F5F5F5" else ""}"></div><b>{name}</b><span class="mono">{hexv}</span><em>{use}</em></div>'
# invoice mini preview
inv_prev=f'''<div class="doc">{strip(inline_logo(JET,"STUDIO",h=22),style="height:22px")}<div class="l1"></div><div class="l2"></div><div class="l3"></div><div class="tot">TOTAL DUE</div></div>'''
pages=[]
cover=f'''<section class="pg cover dk">{cover_art}<div class="shade"></div>
<div class="cv"><div class="small">DASH 10 · BRAND GUIDELINES</div><div class="big">{wm(OFF,"height:150px")}</div><div class="sub">BRAND &amp; LOGO GUIDELINES</div>
<p>A modern digital brand built for clarity, precision and forward motion.<br>One brand. Many solutions.</p></div>
<div class="ver">VERSION 2.1 · NOVEMBER 2026</div><div class="est">EST. 2024 · MILWAUKEE, WI · VETERAN OWNED</div>
<div class="mg">{mono(OFF,"height:120px")}</div></section>'''
pages.append(cover)
vals=['Clarity','Precision','Reliability','Innovation','Forward motion']
pages.append(page(1,'Our brand',f'''<div class="two"><div><h2>Our purpose</h2><p class="lead">Dash 10 builds modern digital platforms and manages the properties that power them. We combine strategy, design, development and ongoing support to help our clients move forward with confidence.</p>
<h3>Our values</h3><ul class="vals">{"".join(f"<li>{v}</li>" for v in vals)}</ul>
<h3>Voice</h3><p>Plain, direct and capable. We say what we build and what it does. No jargon, no hype, no agency fluff.</p></div>
<div class="panel-dk"><div class="pt">{icon("mountain",ACCENT,44)}<b>Built in Milwaukee</b></div><div class="pt">{icon("shield-check",ACCENT,44)}<b>Veteran owned</b></div><div class="pt">{icon("crosshair",ACCENT,44)}<b>Focused on what matters</b></div></div></div>'''))
pages.append(page(2,'Logo system',f'''<div class="grid3"><div class="cell tall"><h3>Primary logo</h3><div class="ctr">{logo("STUDIO",JET,"YOUR GUIDE TO MODERN DIGITAL PLATFORMS","height:120px")}</div><p class="sm">Default for the studio. Use wherever space allows.</p></div>
<div class="cell tall"><h3>Division lockups</h3><div class="ctr col">{logo("PROPERTIES",JET,None,"height:100px")}{logo("SOLUTIONS",JET,None,"height:100px")}</div><p class="sm">Same wordmark, division name in the rule.</p></div>
<div class="cell tall"><h3>Wordmark</h3><div class="ctr">{wm(JET,"height:70px")}</div><p class="sm">When the division or context is already established.</p><h3 style="margin-top:22px">Monogram</h3><div class="ctr">{mono(JET,"height:90px")}</div><p class="sm">Small spaces: icons, social, app, watermark.</p></div></div>'''))
# construction
cons=primary('STUDIO',JET,None,None)
pages.append(page(3,'Construction, clear space, minimum size',f'''<div class="grid3"><div class="cell"><h3>Construction</h3><div class="ctr" style="position:relative">{logo("STUDIO",JET,None,"height:110px")}</div><p class="sm">Letterforms are custom-drawn artwork. Never retype the logo in a font; always use the supplied SVG files. The rule beneath the wordmark matches its width exactly.</p></div>
<div class="cell"><h3>Clear space</h3><div class="ctr"><div class="clear">{logo("STUDIO",JET,None,"height:80px")}</div></div><p class="sm">Keep clear space on all sides equal to the height of the “D” (x). Nothing enters this zone.</p></div>
<div class="cell"><h3>Minimum size</h3><div class="ctr col">{logo("STUDIO",JET,None,"width:120px")}<span class="mono sm">Digital 120 px wide</span>{logo("STUDIO",JET,None,"width:0.75in")}<span class="mono sm">Print 0.75 in wide</span></div><p class="sm">Do not reproduce the logo below minimum size. For smaller placements use the monogram (minimum 24 px / 0.25 in).</p></div></div>'''))
bad=[('Do not stretch or distort','transform:scaleX(1.5)'),('Do not change the colors','filter:invert(0) ;color:red'),('Do not add effects or shadows','filter:drop-shadow(4px 4px 3px rgba(0,0,0,.5))'),('Do not rotate the logo','transform:rotate(-12deg)'),('Do not add text to the logo',''),('Do not crowd the logo','')]
def badcell(t,css,i):
    if i==1: inner=strip(primary('STUDIO',ACCENT,None,None),style='height:56px')
    elif i==4: inner=logo('STUDIO',JET,'BEST IN THE BUSINESS','height:70px')
    elif i==5: inner=f'<div style="border:1px solid #000;padding:2px;display:inline-block">{logo("STUDIO",JET,None,"height:56px")}</div>'
    else: inner=logo('STUDIO',JET,None,f'height:56px;{css}')
    return f'<div class="bad"><div class="bx">{inner}</div><span>✕ {t}</span></div>'
good=''.join(f'<div class="good"><div class="gx" style="background:{bg}">{svg}</div><span>✓ {t}</span></div>' for bg,svg,t in [(JET,logo("STUDIO",OFF,None,"height:56px"),'On black'),('#fff',logo("PROPERTIES",JET,None,"height:56px"),'On white'),('#1A1A1A',mono(OFF,"height:56px"),'Monogram on charcoal'),('#2a2a2a',mono(OFF,"height:56px"),'On dark imagery, with contrast')])
pages.append(page(4,'Usage',f'''<h3>Correct usage</h3><div class="row4">{good}</div><h3 style="margin-top:26px">Incorrect usage</h3><div class="row6">{"".join(badcell(t,c,i) for i,(t,c) in enumerate(bad))}</div>'''))
pages.append(page(5,'Typography',f'''<div class="two"><div><h3>Primary typeface</h3><div class="spec" style="font-weight:600;font-size:72px;letter-spacing:-.03em;text-transform:uppercase;line-height:1">Inter</div><p class="mono sm">SemiBold 600 · uppercase · tracking −3% · headlines</p><div class="spec" style="font-size:20px;letter-spacing:.06em">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>0123456789</div></div>
<div><h3>Secondary typeface</h3><div class="spec" style="font-size:72px;line-height:1">Inter</div><p class="mono sm">Regular 400 / Medium 500 · body, UI, supporting copy</p><div class="spec" style="font-size:15px;line-height:1.6">Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm<br>Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz<br>0123456789</div></div></div>
<div class="two" style="margin-top:20px"><div><h3>Labels &amp; eyebrows</h3><div class="spec" style="font-size:11px;letter-spacing:.22em;font-weight:500">MEDIUM · UPPERCASE · TRACKING +22%</div><h3 style="margin-top:20px">Code &amp; coordinates</h3><div class="spec mono" style="font-size:13px">JetBrains Mono · 43.0389° N, 87.9065° W</div></div>
<div><h3>Rules</h3><p class="sm">The logo is artwork, not a typeface: never set “Dash 10” in a font. Headlines are uppercase Inter SemiBold with tight tracking. Body text is sentence case. Use Inter through Google Fonts on the web; ship static files for print.</p></div></div>'''))
pages.append(page(6,'Color palette',f'''<div class="sws">{sw("Jet Black","#0B0B0B","Primary background, logo")}{sw("Charcoal","#1A1A1A","Panels, surfaces")}{sw("Slate","#333333","Secondary text, rules")}{sw("Steel","#A7A7A7","Captions, labels")}{sw("Off White","#F5F5F5","Text on dark, page color")}</div>
<div class="two" style="margin-top:30px"><div><h3>Accent (changeable)</h3><div class="sw"><div class="chip" style="background:{ACCENT};width:220px"></div><b>{BRAND["accent_name"]}</b><span class="mono">{ACCENT}</span><em>One value, swapped per client. Highlights, icons, rules, data. Never large fills.</em></div></div>
<div><h3>Proportion</h3><div class="bar"><i style="flex:60;background:#0B0B0B"></i><i style="flex:20;background:#1A1A1A"></i><i style="flex:8;background:#333"></i><i style="flex:5;background:#A7A7A7"></i><i style="flex:5;background:#F5F5F5;border:1px solid #ccc"></i><i style="flex:2;background:{ACCENT}"></i></div><p class="sm">A monochrome foundation with precision neutrals. The accent never exceeds a few percent of any layout. The logo is only ever Jet Black or Off White (the monogram may take the accent on black).</p></div></div>'''))

PRESETS=[("Signal Blue","#3D7BFF"),("Cyan","#22D3EE"),("Green","#2BD67B"),("Amber","#FFB020"),("Orange","#FF5B2E"),("Violet","#8B5CF6")]
def pcard(n,h):
    k=ink(h)
    return (f'<div class="pc"><div class="pcs">{mono(OFF,"height:46px")}<span class="pcr" style="background:{h}"></span><span class="pcb" style="background:{h};color:{k}">START A PROJECT ↗</span></div>'
            f'<b>{n}</b><span class="mono">{h}</span></div>')
where=["Website: eyebrow marker, primary button, section numbers, link arrows, code keywords, status meters, focus ring","Invoice: rule above payment terms, invoice-number marker, edge of the total-due block","Icons: accent set for highlights; monogram accent version","Guide and decks: rules, bullets, swatches"]
pages.append(page(7,'Accent system',f"""<div class="two"><div><h2>One accent. Swapped per client.</h2><p class="lead" style="font-size:12.5px">The brand is monochrome. A single accent supplies small pops of color so a client's palette can slot in without touching the logo. Current accent: <b>{BRAND["accent_name"]} {ACCENT}</b>.</p>
<h3>Where it appears</h3><ul class="vals" style="font-size:10px">{"".join(f"<li style='letter-spacing:.04em;text-transform:none;font-size:11px'>{w}</li>" for w in where)}</ul>
<h3>How to change it</h3><p class="sm" style="margin-top:0">Edit <span class="mono">accent</span> in <span class="mono">brand.json</span> and run <span class="mono">python3 src/build_all.py</span>. Everything regenerates. For a client copy: <span class="mono">--accent "#hex" --out clients/name</span>. The website also accepts <span class="mono">?accent=ff5b2e</span> and has a picker in the footer for live demos.</p>
<h3 style="margin-top:16px">Rules</h3><p class="sm" style="margin-top:0">Never more than a few percent of any layout. Text on the accent switches automatically to black or white for contrast. Pick an accent that holds at least 3:1 against Jet Black.</p></div>
<div><h3>Presets</h3><div class="pcs6">{"".join(pcard(n,h) for n,h in PRESETS)}</div></div></div>"""))

icons_html=''.join(f'<div class="ic">{icon(n,JET,44)}<span class="mono">{n}</span></div>' for n in ICONS)
pages.append(page(8,'Icon set',f'''<div class="icons">{icons_html}</div><p class="sm" style="margin-top:20px;max-width:640px">48 px grid, 2.5 px stroke, square caps, mitered joins. Single color: Jet Black or Off White, the accent for one role at a time. Supplied as individual SVGs and a sprite. Do not fill, round or add effects.</p>'''))
pages.append(page(9,'Applications',f'''<div class="grid3"><div class="cell"><h3>Website</h3><div class="mock web"><div class="nv">{strip(inline_logo(OFF,"STUDIO",h=12),style="height:12px")}</div><b>WEBSITES AND<br>SYSTEMS THAT<br>MOVE FORWARD.</b></div><p class="sm">Dark by default. Mountain imagery in greyscale, accent reserved for buttons, icons and rules.</p></div>
<div class="cell"><h3>Invoice</h3><div class="mock inv">{inv_prev}</div><p class="sm">Off-white page, black top bar and total block, single accent rule. Editable template supplied.</p></div>
<div class="cell"><h3>Social &amp; app icon</h3><div class="mock soc"><div class="circ">{mono(OFF,"height:70px")}</div></div><p class="sm">Monogram, Off White on Jet Black.</p></div></div>
<div class="contact"><b>Dash 10 Studio</b> · Justin LaFountain · Dash 10 LLC · justin@dash10.studio · dash10.studio · Milwaukee, WI</div>'''))
css='''@page{size:11in 8.5in;margin:0}*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Inter,sans-serif;color:#0B0B0B;-webkit-print-color-adjust:exact;print-color-adjust:exact;font-size:11px;line-height:1.5}
.pg{width:11in;height:8.5in;position:relative;padding:.55in .65in .5in;page-break-after:always;overflow:hidden;background:#F5F5F5;display:flex;flex-direction:column}
.dk{background:#0B0B0B;color:#F5F5F5}.mono{font-family:'JetBrains Mono',monospace}
.hd{display:flex;gap:22px;font-size:9px;letter-spacing:.2em;text-transform:uppercase;border-bottom:1px solid #0B0B0B;padding-bottom:10px;margin-bottom:26px}.hd span:nth-child(2){font-weight:600;flex:1}.hd span:last-child{color:#888}
.ft{position:absolute;left:.65in;right:.65in;bottom:.3in;display:flex;justify-content:space-between;font-size:8px;letter-spacing:.14em;text-transform:uppercase;color:#888}
h2{font-size:30px;letter-spacing:-.03em;text-transform:uppercase;margin-bottom:12px;line-height:1}
h3{font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:#666;margin-bottom:12px;font-weight:600}
.lead{font-size:14px;line-height:1.55;margin-bottom:22px;max-width:4.6in}.sm{font-size:10px;color:#555;margin-top:10px}
.two{display:grid;grid-template-columns:1fr 1fr;gap:.5in}.grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:.3in}
.cell{border:1px solid #d6d6d6;background:#fff;padding:18px;display:flex;flex-direction:column}.cell.tall{min-height:5.3in}
.ctr{flex:1;display:flex;align-items:center;justify-content:center;padding:14px 0}.ctr.col{flex-direction:column;gap:22px}
.vals{list-style:none;columns:1;margin-bottom:22px}.vals li{padding:7px 0;border-bottom:1px solid #d6d6d6;font-size:12px;letter-spacing:.14em;text-transform:uppercase}.vals li::before{content:"+";margin-right:14px;color:{ACCENT}}
.panel-dk{background:#0B0B0B;color:#F5F5F5;padding:28px;display:flex;flex-direction:column;justify-content:space-around}.pt{display:flex;align-items:center;gap:18px;padding:22px 0;border-bottom:1px solid {ACCENT}55}.pt:last-child{border:0}.pt b{font-size:11px;letter-spacing:.2em;text-transform:uppercase;font-weight:600}
.clear{padding:34px;border:1px dashed #999;background:repeating-linear-gradient(45deg,#f0f0f0,#f0f0f0 4px,#fff 4px,#fff 8px)}.clear svg{background:#fff;display:block}
.row4{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}.row6{display:grid;grid-template-columns:repeat(6,1fr);gap:12px}
.gx{height:1.35in;display:flex;align-items:center;justify-content:center;border:1px solid #d6d6d6}.good span,.bad span{display:block;font-size:9px;margin-top:6px;color:#444}
.bx{height:1.15in;background:#fff;border:1px solid #d6d6d6;display:flex;align-items:center;justify-content:center;overflow:hidden}
.spec{margin:14px 0}.sws{display:grid;grid-template-columns:repeat(5,1fr);gap:16px}.sw .chip{height:1.6in;margin-bottom:10px}.sw b{display:block;font-size:11px;letter-spacing:.14em;text-transform:uppercase}.sw span{display:block;color:#555;font-size:10px}.sw em{display:block;font-style:normal;color:#777;font-size:9.5px;margin-top:4px}
.bar{display:flex;height:46px;margin:6px 0 10px}.bar i{display:block}
.icons{display:grid;grid-template-columns:repeat(6,1fr);gap:14px}.ic{background:#fff;border:1px solid #d6d6d6;padding:22px 0 14px;display:flex;flex-direction:column;align-items:center;gap:12px}.ic span{font-size:9px;color:#666}
.mock{height:2.6in;margin-top:4px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden}
.web{background:linear-gradient(#444,#0b0b0b 70%);color:#F5F5F5;flex-direction:column;align-items:flex-start;justify-content:flex-end;padding:16px}.web .nv{position:absolute;top:14px;left:16px}.web b{font-size:20px;letter-spacing:-.03em;line-height:1}
.inv{background:#e9e9e9}.doc{width:1.7in;height:2.2in;background:#fff;box-shadow:0 6px 18px #0003;padding:12px;border-top:6px solid #0B0B0B;position:relative}.doc .l1,.doc .l2,.doc .l3{height:3px;background:#ccc;margin-top:9px}.doc .l1{margin-top:26px}.doc .l2{width:60%}.doc .l3{width:80%}.doc .tot{position:absolute;right:12px;bottom:16px;background:#0B0B0B;color:#fff;font-size:6px;letter-spacing:.16em;padding:7px 10px}
.soc{background:#e9e9e9}.circ{width:1.6in;height:1.6in;border-radius:50%;background:#0B0B0B;display:flex;align-items:center;justify-content:center}
.contact{margin-top:.3in;border-top:1px solid #0B0B0B;padding-top:12px;font-size:10px;letter-spacing:.06em}
.pcs6{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.pc{border:1px solid #d6d6d6;background:#fff;padding:10px}.pcs{background:#0B0B0B;height:1.05in;position:relative;display:flex;align-items:center;padding:0 14px;gap:14px;margin-bottom:8px}.pcr{position:absolute;left:0;top:0;bottom:0;width:4px}.pcb{white-space:nowrap;margin-left:auto;font-size:7px;letter-spacing:.14em;font-weight:600;padding:7px 10px}.pc b{display:block;font-size:10px;letter-spacing:.14em;text-transform:uppercase}.pc span.mono{font-size:9px;color:#666}
.cover .art{position:absolute;inset:0;width:100%;height:100%}.cover .shade{position:absolute;inset:0;background:linear-gradient(90deg,#0b0b0bcc,#0b0b0b00 70%)}
.cover .cv{position:absolute;left:.8in;top:1in;z-index:2}.cover .small{font-size:10px;letter-spacing:.2em;margin-bottom:.5in}.cover .sub{letter-spacing:.42em;color:{ACCENT};font-size:15px;margin:22px 0 28px}.cover p{font-size:15px;line-height:1.7;max-width:4in}
.cover .ver{position:absolute;right:.65in;top:.55in;font-size:9px;letter-spacing:.2em;z-index:2}.cover .est{position:absolute;left:.8in;bottom:.5in;font-size:9px;letter-spacing:.2em;color:#bbb;z-index:2}.cover .mg{position:absolute;right:.8in;bottom:.9in;z-index:2}
'''
css=css.replace('{ACCENT}',ACCENT)
html=f'<!doctype html><html><head><meta charset="utf-8"><title>Dash 10 Brand Guidelines</title><style>@font-face{{font-family:Inter;src:url("file:///usr/share/fonts/opentype/inter/Inter-Regular.otf");font-weight:400}}@font-face{{font-family:Inter;src:url("file:///usr/share/fonts/opentype/inter/Inter-Medium.otf");font-weight:500}}@font-face{{font-family:Inter;src:url("file:///usr/share/fonts/opentype/inter/Inter-SemiBold.otf");font-weight:600}}{css}</style></head><body>{"".join(pages)}</body></html>'
import os
os.makedirs(OUT/'guide',exist_ok=True)
open(OUT/'guide'/'brand-guide.html','w').write(html)
