export class NMRspectrumObject {
	constructor(param, input) {
		this.verbose = 0;
		this.name = "NMRspectrumObject";
		this.#validateParam(param);

		if (param.demo) {
			this.#loadDemoData(param.demo);
		} else {
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

	#loadDemoData() {
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

		this[importFunctionName](input);
		if (this.verbose > 1) console.log(this.name + ".data:", this.data);
	}

	// Example import method // Should not minimized
	import_EditorDamien_Version1_SourceMnovaJson_IDnone(input) {
		const output = input;
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
		return;
	}
}
