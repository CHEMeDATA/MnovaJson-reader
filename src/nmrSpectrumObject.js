import { processMnovaJsonSpectrum } from "./mnovaJsonReader.js";
import { processMnovaJsonMolecule } from "./mnovaJsonReader.js";

import { extractSpectrumData } from "./mnovaJsonReader.js";
import { getRegionsWithSignal } from "./mnovaJsonReader.js";
import { filterOutPointsOutsideRegions } from "./mnovaJsonReader.js";
import { ingestMoleculeObject } from "./mnovaJsonReader.js";
import { ingestSpectrumRegions } from "./mnovaJsonReader.js";
import { processSf } from "./mnovaJsonReader.js";
class ObjectBase {
	constructor(param, input, name) {
		this.verbose = 0;
		this.name = name;
		if (param.demo) {
			this._handleLoadDemoData(param.demo);
		} else {
			this._validateParam(param.creatorParam);
			this._loadImportedData(param, input);
		}
	}
	encodeArrayFieldWithRequestArrayEncoding(obj = this.data, encodeVersion = 1) {
		if (encodeVersion === 0) return obj;
		if (obj && typeof obj === "object" && obj.requestArrayEncoding) {
			// For every key, check if value is an array to encode
			for (const key in obj) {
				if (Array.isArray(obj[key])) {
					if (encodeVersion === 1) {
						obj[key] = this._binaryEncodeArrayV1(
							obj[key],
							obj.requestArrayEncoding
						);
					}
				}
			}
		}

		// Recurse on nested objects anyway
		for (const key in obj) {
			if (typeof obj[key] === "object" && obj[key] !== null) {
				this.encodeArrayFieldWithRequestArrayEncoding(obj[key]);
			}
		}

		return obj;
	}

	// If changes the binaryEncodeArrayV1 write a decodeArrayV1 for the new version and keep all decdeArray for compatibility
	_binaryEncodeArrayV1(array, encoding) {
		let typedArray;
		switch (encoding) {
			case "float64-hex":
				typedArray = new Float64Array(array);
				break;
			case "float32-hex":
				typedArray = new Float32Array(array);
				break;
			case "int32-hex":
				typedArray = new Int32Array(array);
				break;
			case "int16-hex":
				typedArray = new Int16Array(array);
				break;
			case "uint8-hex":
				typedArray = new Uint8Array(array);
				break;
			default:
				throw new Error("Unsupported encoding: " + encoding);
		}

		const byteArray = new Uint8Array(typedArray.buffer);
		const hex = [...byteArray]
			.map((b) => b.toString(16).padStart(2, "0"))
			.join("");

		return {
			compressionVersion: 1, // version 1
			encoding,
			length: array.length,
			data: hex,
		};

		// possible version 2 will need a decoder ...
		/*
		const byteArray = new Uint8Array(typedArray.buffer);

		// ✅ Compress the binary using deflate
		const compressed = pako.deflate(byteArray);

		// Encode to base64 (safer than hex, and smaller)
		const base64 = Buffer.from(compressed).toString("base64");
		return {
			compressionVersion: 2,
			encoding,
			length: array.length,
			data: base64,
			compression: "deflate", // new field check is here...
		};
		*/
	}

	decodeEncodedArrays(obj = this.data) {
		if (Array.isArray(obj)) {
			return obj.map(decodeEncodedArrays);
		} else if (obj && typeof obj === "object") {
			const keys = Object.keys(obj);
			if (
				keys.includes("encoding") &&
				keys.includes("data") &&
				keys.includes("length") &&
				keys.includes("compressionVersion")
			) {
				if (obj.compressionVersion === 1) {
					return this.decodeArrayV1(obj.data, obj.encoding, obj.length);
				}
			}
			for (const key in obj) {
				obj[key] = this.decodeEncodedArrays(obj[key]);
			}
		}
		return obj;
	}

	_decodeArrayV1(hexStr, encoding, length) {
		const bytes = new Uint8Array(
			hexStr.match(/.{1,2}/g).map((b) => parseInt(b, 16))
		);
		let typedArray;
		switch (encoding) {
			case "float64-hex":
				typedArray = new Float64Array(bytes.buffer);
				break;
			case "float32-hex":
				typedArray = new Float32Array(bytes.buffer);
				break;
			case "int32-hex":
				typedArray = new Int32Array(bytes.buffer);
				break;
			case "int16-hex":
				typedArray = new Int16Array(bytes.buffer);
				break;
			case "uint8-hex":
				typedArray = new Uint8Array(bytes.buffer);
				break;
			default:
				throw new Error("Unsupported encoding: " + encoding);
		}
		return Array.from(typedArray.slice(0, length));
	}

