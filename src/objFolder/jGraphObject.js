// AUTOMATIC IMPORT INSERTION WILL BE MADE HERE

import { ObjectBase } from "./ObjectBase.js";

export class JgraphObject extends ObjectBase {
	constructor(param, input) {
		super(param, input, "JgraphObject");
		// optionally override again
		this.verbose = 0;
	}

	_handleLoadDemoData(numberOfSpectra) {
		this._loadDemoData(numberOfSpectra);
	}

	_loadDemoData(numberOfSpectra) {
	}

// AUTOMATIC METHOD INSERTION WILL BE MADE HERE

}
