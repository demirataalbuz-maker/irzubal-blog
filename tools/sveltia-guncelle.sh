#!/usr/bin/env sh
# Sveltia CMS'i yeni sürüme sabitle: dosyayı unpkg'den indirir, jsDelivr'ın özetiyle
# karşılaştırır, eşleşirse static/admin/index.html içindeki sürüm ve SRI'yi günceller.
# Kullanım: sh tools/sveltia-guncelle.sh 0.222.0   (sürüm verilmezse en yenisi)
set -eu
V="${1:-$(curl -sfL https://unpkg.com/@sveltia/cms/package.json | python -c 'import json,sys;print(json.load(sys.stdin)["version"])')}"
T="$(mktemp)"
curl -sfL "https://unpkg.com/@sveltia/cms@$V/dist/sveltia-cms.js" -o "$T"
J="$(curl -sf "https://data.jsdelivr.com/v1/packages/npm/@sveltia/cms@$V?structure=flat" | python -c 'import json,sys;print([f["hash"] for f in json.load(sys.stdin)["files"] if f["name"]=="/dist/sveltia-cms.js"][0])')"
L="$(openssl dgst -sha256 -binary "$T" | openssl base64 -A)"
[ "$J" = "$L" ] || { echo "UYARI: unpkg ve jsDelivr özetleri uyuşmuyor, güncelleme yapılmadı"; exit 1; }
SRI="sha384-$(openssl dgst -sha384 -binary "$T" | openssl base64 -A)"
F="$(dirname "$0")/../static/admin/index.html"
sed -i -E "s#@sveltia/cms@[0-9.]+/#@sveltia/cms@$V/#; s#integrity=\"sha384-[^\"]+\"#integrity=\"$SRI\"#" "$F"
rm -f "$T"
echo "Sveltia CMS $V, $SRI"
