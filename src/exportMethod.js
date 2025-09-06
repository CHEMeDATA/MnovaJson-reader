//  export method // Should not minimize
	export_Editordjeanner_Version1_SourceMnovaJson_IDnone(param, obj) {
	/* param:
	dataObj        : dataObj,
	objDataField   : dataObj.item.objDataField,
	creatorParam   : dataObj.creatorParam,
	targetObjType  : targetObjType,
	object         : dataObj.objSource
	objoutputFields
	*/
	const objDataField = param.objDataField;
	if (! param.objectObj) {
		console.error("No objectObj in param from export_Editordjeanner_Version1_SourceMnovaJson_IDnone")
		return {};
	}
	if (param.objectObj === "NMRspectrumObject" ) {
		var retObj = {};
		if (objDataField.passedList[0] === "field1") {

    if (!obj.values) { console.error(objDataField," no obj.values"); return ({});}
    if (obj.values.length <= 3 ) { console.error(objDataField, "min 3 values in obj.values"); return ({});}

    // manage possibly missing larmor frequency 
    const commentLarmor = obj.frequency ? "found larmor in obj" : "used default 500 MHz because frequency is missing in obj;"
    console.log(objDataField, commentLarmor);
    const spectrometer_frequency = obj?.frequency ?? 500.0//: 499.842374123801,

    // Manage nucleus
    const nucleus = obj?.nucleus ?? "1H";
   
    const si = obj.values.length;
    const lowest_frequency = spectrometer_frequency * obj.values[si - 1]//: -1644.45388739755,
    const spectral_width =  (spectrometer_frequency * (obj.values[0] - obj.values[si - 1]) * si) / (si - 1); // 8012.82051282049
    			// Step 1: build dimensional_parameters separately
    const dimensionalParameters = [
      {
        "$mnova_schema": "https://mestrelab.com/json-schemas/mnova/2023-07/01/nmr/essentials",
        "points": si,
        "spectrometer_frequency": spectrometer_frequency,
        "nucleus": "1H",
        "spectral_width": spectral_width,
        "lowest_frequency": lowest_frequency,
        "ph0": 0.0, //1.3502247575205066,
        "ph1": 0.0, //2.9646546646811123
      }
    ];
    const arrayOfPoints = []
    // Step 2: build the whole dataset using dimensionalParameters
    const mnovaDataset = {
      "$mnova_schema": "https://mestrelab.com/json-schemas/mnova/2023-07/01/nmr/dataset",
      "spectra": [
        {
          "$mnova_schema": "https://mestrelab.com/json-schemas/mnova/2023-07/01/nmr/spec",
          "data": {
            "$mnova_schema": "https://mestrelab.com/json-schemas/mnova/2023-07/01/nmr/base-spec",
            "dimensional_parameters": dimensionalParameters,
            "type": "spectrum",
            "data": {
              "1r": {
                "array": arrayOfPoints
              }
            }
          },
          "processing": {
            "compression": {
              "method": "None"
            },
            "ft": [
              {
                "invert": false,
                "quadrature": false,
                "realFT": false
              }
            ],
            "pc": [
              {
                "method": "Uncorrected"
              }
            ],
            "zf_lp": [
              {
                "zero_filling": 0
              }
            ]
          }
        }
      ]
    };

		return mnovaDataset;
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