#!/usr/bin/env zsh
mkdir -p external
echo "Fill ./external folder"

echo "start getting https://raw.githubusercontent.com/CHEMeDATA/NMRspectrum-viewer"
curl -s -L -o external/nmrSpectrum.js https://raw.githubusercontent.com/CHEMeDATA/NMRspectrum-viewer/main/src/nmrSpectrum.js 
curl -s -L -o external/graphBase.js https://raw.githubusercontent.com/CHEMeDATA/NMRspectrum-viewer/main/src/graphBase.js 

echo "get all files from https://raw.githubusercontent.com/CHEMeDATA/nmr-objects/dist/"
for file in jGraphObject.js nmrSpectrumObject.js mnovaJsonReader.js; do
    curl -s -L -o "external/$file" "https://raw.githubusercontent.com/CHEMeDATA/nmr-objects/main/dist/$file"
done

echo "copy ObjectBase.js"
cp src/objFolder/ObjectBase.js external/ObjectBase.js 
