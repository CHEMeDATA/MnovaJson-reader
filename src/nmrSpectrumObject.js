export class NMRspectrumObject {
	constructor() {
		const values = Array.from({ length: 16000 }, (_, i) => {
			return (i + Math.random() * 2000.0 - 1000.0) / 1000.0;
		});
		this.data = {
			values: values,
			firstPoint: 11.0,
			lastPoint: -1.0,
		};
	}
}