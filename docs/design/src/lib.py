"""Dash 10 brand geometry: hand-drawn condensed glyphs + outlined Inter text."""
import json, os, pathlib
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

# ---- Colors -------------------------------------------------------------
ROOT = pathlib.Path(__file__).resolve().parent.parent          # the kit
OUT = pathlib.Path(os.environ.get("DASH10_OUT", ROOT)).resolve()  # where builds are written
BRAND = json.load(open(OUT / "brand.json"))                      # <- the one place the accent lives
ACCENT = BRAND["accent"]

JET = "#0B0B0B"; CHAR = "#1A1A1A"; SLATE = "#333333"; STEEL = "#A7A7A7"
OFF = "#F5F5F5"

def _lum(h):
    c = [int(h[i:i+2], 16) / 255 for i in (1, 3, 5)]
    c = [v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4 for v in c]
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]

def ink(h):
    """Text color (jet or white) with the better contrast on accent h."""
    return JET if _lum(h) > 0.1866 else "#FFFFFF"

ACCENT_INK = ink(ACCENT)

# ---- Custom condensed display glyphs (cap height 100, y down) ----------
# each: (width, path d, uses evenodd)
G = {
 "D": (52, "M0 0H30C46 0 52 8 52 24V76C52 92 46 100 30 100H0Z M19 17V83H28C32 83 33 80 33 75V25C33 20 32 17 28 17Z"),
 "A": (56, "M17 0H39L56 100H37.5L35.5 84H20.5L18.5 100H0Z M22.5 68H33.5L28 30Z"),
 "S": (48, "M24 0C42 0 48 8 48 24V32H30V24C30 19 28 16 24 16C20 16 18 19 18 24C18 31 21 36 30 44C42 54 48 62 48 76C48 92 42 100 24 100C6 100 0 92 0 76V66H18V76C18 81 20 84 24 84C28 84 30 81 30 76C30 69 27 64 18 56C6 46 0 38 0 24C0 8 6 0 24 0Z"),
 "H": (52, "M0 0H18V40H34V0H52V100H34V58H18V100H0Z"),
 "1": (30, "M10 0H30V100H12V20H0V9Z"),
 "0": (50, "M25 0C44 0 50 8 50 24V76C50 92 44 100 25 100C6 100 0 92 0 76V24C0 8 6 0 25 0Z M25 16C21 16 19 19 19 24V76C19 81 21 84 25 84C29 84 31 81 31 76V24C31 19 29 16 25 16Z"),
}
GAP = 7

def display(text, tx=0, ty=0, scale=1.0, fill="currentColor", gap=GAP, space=26):
    """Return (svg group markup, width, height) for display text."""
    x = 0; out = []
    for ch in text:
        if ch == " ":
            x += space; continue
        w, d = G[ch]
        out.append(f'<path transform="translate({x:.2f} 0)" d="{d}"/>')
        x += w + gap
    width = x - gap
    g = (f'<g transform="translate({tx} {ty}) scale({scale})" fill="{fill}" fill-rule="evenodd">'
         + "".join(out) + "</g>")
    return g, width * scale, 100 * scale

# ---- Outlined Inter text ----------------------------------------------
_fonts = {}
def _font(name):
    if name not in _fonts:
        _fonts[name] = TTFont(f"/usr/share/fonts/opentype/inter/{name}.otf")
    return _fonts[name]

def text_path(text, size, tracking=0.0, font="Inter-SemiBold"):
    """Outlined text. Returns (d, width, capheight). Origin = left baseline at y=0."""
    f = _font(font); gs = f.getGlyphSet(); cmap = f.getBestCmap()
    upm = f["head"].unitsPerEm; s = size / upm
    cap = f["OS/2"].sCapHeight * s
    x = 0.0; ds = []
    for ch in text:
        gn = cmap[ord(ch)]
        pen = SVGPathPen(gs)
        tp = TransformPen(pen, (s, 0, 0, -s, x, 0))
        gs[gn].draw(tp)
        d = pen.getCommands()
        if d: ds.append(d)
        x += gs[gn].width * s + tracking * size
    return " ".join(ds), x - tracking * size, cap

