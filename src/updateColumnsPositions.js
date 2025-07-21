function getSpread(spreadDelta, smallSpace) {
  // determine how to spead objects to avoid contacts
  // there muss be enough space for this function to work
  // this is obtained by setting smallSpace to a value below the width/number of items
  for (var i = 0; i < spreadDelta.length; i++) {
    const curDelta = spreadDelta[i];
    if (curDelta < smallSpace) {
      spreadDelta[i] = smallSpace;
      const spreadFull = smallSpace - curDelta;
      var spreadleft = spreadFull / 2.0;
      // try shift left (1 of 3)
      for (var j = i - 1; j >= 0; j -= 1) {
        const curExtraSpace = spreadDelta[j] - smallSpace;
        if (curExtraSpace > 0.0) {
          if (curExtraSpace > spreadleft) {
            spreadDelta[j] -= spreadleft;
            spreadleft = 0;
            break;
          } else {
            spreadDelta[j] -= curExtraSpace;
            spreadleft -= curExtraSpace;
          }
        } 
      }
      // work left over
      var spreadRight = spreadFull / 2.0 + spreadleft;
      // try shift right (2 of 3)
      for (j = i + 1; j < spreadDelta.length; j += 1) {
        const curExtraSpace = spreadDelta[j] - smallSpace;
        if (curExtraSpace > 0.0) {
          if (curExtraSpace > spreadRight) {
            spreadDelta[j] -= spreadRight;
            spreadRight = 0;break;
          } else {
            spreadDelta[j] -= curExtraSpace;
            spreadRight -= curExtraSpace;
          }
        } 
      }
      // work left over (rare but there may be a left over....)
      if (spreadRight > 0.0) {
        spreadleft = spreadRight;
        for (var j = i - 1; j >= 0; j -= 1) {
          const curExtraSpace = spreadDelta[j] - smallSpace;
          if (curExtraSpace > 0.0) {
            if (curExtraSpace > spreadleft) {
              spreadDelta[j] -= spreadleft;
              spreadleft = 0;
              break;
            } else {
              spreadDelta[j] -= curExtraSpace;
              spreadleft -= curExtraSpace;
            }
          }
        }
      }
      // Done 3/3
    }
  }
  return spreadDelta;
}

export function updateColumnsPositions(
  dataColumns,
  leftPosColumns,
  x,
  rightPosColumns,
  smallSpace,
) {
  const curChemShiftList = dataColumns.map(function (d) {
    return d.chemShift;
  });
  var spreadPositions = [];
  var spreadDelta = [];

  for (var i = 0; i < curChemShiftList.length; i++) {
    var returnValue = 0.0;
    const curChem = curChemShiftList[i];
    //const curChem = dataColumns[i].chemShift;

    if (leftPosColumns[i] < x(curChem)) {
      if (rightPosColumns[i] > x(curChem)) {
        returnValue = x(curChem);
      } else {
        returnValue = rightPosColumns[i];
      }
    } else {
      returnValue = leftPosColumns[i];
    }
    spreadPositions.push(returnValue);
    if (i > 0) {
      spreadDelta.push(returnValue - spreadPositions[i - 1]);
    } else {
      spreadDelta.push(returnValue);
    }
  }
  spreadDelta = getSpread(spreadDelta, smallSpace);
  for (i = 0; i < spreadDelta.length; i++) {
    //spreadPositions[i + 1] = spreadPositions[i] + spreadDelta[i + 1];
    if ( i == 0) {
      spreadPositions[i] = spreadDelta[i];
    } else {
      spreadPositions[i] = spreadPositions[i - 1] + spreadDelta[i];
    }
  }
  return spreadPositions;
}
