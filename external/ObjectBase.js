export class ObjectBase {
	constructor(param, input, name) {
		this.verbose = 0;
		this.name = name;
		if (param.demo) {
			this._handleLoadDemoData(param.demo);
		} else {
			if (param.creatorParam) {
				this._validateParam(param.creatorParam);
				this._loadImportedData(param, input);
			} else {
				this.data = input;
			}
		}
	}
	encodeArrayFieldWithRequestArrayEncoding(obj = this.data, encodeVersion = 1) {
		if (encodeVersion === 0) return obj;
		if (obj && typeof obj === "object" && obj.requestArrayEncoding) {
			// For every key, check if value is an array to encode
			for (const key in obj) {
				if (Array.isArray(obj[key])) {
					if (encodeVersion === 1) {
						obj[key] = this._binaryEncodeArrayV1(
							obj[key],
							obj.requestArrayEncoding
						);
					}
				}
			}
		}

		// Recurse on nested objects anyway
		for (const key in obj) {
			if (typeof obj[key] === "object" && obj[key] !== null) {
				this.encodeArrayFieldWithRequestArrayEncoding(obj[key]);
			}
		}

		return obj;
	}

	// If changes the binaryEncodeArrayV1 write a decodeArrayV1 for the new version and keep all decdeArray for compatibility
	_binaryEncodeArrayV1(array, encoding) {
		let typedArray;
		switch (encoding) {
			case "float64-hex":
				typedArray = new Float64Array(array);
				break;
			case "float32-hex":
				typedArray = new Float32Array(array);
				break;
			case "int32-hex":
				typedArray = new Int32Array(array);
				break;
			case "int16-hex":
				typedArray = new Int16Array(array);
				break;
			case "uint8-hex":
				typedArray = new Uint8Array(array);
				break;
			default:
				throw new Error("Unsupported encoding: " + encoding);
		}

		const byteArray = new Uint8Array(typedArray.buffer);
		const hex = [...byteArray]
			.map((b) => b.toString(16).padStart(2, "0"))
			.join("");

		return {
			compressionVersion: 1, // version 1
			encoding,
			length: array.length,
			data: hex,
		};

		// possible version 2 will need a decoder ...
		/*
		const byteArray = new Uint8Array(typedArray.buffer);

		// ✅ Compress the binary using deflate
		const compressed = pako.deflate(byteArray);

		// Encode to base64 (safer than hex, and smaller)
		const base64 = Buffer.from(compressed).toString("base64");
		return {
			compressionVersion: 2,
			encoding,
			length: array.length,
			data: base64,
			compression: "deflate", // new field check is here...
		};
		*/
	}

	decodeEncodedArrays(obj = this.data) {
		if (Array.isArray(obj)) {
			return obj.map(decodeEncodedArrays);
		} else if (obj && typeof obj === "object") {
			const keys = Object.keys(obj);
			if (
				keys.includes("encoding") &&
				keys.includes("data") &&
				keys.includes("length") &&
				keys.includes("compressionVersion")
			) {
				if (obj.compressionVersion === 1) {
					return this.decodeArrayV1(obj.data, obj.encoding, obj.length);
				}
			}
			for (const key in obj) {
				obj[key] = this.decodeEncodedArrays(obj[key]);
			}
		}
		return obj;
	}

	_decodeArrayV1(hexStr, encoding, length) {
		const bytes = new Uint8Array(
			hexStr.match(/.{1,2}/g).map((b) => parseInt(b, 16))
		);
		let typedArray;
		switch (encoding) {
			case "float64-hex":
				typedArray = new Float64Array(bytes.buffer);
				break;
			case "float32-hex":
				typedArray = new Float32Array(bytes.buffer);
				break;
			case "int32-hex":
				typedArray = new Int32Array(bytes.buffer);
				break;
			case "int16-hex":
				typedArray = new Int16Array(bytes.buffer);
				break;
			case "uint8-hex":
				typedArray = new Uint8Array(bytes.buffer);
				break;
			default:
				throw new Error("Unsupported encoding: " + encoding);
		}
		return Array.from(typedArray.slice(0, length));
	}

	_validateParam(param) {
		if (!param || typeof param !== "object") {
			throw new Error("param must be an object");
		}
		if (!param.editor) {
			throw new Error("param.editor missing");
		}
		if (!param.version) {
			throw new Error("param.version missing");
		}
		if (!param.source) {
			throw new Error("param.source missing");
		}
		if (!param.id) {
			throw new Error("param.id missing");
		}
	}

	_handleLoadDemoData(numberOfSpectra) {
		throw new Error("_handleLoadDemoData() must be implemented by subclass");
	}

	_buildImportFunctionName(param) {
		return (
			"import" +
			"_Editor" +
			param.editor +
			"_Version" +
			param.version +
			"_Source" +
			param.source +
			"_ID" +
			param.id
		);
	}

	_loadImportedData(param, input) {
		const importFunctionName = this._buildImportFunctionName(
			param.creatorParam
		);

		if (typeof this[importFunctionName] !== "function") {
			throw new Error(
				`Import function ${importFunctionName} does not exist on NMRspectrumObject`
			);
		}
		this.constructorImporterFunctionName = importFunctionName;
		this.constructorImporterParam = param;
		this[importFunctionName](param, input);
		if (this.verbose > 1) console.log(this.name + ".data:", this.data);
	}
}
