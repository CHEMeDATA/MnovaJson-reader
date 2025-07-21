export function jmolUnselectAll(JmolAppletAr) {
  Jmol.script(JmolAppletAr, 'select hydrogen; color white');
  Jmol.script(JmolAppletAr, 'select carbon; color gray');
}

export function jmolSelectAtom(JmolAppletAr,number, col) {
  Jmol.script(
    JmolAppletAr,
    'select atomno = ' + number + ';color [' + col + '];spacefill 80',
  );
}

export function jmolSelectPair(JmolAppletAr,a1, a2, col) {
  Jmol.script(
    JmolAppletAr,
    'select atomno = ' + a1 + ';color [' + col + '];spacefill 80',
  );
  Jmol.script(
    JmolAppletAr,
    'select atomno = ' + a2 + ';color [' + col + '];spacefill 80',
  );
}

export function jmolGetNBbonds(JmolAppletAr,at1, at2) {
  // the two functions are ugly copy/paste plus editing....

  var at1to = -1;
  var at2to = -1;

  var bondInfo = Jmol.getPropertyAsArray(JmolAppletAr, 'bondInfo');
  var atomInfo = Jmol.getPropertyAsArray(JmolAppletAr, 'atomInfo');

  /*
https://chemapps.stolaf.edu/jmol/docs/#getproperty

https://chemapps.stolaf.edu/jmol/docs/misc/bondInfo.txt

https://chemapps.stolaf.edu/jmol/docs/misc/atomInfo.txt
atomInfo[0].bondCount=1
atomInfo[0].atomno=1
atomInfo[0].elemno=1
atomInfo[0].z=0
atomInfo[0].y=-0.8425599
atomInfo[0].x=1.0406722
atomInfo[0].partialCharge=0.1744213
atomInfo[0].sym="H"
atomInfo[0].colix=-32767
atomInfo[0].info="H 1/1 #1"
atomInfo[0]._ipt=0
atomInfo[0].formalCharge=0
*/

  for (var i = 0; i < bondInfo.length; i++) {
    const atom1 = bondInfo[i].atom1.atomno;
    const atom2 = bondInfo[i].atom2.atomno;
    if (atom1 == at1) at1to = atom2;
    if (atom1 == at2) at2to = atom2;
    if (atom2 == at1) at1to = atom1;
    if (atom2 == at2) at2to = atom1;
  }
  var returnedNumberBonds = -1;
  if (at1to > -1 && at2to > -1) {
    if (at1 == at2to && at2 == at1to) {
      // is a 1J
      returnedNumberBonds = 1;
    } else {
      if (at1to == at2to) {
        // is a 2J
        returnedNumberBonds = 2;
      } else {
        var tmps = at1to;
        var tmpl = at2to;
        if (tmps > tmpl) {
          const tmpz = tmps;
          tmps = tmpl;
          tmpl = tmpz;
        }
        var middleAtomFro4J = -1;
        for (var i = 0; i < bondInfo.length; i++) {
          var atomsi = bondInfo[i].atom1.atomno;
          var atomli = bondInfo[i].atom2.atomno;
          if (atomsi > atomli) {
            const tmpz = atomsi;
            atomsi = atomli;
            atomli = tmpz;
          }
          if (tmps == atomsi && tmpl == atomli) {
            // is a 3J
            returnedNumberBonds = 3;
            break;
          }
          for (var j = 0; j < bondInfo.length; j++) {
            if (
              bondInfo[i].atom1.atomno == at1to &&
              bondInfo[j].atom1.atomno == at2to &&
              bondInfo[i].atom2.atomno == bondInfo[j].atom2.atomno
            )
              middleAtomFro4J = bondInfo[i].atom2.atomno;
            if (
              bondInfo[i].atom2.atomno == at1to &&
              bondInfo[j].atom1.atomno == at2to &&
              bondInfo[i].atom1.atomno == bondInfo[j].atom2.atomno
            )
              middleAtomFro4J = bondInfo[i].atom1.atomno;
            if (
              bondInfo[i].atom1.atomno == at1to &&
              bondInfo[j].atom2.atomno == at2to &&
              bondInfo[i].atom2.atomno == bondInfo[j].atom1.atomno
            )
              middleAtomFro4J = bondInfo[i].atom2.atomno;
            if (
              bondInfo[i].atom2.atomno == at1to &&
              bondInfo[j].atom2.atomno == at2to &&
              bondInfo[i].atom1.atomno == bondInfo[j].atom1.atomno
            )
              middleAtomFro4J = bondInfo[i].atom1.atomno;
          }
          if (middleAtomFro4J > -1) {
            // is a 4J
            returnedNumberBonds = 4;
            // here don't break in case a 4J is replaced with a 3J such as in cyclopropane...
          }
        }
      }
    }
  }
  return returnedNumberBonds;
}
export function jmolGetInfo(JmolAppletAr, at1, at2, lineText) {
  var at1to = -1;
  var at2to = -1;

  var bondInfo = Jmol.getPropertyAsArray(JmolAppletAr, 'bondInfo');
  var atomInfo = Jmol.getPropertyAsArray(JmolAppletAr, 'atomInfo');

  /*
https://chemapps.stolaf.edu/jmol/docs/#getproperty

https://chemapps.stolaf.edu/jmol/docs/misc/bondInfo.txt

https://chemapps.stolaf.edu/jmol/docs/misc/atomInfo.txt
atomInfo[0].bondCount=1
atomInfo[0].atomno=1
atomInfo[0].elemno=1
atomInfo[0].z=0
atomInfo[0].y=-0.8425599
atomInfo[0].x=1.0406722
atomInfo[0].partialCharge=0.1744213
atomInfo[0].sym="H"
atomInfo[0].colix=-32767
atomInfo[0].info="H 1/1 #1"
atomInfo[0]._ipt=0
atomInfo[0].formalCharge=0
*/

  for (var i = 0; i < bondInfo.length; i++) {
    const atom1 = bondInfo[i].atom1.atomno;
    const atom2 = bondInfo[i].atom2.atomno;
    if (atom1 == at1) at1to = atom2;
    if (atom1 == at2) at2to = atom2;
    if (atom2 == at1) at1to = atom1;
    if (atom2 == at2) at2to = atom1;
  }
  const defaultText = 'More than 4 bonds apart!';
  var textToDisplay = defaultText;
  if (at1to > -1 && at2to > -1) {
    // Is this 2J, 3J, 4J ?
    // Important note: A pair may be both 3J and 4J (think of cyclopropane)
    if (at1 == at2to && at2 == at1to) {
      // is a 1J
      // var distance = Jmol.evaluateVar(JmolAppletA, "distance(@" + at1 + ", @" + at2 + ")")
      // console.log("2J, angle H-X-H : " + distance.toFixed(2));
      textToDisplay = '1' + lineText;
    } else {
      if (at1to == at2to) {
        // is a 2J
        const elementNumber = atomInfo[at1to - 1].elemno;
        const numberOfBonds = atomInfo[at1to - 1].bondCount;
        // const partialCharge = atomInfo[at1to - 1].partialCharge;
        var theta = Jmol.evaluateVar(
          JmolAppletAr,
          'angle(@' + at1 + ', @' + at1to + ', @' + at2 + ')',
        );
        textToDisplay =
          '<sup>2</sup>' + lineText + ' angle H-X-H : ' + theta.toFixed(2);
        if (elementNumber == 6 && numberOfBonds == 4) {
          // is sp3
          textToDisplay += ' sp3 carbon';
        }
        if (elementNumber == 6 && numberOfBonds == 3) {
          // is sp2
          textToDisplay += ' sp2 carbon';
        }
        if (elementNumber == 6 && numberOfBonds == 2) {
          // is sp1
          textToDisplay += ' sp1 carbon';
        }
      } else {
        var tmps = at1to;
        var tmpl = at2to;
        if (tmps > tmpl) {
          const tmpz = tmps;
          tmps = tmpl;
          tmpl = tmpz;
        }
        var middleAtomFro4J = -1;
        for (var i = 0; i < bondInfo.length; i++) {
          var atomsi = bondInfo[i].atom1.atomno;
          var atomli = bondInfo[i].atom2.atomno;
          if (atomsi > atomli) {
            const tmpz = atomsi;
            atomsi = atomli;
            atomli = tmpz;
          }
          if (tmps == atomsi && tmpl == atomli) {
            // is a 3J
            const elementNumber1 = atomInfo[at1to - 1].elemno;
            const numberOfBonds1 = atomInfo[at1to - 1].bondCount;
            const elementNumber2 = atomInfo[at2to - 1].elemno;
            const numberOfBonds2 = atomInfo[at2to - 1].bondCount;
            var theta = Jmol.evaluateVar(
              JmolAppletAr,
              'angle(@' +
                at1 +
                ', @' +
                at1to +
                ', @' +
                at2to +
                ', @' +
                at2 +
                ')',
            );
            const tmp = theta.toFixed(2);
            textToDisplay =
              '<sup>3</sup>' + lineText + ' dihedral angle H-X-X-H : ' + tmp;
            if (
              elementNumber1 == 6 &&
              numberOfBonds1 == 4 &&
              elementNumber2 == 6 &&
              numberOfBonds2 == 4
            ) {
              textToDisplay += ' on C-C bond';
            }
            if (
              elementNumber1 == 6 &&
              numberOfBonds1 == 2 &&
              elementNumber2 == 6 &&
              numberOfBonds2 == 2
            ) {
              textToDisplay += ' on C=C bond';
            }
            break;
          }
          for (var j = 0; j < bondInfo.length; j++) {
            if (
              bondInfo[i].atom1.atomno == at1to &&
              bondInfo[j].atom1.atomno == at2to &&
              bondInfo[i].atom2.atomno == bondInfo[j].atom2.atomno
            )
              middleAtomFro4J = bondInfo[i].atom2.atomno;
            if (
              bondInfo[i].atom2.atomno == at1to &&
              bondInfo[j].atom1.atomno == at2to &&
              bondInfo[i].atom1.atomno == bondInfo[j].atom2.atomno
            )
              middleAtomFro4J = bondInfo[i].atom1.atomno;
            if (
              bondInfo[i].atom1.atomno == at1to &&
              bondInfo[j].atom2.atomno == at2to &&
              bondInfo[i].atom2.atomno == bondInfo[j].atom1.atomno
            )
              middleAtomFro4J = bondInfo[i].atom2.atomno;
            if (
              bondInfo[i].atom2.atomno == at1to &&
              bondInfo[j].atom2.atomno == at2to &&
              bondInfo[i].atom1.atomno == bondInfo[j].atom1.atomno
            )
              middleAtomFro4J = bondInfo[i].atom1.atomno;
          }
          if (middleAtomFro4J > -1) {
            // is a 4J
            textToDisplay =
              '<sup>4</sup>' +
              lineText +
              ' via (@' +
              at1 +
              ', @' +
              at1to +
              ', @' +
              middleAtomFro4J +
              ', @' +
              at2to +
              ', @' +
              at2 +
              ')';
            // here don't break in case a 4J is replaced with a 3J such as in cyclopropane...
          }
        }
      }
    }
  }
  return textToDisplay;
}
