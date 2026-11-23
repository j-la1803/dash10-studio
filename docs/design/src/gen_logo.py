import sys; sys.path.insert(0,'.')
from lib import *
import os
out=str(OUT/'logo')+'/'; os.makedirs(out,exist_ok=True)
def w(n,s): open(out+n,'w').write(s)
for name,fg,bg in [('black',JET,None),('white',OFF,None)]:
    w(f'dash10-studio-primary-{name}.svg', primary('STUDIO',fg,None,'YOUR GUIDE TO MODERN DIGITAL PLATFORMS'))
    w(f'dash10-studio-{name}.svg', primary('STUDIO',fg,None))
    w(f'dash10-properties-{name}.svg', primary('PROPERTIES',fg,None))
    w(f'dash10-solutions-{name}.svg', primary('SOLUTIONS',fg,None))
    w(f'dash10-wordmark-{name}.svg', wordmark(fg))
    w(f'dash10-monogram-{name}.svg', monogram(fg))
w('dash10-monogram-accent.svg', monogram(ACCENT))
w('dash10-monogram-app-icon.svg', monogram(OFF,JET))
