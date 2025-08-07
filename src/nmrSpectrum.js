import { GraphBase } from "./graphBase.js";
import { NmrAssignment } from "./nmrAssignement.js";

async function loadSpectrum(fileName) {
	try {
		const spectrumData = await d3.csv(fileName, (d) => ({
			chemShift: +d.x,
			value: +d.y,
		}));
		return spectrumData;
	} catch (error) {
		console.error("Error loading or processing data from :" + fileName, error);
	}
}

async function readDataFile(fileNameData) {
	try {
		// Ensure d3.csv properly loads the data
		const jGraphData = await d3.csv(fileNameData);
		console.log("Loaded data from " + fileNameData);
		if (!Array.isArray(jGraphData)) {
			throw new Error("Data loaded " + fileNameData + " is not an array.");
		} else {
			return jGraphData;
		}
	} catch (error) {
		console.error(
			"Error processing or visualizing the data for " + fileNameData + ":",
			error
		);
	}
}

export async function makeGraphic(
	jGraphObjDataList,
	allObjectsExtractedMolecule,
	parallelCoord,
	spectrumDataAllChopped,
	dataviz,
	regionsData,
	JmolAppletAr
) {
	const settings = initializeSettings({});
	var svg = createSVG(dataviz, settings);
	var spectrum = new NmrSpectrum(
		spectrumDataAllChopped,
		svg,
		settings,
		settings.smallScreen, // default true
		//{totalCoveredPPM: 7.0,regions: [{ start: 8.0, end: 1.0 }]},
		regionsData // default {}
	);

	const settings_with_spectrum_settings = spectrum.getSettings();

	var nmrAssignmentList = [];

	for (const jGraphObj2 of jGraphObjDataList) {
		console.log("OKOKOOOKOKO2 jGraphObj2", jGraphObj2);

		nmrAssignmentList.push(
			new NmrAssignment(
				jGraphObj2,
				svg,
				settings_with_spectrum_settings.smallScreen,
				settings_with_spectrum_settings,
				JmolAppletAr,
				nmrAssignmentList.length
			)
		);
	}

	// Register each class as a receiver for every other class based on data type compatibility
	const classes = [...nmrAssignmentList, spectrum];
	if (parallelCoord && Object.entries(parallelCoord).length !== 0) {
		classes.push(parallelCoord);
		console.log("AOKOKOO parallelCoord", parallelCoord);
	} else {
		console.log(" NO AOKOKOO parallelCoord", parallelCoord);
	}
	classes.forEach((sender) => {
		classes.forEach((receiver) => {
			if (sender !== receiver) {
				sender.getExportTypes().forEach((sendType) => {
					if (receiver.getImportTypes().includes(sendType)) {
						sender.registerReceiver(receiver, sendType);
					}
				});
			}
		});
	});

	spectrum.triggerSendAxis();

	nmrAssignmentList.forEach((nmrAssignment) => {
		nmrAssignment.build();
	});
}

export function initializeSettings(overrideSettings = {}) {
	// Default settings
	//const smallScreenDEL = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test( navigator.userAgent, );
	const smallScreen =
		typeof navigator !== "undefined" &&
		/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
			navigator.userAgent
		);
	let defaultSettings = {
		spectrum: {
			margin: smallScreen
				? { top: 50, right: 10, bottom: 30, left: 10 }
				: { top: 10, right: 30, bottom: 30, left: 60 },
			bodyWidth: 800,
			bodyHeight: smallScreen ? 1000 : 450,
			lineWidth: smallScreen ? 5 : 1.5,
			darkMode: false,
			smallScreen: smallScreen,
		},
	};

	// Merge default settings with overrides
	let settings = { ...defaultSettings, ...overrideSettings };

	// Calculate derived values
	settings.spectrum.widthOfThePlot =
		settings.spectrum.bodyWidth -
		settings.spectrum.margin.left -
		settings.spectrum.margin.right;
	settings.spectrum.height =
		settings.spectrum.bodyHeight -
		settings.spectrum.margin.top -
		settings.spectrum.margin.bottom;

	return settings;
}

