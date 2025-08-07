mkdir -p external
curl -o -L external/nmrSpectrum.js https://raw.githubusercontent.com/CHEMeDATA/NMRspectrum-viewer/main/src/nmrSpectrum.js
curl -o -L external/graphBase.js https://raw.githubusercontent.com/CHEMeDATA/NMRspectrum-viewer/main/src/graphBase.js

cat src/objFolder/nmrSpectrumObject.js \
| sed '/\/\/ AUTOMATIC IMPORT INSERTION WILL BE MADE HERE/r src/objFolder/exportMnovaImport.js' \
| sed '/\/\/ AUTOMATIC METHOD INSERTION WILL BE MADE HERE/r src/objFolder/exportMnovaMethod.js' \
> external/nmrSpectrumObject.js

cat src/objFolder/jGraphObject.js \
| sed '/\/\/ AUTOMATIC IMPORT INSERTION WILL BE MADE HERE/r src/objFolder/exportMnovaImport.js' \
| sed '/\/\/ AUTOMATIC METHOD INSERTION WILL BE MADE HERE/r src/objFolder/exportMnovaMethod.js' \
> external/jGraphObject.js

cp src/objFolder/mnovaJsonReader.js external/mnovaJsonReader.js 
cp src/objFolder/ObjectBase.js external/ObjectBase.js 

