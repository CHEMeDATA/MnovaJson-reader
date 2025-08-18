# Identification of relevant files

to be completed....

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

# Requirements (common to all readers)

These three files are needed to add an import to one (or more) classes.

```
src/importMethod.js
src/importStatements.js
extraMethodsStatements.json
``` 

The method to read the external files and import them in object classes are in [src/importMethod.js](src/importMethod.js).
For convenience, the same method is used for all objects. The name of the class of any object is given by `this.name`.

The method should have this structure with the if `(this.name == ...` used to select which type of object is imported.
The name of the method specifies which importer should be used (the community may have developped different importers should not interfer with each other)
```js  
// Example import method // Should not minimize
	import_Editordjeanner_Version1_SourceMnovaJson_IDnone(param, dataInput) {
		if (!dataInput.origin) {
			console.error("No origin data in dataInput", dataInput);
			this.data = {};
			process.exit(1);
		}
		this.origin = dataInput.origin;
		this.conversionParameters = param;

		if (this.name == "NMRspectrumObject") {
			...
		}
		if (this.name == "JgraphObject") {
			...
		}
	}
```  

The list of `import` statements should be in a separate file: [src/importStatements.js](src/importStatements.js) so that they will apear in the header of the final class file. 

The file listing the objects that should include the import is [extraMethodsStatements.json](extraMethodsStatements.json). The listObject lists the objects and type which can be `import` method (for readers of data), `export` method (for writer of data) or `viewer`. If necessary a list of .js files should be listed in the "jsLibrary" array.

These three files are used by the [nmr-objects repository](https://github.com/CHEMeDATA/nmr-objects) to import data objects is [src/importMethod.js](src/importMethod.js)

When creating an object with the import method, use this syntax which maps the name of the import method:

```js  
    const jGraph = new NMRspectrumObject({
      creatorParam: {
        editor: "djeanner",
        version: "1",
        source: "MnovaJson",
        id: "none",
      }}
  , data);
```
