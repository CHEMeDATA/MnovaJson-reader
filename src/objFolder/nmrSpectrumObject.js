// AUTOMATIC IMPORT INSERTION WILL BE MADE HERE

import { ObjectBase } from "./ObjectBase.js";

export class NMRspectrumObject extends ObjectBase {
	constructor(param, input) {
		super(param, input, "NMRspectrumObject");
		// optionally override again
		this.verbose = 0;
	}

	_handleLoadDemoData(demoParam) {
		this._loadDemoData(demoParam);
	}

	_loadDemoData(demoParam = {}) {
		const spectralData = {
			pointNumber: 32768,
			larmor: 500,
			firstPoint: 11,
			lastPoint: -1.0,
			noiseLevel: 10,
			...demoParam.spectralData, // override defaults if present
		};

		const arrayLorentzian = {
			centers: [7.27],
			widthsInHz: [0.7],
			amplitudes: [1],
			...demoParam.arrayLorentzian, // override defaults if present
		};

		const values = [];
		const mean = 0;

		for (let i = 0; i < spectralData.pointNumber; i++) {
			let u = 0;
			while (u === 0) u = Math.random();
			const v = Math.random();
			const amplitude = Math.sqrt(-2.0 * Math.log(u));
			const realPart = amplitude * Math.cos(2.0 * Math.PI * v);
			//const complexPart = amplitude * Math.sin(2.0 * Math.PI * v);
			values.push(realPart * spectralData.noiseLevel + mean);
		}
		function lorentzian(arrayLorentzian, larmor, x, i) {
			const id_centers = i < arrayLorentzian.centers.length ? i : arrayLorentzian.centers.length - 1; // should be useless (should not loop beyond i)
			const id_amplitudes = i < arrayLorentzian.amplitudes.length ? i : arrayLorentzian.amplitudes.length -1; // may be exploited to avoid repeating if constant
			const id_widthsInHz = i < arrayLorentzian.widthsInHz.length ? i : arrayLorentzian.widthsInHz.length - 1; // will often be exploited to avoid repeating if constant
			const center = arrayLorentzian.centers[id_centers];
			const dx = x - center;
			const gamma = arrayLorentzian.widthsInHz[id_widthsInHz] / larmor;
			const amplitude = arrayLorentzian.amplitudes[id_amplitudes];
			return (
				amplitude /
				(Math.PI * gamma * (1 + (dx / gamma) ** 2))
			);
		}

		const increment =
			(spectralData.lastPoint - spectralData.firstPoint) /
			(spectralData.pointNumber - 1);
		for (let i = 0; i < arrayLorentzian.centers.length; i++) {
			for (let index = 0; index < values.length; index++) {
				const x = spectralData.firstPoint + increment * index;
				const larmor = spectralData.larmor;
				//values[index] += lorentzian(arrayLorentzian, larmor, x, i);
				// may replace this will fall to function 
				// values[index] += lorentzian(arrayLorentzian, larmor, x, i);
					//function lorentzian(arrayLorentzian, larmor, x, i) {
				const id_centers = i < arrayLorentzian.centers.length ? i : arrayLorentzian.centers.length - 1; // should be useless (should not loop beyond i)
				const id_amplitudes = i < arrayLorentzian.amplitudes.length ? i : arrayLorentzian.amplitudes.length -1; // may be exploited to avoid repeating if constant
				const id_widthsInHz = i < arrayLorentzian.widthsInHz.length ? i : arrayLorentzian.widthsInHz.length - 1; // will often be exploited to avoid repeating if constant
				const center = arrayLorentzian.centers[id_centers];
				const dx = x - center;
				const gamma = arrayLorentzian.widthsInHz[id_widthsInHz] / larmor;
				const amplitude = arrayLorentzian.amplitudes[id_amplitudes];
				values[index] += (
					amplitude /
					(Math.PI * gamma * (1 + (dx / gamma) ** 2))
				); // was returned
				//} closing function
			}
		}

		this.data = {
			values: values,
			firstPoint: spectralData.firstPoint,
			lastPoint: spectralData.lastPoint,
		};
	}

	// AUTOMATIC METHOD INSERTION WILL BE MADE HERE
}
