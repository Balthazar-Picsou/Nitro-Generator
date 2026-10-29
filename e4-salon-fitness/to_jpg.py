# Converts the 4K PNG stills of koacher-motion/salon.html into JPEGs for the deck.
import glob, os
from PIL import Image

here = os.path.dirname(os.path.abspath(__file__))
src = os.path.join(here, '..', 'koacher-motion', 'out', 'salon', 'stills@2x')
dst = os.path.join(here, '..', 'koacher-motion', 'out', 'salon', 'jpg')
os.makedirs(dst, exist_ok=True)
for f in sorted(glob.glob(os.path.join(src, '*.png'))):
    Image.open(f).convert('RGB').save(os.path.join(dst, os.path.basename(f)[:-4] + '.jpg'), quality=92, subsampling=0, optimize=True)
