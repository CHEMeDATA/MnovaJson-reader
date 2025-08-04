import { processData } from "../src/mnovaReader.js";
import { writeFile } from "fs/promises";



async function saveStuff(
	jGraphObjDataList,
	allObjectsExtractedMolecule,
	parallelCoord,
	spectrumDataAllChopped,
	regionsData,
	baseName
) {
	// HERE DO THE GRAPHICS

	await writeFile(
		"./output/" + baseName + "jGraphObjDataList.json",
		JSON.stringify(jGraphObjDataList, null, 2),
		"utf8"
	);
	/*
[
  [
    {
      "assignedMultipletMnovaHash": "{8f02e8c8-19d8-4c4b-8201-695d7ee8641c}",
      "chemShift": 6.700017200496594,
      "labelsColumn": [
        "14a"
      ],
      "atomIndicesMol": [
        33
      ],
      "listOfJs": []
    },
      */

	await writeFile(
		"./output/" + baseName + "allObjectsExtractedMolecule.json",
		JSON.stringify(allObjectsExtractedMolecule, null, 2),
		"utf8"
	);

	/*
{
  "assignments": [
    {
      "atom": {
        "atomCode": "H;16a"
      },
      "shifts": [
        {
          "shift": 1.2823451246791202,
          "shiftMin": 1.26654470010112,
          "shiftMax": 1.297823432480065,
          "assignedMultiplets": [
            "{cfce7b55-d6b1-4bce-b12f-766aba2a16de}"
          ]
        }
      ],
      "J-couplings": [
        {
          "coupledAtom": {
            "atomCode": "H;8a"
          },
          "coupling": 6.88
  */
	await writeFile(
		"./output/" + baseName + "spectrumDataAllChopped.json",
		JSON.stringify(spectrumDataAllChopped, null, 2),
		"utf8"
	);

	/* 
[
  [
    {
      "chemShift": 7.301624305932058,
      "value": 143.125
    },
*/
	await writeFile(
		"./output/" + baseName + "parallelCoord.json",
		JSON.stringify(parallelCoord, null, 2),
		"utf8"
	);

	/* 

*/
	await writeFile(
		"./output/" + baseName + "regionsData.json",
		JSON.stringify(regionsData, null, 2),
		"utf8"
	);

	/* 

*/
}

const mainName = "santonin";
var fName = "./data/santonin/santonin_spectrum.json";
var fNameN1 = "./data/santonin/santonin_molecule.json";

{
	console.log("===============================================");
	console.log("Processing molecule:", fNameN1);
	const {
		jGraphObjDataList,
		allObjectsExtractedMolecule,
		spectrumDataAllChopped,
		regionsData,
	} = await processData(fName, fNameN1, "");

	saveStuff(
		jGraphObjDataList,
		allObjectsExtractedMolecule,
		{},
		spectrumDataAllChopped,
		regionsData,
		"santonin_"
	);
}

var fNameN2 = "./data/santonin/santonin_moleculeWithAssignment.json"; // with partial assignment of J's
//jGraph(fName, fNameN2);
{
	console.log("===============================================");
	console.log("Processing molecule:", fNameN2);
	const {
		jGraphObjDataList,
		allObjectsExtractedMolecule,
		spectrumDataAllChopped,
		regionsData,
	} = await processData(fName, fNameN2, "");
	saveStuff(
		jGraphObjDataList,
		allObjectsExtractedMolecule,
		{},
		spectrumDataAllChopped,
		regionsData,
		"santonin_WithAssignment_"
	);
}

// one from series

{
	const molecules = [
		"07-Papaverine", // OK
		//"07-Papaverine_H",   // not working
		"phenanthrene_assigned", // OK
		"01_NOTassigned", // OK
		"adcb_anatolia_empty", // OK
		"02-AZ138", // OK
		"di-buthyl-ether", // OK
		"Ibuprofen_slow", // OK
		"Vaniline_assigned", // Final one from your last line
		"01_assigned",
		"08-paper22", // OK
	];

	for (const molec of molecules) {
		console.log("===============================================");
		console.log("Processing molecule:", molec);
		// You can call your main function here, for example:
		// await jGraph(`./data/${molec}/${molec}_spectrum.json`, `./data/${molec}/${molec}.json`, ...);

		var fNameSpectra = "./testSpinFit_assigned/" + molec + "_Set.spectra.json";
		var fNameMolecule = "./testSpinFit_assigned/" + molec + "_molecule.json";
		var fNameParallelCoord =
			"./testSpinFit_assigned/" + molec + "_parallelCoord.json";
		const {
			jGraphObjDataList,
			allObjectsExtractedMolecule,
			spectrumDataAllChopped,
			regionsData,
		} = await processData(fNameSpectra, fNameMolecule, "");
		saveStuff(
			jGraphObjDataList,
			allObjectsExtractedMolecule,
			{},
			spectrumDataAllChopped,
			regionsData,
			molec + "_"
		);
		console.log("===== end Processing molecule:", molec);
	}
	for (const molec of molecules) {
		console.log("===== start molecule:", molec);

		var fNameSpectra =
			"./testSpinFit_unassigned/" + molec + "_Set.spectra.json";
		var fNameMolecule = "./testSpinFit_unassigned/" + molec + "_molecule.json";
		var fNameParallelCoord =
			"./testSpinFit_unassigned/" + molec + "_parallelCoord.json";
		const {
			jGraphObjDataList,
			allObjectsExtractedMolecule,
			spectrumDataAllChopped,
			regionsData,
		} = await processData(fNameSpectra, fNameMolecule, "");
		saveStuff(
			jGraphObjDataList,
			allObjectsExtractedMolecule,
			{},
			spectrumDataAllChopped,
			regionsData,
			molec + "_2_"
		);
		console.log("===== start molecule:", molec);
	}
}

import { NMRspectrumObject } from "../src/nmrSpectrumObject.js";

console.log("===============================================");

console.log("HERE :");
const aNMRspectrumObject = new NMRspectrumObject(); // graph

const isObject =
	typeof aNMRspectrumObject === "object" && aNMRspectrumObject !== null;

if (isObject && aNMRspectrumObject.constructor.name == "NMRspectrumObject") {
	console.log("input is a NMRspectrumObject ");
} else {
	console.log("input is NOT a NMRspectrumObject ");
}

//const del = new NmrSpectrum([aNMRspectrumObject]); // this is a graphic
