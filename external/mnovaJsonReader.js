async function loadJson(filePath) {
    // Running in browser
    return await d3.json(filePath);
}

export function processMnovaJsonSpectrum(
  jsonDataInitial,
  type,
  fieldsToKeep,
) {
  // may be either an array or not. If not put at in an array...
    let filteredSpectraArray_FullArray = [];

    const jsonDataList = Array.isArray(jsonDataInitial)
      ? jsonDataInitial
      : [jsonDataInitial];

    jsonDataList.forEach((jsonData, index) => {
      console.log('read add : index', index);
      // Array to store the filtered spectra
      let filteredSpectraArray = [];

      // Check if the JSON has a 'spectra' field
      if (jsonData[type] && Array.isArray(jsonData[type])) {
        jsonData[type].forEach((spectrum, index) => {
          // Create an object to store the filtered data
          if (spectrum['$mnova_schema']) {
            const schema = spectrum['$mnova_schema'];
            const expected =
              'https://mestrelab.com/json-schemas/mnova/2023-07/01/nmr/spec';
            if (schema != expected) {
              console.error(
                'processMnovaJsonFileSpectrum: wrong schema : got ',
                schema,
                ' expected ',
                expected,
              );
            } else {
              console.log('processMnovaJsonFileSpectrum: schema OK :', schema);
            }
          }
          // Apply logic for varisous versions
          const filteredSpectrum = processMnovaJsonFileSpectrumV1(
            spectrum,
            fieldsToKeep,
            index,
          );
          filteredSpectraArray.push(filteredSpectrum);
        });
      } else {
        console.log('No spectra found in the JSON data.');
      }
      filteredSpectraArray_FullArray.push(filteredSpectraArray);
    });

    return filteredSpectraArray_FullArray;

}


export async function processMnovaJsonFileSpectrum(
  jsonFilePath,
  type,
  fieldsToKeep,
  callback,
) {
  try {
    fieldsToKeep.push('$mnova_schema');
    // Load the JSON data using D3
   // const jsonDataInitial = await d3.json(jsonFilePath);
    const jsonDataInitial = await loadJson(jsonFilePath);
 
 return processMnovaJsonSpectrum(
  jsonDataInitial,type,
  fieldsToKeep,
) ;
  
  } catch (error) {
    console.error('Error fetching or processing data:', error);
  }
}

function processMnovaJsonFileSpectrumV1(spectrum, fieldsToKeep, index) {
  let filteredSpectrum = {};
  fieldsToKeep.forEach((field) => {
    // Check for the field in the spectrum object
    if (spectrum[field]) {
      filteredSpectrum[field] = spectrum[field];
      console.log(
        `SpectrumT Found ${field} at spectrum level in spectra[${index}]`,
      );
    }
    // Check for the field in the spectrum.data object
    else if (spectrum.data && spectrum.data[field]) {
      filteredSpectrum[field] = spectrum.data[field];
      console.log(`SpectrumT Found ${field} in spectra[${index}].data`);
    }
    // Handle case where the field is an array of objects
    else if (Array.isArray(spectrum.data[field])) {
      filteredSpectrum[field] = spectrum.data[field].map((item) => {
        return item; // Customize this if you need to filter fields within the objects
      });
      console.log(
        `SpectrumT Found ${field} as an array in spectra[${index}].data`,
      );
    }
    // Handle nested objects within spectrum.data
    else if (
      typeof spectrum.data[field] === 'object' &&
      spectrum.data[field] !== null
    ) {
      filteredSpectrum[field] = { ...spectrum.data[field] };
      console.log(
        `SpectrumT Found ${field} as an object in spectra[${index}].data`,
      );
    }
    // Log if the field is not found at any expected location
    else {
      console.log(`SpectrumT Did not find ${field} in spectra[${index}]`);
    }
  });

  // Log the filtered spectrum object
  console.log(`SpectrumT ${index + 1}:`, filteredSpectrum);
  return filteredSpectrum;
}

