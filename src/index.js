/*jshint esversion: 6 */

//import * as d3 from "d3"; //
import { NmrSpectrum } from '../external/nmrSpectrum.js';
import { NmrAssignment } from './nmrAssignement.js';
import { getRegionsWithSignal } from './utils.js'; // Adjust the path as necessary

//import { jmolSelectPair } from './src/jmolInterface.js';
//import { readNmrRecord, NmrRecord, parseSDF} from 'nmredata3';
//import { nmredata } from 'nmredata-data-test';

//var del2= parseSDF("");
/*
import { nmredata } from 'nmredata-data-test';
import { readNmrRecord, NmrRecord } from 'nmredata';
*/

//import { nmredata } from './node_modules/nmredata-data-test/index.js';
//import { readNmrRecord, NmrRecord } from './node_modules/nmredata/src/index.js';
//import { readNmrRecord } from './node_modules/nmredata/src/reader/readNmrRecord.js';
//import { nmredata } from 'nmredata-data-test';

//declare module 'nmredata';
//import { readNmrRecord, NmrRecord } from 'nmredata';

/*
npm install nmredata-data-test --save
npm install nmredata --save
*/

/*
// NOT USED ....
https://medium.com/weekly-webtips/import-use-npm-modules-in-the-browser-easily-e70d6c84fc31
npm install browserify --save
npm install nmredata-data-test --save
npm install nmredata --save
node_modules/.bin/browserify client.js > client.bundle.js 
*/

export function jGraphNmredata(
  fileNameSpectrum,
  fileNameData,
  parseSDF,
  readNmrRecord,
  NmrRecord,
  JmolAppletAr,
  dataviz,
) {
  jGraph2(fileNameSpectrum, fileNameData, JmolAppletAr, dataviz);
}

export function jGraph2(fileNameSpectrum, fileNameData, JmolAppletAr, dataviz = "my_dataviz") {

  function initializeSettings(smallScreen, overrideSettings = {}) {
    // Default settings
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

function loadSpectrumFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function (event) {
      const text = event.target.result;
      const lines = text.split('\n').filter((line) => line.trim() !== '');
      const data = lines.map((line) => {
        const [x, y] = line.split(',').map((v) => parseFloat(v));
        return { chemShift: x, value: y };
      });
      resolve(data);
    };

    reader.onerror = function (error) {
      reject('Error reading file: ' + error);
    };

    reader.readAsText(file);
  });
}


  async function loadSpectrum(fileName) {
    try {



      const spectrumData = await d3.csv(fileName, (d) => ({
        chemShift: +d.x,
        value: +d.y,
      }));
      return spectrumData;
    } catch (error) {
      console.error(
        'Error loading or processing data from :' + fileName,
        error,
      );
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

  async function processDataAndVisualize(
    fileNameSpectrum,
    fileNameData,
    JmolAppletAr,
    dataviz,
  ) {
    try {
      const smallScreen =
        /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        );
      // Example usage with overriding default values
      const settings = initializeSettings(smallScreen, {});

      // append the svg object to the body of the page
      var svg = d3
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
        );

      //const spectrumData = await loadSpectrumFromFile(fileNameSpectrum);
      const spectrumData = await loadSpectrum(fileNameSpectrum);

      const marginPPM = 0.02;
      const minSpaceBetweenRegions = 0.05;
      const regionsData = getRegionsWithSignal(
        spectrumData,
        minSpaceBetweenRegions,
        marginPPM,
      );

      var spectrum = new NmrSpectrum(
        spectrumData,
        svg,
        settings,
        smallScreen, // default true
        regionsData, // default {}
      );

      const settings_with_spectrum_settings = spectrum.getSettings();

      const jGraphData = await readDataFile(fileNameData);

      var nmrAssignment = new NmrAssignment(
        jGraphData,
        svg,
        smallScreen,
        settings_with_spectrum_settings,
        JmolAppletAr,
      );

      // Register each class as a receiver for every other class based on data type compatibility
      const classes = [spectrum, nmrAssignment];
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

      nmrAssignment.build();
    } catch (error) {
      console.error('Error processing or visualizing the data ', error);
    }
  }

  // Main call
  processDataAndVisualize(
    fileNameSpectrum,
    fileNameData,
    JmolAppletAr,
    dataviz,
  );
}
