#!/usr/bin/env zsh
mkdir -p external
curl -o -L external/nmrSpectrum.js https://raw.githubusercontent.com/CHEMeDATA/NMRspectrum-viewer/main/src/nmrSpectrum.js
curl -o -L external/graphBase.js https://raw.githubusercontent.com/CHEMeDATA/NMRspectrum-viewer/main/src/graphBase.js

echo 
echo "finished curls commands"
echo 

echo "create external/nmrSpectrumObject.js"
cat src/objFolder/nmrSpectrumObject.js \
| sed '/\/\/ AUTOMATIC IMPORT INSERTION WILL BE MADE HERE/r src/importStatements.js' \
| sed '/\/\/ AUTOMATIC METHOD INSERTION WILL BE MADE HERE/r src/importMethod.js' \
> external/nmrSpectrumObject.js

echo "create external/jGraphObject.js"
cat src/objFolder/jGraphObject.js \
| sed '/\/\/ AUTOMATIC IMPORT INSERTION WILL BE MADE HERE/r src/importStatements.js' \
| sed '/\/\/ AUTOMATIC METHOD INSERTION WILL BE MADE HERE/r src/importMethod.js' \
> external/jGraphObject.js

echo "copy mnovaJsonReader.js"
cp src/mnovaJsonReader.js external/mnovaJsonReader.js 

echo "copy ObjectBase.js"
cp src/objFolder/ObjectBase.js external/ObjectBase.js 

