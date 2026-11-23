#!/usr/bin/env python3
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