	_validateParam(param) {
		if (!param || typeof param !== "object") {
			throw new Error("param must be an object");
		}
		if (!param.editor) {
			throw new Error("param.editor missing");
		}
		if (!param.version) {
			throw new Error("param.version missing");
		}
		if (!param.source) {
			throw new Error("param.source missing");
		}
		if (!param.id) {
			throw new Error("param.id missing");
		}
	}

	_handleLoadDemoData(numberOfSpectra) {
		throw new Error("_handleLoadDemoData() must be implemented by subclass");
	}

	_buildImportFunctionName(param) {
		return (
			"import" +
			"_Editor" +
			param.editor +
			"_Version" +
			param.version +
			"_Source" +
			param.source +
			"_ID" +
			param.id
		);
	}

	_loadImportedData(param, input) {
		const importFunctionName = this._buildImportFunctionName(
			param.creatorParam
		);

		if (typeof this[importFunctionName] !== "function") {
			throw new Error(
				`Import function ${importFunctionName} does not exist on NMRspectrumObject`
			);
		}
		this.constructorImporterFunctionName = importFunctionName;
		this.constructorImporterParam = param;
		this[importFunctionName](param, input);
		if (this.verbose > 1) console.log(this.name + ".data:", this.data);
	}
}
export class NMRspectrumObject extends ObjectBase {
	constructor(param, input) {
		super(param, input, "NMRspectrumObject");
		// optionally override again
		this.verbose = 0;
	}

	_handleLoadDemoData(numberOfSpectra) {
		this._loadDemoData(numberOfSpectra);
	}

	_loadDemoData(numberOfSpectra) {
		const values = Array.from({ length: 16000 }, (_, i) => {
			return (i + Math.random() * 2000.0 - 1000.0) / 1000.0;
		});
		this.data = {
			values: values,
			firstPoint: 11.0,
			lastPoint: -1.0,
		};
	}