export function createSVG(dataviz, settings) {
	return (
		d3
			.select("#" + dataviz)
			.append("svg")
			// 1. Set viewBox first — defines internal coordinate system
			.attr(
				"viewBox",
				`0 0 ${
					settings.spectrum.widthOfThePlot +
					settings.spectrum.margin.left +
					settings.spectrum.margin.right
				} ${
					settings.spectrum.height +
					settings.spectrum.margin.top +
					settings.spectrum.margin.bottom
				}`
			)
			.style("display", "block")
			.attr(
				"width",
				settings.spectrum.widthOfThePlot +
					settings.spectrum.margin.left +
					settings.spectrum.margin.right
			)
			.attr(
				"height",
				settings.spectrum.height +
					settings.spectrum.margin.top +
					settings.spectrum.margin.bottom
			)
			/*
			.attr("preserveAspectRatio", "xMinYMid meet") // adjust how viewBox scales
			.style("width", "100%")
			.style("height", "auto")
			*/
			//.style("border", "1px solid black") // Add a black border around the SVG
			//.style("background-color", "lightblue") // Set the background color
			.append("g")
			.attr(
				"transform",
				"translate(" +
					settings.spectrum.margin.left +
					"," +
					settings.spectrum.margin.top +
					")"
			)
	);
}
export class NmrSpectrum extends GraphBase {
	constructor(
		chemShiftsInput,
		svg,
		settingsInput,
		smallScreen = false,
		regionsData = {},
		name = "nameIsWiredInConstructor_NmrSpectrum1"
	) {
		// data for GraphBase which takes care of communication between classes
		super(name, {
			dataTypesSend: ["xAxisSpectrum"],
			dataTypesReceive: [
				"dataHighlighted",
				"dataUNHighlighted",
				"dataSelected",
			],
			logAllDataExchange: false, // Enable logging for this instance if true
		});

		if (!Array.isArray(chemShiftsInput)) {
			// for objects
			chemShiftsInput = [chemShiftsInput];
		}

		this.chemShiftsList = [];
		for (const chemShifts of chemShiftsInput) {
			const isObject = typeof chemShifts === "object" && chemShifts !== null;
			if (isObject && chemShifts.constructor.name == "NMRspectrumObject") {
				var chemShiftsCur = [];
				const firstPoint = chemShifts.data.firstPoint;
				const lastPoint = chemShifts.data.lastPoint;
				const numberPoints = chemShifts.data.values.length;
				const increment = (lastPoint - firstPoint) / (numberPoints - 1);
				const sw = increment * numberPoints;
				//var curRangeIndexList = [[0, chemShifts.data.value.length]];
				var curRangeList = [
					{ start: chemShifts.data.firstPoint, end: chemShifts.data.lastPoint },
				];
				var inc = 0;
				if (
					typeof regionsData === "object" &&
					regionsData !== null &&
					Array.isArray(regionsData.regions)
				) {
					console.log("totop regionsData >>", regionsData);
					curRangeList = regionsData.regions;
				}
				console.log("totop curRangeList >>", curRangeList);

				for (const curRange of curRangeList) {
					const first = Math.round(
						(numberPoints * (curRange.start - firstPoint)) / sw
					);
					const last = Math.round(
						(numberPoints * (curRange.end - firstPoint)) / sw
					);
					for (var i = first; i < last; i++) {
						const curX = firstPoint + i * increment;
						chemShiftsCur.push({
							chemShift: curX,
							value: chemShifts.data.values[inc],
						});
						inc++;
					}
				}
				this.chemShiftsList.push(chemShiftsCur);
			} else {
				if (Array.isArray(chemShifts)) {
					this.chemShiftsList.push(chemShifts);
					//	break;
				} else {
					this.chemShiftsList.push(chemShifts);
				}
			}
		}

		if (this.isArrayOfArrays(this.chemShiftsList)) {
			this.chemShiftsList = this.chemShiftsList;
			console.log("toto isArrayOfArrays", true);
		} else {
			this.chemShiftsList = [this.chemShiftsList];
			console.log("toto isArrayOfArrays", false);
		}
		console.log("toto chemShiftsList.length >>", this.chemShiftsList.length);
		console.log("toto chemShiftsList >>", this.chemShiftsList);
		this.fullSettings = this.initializeSettings(settingsInput);
		this.svg = svg;

		if (
			typeof regionsData === "object" &&
			regionsData !== null &&
			Object.keys(regionsData).length === 0
		) {
			this.regionsData = this.getRegionFullSpectrum();
		} else {
			this.regionsData = regionsData;
		}

		this.settings = this.fullSettings.spectrum;
		this.jgraphObj = {};

		this.gapSizePt = 6;
		this.idleTimeout = null; // for brush
		console.log("toto this.chemShiftsList[0] >>", this.chemShiftsList[0]);

		const maxY = d3.max(this.chemShiftsList[0], function (d) {
			return +d.value;
		});
		const minScale = d3.min(this.chemShiftsList[0], function (d) {
			return +d.chemShift;
		});
		const maxScale = d3.max(this.chemShiftsList[0], function (d) {
			return +d.chemShift;
		});

		this.scaleData = this.getScaleData();

		var x = d3
			.scaleLinear()
			.domain(this.scaleData.xDomain)
			.range(this.scaleData.xRange);

		// Add Y axis
		var y = d3.scaleLinear().domain([0, maxY]).range([this.settings.height, 0]);
		//yAxis = svg.append("g") .call(d3.axisLeft(y));

		// Add a clipPath: everything out of this area won't be drawn.
		var clip = this.svg
			.append("defs")
			.append("svg:clipPath")
			.attr("id", "clip")
			.append("svg:rect")
			.attr("width", this.settings.widthOfThePlot)
			.attr("height", this.settings.height)
			.attr("x", 0)
			.attr("y", 0);

		// Add brushing
		var brush = d3
			.brushX() // Add the brush feature using the d3.brush function
			.extent([
				[0, 0],
				[this.settings.widthOfThePlot, this.settings.height],
			]) // Initialize the brush area: start at 0,0 and finish at width,settings.height: it means I select the whole graph area
			.on("end", (event) => {
				this.updateChart(event); // `this` correctly refers to the class instance
			});

		// Create the line variable: where both the line and the brush take place
		var lineSpectrum = this.svg.append("g").attr("clip-path", "url(#clip)");

		// Add the spectrum
		// Assuming this.chemShiftsList is an array of arrays
		// Iterate over each spectrum in the list
		this.chemShiftsList.forEach((chemShiftAr, index) => {
			lineSpectrum
				.append("path")
				.datum(chemShiftAr) // Bind the data for the current spectrum
				.attr("class", `lineGA lineG-${index}`) // Add a unique class for each spectrum based on the index
				.attr("fill", "none")
				.attr("stroke", d3.schemeCategory10[index % 10]) // Use a color from the scheme based on the index    .attr('stroke-width', this.settings.lineWidth)
				.attr("stroke-width", 1)
				.attr(
					"d",
					d3
						.line()
						.x(function (d) {
							return x(d.chemShift);
						})
						.y(function (d) {
							return y(d.value); // Apply vertical shift based on index
						})
				);
		});

		// Add the brushing
		this.updateZigZag(this.regionsData, this.scaleData);
		lineSpectrum.append("g").attr("class", "brush").call(brush);
		console.log("calling_constructor");
		// Add Y axis2
		var xAxis = this.svg
			.append("g")
			.attr("transform", "translate(0," + this.settings.height + ")")
			.call(d3.axisBottom(x).tickValues(this.scaleData.tickValues));

		var x = d3
			.scaleLinear()
			.domain(this.scaleData.xDomain)
			.range(this.scaleData.xRange);

		var jgraphObj = {};
		jgraphObj.originalRegionsData = this.regionsData;
		jgraphObj.originalScaleData = this.scaleData;
		jgraphObj.totalWidth = this.scaleData.totalWidth; // Store the original domain for reset
		jgraphObj.originalXrange = this.scaleData.xRange.slice(); // Store the original domain for reset
		jgraphObj.originalXDomain = this.scaleData.xDomain.slice(); // Store the original domain for reset
		jgraphObj.originalTickValues = this.scaleData.tickValues.slice(); // Store the original tick values
		jgraphObj = {
			...jgraphObj, // Copy all existing properties of jgraphObj
			x: x,
			y: y,
			lineSpectrum: lineSpectrum,
			brush: brush,
			xAxis: xAxis,
			spectrumData: this.chemShiftsList[0],
			regionsData: this.regionsData,
			gapSizePt: this.gapSizePt,
		};
		this.jgraphObj = jgraphObj;
	}

