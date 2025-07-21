/*jshint esversion: 6 */
import { getJisOK } from './getJisOK.js';
import { getJgraphColor } from './getJgraphColor.js';
import { jmolGetInfo } from './jmolInterface.js';
import { jmolUnselectAll } from './jmolInterface.js';
import { jmolSelectPair } from './jmolInterface.js';
import { jmolSelectAtom } from './jmolInterface.js';

//import { updateBlockPosition } from './updateBlockPosition.js';

export class AssignedCouplings {
  constructor(dataColumns) {
    var theAssignedCouplings = [];
    var counter = 0;
    for (var indexList1 = 0; indexList1 < dataColumns.length; indexList1++) {
      for (var i1 = 0; i1 < dataColumns[indexList1].listOfJs.length; i1++) {
        if (dataColumns[indexList1].listOfJs[i1].isAssigned) {
          if (dataColumns[indexList1].listOfJs[i1].isFirstInAssignmentIndex) {
            // Otherwise will come twice - once for each partner
            const number1 =
              dataColumns[indexList1].listOfJs[i1].indexInAssignmentList;
            // doubling the loop...
            var foundPartner = false;
            //  var log = "";
            for (
              var indexList2 = 0;
              indexList2 < dataColumns.length;
              indexList2++
            ) {
              for (
                var i2 = 0;
                i2 < dataColumns[indexList2].listOfJs.length;
                i2++
              ) {
                const number2 =
                  dataColumns[indexList2].listOfJs[i2].indexInAssignmentList;

                //   log += " " + indexList2 + "!=" + indexList1 + "." + " :" + i2 + "!=" + i1 + ":" + number2 + "=" + number1 + dataColumns[indexList2].listOfJs[i2].isFirstInAssignmentIndex + "=false true=" +dataColumns[indexList1].listOfJs[i1].isFirstInAssignmentIndex;

                if (dataColumns[indexList2].listOfJs[i2].isAssigned) {
                  if (
                    !dataColumns[indexList2].listOfJs[i2]
                      .isFirstInAssignmentIndex
                  ) {
                    // Otherwise will come twice - once for each partner
                    if (number1 == number2) {
                      // are partners... could search for index with same value there directly...
                      //  console.log(" 1: :" + indexList + ":" + i);
                      //  console.log(" 2: :" + indexList2 + ":" + i2);
                      const JlevelAvoidContact1 =
                        dataColumns[indexList1].listOfJs[i1].JlevelAvoidContact;
                      const JlevelAvoidContact2 =
                        dataColumns[indexList2].listOfJs[i2].JlevelAvoidContact;
                      const Jvalue1 =
                        dataColumns[indexList1].listOfJs[i1].Jvalue;
                      const Jvalue2 =
                        dataColumns[indexList2].listOfJs[i2].Jvalue;
                      //const assignmentPartner = dataColumns[indexList].listOfJs[i1].assignmentPartner;

                      const avJcoupling = (eval(Jvalue1) + eval(Jvalue2)) / 2.0; // Should be equal, but in case slightly different, take average

                      theAssignedCouplings.push({
                        jOKcolor: 'grey',
                        Jvalue: avJcoupling,
                        colNumber1: indexList1,
                        colNumber2: indexList2,
                        // J_H9_7ax
                        Label:
                          'J_' +
                          dataColumns[indexList1].labelColumn +
                          '_' +
                          dataColumns[indexList2].labelColumn, // used for highlight of lines
                        JvalueAntiOverlap1: +JlevelAvoidContact1,
                        JvalueAntiOverlap2: +JlevelAvoidContact2,
                        JvalueShifted: avJcoupling, // initial value, will be change later
                        indexColumn1: indexList1,
                        indexColumn2: indexList2,
                        indexJ1: i1,
                        indexJ2: i2,
                        chemShift1: dataColumns[indexList1].chemShift, // should probably remove - redundance... possibly problementic if shift
                        chemShift2: dataColumns[indexList2].chemShift, // should probably remove - redundance... possibly problementic if shift
                        labelColumn1: dataColumns[indexList1].labelColumn,
                        labelColumn2: dataColumns[indexList2].labelColumn,
                        lineText:
                          'J(' +
                          dataColumns[indexList1].labelColumn +
                          ',' +
                          dataColumns[indexList2].labelColumn +
                          ') = ' +
                          avJcoupling +
                          ' Hz',
                        xx: 0.0,
                        indexInMolFile1: dataColumns[indexList1].atomIndexMol,
                        indexInMolFile2: dataColumns[indexList2].atomIndexMol,
                        indicesInMolFile1:
                          dataColumns[indexList1].atomIndicesMol,
                        indicesInMolFile2:
                          dataColumns[indexList2].atomIndicesMol,
                        iindex: counter,
                      });
                      counter++;
                      foundPartner = true;
                      console.log(
                        'asssigned avJcoupling : ',
                        avJcoupling,
                        ' number1 ',
                        number1,
                        ' number2 ',
                        number2,
                      );
                    }
                  }
                }
              }
            }
            //    if (!foundPartner) {
            //   console.log("Found no partner for " + indexList1 + " " + i1 + " " + dataColumns[indexList1].listOfJs[i1].Jvalue + log);
            //    }
          }
        }
      }
    }
    this.content = theAssignedCouplings;
  }

