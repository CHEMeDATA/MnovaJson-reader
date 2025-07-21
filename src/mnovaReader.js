/*jshint esversion: 6 */

import { processMnovaJsonFileSpectrum } from './mnovaJsonReader.js';
import { processMnovaJsonFileMolecule } from './mnovaJsonReader.js';
import { extractSpectrumData } from './mnovaJsonReader.js';
import { ingestMoleculeObject } from './mnovaJsonReader.js';
import { ingestSpectrumRegions } from './mnovaJsonReader.js';
import { processSfFile } from './mnovaJsonReader.js';
import { getRegionsWithSignal } from './mnovaJsonReader.js'; // Adjust the path as necessary
import { filterOutPointsOutsideRegions } from './mnovaJsonReader.js'; // Adjust the path as necessary

import { NmrSpectrum } from './nmrSpectrum.js';
import { NmrAssignment } from './nmrAssignement.js';


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

function initializeSettings(overrideSettings = {}) {
  // Default settings
  //const smallScreenDEL = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test( navigator.userAgent, );
      const smallScreen = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  let defaultSettings = {
    spectrum: {
      margin: smallScreen
        ? { top: 50, right: 10, bottom: 30, left: 10 }
        : { top: 10, right: 30, bottom: 30, left: 60 },
      bodyWidth: 800,
      bodyHeight: smallScreen ? 1000 : 450,
      lineWidth: smallScreen ? 5 : 1.5,
      darkMode: false,
      smallScreen: smallScreen,
    },
  };

  // Merge default settings with overrides
  let settings = { ...defaultSettings, ...overrideSettings };

  // Calculate derived values
  settings.spectrum.widthOfThePlot =
    settings.spectrum.bodyWidth -
    settings.spectrum.margin.left -
    settings.spectrum.margin.right;
  settings.spectrum.height =
    settings.spectrum.bodyHeight -
    settings.spectrum.margin.top -
    settings.spectrum.margin.bottom;

  return settings;
}

async function loadSpectrum(fileName) {
  try {
    const spectrumData = await d3.csv(fileName, (d) => ({
      chemShift: +d.x,
      value: +d.y,
    }));
    return spectrumData;
  } catch (error) {
    console.error('Error loading or processing data from :' + fileName, error);
  }
}

async function readDataFile(fileNameData) {
  try {
    // Ensure d3.csv properly loads the data
    const jGraphData = await d3.csv(fileNameData);
    console.log('Loaded data from ' + fileNameData);
    if (!Array.isArray(jGraphData)) {
      throw new Error('Data loaded ' + fileNameData + ' is not an array.');
    } else {
      return jGraphData;
    }
  } catch (error) {
    console.error(
      'Error processing or visualizing the data for ' + fileNameData + ':',
      error,
    );
  }
}

function createSVG(dataviz, settings) {
  return (
    d3
      .select('#' + dataviz)
      .append('svg')
      .attr(
        'width',
        settings.spectrum.widthOfThePlot +
          settings.spectrum.margin.left +
          settings.spectrum.margin.right,
      )
      .attr(
        'height',
        settings.spectrum.height +
          settings.spectrum.margin.top +
          settings.spectrum.margin.bottom,
      )
      //           .style('border', '1px solid black') // Add a black border around the SVG
      // .style('background-color', 'lightblue') // Set the background color
      .append('g')
      .attr(
        'transform',
        'translate(' +
          settings.spectrum.margin.left +
          ',' +
          settings.spectrum.margin.top +
          ')',
      )
  );
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
			["data", "raw_data", "multiplets"]
			//['$mnova_schema', 'data', 'raw_data', 'multiplets', 'peaks', 'processing', 'parameters'],
		);
		if (typeof allSpectraObjectsExtracted === "undefined") {
			console.error("allSpectraObjectsExtracted", allSpectraObjectsExtracted);
			console.error("fileNameSpectrum", fileNameSpectrum);
		}
		console.log("allObjectsExtracted", allSpectraObjectsExtracted);

		const allObjectsExtractedMolecule = await processMnovaJsonFileMolecule(
			fileNameData,
			"molecule",
			["assignments", "atoms", "$mnova_schema"]
			/*[
          '$mnova_schema',
          'assignments',
          'predictions',
          'parameters',
          'bonds',
          'atoms',
        ],*/
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
			jGraphObjDataList.push(jGraphObj3);
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


async function makeGraphic (jGraphObjDataList, allObjectsExtractedMolecule, parallelCoord, spectrumDataAllChopped, dataviz, regionsData, JmolAppletAr) {
			const settings = initializeSettings({});
			var svg = createSVG(dataviz, settings);
			var spectrum = new NmrSpectrum(
				spectrumDataAllChopped,
				svg,
				settings,
				settings.smallScreen, // default true
				//{totalCoveredPPM: 7.0,regions: [{ start: 8.0, end: 1.0 }]},
				regionsData // default {}
			);

			const settings_with_spectrum_settings = spectrum.getSettings();

			var nmrAssignmentList = [];

			for (const jGraphObj2 of jGraphObjDataList) {
				console.log("OKOKOOOKOKO2 jGraphObj2", jGraphObj2);

				nmrAssignmentList.push(
					new NmrAssignment(
						jGraphObj2,
						svg,
						settings_with_spectrum_settings.smallScreen,
						settings_with_spectrum_settings,
						JmolAppletAr,
						nmrAssignmentList.length
					)
				);
			}

			// Register each class as a receiver for every other class based on data type compatibility
			const classes = [...nmrAssignmentList, spectrum];
			if (parallelCoord && Object.entries(parallelCoord).length !== 0) {
				classes.push(parallelCoord);
				console.log("AOKOKOO parallelCoord", parallelCoord);
			} else {
				console.log(" NO AOKOKOO parallelCoord", parallelCoord);
			}
			classes.forEach((sender) => {
				classes.forEach((receiver) => {
					if (sender !== receiver) {
						sender.getExportTypes().forEach((sendType) => {
							if (receiver.getImportTypes().includes(sendType)) {
								sender.registerReceiver(receiver, sendType);
							}
						});
					}
				});
			});

			spectrum.triggerSendAxis();

			nmrAssignmentList.forEach((nmrAssignment) => {
				nmrAssignment.build();
			});
		}

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