	highlightSpectrum(index, higlightOrUnHighlight, col = "green") {
		console.log(
			"Highlighted cont2   :",
			index,
			" /",
			this.chemShiftsList.length
		);
		console.log(
			"Highlighted cont2+1 :",
			index + 1,
			" /",
			this.chemShiftsList.length
		);
		const spectrumLine = this.jgraphObj.lineSpectrum.select(
			`.lineG-${index + 1}`
		);
		if (spectrumLine) {
			// reset
			//this.jgraphObj.lineSpectrum.selectAll(`.lineGA`).attr('stroke-width', 1);

			//const originalStrokewidth = spectrumLine.attr('stroke-width');

			if (higlightOrUnHighlight) {
				this.jgraphObj.lineSpectrum.selectAll(`.lineGA`).attr("opacity", 0.0);
				this.jgraphObj.lineSpectrum
					.selectAll(`.lineGA`)
					.attr("stroke-dasharray", null);

				spectrumLine.attr("stroke", "red");
				spectrumLine.attr("stroke-width", "2px");
				spectrumLine.attr("opacity", 1.0);
				spectrumLine.attr("stroke-dasharray", "4,4");
				// in case problem goes back to original after a while
				if (false)
					setTimeout(() => {
						spectrumLine.attr("stroke", col);
						spectrumLine.attr("stroke-width", "1px");
					}, 10000); // in ms
			} else {
				this.jgraphObj.lineSpectrum.selectAll(`.lineGA`).attr("opacity", 1.0);
				spectrumLine.attr("stroke", col);
				spectrumLine.attr("stroke-width", "1px");
			}

			// Make sure reference spectrum is quite visible.
			this.jgraphObj.lineSpectrum
				.select(`.lineG-${0}`)
				.attr("opacity", 1)
				.attr("stroke-width", 2)
				.attr("stroke", "blue");
		}
	}

