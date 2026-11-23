import sys, json, re, subprocess, html, os; sys.path.insert(0,'.')
from lib import *
logo = inline_logo(JET, 'STUDIO', h=58)
inter = '/usr/share/fonts/opentype/inter/'
TEMPLATE = '''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Invoice {{invoice_number}} – Dash 10 Studio</title>
<style>
@font-face{font-family:Inter;src:url("file://@@INTER@@Inter-Regular.otf");font-weight:400}
@font-face{font-family:Inter;src:url("file://@@INTER@@Inter-Medium.otf");font-weight:500}
@font-face{font-family:Inter;src:url("file://@@INTER@@Inter-SemiBold.otf");font-weight:600}
@page{size:Letter;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
:root{--jet:#0B0B0B;--slate:#333;--steel:#A7A7A7;--off:#F5F5F5;--accent:{{accent}};--accent-ink:{{accent_ink}}}
html,body{background:#fff}
body{font-family:Inter,Helvetica,Arial,sans-serif;color:var(--jet);font-size:10.5pt;line-height:1.5;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{width:8.5in;height:11in;padding:.7in .75in .6in;position:relative;display:flex;flex-direction:column}
.topbar{position:absolute;left:0;top:0;right:0;height:.18in;background:var(--jet)}
header{display:flex;justify-content:space-between;align-items:flex-start;margin-top:.15in}
.from{margin-top:14px;font-size:9pt;color:var(--slate);line-height:1.55}
.from b{color:var(--jet);font-weight:600}
.inv{text-align:right}
.inv h1{font-weight:600;font-size:11pt;letter-spacing:.32em;margin-right:-.32em}
.inv .num{margin-top:6px;font-size:9pt;color:var(--slate)}
.rule{height:1px;background:var(--jet);margin:.38in 0 .3in}
.meta{display:grid;grid-template-columns:1.3fr 1fr 1fr;gap:.3in}
.lbl{font-size:7.5pt;font-weight:600;letter-spacing:.2em;color:#777;margin-bottom:6px}
.meta p{font-size:10pt;line-height:1.5}
.meta .strong{font-weight:600}
table{width:100%;border-collapse:collapse;margin-top:.45in}
th{font-size:7.5pt;font-weight:600;letter-spacing:.2em;text-align:left;color:#777;padding:0 0 8px;border-bottom:1px solid var(--jet)}
th.r,td.r{text-align:right;white-space:nowrap}
td{padding:14px 0;vertical-align:top;border-bottom:1px solid #DADADA}
td .t{font-weight:600}
td .d{margin-top:4px;color:var(--slate);font-size:9.5pt;max-width:4.6in}
.totals{margin-top:.25in;margin-left:auto;width:3in}
.totals .row{display:flex;justify-content:space-between;padding:6px 0;font-size:10pt}
.totals .due{margin-top:8px;background:var(--jet);border-left:5px solid var(--accent);color:var(--off);padding:14px 16px;display:flex;justify-content:space-between;align-items:center}
.totals .due span:first-child{font-size:8pt;font-weight:600;letter-spacing:.22em}
.totals .due span:last-child{font-size:15pt;font-weight:600}
.terms{margin-top:.4in;display:grid;grid-template-columns:1fr 1fr;gap:.3in}
.terms p{font-size:9.5pt;color:var(--slate)}
.spacer{flex:1}
footer{border-top:1px solid #DADADA;padding-top:14px;display:flex;justify-content:space-between;align-items:center;font-size:8pt;color:#777;letter-spacing:.08em}
footer .thanks{font-size:10pt;color:var(--jet);letter-spacing:0;font-weight:500}
.accent{display:inline-block;width:28px;height:3px;background:var(--accent);margin-bottom:10px}
.inv .num::before{content:'';display:inline-block;width:7px;height:7px;background:var(--accent);margin-right:8px}
</style></head><body><div class="page">
<div class="topbar"></div>
<header>
 <div>@@LOGO@@
  <div class="from"><b>Justin LaFountain</b><br>Dash 10 LLC<br>5819 S Hately Ave.<br>Cudahy, WI 53110</div>
 </div>
 <div class="inv"><h1>INVOICE</h1><div class="num">{{invoice_number}}</div></div>
</header>
<div class="rule"></div>
<section class="meta">
 <div><div class="lbl">BILL TO</div><p class="strong">{{client_name}}</p><p>{{client_address_html}}</p></div>
 <div><div class="lbl">INVOICE DATE</div><p>{{invoice_date}}</p></div>
 <div><div class="lbl">PROJECT</div><p class="strong">{{project_name}}</p><p>{{project_detail}}</p></div>
</section>
<table><thead><tr><th>DESCRIPTION</th><th class="r">AMOUNT</th></tr></thead><tbody>
{{line_items_html}}
</tbody></table>
<div class="totals">
 {{subtotal_row}}
 <div class="due"><span>TOTAL DUE</span><span>{{total}}</span></div>
</div>
<div class="terms"><div><span class="accent"></span><div class="lbl">PAYMENT TERMS</div><p>{{payment_terms}}</p></div><div></div></div>
<div class="spacer"></div>
<footer><span class="thanks">Thank you for your business.</span><span>DASH10.STUDIO &nbsp;·&nbsp; MILWAUKEE, WI</span></footer>
</div></body></html>'''.replace('@@INTER@@',inter).replace('@@LOGO@@',logo)
os.makedirs(OUT/'invoice',exist_ok=True)
open(OUT/'invoice'/'invoice-template.html','w').write(TEMPLATE)

