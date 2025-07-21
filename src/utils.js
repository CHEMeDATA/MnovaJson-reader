export function filterOutPointsOutsideRegions(spectrumDataAll, regionsData) {
  // Helper function to check if chemShift is within any region
  function isWithinRegions(chemShift, regions) {
    return regions.some(region => chemShift <= region.start && chemShift >= region.end);
  }

  // Iterate through each spectrum in spectrumDataAll
  let filteredSpectrumData = spectrumDataAll.map(spectrumArray => {
    // For each inner array, filter the points based on chemShift
    return spectrumArray.filter(point => isWithinRegions(point.chemShift, regionsData.regions));
  });

  // Return the filtered spectrum data
  return filteredSpectrumData;
}

export function getRegionsWithSignal(
  chemShifts,
  minSpacePPMin = 0.2,
  marginPPMin = 0.02,
  level = 0.01, // default 1%
) {
  const minSpacePPM = Math.abs(minSpacePPMin);
  const marginPPM = Math.abs(marginPPMin);
  const maxY = d3.max(chemShifts, function (d) {
    return +d.value;
  });
  const minScale = d3.min(chemShifts, function (d) {
    return +d.chemShift;
  });
  const maxScale = d3.max(chemShifts, function (d) {
    return +d.chemShift;
  });

  // Determine the maximum value in the dataset

  // Step 1: Identify regions where y > 1% of maxY and merge close fragments
  var regions = [];
  var currentRegion = null;
  chemShifts.forEach(function (d, i) {
    if (d.value > level * maxY) {
      if (!currentRegion) {
        // Start a new region
        currentRegion = { start: d.chemShift, end: d.chemShift };
      } else {
        // Continue the current region
        currentRegion.end = d.chemShift;
      }
    } else {
      if (currentRegion) {
        // Finalize the current region and add margins
        currentRegion.start += marginPPM;
        if (currentRegion.start > maxScale) currentRegion.start = maxScale;
        currentRegion.end -= marginPPM;
        if (currentRegion.end < minScale) currentRegion.end = minScale;
        regions.push(currentRegion);
        currentRegion = null;
      }
    }
  });

  // If there's an unfinished region, add it
  if (currentRegion) {
    currentRegion.start += marginPPM;
    if (currentRegion.start > maxScale) currentRegion.start = maxScale;
    currentRegion.end -= marginPPM;
    if (currentRegion.end < minScale) currentRegion.end = minScale;
    regions.push(currentRegion);
  }

  let newRegions = [];
  let curRegion;
  regions.forEach(function (d, i) {
    if (i != 0) {
      if (curRegion.end < d.start + minSpacePPM) {
        // fuse
        curRegion.end = d.end;

        if (i + 1 == regions.length) {
          newRegions.push(curRegion);
        }
      } else {
        newRegions.push(curRegion);
        curRegion = d;
        if (i + 1 == regions.length) {
          newRegions.push(curRegion);
        }
      }
    } else {
      curRegion = d;
    }
  });

  var totalCoveredPPM = 0.0;
  newRegions.forEach(function (currentRegion, i) {
    totalCoveredPPM += Math.abs(currentRegion.start - currentRegion.end);
  });

  // Create an Object
  const obj = {
    totalCoveredPPM: totalCoveredPPM,
    regions: newRegions,
  };

  return obj;
}