export function processMnovaJsonMolecule(jsonData, type,
  fieldsToKeep,) {


    // Array to store the filtered spectra
    var filteredMolecule = {};
    // Check if the JSON has a 'spectra' field
    if (jsonData[type]) {
      const molecule = jsonData[type];
      // Create an object to store the filtered data

      fieldsToKeep.forEach((field) => {
        // Check for the field in the molecule object
        if (molecule[field]) {
          filteredMolecule[field] = molecule[field];
          console.log(`moleculeT Found ${field} at spectrum level in molecule`);
          return; // Exit the current iteration
        }

        // Check for the field in the molecule.data object
        if (molecule.data && molecule.data[field]) {
          filteredMolecule[field] = molecule.data[field];
          console.log(`moleculeT Found ${field} in molecule`);
          return; // Exit the current iteration
        }

        // Handle case where the field is an array of objects
        if (molecule.data)
          if (Array.isArray(molecule.data[field])) {
            filteredMolecule[field] = molecule.data[field].map((item) => {
              return item; // Customize this if needed
            });
            console.log(`moleculeT Found ${field} as an array in molecule`);
            return; // Exit the current iteration
          }

        // Handle nested objects within molecule.data
        if (molecule.data)
          if (
            typeof molecule.data[field] === 'object' &&
            molecule.data[field] !== null
          ) {
            filteredMolecule[field] = { ...molecule.data[field] };
            console.log(`moleculeT Found ${field} as an object in molecule`);
            return; // Exit the current iteration
          }

        // Log if the field is not found at any expected location
        console.log(`moleculeT Did not find ${field} in molecule`);
      });

      // Store the filtered spectrum in the array

      // Log the filtered spectrum object
      console.log(`moleculeT :`, filteredMolecule);
    }

    // Return the filtered spectra array via the callback
    return filteredMolecule;


  }


export async function processMnovaJsonFileMolecule(
  jsonFilePath,
  type,
  fieldsToKeep,
  callback,
) {
  try {
    // Load the JSON data using D3
   // const jsonData = await d3.json(jsonFilePath);
    const jsonData = await loadJson(jsonFilePath);

    return processMnovaJsonMolecule(jsonData, type,
  fieldsToKeep,);
  } catch (error) {
    console.error('Error fetching or processing data:', error);
  }
}