BUILD = r'''#!/usr/bin/env python3
"""Fill invoice-template.html from a JSON file and render a PDF with headless Chrome.
Usage: python3 build_invoice.py invoice-data.json [out.pdf]"""
import json, sys, html, subprocess, pathlib, tempfile
here = pathlib.Path(__file__).parent
data = json.load(open(sys.argv[1]))
brand = json.load(open(here.parent / "brand.json"))
def _lum(h):
    c = [int(h[i:i+2], 16) / 255 for i in (1, 3, 5)]
    c = [v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4 for v in c]
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
accent = data.get("accent", brand["accent"])           # per-invoice override, else the brand accent
accent_ink = "#0B0B0B" if _lum(accent) > 0.1866 else "#FFFFFF"
out = pathlib.Path(sys.argv[2] if len(sys.argv) > 2 else here / (data["invoice_number"] + ".pdf"))
money = lambda v: "${:,.2f}".format(v)
items = data["line_items"]
rows = "".join(
    '<tr><td><div class="t">%s</div><div class="d">%s</div></td><td class="r">%s</td></tr>'
    % (html.escape(i["title"]), html.escape(i.get("description", "")), money(i["amount"])) for i in items)
total = sum(i["amount"] for i in items)
subtotal_row = ""
if data.get("tax_rate"):
    tax = round(total * data["tax_rate"], 2)
    subtotal_row = ('<div class="row"><span>Subtotal</span><span>%s</span></div>'
                    '<div class="row"><span>Tax (%s%%)</span><span>%s</span></div>'
                    % (money(total), data["tax_rate"] * 100, money(tax)))
    total += tax
f = {
 "invoice_number": html.escape(data["invoice_number"]),
 "client_name": html.escape(data["client_name"]),
 "client_address_html": "<br>".join(html.escape(l) for l in data["client_address"]),
 "invoice_date": html.escape(data["invoice_date"]),
 "project_name": html.escape(data["project_name"]),
 "project_detail": html.escape(data.get("project_detail", "")),
 "line_items_html": rows, "subtotal_row": subtotal_row, "total": money(total),
 "payment_terms": html.escape(data.get("payment_terms", "Due upon receipt.")),
 "accent": accent, "accent_ink": accent_ink,
}
t = (here / "invoice-template.html").read_text()
for k, v in f.items(): t = t.replace("{{%s}}" % k, v)
tmp = pathlib.Path(tempfile.mkdtemp()) / "inv.html"; tmp.write_text(t)
subprocess.run(["google-chrome", "--headless=new", "--no-sandbox", "--disable-gpu", "--no-pdf-header-footer",
                "--print-to-pdf=" + str(out), "file://" + str(tmp)], check=True, capture_output=True)
print("wrote", out)
'''
open(OUT/'invoice'/'build_invoice.py','w').write(BUILD)
data = {
 "invoice_number":"INV-0000-001","client_name":"Sample Client Co.",
 "client_address":["123 Example Ave., Suite 100","Milwaukee, WI 00000"],
 "invoice_date":"January 1, 2026","project_name":"Sample Project","project_detail":"example.com",
 "line_items":[{"title":"Custom WordPress Theme Development - Sample Project",
   "description":"Custom WordPress theme development and website implementation, including responsive front-end development, WordPress CMS integration, custom templates/components, styling, testing, deployment support, and launch.",
   "amount":0}],
 "payment_terms":"Due upon receipt."}
if not (OUT/'invoice'/'invoice-data.json').exists():
    json.dump(data,open(OUT/'invoice'/'invoice-data.json','w'),indent=2)
