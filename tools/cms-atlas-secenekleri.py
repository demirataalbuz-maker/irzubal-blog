"""data/atlas.yaml'daki MITRE ATLAS tekniklerini CMS seçim listesine yazar.

static/admin/config.yml içindeki ATLAS-OPTIONS-START / END işaretleri arasını
yeniden üretir. ATLAS verisi güncellenince (data/atlas.yaml) bunu çalıştır:

    python tools/cms-atlas-secenekleri.py
"""
import re
import sys
from pathlib import Path

KOK = Path(__file__).resolve().parent.parent
ATLAS = KOK / "data" / "atlas.yaml"
CONFIG = KOK / "static" / "admin" / "config.yml"

satirlar = []
for satir in ATLAS.read_text(encoding="utf-8").splitlines():
    m = re.match(r'^"(AML\.T[0-9.]+)":\s*"(.*)"\s*$', satir)
    if m:
        kimlik, ad = m.groups()
        etiket = f"{kimlik} · {ad}".replace('"', "'")
        satirlar.append(f'          - {{ label: "{etiket}", value: {kimlik} }}')

if not satirlar:
    sys.exit("data/atlas.yaml içinde teknik bulunamadı")

metin = CONFIG.read_text(encoding="utf-8")
desen = re.compile(r"(          # ATLAS-OPTIONS-START\n).*?(          # ATLAS-OPTIONS-END)", re.S)
if not desen.search(metin):
    sys.exit("config.yml içinde ATLAS-OPTIONS işaretleri yok")
metin = desen.sub(lambda m: m.group(1) + "\n".join(satirlar) + "\n" + m.group(2), metin)
CONFIG.write_text(metin, encoding="utf-8")
print(f"{len(satirlar)} ATLAS tekniği yazıldı")