	// Example import method // Should not minimize
	import_Editordjeanner_Version1_SourceMnovaJson_IDnone(param, dataInput) {
		if (!dataInput.origin) {
			console.error("No origin data in dataInput", dataInput);
			this.data = {};
			// process.exit(1);
		}
		this.origin = dataInput.origin;
		this.conversionParameters = param;

		if (this.name == "NMRspectrumObject") {
			// Specify here the version number of the specific object (needed to allow version update)
			this.versionData = 1;
			if (!dataInput.jsonSpectrum) {
				console.error("No jsonSpectrum in dataInput", dataInput);
				this.data = {};
				return;
			}
			const jsonSpectrum = dataInput.jsonSpectrum;
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

			if (typeof allSpectraObjectsExtracted === "undefined") {
				console.error("allSpectraObjectsExtracted", allSpectraObjectsExtracted);
				console.error("fileNameSpectrum", fileNameSpectrum);
			}

			if (this.verbose > 1) {
				var total = 0;
				for (var i = 0; i < allSpectraObjectsExtracted.length; i++) {
					total += allSpectraObjectsExtracted[i].length;
					if (this.verbose > 1)
						console.log(
							">>>>>>>>> ",
							" spectrum set ",
							i + 1,
							":",
							allSpectraObjectsExtracted[i].length,
							"spectra."
						);
				}
				if (this.verbose > 1)
					console.log(
						">>>>>>>>>>>>>>>>>>>>>>>>>> ",
						" total :",
						total,
						"spectra."
					);
			}

			var input = extractSpectrumData(allSpectraObjectsExtracted[0][0], "data");
			if (param) {
				if (param.filterSpectra) {
					if (param.filterSpectra == "onlyFirst") {
						input = extractSpectrumData(
							allSpectraObjectsExtracted[0][0],
							"data"
						);
					}
					if (param.filterSpectra == "firstFirstLastOthers") {
						var index = 0;
						if (param.filterSpectraIndex) {
							index = param.filterSpectraIndex;
						}
						if (index == 0) {
							// first of first spectrum (experimental spectrum)
							input = extractSpectrumData(
								allSpectraObjectsExtracted[0][0],
								"data"
							);
						} else {
							// last (simulation) of other (non first)

							const redindex = index - 1;
							if (this.verbose > 1) console.log(" redindex :", redindex);
							if (redindex >= allSpectraObjectsExtracted.length) {
								this.data = {};
								return; // normal when not knowning until where go.
							}
							const lastItem = allSpectraObjectsExtracted[redindex].length - 1;
							input = extractSpectrumData(
								allSpectraObjectsExtracted[redindex][lastItem],
								"data"
							);
						}
					}
					if (param.filterSpectra == "any") {
						var index = 0;
						var index2 = 0;
						if (param.filterSpectraIndex) {
							index = param.filterSpectraIndex;
						}
						if (param.filterSpectraIndex2) {
							index2 = param.filterSpectraIndex2;
						}
						input = extractSpectrumData(
							allSpectraObjectsExtracted[index][index2],
							"data"
						);
					}
				}
			}
			// get min and max of chemShift (the scale)
			const extremas_chemshift = input.reduce(
				(acc, item) => {
					const value = item["chemShift"];
					if (typeof value === "number" && !isNaN(value)) {
						if (value < acc.min) acc.min = value;
						if (value > acc.max) acc.max = value;
					}
					return acc;
				},
				{ min: Infinity, max: -Infinity }
			);
			// get spectrum
			const values = input.map((d) => d.value);

			// create final data object
			this.data = {
				values: values,
				firstPoint: extremas_chemshift.max,
				lastPoint: extremas_chemshift.min,
				requestArrayEncoding: "float64-hex", // flag to binary encode values
			};
		}
		if (this.name == "JgraphObject") {
			// Specify here the version number of the specific object (needed to allow version update)
			this.versionData = 1;
			/*if (!dataInput.jsonSpectrum) {
				console.error("No jsonSpectrum in dataInput", dataInput);
				this.data = {};
				return;
			}*/

			// create final data object

			const jsonSpectrum = dataInput.jsonSpectrum;
			const jsonMolecule = dataInput.jsonMolecule;
			const jsonDataInitial = dataInput.jsonDataInitial;

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
				console.error(
					"allObjectsExtractedMolecule",
					allObjectsExtractedMolecule
				);
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

			//if (fileResulstSF !== "") {
			//	const tmp11 = await readFile(fileResulstSF, "utf-8");
			//	const jsonDataInitial = JSON.parse(tmp11);
			if (jsonDataInitial && Object.keys(jsonDataInitial).length > 0) {
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

				obj.originScript = "assignments using ingestMoleculeObject";
				jGraphObjDataList.push(obj);
			}

			// this is not done or finished....
			if ("assignments" in allObjectsExtractedMolecule) {
				const obj = ingestSpectrumRegions(
					allObjectsExtractedMolecule,
					allSpectraObjectsExtracted[0][0].multiplets
				);

				obj.originScript = "assignments using ingestSpectrumRegions";
				jGraphObjDataList.push(obj);
			}

			this.data = {
				jGraphObjDataList: jGraphObjDataList,
				allObjectsExtractedMolecule: allObjectsExtractedMolecule,
				spectrumDataAllChopped: spectrumDataAllChopped,
				regionsData: regionsData,

				//requestArrayEncoding: "float64-hex", // flag to binary encode values
			};
		}
	}
}
export class JgraphObject extends ObjectBase {
	constructor(param, input) {
		super(param, input, "JgraphObject");
		// optionally override again
		this.verbose = 0;
	}

	_handleLoadDemoData(numberOfSpectra) {
		this._loadDemoData(numberOfSpectra);
	}

	_loadDemoData(numberOfSpectra) {
	}