	selectSpectrum(listSelected) {
		const defOpacity = 0;
		const selectedOpacity = 1;
		const noselectionOpacity = 1;
		if (listSelected.length == 0) {
			this.jgraphObj.lineSpectrum
				.selectAll(`.lineGA`)
				.attr("opacity", noselectionOpacity);
		} else {
			// non-selected, opacity defOpacity
			this.jgraphObj.lineSpectrum
				.selectAll(`.lineGA`)
				.attr("opacity", defOpacity);

			// Set the selected lines to opacity 0 (invisible)
			listSelected.forEach((indexObj) => {
				const index = indexObj.index;
				this.jgraphObj.lineSpectrum
					.select(`.lineG-${index + 1}`)
					.attr("opacity", selectedOpacity)
					.attr("stroke", indexObj.color);
				//spectrumLine.style('opacity', selectedOpacity);
			});
		}
		this.jgraphObj.lineSpectrum
			.select(`.lineG-${0}`)
			.attr("opacity", 1)
			.attr("stroke-width", 2)
			.attr("stroke", "blue");
	}

	dataHighlighted_UpdateFunction(data, sender) {
		// this is the method called when receiving data catenate the datatype (see dataTypesReceive)
		const index = data.content.index;
		const color = data.content.color;
		this.highlightSpectrum(index, true, color);

		var inContent = null;
		inContent = { reception: "highlightOK" };
		return inContent;
	}

	dataUNHighlighted_UpdateFunction(data, sender) {
		// this is the method called when receiving data catenate the datatype (see dataTypesReceive)
		const index = data.content.index;
		const color = data.content.color;
		this.highlightSpectrum(index, false, color);

		var inContent = null;
		inContent = { reception: "highlightOK" };
		return inContent;
	}

	dataSelected_UpdateFunction(data, sender) {
		// this is the method called when receiving data catenate the datatype (see dataTypesReceive)

		this.selectSpectrum(data.content);

		var inContent = null;
		inContent = { reception: "dataSelectedOK" };
		return inContent;
	}

	isArrayOfArrays(input) {
		if (Array.isArray(input) && input.length > 0) {
			return Array.isArray(input[0]);
		}
		return false;
	}