export function processSf(jsonDataInitial, type) {
  let filteredSpectraArray_FullArray = [];

    const jsonDataList = Array.isArray(jsonDataInitial)
      ? jsonDataInitial
      : [jsonDataInitial];

    jsonDataList.forEach((jsonData, index) => {
      console.log(`moleculeS got json`);
      var dataOutput = [];
      if (type == 'couplingNetwork') {
        console.log(`moleculeS look for couplingNetwork`);
        if ('z_fromVarSet' in jsonData) {
          if ('network' in jsonData.z_fromVarSet) {
            const network = jsonData.z_fromVarSet.network;
            console.log(`moleculeS got network`, network);
            if ('fJGraphColumn' in network) {
            }
            network.fJGraphColumn.forEach((afJGraphColumn, indexCol) => {
              /*
                    "atomIndex": 
                    "chemicalShift": 7.359199,
                    "assigned": true,
                    "nameChemicalShift": "1",
                    "nameChemicalShiftWithMoleculeNumber": "1 (1)",
                    "compoundIndex": [0],
                    "nbProton": 1,
                    "fQUuid": "{7b8cf080-2f69-4438-adf0-7b404cd8b67d}",
                    "indexNetworkArray": [2],
            */
              console.log(`moleculeS Element ${indexCol}:`, afJGraphColumn);
              console.log('moleculeS Atom Index:', afJGraphColumn.atomIndex);
              console.log(
                'moleculeS compoundIndex:',
                afJGraphColumn.compoundIndex,
              );
              console.log(
                'moleculeS Chemical Shift:',
                afJGraphColumn.chemicalShift,
              );
              console.log('moleculeS Assigned:', afJGraphColumn.assigned);
              console.log('moleculeS nbProton:', afJGraphColumn.nbProton);
              console.log(
                'moleculeS nameChemicalShift:',
                afJGraphColumn.nameChemicalShift,
              );
              console.log(
                'moleculeS nameChemicalShiftWithMoleculeNumber:',
                afJGraphColumn.nameChemicalShiftWithMoleculeNumber,
              );
              // You can add more processing logic here
              var listOfJs = [];
              afJGraphColumn.jInColumnArray.forEach(
                (ajInColumnArray, IndexJ) => {
                  /*
              jInColumnArray {
                    assigned: true
                    fValue: 8.086425
                    ​indexPartnerJInColumn: 1
                    ​​​indexPartnerjGraphColumn: 1
                    ​​nameCoupling: "J(1-2)"
                    ​​​nodeNumber: 0
              }
              */
                  var jObj = {
                    coupling: ajInColumnArray.fValue,
                    atomIndexMol: [],
                  };
                  // update jObj if find assigned J
                  if ('fJGraphEdges' in network) {
                    network.fJGraphEdges.forEach((afJGraphEdges, index) => {
                      /* afJGraphEdges:
                  edgeAssignmentType: 2
                  ​​jValue1: 8.121948
                 ​ jValue2: 8.086425
                  ​jValueAv: 8.104187
                  ​​​name: "J(1-2)"
                  ​​​numberOfBonds: 3
                  ​​​partner1JInColumn: 1
                  ​​​partner1jGraphColumn: 1
                  ​​​partner2JInColumn: 0
                  ​​​partner2jGraphColumn: 3
                  */
                      var tarCol = -1;
                      if (
                        afJGraphEdges.partner1jGraphColumn == indexCol &&
                        afJGraphEdges.partner1JInColumn == IndexJ
                      ) {
                        tarCol = afJGraphEdges.partner2jGraphColumn;
                      }
                      if (
                        afJGraphEdges.partner2jGraphColumn == indexCol &&
                        afJGraphEdges.partner2JInColumn == IndexJ
                      ) {
                        tarCol = afJGraphEdges.partner1jGraphColumn;
                      }

                      if (network?.fJGraphColumn?.[tarCol]?.atomIndex) {
                        // Set coupling partners
                        jObj.atomIndexMol =
                          network.fJGraphColumn[tarCol].atomIndex;
                      }
                    });
                  }
                  listOfJs.push(jObj);
                },
              );
              listOfJs.sort((a, b) => a.coupling - b.coupling);

              const obj = {
                assignedMultipletMnovaHash: afJGraphColumn.fQUuid,
                chemShift: afJGraphColumn.chemicalShift,
                labelsColumn: [afJGraphColumn.nameChemicalShift],
                atomIndicesMol: afJGraphColumn.atomIndex,
                listOfJs: listOfJs,
              };
              dataOutput.push(obj);
            });
          }
        }
      }

      if (type == 'variableSet') {
        const runEachDegenerated = false; // HERE
        console.log(`moleculeK look for spinFitVariableArray`);
        if ('spinFitVariableArray' in jsonData) {
          console.log(
            `moleculeK got spinFitVariableArray`,
            jsonData.spinFitVariableArray,
          );

          jsonData.spinFitVariableArray.forEach((aVar, indexVar) => {
            if (aVar.typeVariableString !== 'ChemicalShift') return;
            /*
                    "molAtomIndicesFull": [2],
            "molAtomIndices": [2],
            "molCompoundIndices": [0],
            "typeVariableEnum": 1,
            "typeVariableString": "ChemicalShift",
            "value": 7.315821,
            "lowerBound": 7.308822,
            "upperBound": 7.322819,
            "curQuality": {
                "m5NScalPro": 0.991754,
                "proj2": 1.000316,
                "integral1Ref": 91249653.875,
                "integral2Sim": 91588782.515625,
                "lineShapeFactor": 50085576.0,
                "lineShapeLineWidth": 1.203124,
                "diffLineWidthRelToCompoundD": 0.190624,
                "diffLineWidthRelToCompoundS": "0.190625 Hz δ(5) sp:0.991754",
                "lineKurtosis": -0.574999,
                "lineOptimized": true,
                "m1X2": 6644623768563.628,
                "m2DistEXtreSlopes": 96203.78125,
                "m3MaxMinRatio": 0.178678,
                "m4PercentInte": 86.964848,
                "sum1Ref": 404565940537269.9,
                "sum2Sim": 397669647039552.2,
                "sp": 397795481904129.2,
                "multiCompPropSelf": 1.0,
                "multiCompPropSelfFactoredQuantity": 0.0,
                "lineShapeFactorCorrectedShape": 53940580.0,
                "satisfactory": true
            },
            "satisfactory": true,
            "labelVarSet": "δ(5)",
            "stepNumber": 3
            */
            const label = aVar.labelVarSet.replace(/[δ()]/g, '');
            if (runEachDegenerated) {
              aVar.molAtomIndices.forEach((aIndex) => {
                const obj = {
                  assignedMultipletMnovaHash: '',
                  chemShift: aVar.value,
                  labelsColumn: [label],
                  atomIndicesMol: [aIndex],
                  listOfJs: [],
                  satisfactory: aVar.satisfactory,
                };
                dataOutput.push(obj);
              });
            } else {
              const obj = {
                assignedMultipletMnovaHash: '',
                chemShift: aVar.value,
                labelsColumn: [label],
                atomIndicesMol: aVar.molAtomIndices,
                listOfJs: [],
                satisfactory: aVar.satisfactory,
              };
              dataOutput.push(obj);
            }
          });
          jsonData.spinFitVariableArray.forEach((aVar, indexVar) => {
            if (aVar.typeVariableString !== 'Jcoupling') return;
            /*
            "molAtomIndices": [[2, 12]],
            "typeVariableEnum": 2,
            "typeVariableString": "Jcoupling",
            "value": 0.5,
            "lowerBound": -0.18,
            "upperBound": 1.18,
            "numberBonds": 4,
            "numberBondslabelVarSet": "4J(5-8)",
            "satisfactory": true,
            "labelVarSet": "J(5-8)",
            "stepNumber": 3
            */
            aVar.molAtomIndices.forEach((aPair, indexPair) => {
              if (!runEachDegenerated && indexPair > 0) return;

              if (aPair.length < 2) return;
              const c1 = aPair[0];
              const c2 = aPair[1];
              const graphIndex1 = dataOutput.findIndex(
                (item) =>
                  Array.isArray(item?.atomIndicesMol) &&
                  item.atomIndicesMol.includes(c1),
              );
              const graphIndex2 = dataOutput.findIndex(
                (item) =>
                  Array.isArray(item?.atomIndicesMol) &&
                  item.atomIndicesMol.includes(c2),
              );
              if (graphIndex1 < 0) return;
              if (graphIndex2 < 0) return;
              console.log(
                `moleculeK got J `,
                aVar.value,
                ' ',
                aVar.numberBondslabelVarSet,
                '',
              );

              const jObj1 = {
                coupling: aVar.value,
                atomIndexMol: [c2],
              };
              const jObj2 = {
                coupling: aVar.value,
                atomIndexMol: [c1],
              };
              dataOutput[graphIndex1].listOfJs.push(jObj1);
              dataOutput[graphIndex1].listOfJs.sort(
                (a, b) => a.coupling - b.coupling,
              );
              dataOutput[graphIndex2].listOfJs.push(jObj2);
              dataOutput[graphIndex2].listOfJs.sort(
                (a, b) => a.coupling - b.coupling,
              );
            });
          });
        }
      }

      dataOutput.sort((a, b) => b.chemShift - a.chemShift);
      console.log(`moleculeK returning dataOutput`, dataOutput);
      filteredSpectraArray_FullArray.push(dataOutput);
    });
    return { typeArray: true, data: filteredSpectraArray_FullArray , type : type};
}

