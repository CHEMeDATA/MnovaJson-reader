
export function updateBlockPosition(listOfJs, minSpaceBetweekCircles, minSpaceBetweekBlocks) {
  //listOfJs.sort((a, b) => Math.abs(a.Jvalue) > Math.abs(b.Jvalue) ? 1 : -1); 
  for (var index1 = 0; index1 < listOfJs.length; index1++ ) {
    var aValue = Math.abs(listOfJs[index1].Jvalue);
    var minSpace = 0;
    if (listOfJs[index1].isAssigned) {
      minSpace += minSpaceBetweekBlocks / 2.0;
    } else {
      minSpace += minSpaceBetweekCircles / 2.0;
    }
    var ref = minSpace;
    if (index1 > 0) {
      if (listOfJs[index1 - 1].isAssigned) {
        minSpace += minSpaceBetweekBlocks / 2.0;
      } else {
        minSpace += minSpaceBetweekCircles / 2.0;
      }
      ref = listOfJs[index1 - 1].JlevelAvoidContact + minSpace;
    }
    if (aValue < ref) {
      aValue = ref;
    }
    listOfJs[index1].JlevelAvoidContact = aValue;
  }
  return listOfJs;
} 