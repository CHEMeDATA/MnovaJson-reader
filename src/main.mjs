import { writeFile } from "fs/promises";
import { readFile } from "fs/promises";
import crypto from "crypto";
////////////////////////////////

import { processSf } from "./mnovaJsonReader.js";
import { processMnovaJsonSpectrum } from "./mnovaJsonReader.js";
import { processMnovaJsonMolecule } from "./mnovaJsonReader.js";

import { extractSpectrumData } from "./mnovaJsonReader.js";
import { getRegionsWithSignal } from "./mnovaJsonReader.js";
import { filterOutPointsOutsideRegions } from "./mnovaJsonReader.js";
import { ingestMoleculeObject } from "./mnovaJsonReader.js";
import { ingestSpectrumRegions } from "./mnovaJsonReader.js";

import { NMRspectrumObject } from "../src/nmrSpectrumObject.js";
import { JgraphObject } from "../src/nmrSpectrumObject.js";

async function saveNMRspectrumObjectToFile(filePath, spectrumObject) {
	const jsonString = JSON.stringify(spectrumObject, null, 2);
	await writeFile(filePath, jsonString, "utf8");
}

const all = true;

async function processDataLOCAL(
	fileNameSpectrum,
	fileNameData,
	fileResulstSF,
	molecForFileName
) {
	try {
		//const timestamp = new Date().toISOString();
		const timestamp = "no timestamp in test files";
		{
			const dataSpectrum = await readFile(fileNameSpectrum, "utf-8");
			const nmrJsonFileName_sha256Hex = crypto
				.createHash("sha256")
				.update(dataSpectrum, "utf8")
				.digest("hex");
			const jsonSpectrum = JSON.parse(dataSpectrum);

			const originNMR = {
				timeStampConversion: timestamp,
				nmrJsonFileName: fileNameSpectrum,
				nmrJsonFileName_sha256Hex: nmrJsonFileName_sha256Hex,
			};

			// create NMRspectrumObject objects
			const arrayOf_NMRspectrumObject = [];
			for (let i = 0; i < 100000; i++) {
				const param = {
					creatorParam: {
						editor: "djeanner",
						version: "1",
						source: "MnovaJson",
						id: "none",
					},
					filterSpectra: "firstFirstLastOthers",
					filterSpectraIndex: i,
				};
				const lastObj = new NMRspectrumObject(param, {
					jsonSpectrum: jsonSpectrum,
					jsonMolecule: {},
					origin: originNMR,
				});
				if (
					!lastObj ||
					!lastObj.data ||
					!lastObj.data.values ||
					lastObj.data.values.length === 0
				) {
					break;
				}
				//lastObj.encodeArrayFieldWithRequestArrayEncoding(lastObj, 0);
				lastObj.encodeArrayFieldWithRequestArrayEncoding(lastObj, 1); // default
				// lastObj.decodeEncodedArrays();

				arrayOf_NMRspectrumObject.push(lastObj);
			}

			// save arrays of objects
			await saveNMRspectrumObjectToFile(
				`./output/${molecForFileName}_all_NMRspectrumObject.json`,
				arrayOf_NMRspectrumObject
			);

			// save first object
			await saveNMRspectrumObjectToFile(
				`./output/${molecForFileName}_first_NMRspectrumObject.json`,
				arrayOf_NMRspectrumObject[0]
			);
		}

		const dataSpectrum = await readFile(fileNameSpectrum, "utf-8");
		const nmrJsonFile_sha256Hex = crypto
			.createHash("sha256")
			.update(dataSpectrum, "utf8")
			.digest("hex");
		const jsonSpectrum = JSON.parse(dataSpectrum);

		const dataMolecule = await readFile(fileNameData, "utf-8");
		const moleculeJsonFile_sha256Hex = crypto
			.createHash("sha256")
			.update(dataMolecule, "utf8")
			.digest("hex");
		const jsonMolecule = JSON.parse(dataMolecule);

		var jsonDataInitial = {};
		var parallelDataFileName_sha256Hex = "";
		if (fileResulstSF !== "") {
			const tmp11 = await readFile(fileResulstSF, "utf-8");
			jsonDataInitial = JSON.parse(tmp11);
			parallelDataFileName_sha256Hex = crypto
				.createHash("sha256")
				.update(tmp11, "utf8")
				.digest("hex");
		}

		// prepare origin

		const originJgraphObject = {
			timeStampConversion: timestamp,
			nmrJsonFileName: fileNameSpectrum,
			nmrJsonFile_sha256Hex: nmrJsonFile_sha256Hex,
			moleculeJsonFileName: fileNameData,
			moleculeJsonFile_sha256Hex: moleculeJsonFile_sha256Hex,
			parallelDataJsonFileName: fileResulstSF,
			parallelDataJsonFile_sha256Hex: parallelDataFileName_sha256Hex,
		};

		const param = {
			creatorParam: {
				editor: "djeanner",
				version: "1",
				source: "MnovaJson",
				id: "none",
			},
		};

		const paralelCoordNMRspectra = new JgraphObject(param, {
			jsonSpectrum: jsonSpectrum,
			jsonMolecule: jsonMolecule,
			jsonDataInitial: jsonDataInitial,
			origin: originJgraphObject,
		});

		// save arrays of objects
		await saveNMRspectrumObjectToFile(
			`./output/${molecForFileName}_JgraphObject.json`,
			paralelCoordNMRspectra
		);

		const fieldsToKeepMolecule = [
			"$mnova_schema",
			"assignments",
			"predictions",
			"parameters",
			"bonds",
			"atoms",
		];

		const allObjectsExtractedMolecule = processMnovaJsonMolecule(
			jsonMolecule,
			"molecule",
			fieldsToKeepMolecule
		);

		if (typeof allObjectsExtractedMolecule === "undefined") {
			console.error("allObjectsExtractedMolecule", allObjectsExtractedMolecule);
			console.error("fileNameData", fileNameData);
		}

		const fieldsToKeepSpectrum = [
			"data",
			"raw_data",
			"multiplets",
			"peaks",
			"processing",
			"parameters",
			"$mnova_schema",
		];

		const allSpectraObjectsExtracted = processMnovaJsonSpectrum(
			jsonSpectrum,
			"spectra",
			fieldsToKeepSpectrum
		);
		const storeAll = false;
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
			const tmp11 = await readFile(fileResulstSF, "utf-8");
			const jsonDataInitial = JSON.parse(tmp11);

			const obj3 = processSf(jsonDataInitial, "variableSet");
			if (obj3) {
				if (obj3.data) {
					if (obj3.data.length > 0) {
						obj3.originScript = "variableSet using processSf";
						jGraphObjDataList.push(obj3);
					}
				}
			}

			const obj2 = processSf(jsonDataInitial, "couplingNetwork");
			console.log("jGraphObjZ 2 ", obj2);
			if (obj2) {
				if (obj2.data) {
					if (obj2.data.length > 0) {
						obj2.originScript = "couplingNetwork using processSf";
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
			obj.originScript = "assignments using ingestMoleculeObject";
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
			obj.originScript = "assignments using ingestSpectrumRegions";
			jGraphObjDataList.push(obj);
		}

		return {
			jGraphObjDataList,
			allObjectsExtractedMolecule,
			spectrumDataAllChopped,
			regionsData,
		};
	} catch (error) {
		console.error("Error processing or visualizing the data ", error);
	}
}

if (all) {
	const mainName = "santonin";
	var fileNameSpectrum = "./data/santonin/santonin_spectrum.json";
	var fileNameData = "./data/santonin/santonin_molecule.json";
	var fileResulstSF = "";
	processDataLOCAL(fileNameSpectrum, fileNameData, fileResulstSF);
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
if (all) {
	const mainName = "santonin";
	var fName = "./data/santonin/santonin_spectrum.json";
	var fNameN1 = "./data/santonin/santonin_molecule.json";
	console.log("===============================================");
	console.log("Processing molecule:", fNameN1);
	const {
		jGraphObjDataList,
		allObjectsExtractedMolecule,
		spectrumDataAllChopped,
		regionsData,
	} = await processDataLOCAL(fName, fNameN1, "", mainName);

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
if (all) {
	const mainName = "santoninWithAssignement";
	var fName = "./data/santonin/santonin_spectrum.json";
	var fNameN2 = "./data/santonin/santonin_moleculeWithAssignment.json"; // with partial assignment of J's

	console.log("===============================================");
	console.log("Processing molecule:", fNameN2);
	const {
		jGraphObjDataList,
		allObjectsExtractedMolecule,
		spectrumDataAllChopped,
		regionsData,
	} = await processDataLOCAL(fName, fNameN2, "", mainName);
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

if (all) {
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
		var fNameSF = "./testSpinFit_assigned/" + molec + "_Set.spinFitResult.json";

		const {
			jGraphObjDataList,
			allObjectsExtractedMolecule,
			spectrumDataAllChopped,
			regionsData,
		} = await processDataLOCAL(fNameSpectra, fNameMolecule, fNameSF, molec);
		saveStuff(
			jGraphObjDataList,
			allObjectsExtractedMolecule,
			{},
			spectrumDataAllChopped,
			regionsData,
			molec + "_"
		);
		console.log("===== end Processing molecule _1_:", molec);
	}
	for (const molec of molecules) {
		console.log("===== start molecule:", molec);

		var fNameSpectra =
			"./testSpinFit_unassigned/" + molec + "_Set.spectra.json";
		var fNameMolecule = "./testSpinFit_unassigned/" + molec + "_molecule.json";
		var fNameSF =
			"./testSpinFit_unassigned/" + molec + "_Set.spinFitResult.json";

		const {
			jGraphObjDataList,
			allObjectsExtractedMolecule,
			spectrumDataAllChopped,
			regionsData,
		} = await processDataLOCAL(
			fNameSpectra,
			fNameMolecule,
			fNameSF,
			molec + "_2"
		);
		saveStuff(
			jGraphObjDataList,
			allObjectsExtractedMolecule,
			{},
			spectrumDataAllChopped,
			regionsData,
			molec + "_2_"
		);
		console.log("===== ends Processing molecule _2_:", molec);
	}
}