export async function processSfFile(jsonFilePath, type) {
  try {
    const jsonDataInitial = await loadJson(jsonFilePath);
    return processSf(jsonDataInitial, type);
   
  } catch (error) {
    console.error('Error fetching or processing data:', error);
  }
}

function extractMoleculeData(spectrumObjectIn, type = 'data') {
  const schema = spectrumObjectIn['$mnova_schema'];
  const expected =
    'https://mestrelab.com/json-schemas/mnova/2023-07/01/molecule/molecule';
  if (schema != expected) {
    console.error(
      'extractMoleculeData: wrong schema : got ',
      schema,
      ' expected ',
      expected,
    );
  } else {
    console.log('extractMoleculeData: schema OK :', schema);
  }
  const spectrumObject = spectrumObjectIn[type];
  return spectrumObject;
}

export function extractSpectrumData(spectrumObjectIn, type = 'data') {
  const schema = spectrumObjectIn['$mnova_schema'];
  const expected =
    'https://mestrelab.com/json-schemas/mnova/2023-07/01/nmr/spec';
  if (schema != expected) {
    console.error(
      'extractSpectrumData: wrong schema : got ',
      schema,
      ' expected ',
      expected,
    );
  } else {
    console.log('extractSpectrumData: schema OK :', schema);
  }
  // Apply logic for varisous versions
  return extractSpectrumDataV1(spectrumObjectIn, type);
}

