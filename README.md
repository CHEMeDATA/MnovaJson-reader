
# Type of input files

Mnova .json files exported by Mnova >=15.1, not the main Mnova documents (.mnova).

The molecules and NMR spectra data muss be stored in two separate files. In the current implementation, it is also recommend to save the molecules in the .mol format. We recommend naming them respectively FILENAME_molecule_.json, FILENAME_spectrum and FILENAME.mol. (to facilitate reading them in this repository)

Use "Save as ..." in the "File" menu and select the relevant (*.json).

Using mnova scripting :

```  
serialization.save("c:/FILENAME_molecule.json", "JSON Molecule (*.json)")
serialization.save("c:/FILENAME_spectrum.json", "JSON NMR (*.json)")
serialization.save("c:/FILENAME.mol", "mol");
```

# Identification of relevant files

Examples of files can be found in [data](data).

[Json file](identification.json) for identification.

# Comments

Notes about the Mnova .json files:

- The molecule name (first line in .mol file) is the `molecule.parameters.name` field in the molecule json.
- The `spectra.peaks.uuid` in the spectra json are used in the arrays `spectra.multiplets.list.peaks` and `molecule.assignments.shifts.assignedMultiplets`.
- The molecules files include, atoms, bonds, assignments, predictions. The first two are quite similar to the content of .mol files.
- It should be possible to reconstruct a .mol file from the molecule json file.


```zsh
node src/main.mjs
```  
