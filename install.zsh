#!/usr/bin/env zsh
mkdir -p external
curl -o -L external/nmrSpectrum.js https://raw.githubusercontent.com/CHEMeDATA/NMRspectrum-viewer/main/src/nmrSpectrum.js
curl -o -L external/graphBase.js https://raw.githubusercontent.com/CHEMeDATA/NMRspectrum-viewer/main/src/graphBase.js

curl -o -L external/jGraphObject.js https://raw.githubusercontent.com/CHEMeDATA/nmr-objects/dist/jGraphObject.js
curl -o -L external/nmrSpectrumObject.js https://raw.githubusercontent.com/CHEMeDATA/nmr-objects/main/dist/nmrSpectrumObject.js
echo 
echo "finished curls commands"
echo 

echo "copy mnovaJsonReader.js"
cp src/mnovaJsonReader.js external/mnovaJsonReader.js 

echo "copy ObjectBase.js"
cp src/objFolder/ObjectBase.js external/ObjectBase.js 