function extractSpectrumDataV1(spectrumObjectIn, type) {
  const spectrumObject = spectrumObjectIn[type];
  let result = [];

  if (spectrumObject.type === 'spectrum') {
    if (
      spectrumObject.data &&
      spectrumObject.data['1r'] &&
      Array.isArray(spectrumObject.data['1r'].array)
    ) {
      const yArray = spectrumObject.data['1r'].array.slice(); // Copy the array to "y"
      // Check if dimensional_parameters exist
      if (
        Array.isArray(spectrumObject.dimensional_parameters) &&
        spectrumObject.dimensional_parameters.length > 0
      ) {
        const params = spectrumObject.dimensional_parameters[0];

        if (
          params.points &&
          params.lowest_frequency !== undefined &&
          params.spectral_width &&
          params.spectrometer_frequency
        ) {
          // Calculate the increment
          const increment = params.spectral_width / params.points;

          // Create the array of objects with chemShift and value
          result = Array.from({ length: params.points }, (_, i) => ({
            chemShift:
              (params.lowest_frequency +
                params.spectral_width -
                i * increment) /
              params.spectrometer_frequency,
            value: yArray[i], // Assign the corresponding y value, or null if it doesn't exist
          }));
        } else {
          console.error(
            'Required parameters (points, lowest_frequency, spectral_width, spectrometer_frequency) are missing.',
          );
        }
      } else {
        console.error('dimensional_parameters not found or empty.');
      }
    } else {
      console.error('1r data array not found in the spectrum object.');
    }
  } else {
    console.error('The object does not have a type ', type);
  }

  return result;
}

