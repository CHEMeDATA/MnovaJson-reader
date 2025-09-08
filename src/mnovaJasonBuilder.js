export function buildFromNMRspectrumObject(objDataField, obj) {
	if (!obj.values) {
		console.error(objDataField, " no obj.values obj:", obj);
		return {};
	}
	if (obj.values.length <= 3) {
		console.error(objDataField, "min 3 values in obj.values obj.values: ", obj.values);
		return {};
	}

	// manage possibly missing larmor frequency
	const commentLarmor = obj.frequency
		? "found larmor in obj"
		: "used default 500 MHz because frequency is missing in obj;";
	console.log(objDataField, commentLarmor);
	const spectrometer_frequency = obj?.frequency ?? 500.0;

	// Manage nucleus
	const nucleus = obj?.nucleus ?? "1H";

	const si = obj.values.length;
	const lowest_frequency = spectrometer_frequency * obj.lastPoint;
	const spectral_width =
		(spectrometer_frequency * (obj.firstPoint - obj.lastPoint) * si) / (si - 1);

	const dimensionalParameters = [
		{
			$mnova_schema:
				"https://mestrelab.com/json-schemas/mnova/2023-07/01/nmr/essentials",
			points: si,
			spectrometer_frequency: spectrometer_frequency,
			nucleus: nucleus,
			spectral_width: spectral_width,
			lowest_frequency: lowest_frequency,
			ph0: 0.0,
			ph1: 0.0,
		},
	];
	const arrayOfPoints = obj.values;

	const oneSpectrum = {
		$mnova_schema:
			"https://mestrelab.com/json-schemas/mnova/2023-07/01/nmr/spec",
		data: {
			$mnova_schema:
				"https://mestrelab.com/json-schemas/mnova/2023-07/01/nmr/base-spec",
			dimensional_parameters: dimensionalParameters,
			type: "spectrum",
			data: {
				"1r": {
					array: arrayOfPoints,
				},
			},
		},
		processing: {
			compression: {
				method: "None",
			},
			ft: [
				{
					invert: false,
					quadrature: false,
					realFT: false,
				},
			],
			pc: [
				{
					method: "Uncorrected",
				},
			],
			zf_lp: [
				{
					zero_filling: 0,
				},
			],
		},
	};
	return oneSpectrum;
}
