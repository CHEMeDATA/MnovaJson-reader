import { writeFile } from "fs/promises";
import { readFile } from "fs/promises";

////////////////////////////////

import { processMnovaJsonSpectrum } from './mnovaJsonReader.js';
import { processMnovaJsonMolecule } from './mnovaJsonReader.js';

import { extractSpectrumData } from './mnovaJsonReader.js';
import { getRegionsWithSignal } from './mnovaJsonReader.js';
import { filterOutPointsOutsideRegions } from './mnovaJsonReader.js';
import { ingestMoleculeObject } from './mnovaJsonReader.js';
import { ingestSpectrumRegions } from './mnovaJsonReader.js';


import { NMRspectrumObject } from "../src/nmrSpectrumObject.js";
const all = true;

 async function processDataLOCAL(
  fileNameSpectrum,
  fileNameData,
  fileResulstSF
) {
  try {
	/*const allSpectraObjectsExtracted = await processMnovaJsonFileSpectrum(
			fileNameSpectrum,
			"spectra",
			//["data", "raw_data", "multiplets"]
			//['$mnova_schema', 'data', 'raw_data', 'multiplets', 'peaks', 'processing', 'parameters']
			['data', 'raw_data', 'multiplets', 'peaks', 'processing', 'parameters']
		);*/



  const fieldsToKeep = ['data', 'raw_data', 'multiplets', 'peaks', 'processing', 'parameters', '$mnova_schema'];
  fieldsToKeep.push();

  // Load the JSON data — assuming loadJson is an async function you have
  //const jsonDataInitial = await loadJson(fileNameSpectrum);
  const data = await readFile(fileNameSpectrum, 'utf-8');
   const jsonDataInitial = JSON.parse(data);
  // Call processMnovaJsonSpectrum directly with loaded data
  const allSpectraObjectsExtracted = processMnovaJsonSpectrum(
    jsonDataInitial,
    "spectra",
    fieldsToKeep
  );

		if (typeof allSpectraObjectsExtracted === "undefined") {
			console.error("allSpectraObjectsExtracted", allSpectraObjectsExtracted);
			console.error("fileNameSpectrum", fileNameSpectrum);
		}
		//console.log("allObjectsExtracted", allSpectraObjectsExtracted);

			//["assignments", "atoms", "$mnova_schema"],
  const fieldsToKeepMolecule = ['$mnova_schema','assignments', 'predictions', 'parameters','bonds', 'atoms',];

		

  //const jsonData = await loadJson(fileNameData);
  const dataM = await readFile(fileNameData, 'utf-8');
    const jsonData = JSON.parse(dataM);
	const allObjectsExtractedMolecule = processMnovaJsonMolecule(jsonData, "molecule",fieldsToKeepMolecule);


if (typeof allObjectsExtractedMolecule === "undefined") {
			console.error("allObjectsExtractedMolecule", allObjectsExtractedMolecule);
			console.error("fileNameData", fileNameData);
		}

		//console.log("allObjectsExtractedMolecule", allObjectsExtractedMolecule);

for (var i = 0; i < allSpectraObjectsExtracted.length; i++) {
			console.log(">>>>>>>>>   spectrum set ", i + 1, ":", allSpectraObjectsExtracted[i].length, "spectra.");
		}


const storeAll = true;
var spectrumDataAll = [];
if (storeAll) {
	for (var i = 0; i < allSpectraObjectsExtracted.length; i++) {
		for (var i2 = 0; i2 < allSpectraObjectsExtracted[i].length; i2++) {
			spectrumDataAll.push(
				extractSpectrumData(allSpectraObjectsExtracted[i][i2], "data")
			);
		}
	}
} else {
	// First the reference spectrum
	const spectrumData = extractSpectrumData(
		allSpectraObjectsExtracted[0][0],
		"data"
	);
	// Add from all other spectra only the last one
	spectrumDataAll.push(spectrumData);
	for (var i = 0; i < allSpectraObjectsExtracted.length; i++) {
		const lastItem = allSpectraObjectsExtracted[i].length - 1;
		spectrumDataAll.push(
			extractSpectrumData(allSpectraObjectsExtracted[i][lastItem], "data")
		);
	}
}



		if (false) {
			// demo creation spectrum
			spectrumDataAll.push([
				{ chemShift: 7.305, value: 10000 },
				{ chemShift: 7.3, value: 3000000 },
				{ chemShift: 7.295, value: 10000 },
				{ chemShift: 7.29, value: 80000 },
			]);
		}

// end of series of mnova blocks....
  //const spec00 = new NMRspectrumObject({editor: "Damien",version: "1",source: "MnovaJson",id: "none"}, spectrumDataAll[0]);
const arrayOf_NMRspectrumObject = [];
for (let i = 0; i < spectrumDataAll.length; i++) {
	arrayOf_NMRspectrumObject[i] = new NMRspectrumObject(
		{ editor: "Damien", version: "1", source: "MnovaJson", id: "none" },
		spectrumDataAll[i]
	);
}


		const marginPPM = 0.02;
		const minSpaceBetweenRegions = 0.05;
		const regionsData = getRegionsWithSignal(
			spectrumDataAll[0],
			minSpaceBetweenRegions,
			marginPPM
		);

		console.log("TTPo spectrumDataAll", spectrumDataAll);
		console.log("TTPo regionsData", regionsData);
		const spectrumDataAllChopped = filterOutPointsOutsideRegions(
			spectrumDataAll,
			regionsData
		);
		//const spectrumDataAllChopped = (spectrumDataAll);
		console.log("TTPo spectrumDataAllChopped", spectrumDataAllChopped);

		var jGraphObjDataList = [];
		if (fileResulstSF !== "") {
			const obj3 = await processSfFile(fileResulstSF, "variableSet");
		//	jGraphObjDataList.push(jGraphObj3);
			if (obj3) {
				if (obj3.data) {
					if (obj3.data.length > 0) {
						jGraphObjDataList.push(obj3);
					}
				}
			}
			const obj2 = await processSfFile(fileResulstSF, "couplingNetwork");
			console.log("jGraphObjZ 2 ", obj2);
			if (obj2) {
				if (obj2.data) {
					if (obj2.data.length > 0) {
						jGraphObjDataList.push(obj2);
					}
				}
			}
		}

 


		if ("assignments" in allObjectsExtractedMolecule) {
			const obj = ingestMoleculeObject(
				allObjectsExtractedMolecule,
				allSpectraObjectsExtracted[0][0].multiplets
			);
			console.log("jGraphObjZ 1 ", obj);
			console.log("OKOKOOOKOKO1 ", fileResulstSF);
			console.log("OKOKOOOKOKO1 jGraphObj", obj);

			jGraphObjDataList.push(obj);
		}

    // this is not done or finished....
    if ("assignments" in allObjectsExtractedMolecule) {
			const obj = ingestSpectrumRegions(
				allObjectsExtractedMolecule,
				allSpectraObjectsExtracted[0][0].multiplets
			);
			console.log("jGraphObjZ 1 ", obj);
			console.log("OKOKOOOKOKO1 ", fileResulstSF);
			console.log("OKOKOOOKOKO1 jGraphObj", obj);

		//	jGraphObjDataList.push(jGraphObj);
		}
	
 return {
    jGraphObjDataList,
    allObjectsExtractedMolecule,
    spectrumDataAllChopped,
    regionsData
  
  };
	} catch (error) {
    console.error('Error processing or visualizing the data ', error);
  }

}