  /*for (var indexList = 0; indexList < dataColumns.length; indexList++) {
        for (var i = 0; i < dataColumns[indexList].listOfJs.length; i++) {
          const iddex = dataColumns[indexList].listOfJs[i].indexInAssignementList;
          const JlevelAvoidContactTMP = dataColumns[indexList].listOfJs[i].JlevelAvoidContact;
          if (iddex >= this.content.length) {
            console.log("ERROR  iddex ");
          } else {
            console.log("OK  iddex " + iddex);

            if (dataColumns[indexList].listOfJs[i].isFirstInAssignmentIndex) {
              this.content[iddex].JvalueAntiOverlap1 = JlevelAvoidContactTMP;
            } else {
              this.content[iddex].JvalueAntiOverlap2 = JlevelAvoidContactTMP;
            }
          }
        }
      }
      */

  addAssignment(
    dataColumns,
    at1,
    at2,
    svg,
    lineWidth,
    darkMode,
    generalUseWidth,
    yJs,
    smallSpace,
    blockWidth,
    pathFun,
    JmolAppletAr,
    instanceId,
  ) {
    console.log('at1 = ' + JSON.stringify(at1));
    console.log('at2 = ' + JSON.stringify(at2));
    if (at1.dataColIndex1 > at2.dataColIndex1) {
      const at3 = at1;
      at1 = at2;
      at2 = at3; //swap
    }
    const daC1 = dataColumns[at1.dataColIndex1];
    const daC2 = dataColumns[at2.dataColIndex1];
    const dataJs1 = dataColumns[at1.dataColIndex1].listOfJs[at1.dataColIndex2];
    const dataJs2 = dataColumns[at2.dataColIndex1].listOfJs[at2.dataColIndex2];
    // f1 = {"isAssigned":false,"indexInAssignementList":9,"isFirstInAssignmentIndex":true,"Jvalue":"2.45","JlevelAvoidContact":2.45}
    if (dataJs1.isAssigned == false && dataJs2.isAssigned == false) {
      const tmpJvalue = 0.5 * dataJs1.Jvalue + 0.5 * dataJs2.Jvalue;

      dataJs1.indexInAssignementList = this.content.length;
      dataJs2.indexInAssignementList = this.content.length;
      dataJs1.isFirstInAssignmentIndex = at1.dataColIndex1 > at2.dataColIndex1;
      dataJs2.isFirstInAssignmentIndex = at1.dataColIndex1 < at2.dataColIndex1;

      var theAssignedCouplings = {
        jOKcolor: 'black',
        Jvalue: tmpJvalue,
        colNumber1: at1.dataColIndex1,
        colNumber2: at2.dataColIndex1,
        Label: 'J_' + daC1.labelColumn + '_' + daC2.labelColumn, // used for highlight of lines
        JvalueAntiOverlap1: +dataJs1.JlevelAvoidContact,
        JvalueAntiOverlap2: +dataJs2.JlevelAvoidContact,
        JvalueShifted: tmpJvalue,
        indexColumn1: at1.dataColIndex1,
        indexColumn2: at2.dataColIndex1,
        chemShift1: +daC1.chemShift,
        chemShift2: +daC2.chemShift,
        labelColumn1: daC1.labelColumn,
        labelColumn2: daC2.labelColumn,
        lineText:
          'J(' +
          daC1.labelColumn +
          ',' +
          daC2.labelColumn +
          ') = ' +
          tmpJvalue +
          ' Hz',
        xx: 0.0,
        indexInMolFile1: daC1.atomIndexMol,
        indexInMolFile2: daC2.atomIndexMol,
        indicesInMolFile1: daC1.atomIndicesMol,
        indicesInMolFile2: daC2.atomIndicesMol,
        iindex: this.content.length,
        indexJ1: at1.dataColIndex2,
        indexJ2: at2.dataColIndex2,
      };
      this.content.push(theAssignedCouplings);
      const lastObj = this.addGraphicForLast(
        svg,
        lineWidth,
        darkMode,
        generalUseWidth,
        yJs,
        smallSpace,
        blockWidth,
        pathFun,
        JmolAppletAr,
        instanceId,
      );
    }
    this.content.sort((a, b) => (a.tmpJvalue > b.tmpJvalue ? 1 : -1));

    return svg.selectAll(`.lineZ-${instanceId}`);
  }
  getAssignedCouplings() {
    return this.content;
  }

