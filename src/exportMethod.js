//  export method // Should not minimize
	export_Editordjeanner_Version1_SourceMnovaJson_IDnone(param, dataInput) {

		if (!dataInput.origin) {
			console.error("No origin data in dataInput for import", dataInput);
			this.data = {};
			// process.exit(1);
		}
		this.origin = dataInput.origin;
		this.conversionParameters = param;

		if (param.requestedField) {
			if (param.requestedField === "first") {
				return {dummy_data : 1};
			}
			if (param.requestedField === "second") {
				return {dummy_data : 2};
			}
		}
	}
