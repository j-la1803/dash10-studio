import json
import os,sys
sys.path.insert(0,'.')
from lib import OUT, ACCENT
ICONS=json.load(open('icons.json'))
base=str(OUT/'icons')+'/'; os.makedirs(base,exist_ok=True)
def svg(body,color='currentColor',sw=2.5,bg=None):
    r = f'<rect width="48" height="48" fill="{bg}"/>' if bg else ''
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="{color}" stroke-width="{sw}" stroke-linecap="square" stroke-linejoin="miter" role="img">{r}{body}</svg>'
for n,b in ICONS.items():
    open(base+f'{n}.svg','w').write(svg(b,'#0B0B0B'))
    os.makedirs(base+'white',exist_ok=True); os.makedirs(base+'accent',exist_ok=True)
    open(base+f'white/{n}.svg','w').write(svg(b,'#F5F5F5'))
    open(base+f'accent/{n}.svg','w').write(svg(b,ACCENT))
sprite='<svg xmlns="http://www.w3.org/2000/svg" style="display:none">'+''.join(f'<symbol id="i-{n}" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square" stroke-linejoin="miter">{b}</symbol>' for n,b in ICONS.items())+'</svg>'
open(base+'dash10-icons-sprite.svg','w').write(sprite)