  highlightLines(
    d,
    darkMode,
    generalUseWidth,
    svg,
    yJs,
    JmolAppletAr,
    instanceId,
  ) {
    const element = d3.select(d.target);
    const data = element.datum();
    const d2 = element.datum();
    var selected_specie = data.Label;

    // Retrieve the data bound to this element

    d3.selectAll('.toBeHidden').transition().duration(10).delay(0).remove();

    // first every group turns grey

    d3.selectAll(`.lineZ-${instanceId}`)
      .transition()
      .duration(200)
      .style('stroke', 'black')
      .style('opacity', 0.2)
      .transition()
      .duration(200)
      .delay(3000)
      //   .style("stroke", function (d) { return (color(d.Label)) })
      // .style("stroke", function (d) { return getJgraphColor(d.Jvalue, darkMode) })
      .style('stroke', function (d6) {
        return getJisOK(d6.jOKcolor);
      })
      .style('opacity', 0.5);
    // Second the hovered specie takes its color

    d3.selectAll(`.lineZ-${instanceId}_${selected_specie}`)
      .transition()
      .duration(200)
      //  .style("stroke", color(selected_specie))
      //.style("stroke", getJgraphColor(d.Jvalue, darkMode))
      .style('stroke', function (d9) {
        return getJgraphColor(Math.abs(d9.Jvalue), darkMode);
      })
      .style('opacity', 1.0)
      .transition()
      .duration(200)
      .delay(3000)
      //   .style("stroke", function (d) { return (color(d.Label)) })
      // .style("stroke", function (d) { return getJgraphColor(d.Jvalue, darkMode) })
      .style('stroke', function (d4) {
        return getJisOK(d4.jOKcolor);
      })
      .style('opacity', 0.5);

    // text above the line
    var theTextLine2 = svg
      .append('text')
      .attr('class', 'toBeHidden')
      .attr('x', d2.xx)
      .attr('y', yJs(Math.abs(d2.JvalueShifted)) - 3.0)
      .text('' + d2.lineText)
      .attr('dx', 1.3 * generalUseWidth)
      .style('font-size', generalUseWidth * 2.5)
      .style('font-family', 'Helvetica')
      .style('text-anchor', 'middle')
      .transition()
      .duration(100)
      .delay(3000)
      .remove();

    var toto = function (d5) {
      return d5.lineText;
    };
    jmolUnselectAll(JmolAppletAr);
    const atomColorHighlightPairs = [127, 255, 127];

    if (
      Array.isArray(d2.indicesInMolFile1) &&
      Array.isArray(d2.indicesInMolFile2)
    ) {
      d2.indicesInMolFile1.forEach((element) => {
        jmolSelectAtom(
          JmolAppletAr,
          element.toString(),
          atomColorHighlightPairs,
        );
      });
      d2.indicesInMolFile2.forEach((element) => {
        jmolSelectAtom(
          JmolAppletAr,
          element.toString(),
          atomColorHighlightPairs,
        );
      });
    }
    //https://chemapps.stolaf.edu/jmol/docs/#getproperty
    // What are the directly bound atoms of the two selected hydrogen (we don't test 1J)
    const at1 = d2.indexInMolFile1;
    const at2 = d2.indexInMolFile2;

    var textToDisplay = jmolGetInfo(JmolAppletAr, at1, at2, d2.lineText);
    // const nbBond = jmolGetNBbonds(at1, at2);
    const textElement = document.getElementById('textMainPage');
    if (textElement) {
      textElement.innerHTML = textToDisplay;
    }

    setTimeout(function () {
      jmolUnselectAll(JmolAppletAr);
    }, 3200);
  }

