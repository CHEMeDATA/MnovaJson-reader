
# MnovaJson-reader

Import Mnova .json files exported by Mnova >=14.1 (not the main .mnova documents) into NMRspectrumObject and JgraphObject objects

The molecules and NMR spectra data muss be stored in two separate files in the current implementation. It is also recommended to save the molecules in the .mol format. We recommend naming them respectively FILENAME_molecule_.json, FILENAME_spectrum and FILENAME.mol. (to facilitate reading them in this repository)

Use "Save as ..." in the "File" menu and select the relevant (*.json).

# Generation of the input files

Using mnova scripting :

```  
serialization.save("c:/FILENAME_molecule.json", "JSON Molecule (*.json)")
serialization.save("c:/FILENAME_spectrum.json", "JSON NMR (*.json)")
serialization.save("c:/FILENAME.mol", "mol");
```

Examples of files can be found in [data](https://github.com/CHEMeDATA/MnovaJson-reader/tree/main/data).

For santonin, [santonin_molecule.json](https://github.com/CHEMeDATA/MnovaJson-reader/blob/main/data/santonin/santonin_molecule.json), [santonin_spectrum.json](https://github.com/CHEMeDATA/MnovaJson-reader/blob/main/data/santonin/santonin_spectrum.json) and [santonin.mol](https://github.com/CHEMeDATA/MnovaJson-reader/blob/main/data/santonin/santonin.mol)


A simple example only reading a Mnova spectrum [html/mnovaOnlySpectrum.html](html/mnovaOnlySpectrum.html).

A more complex example with assignment and the assigned molecule and interactions [html/mnovaFileDemo.html](html/mnovaFileDemo.html).

# More information

[Technical details](./technicalDetails.md)