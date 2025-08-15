// AUTOMATIC IMPORT INSERTION WILL BE MADE HERE

import { ObjectBase } from "./ObjectBase.js";

export class NMRspectrumObject extends ObjectBase {
	constructor(param, input) {
		super(param, input, "NMRspectrumObject");
		// optionally override again
		this.verbose = 0;
	}

	_handleLoadDemoData() {
		this._loadDemoData();
	}

	_loadDemoData(
		spectralData = {
			pointNumber: 32768,
			larmor: 500,
			firstPoint: 11,
			lastPoint: -1.0,
			noiseLevel: 1000,
		},
		arrayLorentzian = {
			centers: [7.27, 5.0, 0.0],
			widthsInHz: [0.7, 0.7, 0.7],
			amplitudes: [100, 1000, 100],
		}
	) {
		const values = [];
		const mean = 0;

		for (let i = 0; i < spectralData.pointNumber; i++) {
			let u = 0,
				v = 0;
			while (u === 0) u = Math.random();
			while (v === 0) v = Math.random();
			const amplitude = Math.sqrt(-2.0 * Math.log(u));
			const realPart = amplitude * Math.cos(2.0 * Math.PI * v);
			//const complexPart = amplitude * Math.sin(2.0 * Math.PI * v);
			values.push(realPart * spectralData.noiseLevel + mean);
		}
		function lorentzian(arrayLorentzian, larmor, x, i) {
			const dx = x - arrayLorentzian.centers[i];
			const gamma = arrayLorentzian.widthsInHz[i] / spectralData.larmor;

			return (
				arrayLorentzian.amplitudes[i] /
				(Math.PI * gamma * (1 + (dx / gamma) ** 2))
			);
		}

		const increment =
			(spectralData.lastPoint - spectralData.firstPoint) /
			(spectralData.pointNumber - 1);
		for (let i = 0; i < arrayLorentzian.centers.length; i++) {
			for (let index = 0; index < values.length; index++) {
				const x = spectralData.firstPoint + increment * index;
				values[index] += lorentzian(arrayLorentzian, spectralData.larmor, x, i);
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
