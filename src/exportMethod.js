//  export method // Should not minimize
	export_Editordjeanner_Version1_SourceMnovaJson_IDnone(param, dataInput) {
		if (param.requestedField) {
			if (param.requestedField === "first") {
				return {dummy_data : 1};
			}
			if (param.requestedField === "second") {
				return {dummy_data : 2};
			}
		}
	}
