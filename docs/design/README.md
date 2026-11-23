# Dash 10 brand kit

Change the accent in ONE place: `brand.json` -> run `python3 src/build_all.py`.
Client copy: `python3 src/build_all.py --accent "#FF5B2E" --name "Acme" --out clients/acme`
(needs python3 + fonttools, rsvg-convert, google-chrome)

- brand.json     name + accent (the single source of truth)
- brand/         tokens.css and tokens.json (use these in WordPress themes and code)
- logo/          outlined SVG logos (black/white, Studio/Properties/Solutions, wordmark, monogram, accent monogram, app icon) + png/
- icons/         12 SVG icons: black, white/, accent/, plus sprite
- invoice/       invoice-template.html, build_invoice.py, invoice-data.json (local, git-ignored: holds real client details)
- website/       index.html (drop your video at website/assets/dash-10-video-bg-slowed.mp4; it is picked up automatically)
- guide/         Dash_10_Brand_Guidelines.pdf (+ HTML source)
- src/           generators

Website live accent: add ?accent=ff5b2e to the URL, or use the Accent picker in the footer.
Per-invoice accent: add "accent": "#hex" to invoice-data.json.