	getRegionFullSpectrum() {
		let minScale = Infinity;
		let maxScale = -Infinity;

		for (const d of this.chemShiftsList[0]) {
			const val = +d.chemShift; // ensure numeric
			if (val < minScale) minScale = val;
			if (val > maxScale) maxScale = val;
		}
		const regions = [{ start: maxScale, end: minScale }];

		var totalCoveredPPM = 0.0;
		regions.forEach(function (currentRegion, i) {
			totalCoveredPPM += Math.abs(currentRegion.start - currentRegion.end);
		});

		return {
			totalCoveredPPM,
			regions,
		};
	}

	getSettings() {
		return this.fullSettings;
	}
	initializeSettings(overrideSettings = {}) {
		// Default settings
		/*let defaultSettings = {
      spectrum: {
        lineWidth: smallScreen ? 5 : 1.5,
      }
    };*/

		// Merge default settings with overrides
		//let settings = { ...defaultSettings, ...overrideSettings };
		let settings = overrideSettings;

		// Calculate derived values

		return settings;
	}
	getScaleDataShuldSetFormatTicksNOtDoingIt() {
		const gapSizePt = this.gapSizePt;
		let tickValues = [];
		let xDomain = [];
		let xRange = [];
		let totalWidthForSpectrum = this.settings.widthOfThePlot;
		totalWidthForSpectrum =
			this.settings.widthOfThePlot -
			gapSizePt * (this.regionsData.regions.length - 1);
		let currentX = 0;
		const numberTotalTicks = (10.0 / 700.0) * this.settings.widthOfThePlot;

		const totalCoveredPPM = this.regionsData.totalCoveredPPM;

		this.regionsData.regions.forEach(function (region, i) {
			const curWidth = Math.abs(region.start - region.end);
			const regionWidth = totalWidthForSpectrum * (curWidth / totalCoveredPPM); // Calculate width per region
			const numTicksForThisRegion = Math.round(
				numberTotalTicks * (curWidth / totalCoveredPPM)
			); // Calculate number of ticks per region

			// Update domain and range
			xDomain.push(region.start, region.end);
			xRange.push(currentX, currentX + regionWidth);
			currentX += regionWidth + gapSizePt;

			// Create the scale and generate ticks
			const regionScale = d3.scaleLinear().domain([region.start, region.end]);

			const regionTicks = regionScale.ticks(numTicksForThisRegion);

			// Format ticks
			const formattedRegionTicks = regionTicks.map(d3.format(".1f"));

			// Concatenate formatted ticks to the tickValues array
			tickValues = tickValues.concat(formattedRegionTicks);
		});

		return {
			tickValues: tickValues,
			xDomain: xDomain,
			xRange: xRange,
			totalWidth: totalWidthForSpectrum,
		};
	}

	getScaleData() {
		const gapSizePt = this.gapSizePt;
		// Step 2: Create the X axis scale with gaps
		var tickValues = [];
		var xDomain = [];
		var xRange = [];
		var totalWidthForSpectrum = this.settings.widthOfThePlot;
		totalWidthForSpectrum =
			this.settings.widthOfThePlot -
			gapSizePt * (this.regionsData.regions.length - 1);
		var currentX = 0;
		const numberTotalTicks = (10.0 / 700.0) * this.settings.widthOfThePlot;

		const totalCoveredPPM = this.regionsData.totalCoveredPPM;
		this.regionsData.regions.forEach(function (region, i) {
			const curWidth = Math.abs(region.start - region.end);
			var regionWidth = totalWidthForSpectrum * (curWidth / totalCoveredPPM); // Calculate width per region
			var numTicksForThisRegion = Math.round(
				numberTotalTicks * (curWidth / totalCoveredPPM)
			); // Calculate width per region
			xDomain.push(region.start, region.end);
			xRange.push(currentX, currentX + regionWidth);
			currentX += regionWidth + gapSizePt;
			var regionTicks = d3
				.scaleLinear()
				.domain([region.start, region.end])
				.ticks(numTicksForThisRegion);
			tickValues = tickValues.concat(regionTicks);
		});

		const objRet = {
			tickValues: tickValues,
			xDomain: xDomain,
			xRange: xRange,
			totalWidth: totalWidthForSpectrum,
		};
		return objRet;
	}