export function ingestSpectrumRegions(
  allObjectsExtractedMolecule,
  spectrumAssignment,
) {
  console.log('spectrumAssignment ', spectrumAssignment);
  const jGraphData = extractMoleculeData(
    allObjectsExtractedMolecule,
    'assignments',
  );
  const atoms = extractMoleculeData(allObjectsExtractedMolecule, 'atoms');
  console.log('spectrumAssignment jGraphData ', jGraphData);

  var dataOutput = [];

  spectrumAssignment.list.forEach((multiplet, i) => {
    // find multiplet in spectra data from molecule data

    /*console.log('spectrumAssignment multiplet ========= ', multiplet);
          console.log('spectrumAssignment multiplet area ', multiplet.area);
          console.log( 'spectrumAssignment multiplet category ', multiplet.category,);
          console.log('spectrumAssignment multiplet f1_shift ', multiplet.f1_shift, );
          console.log(  'spectrumAssignment multiplet maximum ', multiplet.maximum,  );
          console.log( 'spectrumAssignment multiplet nuclides ', multiplet.nuclides, );
          console.log('spectrumAssignment multiplet name ', multiplet.name);
          console.log('spectrumAssignment multiplet amoderea ', multiplet.mode);
          console.log( 'spectrumAssignment multiplet is_reference ', multiplet.is_reference,);
          */
    console.log('spectrumAssignment multiplet range ', multiplet.range);
    let f2range = [
      multiplet.range?.f2?.from ?? null,
      multiplet.range?.f2?.to ?? null,
    ];
    let f1range = [
      multiplet.range?.f1?.from ?? null,
      multiplet.range?.f1?.to ?? null,
    ];

    /*
    "calc_parms": {
      "method": "Peaks",
      "parameters": {
          "exc_peaks": [
              "Hidden",
              "C13Satellite",
              "Rotational"
          ],
          "inc_peaks": [
              "Compound"
          ],
          "peak_method": "AutoAssignment"
      }
    },
   
   "peaks": [
        "49ad22f6-faf3-4c10-ba8d-015f374f83b5",
        "24b26e8e-c6f0-4353-9842-bd6ba5f3a4ba",
        "2acb9a7d-dbb0-4ebd-81d9-d627243b573d"
    ],
    */

    var jObj = {
      couplings: multiplet.j_list.map((obj) => obj.value),
      area: multiplet.area,
      category: multiplet.category,
      f1_shift: multiplet.f1_shift,
      maximum: multiplet.maximum,
      nuclides: multiplet.nuclides,
      name: multiplet.name,
      mode: multiplet.mode,
      is_reference: multiplet.is_reference,
      area: multiplet.area,
      f1rangePPM: f1range,
      f2rangePPM: f2range,
      type: multiplet.type,
      uuid: multiplet.uuid,
    };

    dataOutput.push(jObj);
  });
  dataOutput.sort((a, b) => b.chemShift - a.chemShift);
  return dataOutput;
}