  // Method that creates the SVG paths
  makeGraphic(
    svg,
    lineWidth,
    darkMode,
    generalUseWidth,
    yJs,
    JmolAppletAr,
    instanceId,
  ) {
    return svg
      .selectAll('myPath222')
      .data(this.content) // Pass data as a separate parameter
      .enter()
      .append('path')
      .attr(
        'class',
        (d) => `lineZ-${instanceId} lineZ-${instanceId}_${d.Label}`,
      )
      .attr('d', (d) => {
        if (d.pathData) {
          return d.pathData;
        } else {
          return null; // or you can handle it differently
        }
      })
      .style('stroke-width', lineWidth)
      .style('stroke-dasharray', (d) => {
        return (
          '' +
          eval(4.0 * (lineWidth + 1000.0 * (d.Jvalue > 0.0))) +
          ',' +
          2.0 * lineWidth
        );
      })
      .style('fill', 'none')
      .style('stroke', (d) => getJisOK(d.jOKcolor))
      .style('opacity', 0.5)
      .on('click', (d) => {
        this.highlightLines(
          d,
          darkMode,
          generalUseWidth,
          svg,
          yJs,
          JmolAppletAr,
          instanceId,
        );
      })
      .on('mouseover', (d) => {
        this.highlightLines(
          d,
          darkMode,
          generalUseWidth,
          svg,
          yJs,
          JmolAppletAr,
          instanceId,
        );
      });
  }

  // REDUNDANCE ABOVE AND BELOW
  addGraphicForLast(
    svg,
    lineWidth,
    darkMode,
    generalUseWidth,
    yJs,
    smallSpace,
    blockWidth,
    pathFun,
    JmolAppletAr,
    instanceId,
  ) {
    var tmpCOntent = [];

    tmpCOntent.push(this.content[this.content.length - 1]); // take only last

    return (
      svg
        .selectAll('myPath222')
        .attr('class', 'lineW')
        .data(tmpCOntent)
        .enter()
        .append('path')
        .attr(
          'class',
          (d) => `lineZ-${instanceId} lineZ-${instanceId}_${d.Label}`,
        )
        // 2 class for each line: 'line' and the group name
        //.attr("d", function (d) { return d3.line()(listOfChemicalShifts.map(function(p) { return [x(p), yJs(d[p])]; })); })
        //.attr("d", d => {this.pathFun(d, yJs, smallSpace, blockWidth);})
        //    .attr("d", pathFun)
        .attr('d', (d) => {
          if (d.pathData) {
            return d.pathData;
          } else {
            //console.error( `Missing or invalid pathData for item with Label: ${d.Label}`, );
            return null;
          }
        })
        .style('stroke-width', lineWidth)
        .style('stroke-dasharray', function (d) {
          return (
            '' +
            eval(4.0 * (lineWidth + 1000.0 * (d.Jvalue > 0.0))) +
            ',' +
            2.0 * lineWidth
          );
        })
        .style('fill', 'none')
        .style('stroke', function (d) {
          return getJisOK(d.jOKcolor);
        })
        .style('opacity', 0.5)
        .on('click', (d) => {
          this.highlightLines(
            d,
            darkMode,
            generalUseWidth,
            svg,
            yJs,
            JmolAppletAr,
            instanceId,
          );
        })
        .on('mouseover', (d) => {
          this.highlightLines(
            d,
            darkMode,
            generalUseWidth,
            svg,
            yJs,
            JmolAppletAr,
            instanceId,
          );
        })
    );
    // .on("mouseleave", doNotHighlightLines)}
  }