	updateZigZag(regionsData, scaleData) {
		// Remove any existing zigzag paths before adding new ones
		this.svg.selectAll(".zigzag-path").remove();
		const settings = this.settings;
		var svg = this.svg;
		regionsData.regions.forEach(function (region, i) {
			if (i > 0) {
				const currentX1 = scaleData.xRange[i * 2 - 1];
				const currentX2 = scaleData.xRange[i * 2];

				var zigzagHeight = 4; // Height of each zigzag segment
				var zigzagWidth = 3; // Width of each zigzag segment
				var numZigs = 3; // Number of zigzag segments
				var zigzagPath1 = `M${currentX1},${
					settings.height + (numZigs * zigzagHeight) / 2
				}`;
				var zigzagPath2 = `M${currentX2},${
					settings.height + (numZigs * zigzagHeight) / 2
				}`;
				var zigzagPath3 = `M${currentX1 * 0.5 + currentX2 * 0.5},${
					settings.height + (numZigs * zigzagHeight) / 2
				}`;
				for (var j = 0; j < numZigs; j++) {
					var xOffset = j % 2 === 0 ? zigzagWidth : -zigzagWidth;
					var yOffset = -zigzagHeight;
					zigzagPath1 += ` l${xOffset},${yOffset}`;
					zigzagPath2 += ` l${xOffset},${yOffset}`;
					zigzagPath3 += ` l${xOffset},${yOffset}`;
				}

				// Append the zigzag paths to the SVG

				svg
					.append("path")
					.transition()
					.duration(20)
					.delay(310)
					.attr("d", zigzagPath3)
					.attr("class", "zigzag-path") // Assign a class for easy removal
					.attr("stroke", "white")
					.attr("stroke-width", settings.gapSizePt)
					.attr("fill", "none");

				svg
					.append("path")
					.transition()
					.duration(20)
					.delay(310)
					.attr("d", zigzagPath1)
					.attr("class", "zigzag-path") // Assign a class for easy removal
					.attr("stroke", "black")
					.attr("stroke-width", 1)
					.attr("fill", "none");

				svg
					.append("path")
					.transition()
					.duration(20)
					.delay(310)
					.attr("d", zigzagPath2)
					.attr("class", "zigzag-path") // Assign a class for easy removal
					.attr("stroke", "black")
					.attr("stroke-width", 1)
					.attr("fill", "none");
			}
		});
	}

	updateChart(event) {
		// console.time('UpdataChart Event Selection Time6');
		// console.time('UpdataChart Event Selection Time7');
		const extent = event.selection;
		if (!extent) {
			if (!this.idleTimeout)
				return (this.idleTimeout = setTimeout(this.idled.bind(this), 350));

			const minScale = d3.min(this.chemShiftsList[0], function (d) {
				return +d.chemShift;
			});
			const maxScale = d3.max(this.chemShiftsList[0], function (d) {
				return +d.chemShift;
			});
			// Reset the X domain to the original domain for the custom X-axis

			const selectedDomain = [maxScale, minScale];

			// Find the corresponding segment of the custom domain

			this.regionsData = this.getNewRegions(selectedDomain);
			this.scaleData = this.getScaleData();
			this.updateZigZag(this.regionsData, this.scaleData);
			this.jgraphObj.x
				.domain(this.scaleData.xDomain)
				.range(this.scaleData.xRange);
			// Restore the original tick values

			// Update the X axis with the new ticks
			this.jgraphObj.xAxis
				.transition()
				.duration(1000)
				//.call(d3.axisBottom(jgraphObj.x).tickValues(newTickValues));
				.call(
					d3.axisBottom(this.jgraphObj.x).tickValues(this.scaleData.tickValues)
				);

			//  this.regionsData = this.jgraphObj.originalRegionsData;
			// this.scaleData = this.getScaleData(this.regionsData, this.jgraphObj.gapSizePt);

			//this.updateZigZag(this.scaleData, this.scaleData);
			this.updateZigZag(
				this.jgraphObj.originalRegionsData,
				this.jgraphObj.originalScaleData
			);
		} else {
			// Update the X domain based on the brush selection
			const selectedDomain = [
				this.jgraphObj.x.invert(extent[0]),
				this.jgraphObj.x.invert(extent[1]),
			];

			// Find the corresponding segment of the custom domain
			this.regionsData = this.getNewRegions(selectedDomain);

			// this.scaleData = this.getScaleData(this.regionsData, this.jgraphObj.gapSizePt);
			this.scaleData = this.getScaleData();
			this.updateZigZag(this.regionsData, this.scaleData);

			this.jgraphObj.x
				.domain(this.scaleData.xDomain)
				.range(this.scaleData.xRange);

			this.jgraphObj.lineSpectrum
				.select(".brush")
				.call(this.jgraphObj.brush.move, null); // Clear the brush

			// Update the X axis with the new ticks
			this.jgraphObj.xAxis
				.transition()
				.duration(1000)
				.call(
					d3.axisBottom(this.jgraphObj.x).tickValues(this.scaleData.tickValues)
				);
		}
		//console.timeEnd('UpdataChart Event Selection Time6');

		// Update the line path with a transition
		this.jgraphObj.lineSpectrum
			.selectAll(`.lineGA`)
			.transition()
			.duration(1000)
			.attr(
				"d",
				d3
					.line()
					.x((d) => {
						return this.jgraphObj.x(d.chemShift);
					})
					.y((d) => {
						return this.jgraphObj.y(d.value);
					})
			);

		//console.timeEnd('UpdataChart Event Selection Time7');

		this.triggerSendAxis();

		return;
	}

