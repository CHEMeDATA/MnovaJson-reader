
// AUTOMATIC IMPORT INSERTION WILL BE MADE HERE

import { ObjectBase } from "./ObjectBase.js";

export class NMRspectrumObject extends ObjectBase {
	constructor(param, input) {
		super(param, input, "NMRspectrumObject");
		// optionally override again
		this.verbose = 0;
	}

	_handleLoadDemoData(numberOfSpectra) {
		this._loadDemoData(numberOfSpectra);
	}

	_loadDemoData(numberOfSpectra) {
		const values = Array.from({ length: 16000 }, (_, i) => {
			return (i + Math.random() * 2000.0 - 1000.0) / 1000.0;
		});
		this.data = {
			values: values,
			firstPoint: 11.0,
			lastPoint: -1.0,
		};
	}

// AUTOMATIC METHOD INSERTION WILL BE MADE HERE

}
