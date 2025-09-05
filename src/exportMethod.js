//  export method // Should not minimize
	export_Editordjeanner_Version1_SourceMnovaJson_IDnone(param, obj) {
	/* param:
	dataObj : dataObj,
	objDataField: dataObj.item.objDataField,
	creatorParam : dataObj.creatorParam,
	targetObjType:targetObjType,
	outputFields:outputFields

	Main object:
	param.objoutputFields
	*/
	//var retObj = {paramArrivedIntoExportFunction : param};
	const objDataField = param.objDataField; 
	if (! param.objectObj) {
		console.error("No objectObj in param from export_Editordjeanner_Version1_SourceMnovaJson_IDnone")
		return {};
	}
	if (param.objectObj === "NMRspectrumObject" ) {
		var retObj = {};
		if (objDataField.passedList[0] === "field1") {
			retObj.dummy_data = 11;
			return retObj;
		} 
		if (objDataField.passedList[0] === "field2") {
			retObj.dummy_data = 22;
			return retObj;
		} 
		return retObj;
	}
	if (param.objectObj === "ZZZZZZZZ" ) {
		var retObj = {};
		if (objDataField.passedList[0] === "field1") {
			retObj.dummy_data = 33;
			return retObj;
		} 
		if (objDataField.passedList[0] === "field2") {
			retObj.dummy_data = 44;
			return retObj;
		} 
		return retObj;
	}
	console.error("objDataField : ", param.objectObj)
	console.error(`objDataField : ${param.objectObj} not implemented from export_Editordjeanner_Version1_SourceMnovaJson_IDnone`)
	return {};
	}