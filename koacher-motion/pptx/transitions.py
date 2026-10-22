# Adds a fade transition to every slide (pptxgenjs cannot write transitions).
import re, sys, zipfile, shutil, os

FADE = '<p:transition spd="med"><p:fade/></p:transition>'
src = sys.argv[1]
tmp = src + '.tmp'
with zipfile.ZipFile(src) as zin, zipfile.ZipFile(tmp, 'w', zipfile.ZIP_DEFLATED) as zout:
    for item in zin.infolist():
        data = zin.read(item.filename)
        if re.fullmatch(r'ppt/slides/slide\d+\.xml', item.filename):
            xml = data.decode('utf-8')
            if '<p:transition' not in xml:
                xml = xml.replace('</p:clrMapOvr>', '</p:clrMapOvr>' + FADE, 1)
            data = xml.encode('utf-8')
        zout.writestr(item, data)
shutil.move(tmp, src)
