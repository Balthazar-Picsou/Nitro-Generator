# Converts the 4K PNG stills of the motion into high-quality JPEGs for the deck.
import glob, os
from PIL import Image

here = os.path.dirname(os.path.abspath(__file__))
os.makedirs(os.path.join(here, 'images'), exist_ok=True)
for f in sorted(glob.glob(os.path.join(here, '..', 'out', 'stills@2x', '*.png'))):
    out = os.path.join(here, 'images', os.path.basename(f)[:-4] + '.jpg')
    Image.open(f).convert('RGB').save(out, quality=92, subsampling=0, optimize=True)
