export function updateColumnsAction(
  spreadPositions,
  timeAnimation,
  positionJscale,
  topJGraphYposition,
  colorShowLine,
  colorHideLine,
  generalUseWidth,
  x,
  width,
  jgraphObj,
  blockWidth,
  yJs,
) {
  console.log(
    'jgraphObj.theColumns.theColumnsConnectColumnToSpectrumPosition',
    jgraphObj.theColumns.theColumnsConnectColumnToSpectrumPosition,
  );
  console.log(
    'jgraphObj.theColumns.theColumnsConnectColumnToSpectrumPosition',
    jgraphObj.theColumns.theColumnsConnectColumnToSpectrumPosition,
  );
  if (typeof width === 'undefined') {
    console.error('width is undefined');
  }
  if (typeof colorHideLine === 'undefined') {
    console.error('zzh  colorHideLine is undefined');
  }
  if (typeof generalUseWidth === 'undefined') {
    console.error('zzh  generalUseWidth is undefined');
  }
  if (typeof colorShowLine === 'undefined') {
    console.error('zzh  colorShowLine is undefined');
  }
  if (typeof blockWidth === 'undefined') {
    console.error('zzh  blockWidth is undefined');
  }

  if ('theColumnsConnectColumnToSpectrumPosition' in jgraphObj.theColumns)
    jgraphObj.theColumns.theColumnsConnectColumnToSpectrumPosition
      .transition()
      .duration(timeAnimation)
      .attr('x1', function (d) {
        return spreadPositions[d.MyIndex];
      })
      .attr('x2', function (d) {
        return x(d.chemShift);
      })
      .attr('stroke', function (d) {
        if (x(d.chemShift) > 0.0 && x(d.chemShift) < width) {
          return colorShowLine;
        } else {
          return colorHideLine;
        }
      });

  if ('theColumnsVerticalInSpectrum' in jgraphObj.theColumns) {
    console.log('found   theColumnsVerticalInSpectrum to adjust');
    jgraphObj.theColumns.theColumnsVerticalInSpectrum
      .transition()
      .duration(timeAnimation)
      .attr('x1', function (d) {
        return x(d.chemShift);
      })
      .attr('x2', function (d) {
        return x(d.chemShift);
      })
      .attr('stroke', function (d) {
        if (x(d.chemShift) > 0.0 && x(d.chemShift) < width) {
          return colorShowLine;
        } else {
          return colorHideLine;
        }
      });
  }
  console.log(
    'jgraphObj.theColumns.theColumnsMainVerticalBackLine',
    jgraphObj.theColumns.theColumnsMainVerticalBackLine,
  );

  if ('theColumnsMainVerticalBackLine' in jgraphObj.theColumns)
    jgraphObj.theColumns.theColumnsMainVerticalBackLine
      .transition()
      .duration(timeAnimation)
      .attr('x1', function (d) {
        return spreadPositions[d.MyIndex];
      })
      .attr('x2', function (d) {
        return spreadPositions[d.MyIndex];
      })
      .attr('stroke', function (d) {
        if (x(d.chemShift) > 0.0 && x(d.chemShift) < width) {
          return colorShowLine;
        } else {
          return colorHideLine;
        }
      });

  if ('theColumnsMainVerticalLine' in jgraphObj)
    jgraphObj.theColumnsMainVerticalLine
      .transition()
      .duration(timeAnimation)
      .attr('x1', function (d) {
        return spreadPositions[d.MyIndex];
      })
      .attr('x2', function (d) {
        return spreadPositions[d.MyIndex];
      })
      .attr('stroke', function (d) {
        return 'black';
      });

  if ('theColumnsBase' in jgraphObj)
    jgraphObj.theColumnsBase
      .transition()
      .duration(timeAnimation)
      .attr('x1', function (d) {
        return spreadPositions[d.MyIndex] + generalUseWidth;
      })
      .attr('x2', function (d) {
        return spreadPositions[d.MyIndex] - generalUseWidth;
      })
      .attr('stroke', function (d) {
        return 'black';
      });

  if (true)
    if ('theDots' in jgraphObj)
      jgraphObj.theDots
        .transition()
        .duration(timeAnimation)
        .attr('cx', function (d) {
          return spreadPositions[d.MyIndex];
        })
        .attr('cy', function (d) {
          return yJs(d.valueOnBar);
        });
  /*
           theTextDots2
             .transition().duration(timeAnimation)
             .attr("x", function (d) { return spreadPositions[d.MyIndex]; })
            ;
*/
  if (true)
    if ('theBlocks' in jgraphObj)
      jgraphObj.theBlocks
        .transition()
        .duration(timeAnimation)
        .attr('x', function (d) {
          return eval(spreadPositions[d.MyIndex] - blockWidth);
        });
  //    .attr("y", function (d) { return yJs(Math.abs(d.value )) - halfBlockHeight; })

  //  .attr("x", function (d) { return spreadPositions[d.MyIndex]; })
  //.attr("transform", function (d) { return "rotate(-45," + spreadPositions[d.MyIndex] + "," + yJs(Math.abs(d.value)) + ")"; })
  //  .attr("opacity", 0.0)

  if (true)
    jgraphObj.theColumns.theColumnLabel
      .transition()
      .duration(timeAnimation)
      .attr('x', function (d) {
        return spreadPositions[d.MyIndex];
      })
      .attr('transform', function (d) {
        return (
          'rotate(-45,' +
          spreadPositions[d.MyIndex] +
          ',' +
          eval(-6 + topJGraphYposition + positionJscale) +
          ' )'
        );
      });
  if (false) {
    jgraphObj.theColumns.theColumnLabel
      .transition()
      .duration(timeAnimation)
      .attr('x', function (d) {
        return spreadPositions[d.MyIndex];
      })
      .attr('transform', function (d) {
        // Calculate the y-coordinate for the rotation
        const yPosition = -6 + topJGraphYposition + positionJscale;

        // Ensure that yPosition is a number before using it in the transform
        if (isNaN(yPosition) || isNaN(spreadPositions[d.MyIndex])) {
          console.error(
            'Invalid numeric values:',
            yPosition,
            spreadPositions[d.MyIndex],
          );
          console.error(
            'Invalid numeric topJGraphYposition:',
            topJGraphYposition,
          );
          console.error('Invalid numeric positionJscale:', positionJscale);
          return null; // Return null if there are invalid values to avoid applying the transform
        }

        return `rotate(-45,${spreadPositions[d.MyIndex]},${yPosition})`;
      });
  }
  //   .attr("x", function (d) { return spreadPositions[d.MyIndex]; })
  //  .attr("opacity", 0.0)
  console.log('end updateColumnsAction');
}