  udateLineTrajectory(
    fDeltaDotAbove,
    fDeltaLineAbove,
    circleRadius,
    dataColumns,
  ) {
    for (var indexList = 0; indexList < this.content.length; indexList++) {
      this.content[indexList].JvalueShifted = Math.abs(
        this.content[indexList].Jvalue,
      );
    }

    // parameters

    const lastColuNumber = dataColumns.length - 1; // .size() - 1;
    // from close by pairs to farther apart pairs
    for (var diffIndex = 1; diffIndex < lastColuNumber; diffIndex++) {
      const lastColGigenDiffIndex = lastColuNumber - diffIndex;
      for (var curCol = 0; curCol <= lastColGigenDiffIndex; curCol++) {
        const first = curCol;
        const second = curCol + diffIndex;

        // look for the coupling between the first/second pair
        var currentShiftedJ = 0.0;
        var currentJ = 0.0;
        var indexOther = 0;
        var OK = false;
        for (var indexList = 0; indexList < this.content.length; indexList++) {
          var fs = this.content[indexList].indexColumn1;
          var fl = this.content[indexList].indexColumn2;
          if (fs > fl) {
            const del = fl;
            fl = fs;
            fs = del;
          } // Swap
          if (fs == first && fl == second) {
            indexOther = indexList;
            OK = true;
            break;
          }
        }

        if (OK) {
          // There is a pair
          currentJ = this.content[indexOther].Jvalue;
          const currentJwithTrueSign = currentJ;
          currentJ = Math.abs(currentJ);

          var rangesToAvoidFirst = [];
          var rangesToAvoidSecond = [];

          // look for stuff in between
          for (var iterator = 0; iterator < dataColumns.length; iterator++) {
            if (iterator > first && iterator < second) {
              for (
                var iterJ = 0;
                iterJ < dataColumns[iterator].listOfJs.length;
                iterJ++
              ) {
                var delta = 0.0 + circleRadius / 2.0;
                if (dataColumns[iterator].listOfJs[iterJ].isAssigned) {
                  delta = fDeltaDotAbove;
                }
                const refValue =
                  dataColumns[iterator].listOfJs[iterJ].JlevelAvoidContact;
                if (currentJ < refValue + delta) {
                  rangesToAvoidFirst.push(refValue + delta);
                  rangesToAvoidSecond.push(refValue - delta);
                }
              }
            }
          }

          // list all ranges of lines for which top is above currentJ
          var ind1 = this.content[indexOther].indexColumn1;
          var ind2 = this.content[indexOther].indexJ1;
          this.content[indexOther].JvalueAntiOverlap1 =
            dataColumns[ind1].listOfJs[ind2].JlevelAvoidContact;

          ind1 = this.content[indexOther].indexColumn2;
          ind2 = this.content[indexOther].indexJ2;
          this.content[indexOther].JvalueAntiOverlap2 =
            dataColumns[ind1].listOfJs[ind2].JlevelAvoidContact;

          currentShiftedJ = currentJ;

          for (var inside1 = first + 1; inside1 <= second - 1; inside1++) {
            // includes current
            var from = 0;
            if (inside1 > diffIndex) from = inside1 - diffIndex;
            var to = lastColuNumber;
            if (inside1 + diffIndex < lastColuNumber) to = inside1 + diffIndex;
            for (var inside2 = from; inside2 <= to; inside2++) {
              // includes current
              if (inside1 == inside2) continue;
              var currentShiftedJ2 = 0.0;
              var currentJ2 = 0.0;
              var OK2 = false;

              for (
                indexList = 0;
                indexList < this.content.length;
                indexList++
              ) {
                const fs = this.content[indexList].indexColumn1;
                const fl = this.content[indexList].indexColumn2;
                //if (fs > fl) {const del = fl; fl = fs; fs = del;} // Swap
                if (
                  (fs == inside1 && fl == inside2) ||
                  (fs == inside2 && fl == inside1)
                ) {
                  currentJ2 = this.content[indexList].Jvalue;
                  currentShiftedJ2 = this.content[indexList].JvalueShifted;
                  OK2 = true;
                  break;
                }
              }

              if (OK2) {
                //if (hasJ(inside1, inside2, currentJ2, currentShiftedJ2)) {
                currentJ2 = Math.abs(currentJ2);
                currentShiftedJ2 = Math.abs(currentShiftedJ2);
                if (currentJ2 < currentShiftedJ2 + fDeltaLineAbove) {
                  rangesToAvoidFirst.push(currentShiftedJ2 + fDeltaLineAbove);
                  rangesToAvoidSecond.push(currentShiftedJ2 - fDeltaLineAbove);
                }
              }
            }
          }

          var indices = new Array(rangesToAvoidFirst.length);
          for (var i = 0; i < rangesToAvoidFirst.length; ++i) indices[i] = i;

          indices.sort(function (a, b) {
            return rangesToAvoidFirst[a] > rangesToAvoidFirst[b]
              ? 1
              : rangesToAvoidFirst[a] < rangesToAvoidFirst[b]
              ? -1
              : 0;
          });

          for (var item = 0; item < rangesToAvoidFirst.length; item++) {
            var it1 = rangesToAvoidFirst[indices[item]];
            var it2 = rangesToAvoidSecond[indices[item]];

            if (currentShiftedJ < it1 && currentShiftedJ > it2) {
              currentShiftedJ = it1;
            }
          }
          for (var item = 0; item < rangesToAvoidFirst.length; item++) {
            var it1 = rangesToAvoidFirst[indices[item]];
            var it2 = rangesToAvoidSecond[indices[item]];

            if (currentShiftedJ < it1 && currentShiftedJ > it2) {
              currentShiftedJ = it1;
            }
          }
          this.content[indexOther].JvalueShifted = currentShiftedJ;
        }
      }
    }
  }
}