{

const mainName = "santonin";
var fileNameSpectrum = "./data/santonin/santonin_spectrum.json";
var fileNameData = "./data/santonin/santonin_molecule.json";
var fileResulstSF = "";
processDataLOCAL(fileNameSpectrum, fileNameData, fileResulstSF);

const param = {
  editor: "Damien",
  version: "1",
  source: "MnovaJson",
  id: "none"
};

const payload = {
  peaks: [1, 2, 3]
};
var baseName = "demoFirst"
try {
  const spec = new NMRspectrumObject(param, payload);
  // here test schema
 /* await writeFile(
		"./output/" + baseName + ".json",
		JSON.stringify(jGraphObjDataList, null, 2),
		"utf8"
	);
	*/
  console.log("OK", spec);
} catch (e) {
  console.error(e.message);
}
}
////////////////////////////////

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

if(all) {
	console.log("===============================================");
	console.log("Processing molecule:", fNameN1);
	const {
		jGraphObjDataList,
		allObjectsExtractedMolecule,
		spectrumDataAllChopped,
		regionsData,
	} = await processDataLOCAL(fName, fNameN1, "");

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
if(all) {
	console.log("===============================================");
	console.log("Processing molecule:", fNameN2);
	const {
		jGraphObjDataList,
		allObjectsExtractedMolecule,
		spectrumDataAllChopped,
		regionsData,
	} = await processDataLOCAL(fName, fNameN2, "");
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

if(all) {
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
		} = await processDataLOCAL(fNameSpectra, fNameMolecule, "");
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
		} = await processDataLOCAL(fNameSpectra, fNameMolecule, "");
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