	getNewRegions(selectedDomain) {
		var newDomain = [];
		var from = 0;
		var to = 0;

		var totalCoveredPPM = 0.0;

		this.jgraphObj.regionsData.regions.forEach(function (d, i) {
			from = d.start;
			to = d.end;
			const c1 =
				(from >= selectedDomain[0] && from <= selectedDomain[1]) ||
				(from <= selectedDomain[0] && from >= selectedDomain[1]);
			const c2 =
				(to >= selectedDomain[0] && to <= selectedDomain[1]) ||
				(to <= selectedDomain[0] && to >= selectedDomain[1]);
			const c111 =
				(from >= selectedDomain[0] && to <= selectedDomain[0]) ||
				(from <= selectedDomain[0] && to >= selectedDomain[0]);
			const c222 =
				(from >= selectedDomain[1] && to <= selectedDomain[1]) ||
				(from <= selectedDomain[1] && to >= selectedDomain[1]);
			if (c1 && c2) {
				const toAdd = {
					start: from,
					end: to,
				};
				newDomain.push(toAdd);
				totalCoveredPPM += Math.abs(toAdd.start - toAdd.end);
			} else {
				if (c111 && c222) {
					const toAdd = {
						start: selectedDomain[0],
						end: selectedDomain[1],
					};

					newDomain.push(toAdd);
					totalCoveredPPM += Math.abs(toAdd.start - toAdd.end);
				} else {
					if (c222) {
						// only
						const toAdd = {
							start: from,
							end: selectedDomain[1],
						};
						newDomain.push(toAdd);

						totalCoveredPPM += Math.abs(toAdd.start - toAdd.end);
					} else {
						if (c111) {
							// only
							const toAdd = {
								start: selectedDomain[0],
								end: to,
							};

							newDomain.push(toAdd);
							totalCoveredPPM += Math.abs(toAdd.start - toAdd.end);
						}
					}
				}
			}
		});

		const obj = {
			totalCoveredPPM: totalCoveredPPM,
			regions: newDomain,
		};
		return obj;
	}

	idled() {
		this.idleTimeout = null;
	}

	storeJgraphObj(jgraphObj) {
		this.jgraphObj = {
			...this.jgraphObj, // Retain existing fields
			...jgraphObj, // Update with new fields from jgraphObj
		};
	}

	triggerSendAxis() {
		const content = {
			x: this.jgraphObj.x,
		};

		this.triggerSend("xAxisSpectrum", content);
	}

	triggerSend(type, content) {
		if (this.dataTypesSend.includes(type)) {
			console.log(
				`${this.name}  tries to send ${type}. It is in the dataTypesSend array`
			);
		} else {
			console.error(
				`${this.name}  tries to send ${type}. It is not in the dataTypesSend array`
			);
			return;
		}

		this.sendData(type, content);
	}
}
