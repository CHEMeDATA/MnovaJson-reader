//  export method // Should not minimize
	export_Editordjeanner_Version1_SourceMnovaJson_IDnone(param) {

		var retObj = {paramOfCall: param};
			if (param.requestedField === "first") {
				retObj.dummy_data = 1;
				return retObj;
			} else {
				retObj.dummy_data = 2;
				return retObj;			
			}
	}
