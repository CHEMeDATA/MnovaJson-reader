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
			this.#validateParam(param);
			this.#loadImportedData(param, input);
		}
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
		const importFunctionName = this.#buildImportFunctionName(param);

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
			const values = input.map((d) => d.value);
			this.data = {
				values: values,
				firstPoint: extremas_chemshift.max,
				lastPoint: extremas_chemshift.min,
			};
			this.versionData = 1;
		}
	}
}
