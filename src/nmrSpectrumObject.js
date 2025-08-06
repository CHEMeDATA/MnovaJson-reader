import { processMnovaJsonSpectrum } from "./mnovaJsonReader.js";
import { processMnovaJsonMolecule } from "./mnovaJsonReader.js";

import { extractSpectrumData } from "./mnovaJsonReader.js";
import { getRegionsWithSignal } from "./mnovaJsonReader.js";
import { filterOutPointsOutsideRegions } from "./mnovaJsonReader.js";
import { ingestMoleculeObject } from "./mnovaJsonReader.js";
import { ingestSpectrumRegions } from "./mnovaJsonReader.js";

export class NMRspectrumObject {
	constructor(param, input) {
		this.verbose = 2;
		this.name = "NMRspectrumObject";

		if (param.demo) {
			this.#loadDemoData(param.demo);
		} else {
			this.#validateParam(param.creatorParam);
			this.#loadImportedData(param, input);
		}
	}

	encodeArrayFieldWithRequestArrayEncoding(obj = this.data, encodeVersion = 1) {
		if (encodeVersion === 0) return obj;
		if (obj && typeof obj === "object" && obj.requestArrayEncoding) {
			// For every key, check if value is an array to encode
			for (const key in obj) {
				if (Array.isArray(obj[key])) {
					if (encodeVersion === 1) {
						obj[key] = this.#binaryEncodeArrayV1(
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

	// If changes the #binaryEncodeArrayV1 write a decodeArrayV1 for the new version and keep all decdeArray for compatibility
	#binaryEncodeArrayV1(array, encoding) {
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
					return this.#decodeArrayV1(obj.data, obj.encoding, obj.length);
				}
			}
			for (const key in obj) {
				obj[key] = this.decodeEncodedArrays(obj[key]);
			}
		}
		return obj;
	}

	#decodeArrayV1(hexStr, encoding, length) {
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

	#validateParam(param) {
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

	#loadDemoData(numberOfSpectra) {
		const values = Array.from({ length: 16000 }, (_, i) => {
			return (i + Math.random() * 2000.0 - 1000.0) / 1000.0;
		});
		this.data = {
			values: values,
			firstPoint: 11.0,
			lastPoint: -1.0,
		};
	}

	#buildImportFunctionName(param) {
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

	#loadImportedData(param, input) {
		const importFunctionName = this.#buildImportFunctionName(
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

	// Example import method // Should not minimized
	import_Editordjeanner_Version1_SourceMnovaJson_IDnone(param, dataInput) {
		if (!dataInput.origin) {
			console.error("No origin data in dataInput", dataInput);
			this.data = {};
			// process.exit(1);
		}
		this.origin = dataInput.origin;

		if (this.name == "NMRspectrumObject") {
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
			this.conversionParameters = param;
			// Specify here the version number of the specific object (needed to allow version update)
			this.versionData = 1;
		}
	}
}