	// Example import method // Should not minimize
	import_Editordjeanner_Version1_SourceMnovaJson_IDnone(param, dataInput) {
		if (!dataInput.origin) {
			console.error("No origin data in dataInput", dataInput);
			this.data = {};
			// process.exit(1);
		}
		this.origin = dataInput.origin;
		this.conversionParameters = param;

		if (this.name == "NMRspectrumObject") {
			// Specify here the version number of the specific object (needed to allow version update)
			this.versionData = 1;
			if (!dataInput.jsonSpectrum) {
				console.error("No jsonSpectrum in dataInput", dataInput);
				this.data = {};
				return;
			}
			const jsonSpectrum = dataInput.jsonSpectrum;
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

			if (typeof allSpectraObjectsExtracted === "undefined") {
				console.error("allSpectraObjectsExtracted", allSpectraObjectsExtracted);
				console.error("fileNameSpectrum", fileNameSpectrum);
			}

			if (this.verbose > 1) {
				var total = 0;
				for (var i = 0; i < allSpectraObjectsExtracted.length; i++) {
					total += allSpectraObjectsExtracted[i].length;
					if (this.verbose > 1)
						console.log(
							">>>>>>>>> ",
							" spectrum set ",
							i + 1,
							":",
							allSpectraObjectsExtracted[i].length,
							"spectra."
						);
				}
				if (this.verbose > 1)
					console.log(
						">>>>>>>>>>>>>>>>>>>>>>>>>> ",
						" total :",
						total,
						"spectra."
					);
			}

			var input = extractSpectrumData(allSpectraObjectsExtracted[0][0], "data");
			if (param) {
				if (param.filterSpectra) {
					if (param.filterSpectra == "onlyFirst") {
						input = extractSpectrumData(
							allSpectraObjectsExtracted[0][0],
							"data"
						);
					}
					if (param.filterSpectra == "firstFirstLastOthers") {
						var index = 0;
						if (param.filterSpectraIndex) {
							index = param.filterSpectraIndex;
						}
						if (index == 0) {
							// first of first spectrum (experimental spectrum)
							input = extractSpectrumData(
								allSpectraObjectsExtracted[0][0],
								"data"
							);
						} else {
							// last (simulation) of other (non first)

							const redindex = index - 1;
							if (this.verbose > 1) console.log(" redindex :", redindex);
							if (redindex >= allSpectraObjectsExtracted.length) {
								this.data = {};
								return; // normal when not knowning until where go.
							}
							const lastItem = allSpectraObjectsExtracted[redindex].length - 1;
							input = extractSpectrumData(
								allSpectraObjectsExtracted[redindex][lastItem],
								"data"
							);
						}
					}
					if (param.filterSpectra == "any") {
						var index = 0;
						var index2 = 0;
						if (param.filterSpectraIndex) {
							index = param.filterSpectraIndex;
						}
						if (param.filterSpectraIndex2) {
							index2 = param.filterSpectraIndex2;
						}
						input = extractSpectrumData(
							allSpectraObjectsExtracted[index][index2],
							"data"
						);
					}
				}
			}
			// get min and max of chemShift (the scale)
			const extremas_chemshift = input.reduce(
				(acc, item) => {
					const value = item["chemShift"];
					if (typeof value === "number" && !isNaN(value)) {
						if (value < acc.min) acc.min = value;
						if (value > acc.max) acc.max = value;
					}
					return acc;
				},
				{ min: Infinity, max: -Infinity }
			);
			// get spectrum
			const values = input.map((d) => d.value);

			// create final data object
			this.data = {
				values: values,
				firstPoint: extremas_chemshift.max,
				lastPoint: extremas_chemshift.min,
				requestArrayEncoding: "float64-hex", // flag to binary encode values
			};
		}
		if (this.name == "JgraphObject") {
			// Specify here the version number of the specific object (needed to allow version update)
			this.versionData = 1;
			/*if (!dataInput.jsonSpectrum) {
				console.error("No jsonSpectrum in dataInput", dataInput);
				this.data = {};
				return;
			}*/

			// create final data object

			const jsonSpectrum = dataInput.jsonSpectrum;
			const jsonMolecule = dataInput.jsonMolecule;
			const jsonDataInitial = dataInput.jsonDataInitial;

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
				console.error(
					"allObjectsExtractedMolecule",
					allObjectsExtractedMolecule
				);
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

			//if (fileResulstSF !== "") {
			//	const tmp11 = await readFile(fileResulstSF, "utf-8");
			//	const jsonDataInitial = JSON.parse(tmp11);
			if (jsonDataInitial && Object.keys(jsonDataInitial).length > 0) {
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

				obj.originScript = "assignments using ingestMoleculeObject";
				jGraphObjDataList.push(obj);
			}

			// this is not done or finished....
			if ("assignments" in allObjectsExtractedMolecule) {
				const obj = ingestSpectrumRegions(
					allObjectsExtractedMolecule,
					allSpectraObjectsExtracted[0][0].multiplets
				);

				obj.originScript = "assignments using ingestSpectrumRegions";
				jGraphObjDataList.push(obj);
			}

			this.data = {
				jGraphObjDataList: jGraphObjDataList,
				allObjectsExtractedMolecule: allObjectsExtractedMolecule,
				spectrumDataAllChopped: spectrumDataAllChopped,
				regionsData: regionsData,

				//requestArrayEncoding: "float64-hex", // flag to binary encode values
			};
		}
	}
}