export function ingestMoleculeObject(
  allObjectsExtractedMolecule,
  spectrumAssignment,
) {
  console.log('spectrumAssignment ', spectrumAssignment);
  const jGraphData = extractMoleculeData(
    allObjectsExtractedMolecule,
    'assignments',
  );
  const atoms = extractMoleculeData(allObjectsExtractedMolecule, 'atoms');
  console.log('spectrumAssignment jGraphData ', jGraphData);

  var dataOutput = [];
  jGraphData.forEach((atomIt, index) => {
    if (!'atom' in atomIt) return;
    const atomCode = atomIt.atom.atomCode;
    const shifts = atomIt.shifts;
    const [element, label] = atomIt.atom.atomCode.split(';');
    var atomIndexMol =
      atoms.findIndex(
        (atom) => atom.elementSymbol === element && atom.number === label,
      ) + 1;
    if (atomIndexMol == 0) {
      console.log('PROB element', element);
      console.log('PROB label', label);
      console.log('PROB ', atoms);
      atomIndexMol = atoms.findIndex((atom) => atom.number === label) + 1;
      console.log('PROB atomIndexMol ', atomIndexMol);
    }
    if (element != 'H') {
      return;
    }
    console.log('llog', ' element ', element, ' label ', label);
    // Assigned J's from the molecule
    var listOfJs = [];
    if ('J-couplings' in atomIt) {
      const listCoup = atomIt['J-couplings'];
      atomIt['J-couplings'].forEach((aJ, index) => {
        const coupling = aJ.coupling;
        var jObj = {
          coupling: coupling,
          atomIndexMol: [],
        };
        if ('atomCode' in aJ.coupledAtom) {
          // !!!! Should be a list....
          const atomCode = aJ.coupledAtom.atomCode;
          const [elementPartner, labelPartner] =
            aJ.coupledAtom.atomCode.split(';');
          const atomIndexMolPartner =
            atoms.findIndex(
              (atom) =>
                atom.elementSymbol === elementPartner &&
                atom.number === labelPartner,
            ) + 1;

          if (false)
            console.log(
              'spectrumAssignment multiplet J-couplings atomIndexMolPartner',
              atomIndexMolPartner,
              ' coupling ',
              coupling,
              ' Hz',
            );
          jObj.atomIndexMol.push(atomIndexMolPartner);
        }
        listOfJs.push(jObj);
      });
    }
    // Unassigned J's from the multiplets of the spectrum

    shifts.forEach((shiftIt, i) => {
      const listOfJsToRemove = Array.from(listOfJs);
      var alreadySomething = false; // assumes first multiplet has more information (1H)
      shiftIt.assignedMultiplets.forEach((assignedMultipletIt, i) => {
        if (alreadySomething) return;
        // find multiplet in spectra data from molecule data
        if (typeof spectrumAssignment !== 'undefined') {
          const multipletIndex = spectrumAssignment.list.findIndex(
            (multiplet) => '{' + multiplet.uuid + '}' === assignedMultipletIt,
          );
          //console.log(" -------- llog", " element ", element, " label ", label,  " ",   shiftIt);

          if (multipletIndex > 0) {
            const multiplet = spectrumAssignment.list[multipletIndex];
            /*
          console.log('spectrumAssignment multiplet ========= ', multiplet);
          console.log('spectrumAssignment multiplet area ', multiplet.area);
          console.log( 'spectrumAssignment multiplet category ', multiplet.category,);
          console.log('spectrumAssignment multiplet f1_shift ', multiplet.f1_shift, );
          console.log(  'spectrumAssignment multiplet maximum ', multiplet.maximum,  );
          console.log( 'spectrumAssignment multiplet nuclides ', multiplet.nuclides, );
          console.log('spectrumAssignment multiplet name ', multiplet.name);
          console.log('spectrumAssignment multiplet amoderea ', multiplet.mode);
          console.log( 'spectrumAssignment multiplet is_reference ', multiplet.is_reference,);
          */

            multiplet.j_list.forEach((aList) => {
              const delta = 0.1;
              let foundIndex = listOfJsToRemove.findIndex(
                (item) => Math.abs(item.coupling - aList.value) <= delta,
              );

              if (foundIndex !== -1) {
                console.log(
                  'spectrumAssignmentA Remove',
                  label,
                  'multiplet aList.value ',
                  aList.value,
                );
                listOfJsToRemove.splice(foundIndex, 1);
              } else {
                console.log(
                  'spectrumAssignmentA Keep ',
                  label,
                  'multiplet aList.value ',
                  aList.value,
                );
                var jObj = {
                  coupling: aList.value,
                  atomIndexMol: [],
                };
                listOfJs.push(jObj);
              }
            });
          }
        }
        //J-couplings

        // Find the existing object in the list by assignedMultiplet
        let existingItem = dataOutput.find(
          (item) =>
            item.assignedMultipletMnovaHash === assignedMultipletIt &&
            item.chemShift === shiftIt.shift,
        );
        const avoidsDegeneracy = false;
        if (existingItem && avoidsDegeneracy) {
          existingItem.labelsColumn.push(label);
          existingItem.atomIndicesMol.push(atomIndexMol);
          existingItem.listOfJs.concat(listOfJs);
        } else {
          const obj = {
            assignedMultipletMnovaHash: assignedMultipletIt,
            chemShift: shiftIt.shift,
            labelsColumn: [label],
            atomIndicesMol: [atomIndexMol],
            listOfJs: listOfJs,
          };
          dataOutput.push(obj);
          console.log(
            '      push        llog',
            ' element ',
            element,
            ' label ',
            label,
          );
          alreadySomething = true;
        }
      });
    });
  });
  dataOutput.sort((a, b) => b.chemShift - a.chemShift);
  return dataOutput;
}

