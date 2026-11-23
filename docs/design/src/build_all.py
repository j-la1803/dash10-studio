#!/usr/bin/env python3
"""Rebuild the whole Dash 10 kit with one accent color.

  python3 src/build_all.py                                  # rebuild in place from brand.json
  python3 src/build_all.py --accent "#FF5B2E"               # change the accent, rebuild in place
  python3 src/build_all.py --accent "#8B5CF6" --name "Acme" --out clients/acme   # client copy

Needs: python3 + fonttools, rsvg-convert (PNG export), google-chrome (PDFs).
"""
import argparse, json, os, pathlib, shutil, subprocess, sys

SRC = pathlib.Path(__file__).resolve().parent
ROOT = SRC.parent
ap = argparse.ArgumentParser()
ap.add_argument("--accent", help="hex color, e.g. #FF5B2E")
ap.add_argument("--name", help="accent name (shown in the guide)")
ap.add_argument("--out", help="output folder (default: this kit)")
a = ap.parse_args()

out = pathlib.Path(a.out).resolve() if a.out else ROOT
out.mkdir(parents=True, exist_ok=True)
brand = json.load(open((out if (out / "brand.json").exists() else ROOT) / "brand.json"))
if a.accent:
    if not (len(a.accent) == 7 and a.accent[0] == "#"):
        sys.exit("accent must look like #RRGGBB")
    brand["accent"] = a.accent.upper()
    brand["accent_name"] = a.name or "Custom"
elif a.name:
    brand["accent_name"] = a.name
json.dump(brand, open(out / "brand.json", "w"), indent=2)
env = dict(os.environ, DASH10_OUT=str(out))

def run(*cmd, **kw):
    subprocess.run(cmd, check=True, env=env, **kw)

for g in ("gen_logo.py", "gen_icons.py", "gen_invoice.py", "gen_site.py", "gen_guide.py"):
    print("•", g); run(sys.executable, g, cwd=SRC)

# PNG exports of the logos
logo = out / "logo"; png = logo / "png"; png.mkdir(exist_ok=True)
if shutil.which("rsvg-convert"):
    for f in logo.glob("dash10-*.svg"):
        run("rsvg-convert", "-w", "2000", str(f), "-o", str(png / (f.stem + ".png")))
    app = logo / "dash10-monogram-app-icon.svg"
    for w, n in ((512, "dash10-app-icon-512"), (180, "apple-touch-icon"), (32, "favicon-32")):
        run("rsvg-convert", "-w", str(w), str(app), "-o", str(png / (n + ".png")))
else:
    print("! rsvg-convert not found: PNG exports skipped")

# website needs the favicon files beside it
(out / "website" / "logo").mkdir(parents=True, exist_ok=True)
shutil.copytree(png, out / "website" / "logo" / "png", dirs_exist_ok=True)
(out / "website" / "assets").mkdir(exist_ok=True)

# design tokens for code (WordPress theme, CSS, JSON)
os.environ["DASH10_OUT"] = str(out)
sys.path.insert(0, str(SRC))
from lib import ACCENT, ACCENT_INK  # noqa: E402  (reads OUT/brand.json)
tok = {"jet": "#0B0B0B", "charcoal": "#1A1A1A", "slate": "#333333", "steel": "#A7A7A7", "offwhite": "#F5F5F5",
       "accent": ACCENT, "accent-ink": ACCENT_INK}
(out / "brand").mkdir(exist_ok=True)
json.dump(tok, open(out / "brand" / "tokens.json", "w"), indent=2)
open(out / "brand" / "tokens.css", "w").write(
    ":root{\n" + "".join(f"  --d10-{k}: {v};\n" for k, v in tok.items()) + "}\n")

# PDFs
chrome = shutil.which("google-chrome") or shutil.which("chromium")
if chrome:
    run(sys.executable, str(out / "invoice" / "build_invoice.py"), str(out / "invoice" / "invoice-data.json"),
        str(out / "invoice" / "Dash_10_Studio_Invoice.pdf"))
    run(chrome, "--headless=new", "--no-sandbox", "--disable-gpu", "--no-pdf-header-footer",
        f"--print-to-pdf={out / 'guide' / 'Dash_10_Brand_Guidelines.pdf'}", f"file://{out / 'guide' / 'brand-guide.html'}",
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
else:
    print("! Chrome not found: PDFs skipped")
print("done ->", out, "| accent", ACCENT)
