/*jshint esversion: 6 */

import { processMnovaJsonFileSpectrum } from './mnovaJsonReader.js';
import { processMnovaJsonFileMolecule } from './mnovaJsonReader.js';
import { extractSpectrumData } from './mnovaJsonReader.js';
import { ingestMoleculeObject } from './mnovaJsonReader.js';
import { ingestSpectrumRegions } from './mnovaJsonReader.js';
import { processSfFile } from './mnovaJsonReader.js';
import { getRegionsWithSignal } from './mnovaJsonReader.js'; // Adjust the path as necessary
import { filterOutPointsOutsideRegions } from './mnovaJsonReader.js'; // Adjust the path as necessary

import { makeGraphic } from './nmrSpectrum.js';

export function jGraphNmredata(
  fileNameSpectrum,
  fileNameData,
  parseSDF,
  readNmrRecord,
  NmrRecord,
  JmolAppletAr,
  dataviz,
) {
  jGraph(fileNameSpectrum, fileNameData, JmolAppletAr, dataviz);
}

export async function processData(
  fileNameSpectrum,
  fileNameData,
  fileResulstSF
) {
  try {
		// Example usage with overriding default values
		const allSpectraObjectsExtracted = await processMnovaJsonFileSpectrum(
			fileNameSpectrum,
			"spectra",
			//["data", "raw_data", "multiplets"]
			//['$mnova_schema', 'data', 'raw_data', 'multiplets', 'peaks', 'processing', 'parameters']
			['data', 'raw_data', 'multiplets', 'peaks', 'processing', 'parameters']
		);
		if (typeof allSpectraObjectsExtracted === "undefined") {
			console.error("allSpectraObjectsExtracted", allSpectraObjectsExtracted);
			console.error("fileNameSpectrum", fileNameSpectrum);
		}
		console.log("allObjectsExtracted", allSpectraObjectsExtracted);

		const allObjectsExtractedMolecule = await processMnovaJsonFileMolecule(
			fileNameData,
			"molecule",
			//["assignments", "atoms", "$mnova_schema"],
			['$mnova_schema','assignments', 'predictions', 'parameters','bonds', 'atoms',],
		);

		// First the reference spectrum
		const spectrumData = extractSpectrumData(
			allSpectraObjectsExtracted[0][0],
			"data"
		);
		var spectrumDataAll = [spectrumData];

		// Add from all other spectra only the last one
		for (var i = 0; i < allSpectraObjectsExtracted.length; i++) {
			const lastItem = allSpectraObjectsExtracted[i].length - 1;
			spectrumDataAll.push(
				extractSpectrumData(allSpectraObjectsExtracted[i][lastItem], "data")
			);
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
			spectrumData,
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
			const jGraphObj3 = await processSfFile(fileResulstSF, "variableSet");
		//	jGraphObjDataList.push(jGraphObj3);
			if (jGraphObj3) {
				if (jGraphObj3.data) {
					if (jGraphObj3.data.length > 0) {
						jGraphObjDataList.push(jGraphObj3);
					}
				}
			}
			const jGraphObj2 = await processSfFile(fileResulstSF, "couplingNetwork");
			console.log("jGraphObjZ 2 ", jGraphObj2);
			if (jGraphObj2) {
				if (jGraphObj2.data) {
					if (jGraphObj2.data.length > 0) {
						jGraphObjDataList.push(jGraphObj2);
					}
				}
			}
		}

 


		if ("assignments" in allObjectsExtractedMolecule) {
			const jGraphObj = ingestMoleculeObject(
				allObjectsExtractedMolecule,
				allSpectraObjectsExtracted[0][0].multiplets
			);
			console.log("jGraphObjZ 1 ", jGraphObj);
			console.log("OKOKOOOKOKO1 ", fileResulstSF);
			console.log("OKOKOOOKOKO1 jGraphObj", jGraphObj);

			jGraphObjDataList.push(jGraphObj);
		}

    // this is not done or finished....
    if ("assignments" in allObjectsExtractedMolecule) {
			const jGraphObj = ingestSpectrumRegions(
				allObjectsExtractedMolecule,
				allSpectraObjectsExtracted[0][0].multiplets
			);
			console.log("jGraphObjZ 1 ", jGraphObj);
			console.log("OKOKOOOKOKO1 ", fileResulstSF);
			console.log("OKOKOOOKOKO1 jGraphObj", jGraphObj);

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

// dont use this function. Nothing to do here. Will be removed. Deprication
export async function jGraph(
  fileNameSpectrum,
  fileNameData,
  JmolAppletAr,
  dataviz = 'my_dataviz',
  fileResulstSF = '',
  parallelCoord = {},
) {
	// Main call
	const {
		jGraphObjDataList,
		allObjectsExtractedMolecule,
		spectrumDataAllChopped,
		regionsData,
	} = await processData(
		fileNameSpectrum,
		fileNameData,
		fileResulstSF
	);
	
		makeGraphic(
			jGraphObjDataList,
			allObjectsExtractedMolecule,
			parallelCoord,
			spectrumDataAllChopped,
			dataviz,
			regionsData,
			JmolAppletAr
		);
		
	
}