export function filterOutPointsOutsideRegions(spectrumDataAll, regionsData) {
  // Helper function to check if chemShift is within any region
  function isWithinRegions(chemShift, regions) {
    return regions.some(region => chemShift <= region.start && chemShift >= region.end);
  }

  // Iterate through each spectrum in spectrumDataAll
  let filteredSpectrumData = spectrumDataAll.map(spectrumArray => {
    // For each inner array, filter the points based on chemShift
    return spectrumArray.filter(point => isWithinRegions(point.chemShift, regionsData.regions));
  });

  // Return the filtered spectrum data
  return filteredSpectrumData;
}

export function getRegionsWithSignal(
  chemShifts,
  minSpacePPMin = 0.2,
  marginPPMin = 0.02,
  level = 0.01, // default 1%
) {
  const minSpacePPM = Math.abs(minSpacePPMin);
  const marginPPM = Math.abs(marginPPMin);
  
  const maxY = chemShifts.reduce((max, d) => {
  const val = +d.value; // convert to number
  return val > max ? val : max;
}, -Infinity);

  const minScale = chemShifts.reduce((min, d) => {
  const val = +d.chemShift;
  return val < min ? val : min;
}, Infinity);

const maxScale = chemShifts.reduce((max, d) => {
  const val = +d.chemShift;
  return val > max ? val : max;
}, -Infinity);


  // Determine the maximum value in the dataset

  // Step 1: Identify regions where y > 1% of maxY and merge close fragments
  var regions = [];
  var currentRegion = null;
  chemShifts.forEach(function (d, i) {
    if (d.value > level * maxY) {
      if (!currentRegion) {
        // Start a new region
        currentRegion = { start: d.chemShift, end: d.chemShift };
      } else {
        // Continue the current region
        currentRegion.end = d.chemShift;
      }
    } else {
      if (currentRegion) {
        // Finalize the current region and add margins
        currentRegion.start += marginPPM;
        if (currentRegion.start > maxScale) currentRegion.start = maxScale;
        currentRegion.end -= marginPPM;
        if (currentRegion.end < minScale) currentRegion.end = minScale;
        regions.push(currentRegion);
        currentRegion = null;
      }
    }
  });

  // If there's an unfinished region, add it
  if (currentRegion) {
    currentRegion.start += marginPPM;
    if (currentRegion.start > maxScale) currentRegion.start = maxScale;
    currentRegion.end -= marginPPM;
    if (currentRegion.end < minScale) currentRegion.end = minScale;
    regions.push(currentRegion);
  }

  let newRegions = [];
  let curRegion;
  regions.forEach(function (d, i) {
    if (i != 0) {
      if (curRegion.end < d.start + minSpacePPM) {
        // fuse
        curRegion.end = d.end;

        if (i + 1 == regions.length) {
          newRegions.push(curRegion);
        }
      } else {
        newRegions.push(curRegion);
        curRegion = d;
        if (i + 1 == regions.length) {
          newRegions.push(curRegion);
        }
      }
    } else {
      curRegion = d;
    }
  });

  var totalCoveredPPM = 0.0;
  newRegions.forEach(function (currentRegion, i) {
    totalCoveredPPM += Math.abs(currentRegion.start - currentRegion.end);
  });

  // Create an Object
  const obj = {
    totalCoveredPPM: totalCoveredPPM,
    regions: newRegions,
  };

  return obj;
}
// for Editordjeanner_Version1_SourceMnovaJson_IDnone