def text_group(text, size, cx=None, x=None, y=0, tracking=0.0, fill="currentColor", font="Inter-SemiBold", anchor="middle"):
    d, w, cap = text_path(text, size, tracking, font)
    if anchor == "middle":
        x0 = cx - w / 2
    else:
        x0 = x
    return f'<path transform="translate({x0:.2f} {y:.2f})" d="{d}" fill="{fill}"/>', w, cap

# ---- Lockups ------------------------------------------------------------
def rule_with_label(label, cx, y, wordw, size, fill, tracking=0.5, rule_gap=14, rule_len=None):
    """Label centered with thin rules either side. y = baseline of label."""
    d, w, cap = text_path(label, size, tracking, "Inter-SemiBold")
    parts = [f'<path transform="translate({cx - w/2:.2f} {y:.2f})" d="{d}" fill="{fill}"/>']
    ymid = y - cap / 2
    total = wordw
    left_end = cx - w / 2 - rule_gap
    right_start = cx + w / 2 + rule_gap
    left_start = cx - total / 2
    right_end = cx + total / 2
    sw = max(1.2, size * 0.09)
    parts.append(f'<path d="M{left_start:.2f} {ymid:.2f}H{left_end:.2f}M{right_start:.2f} {ymid:.2f}H{right_end:.2f}" stroke="{fill}" stroke-width="{sw:.2f}" fill="none"/>')
    return "".join(parts)

def primary(label="STUDIO", fg=JET, bg=None, tagline=None, pad=40):
    """Primary lockup: DASH 10 + rule/label (+ optional tagline). Returns svg string."""
    scale = 1.0
    wm, ww, wh = display("DASH 10", 0, 0, scale, fg)
    W = ww + pad * 2
    cx = W / 2
    wm, ww, wh = display("DASH 10", pad, pad, scale, fg)
    y = pad + wh + 30
    body = [wm]
    body.append(rule_with_label(label, cx, y + 9, ww, 15, fg, tracking=0.72, rule_gap=14))
    H = y + 9 + pad
    if tagline:
        t, w, cap = text_group(tagline, 8.2, cx=cx, y=y + 9 + 26, tracking=0.2, fill=fg, font="Inter-Medium")
        body.append(t); H += 26
    bgrect = f'<rect width="{W:.0f}" height="{H:.0f}" fill="{bg}"/>' if bg else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W:.0f} {H:.0f}" width="{W:.0f}" height="{H:.0f}" role="img" aria-label="Dash 10 {label.title()}">'
            f'<title>Dash 10 {label.title()}</title>{bgrect}{"".join(body)}</svg>')

def wordmark(fg=JET, bg=None, pad=20):
    wm, ww, wh = display("DASH 10", pad, pad, 1, fg)
    W = ww + 2 * pad; H = wh + 2 * pad
    bgrect = f'<rect width="{W:.0f}" height="{H:.0f}" fill="{bg}"/>' if bg else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W:.0f} {H:.0f}" width="{W:.0f}" height="{H:.0f}" role="img" aria-label="Dash 10"><title>Dash 10</title>{bgrect}{wm}</svg>')

def monogram(fg=JET, bg=None, frame=True, size=160):
    """D10 inside a square frame. viewBox 160x160."""
    S = 160
    s = 0.62
    g, w, h = display("D10".replace("D", "D"), 0, 0, s, fg, gap=GAP)
    # 'D10' uses letters D,1,0
    gx = (S - w) / 2; gy = (S - h) / 2
    g, w, h = display("D10", gx, gy, s, fg)
    bgrect = f'<rect width="{S}" height="{S}" fill="{bg}"/>' if bg else ""
    fr = f'<rect x="9" y="9" width="142" height="142" fill="none" stroke="{fg}" stroke-width="4"/>' if frame else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {S} {S}" width="{size}" height="{size}" role="img" aria-label="D10 monogram"><title>D10</title>{bgrect}{fr}{g}</svg>')

def inline_logo(fg="currentColor", label="STUDIO", h=34):
    """Small nav lockup (no tagline), tight padding, for inline use. Returns svg."""
    scale = 1.0
    wm, ww, wh = display("DASH 10", 0, 0, scale, fg)
    cx = ww / 2; y = wh + 22
    lab = rule_with_label(label, cx, y + 9, ww, 15, fg, tracking=0.72, rule_gap=14)
    H = y + 9
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {ww:.0f} {H:.0f}" height="{h}" role="img" aria-label="Dash 10 Studio">{wm}{lab}</svg>')
