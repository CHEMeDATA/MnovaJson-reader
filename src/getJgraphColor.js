/*jshint esversion: 6 */
export function getJgraphColor(Jcoupling, darkmode) {
    // https://nmredatainitiative.github.io/color-map-J-coupling/
    // input
    // Color maps. First color for 0 Hz, second color for 2 Hz, etc. up to 20 Hz

    var colormap = [0, 1, 1, 0, 1, 0, 0.8, 0.8, 0, 0.9, 0.4, 0, 1, 0, 0, 1, 0, 0.5, 1, 0, 1, 0.5, 0, 1, 0, 0, 1, 0, 0, 0.5, 0, 0, 0]; // for white background
    if (darkmode) {
      colormap = [0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0.5, 0, 1, 0, 0, 1, 0, 0.5, 1, 0, 1, 0.5, 0, 0.9, 0.2, 0.2, 1, 0.4, 0.4, 0.5, 1, 1, 1]; // for black background
    }

    const JcouplingAbs = Math.abs(Jcoupling); // Hz
    var baseColorInt = Math.floor(JcouplingAbs / 2.0); // -20 - 20.0 ->  0 - 9 
    if (baseColorInt > 9) baseColorInt = 9; // baseColorInt 0 - 9
    var adjust = +(JcouplingAbs - 2.0 * baseColorInt) / 2.0; // normalized diff (0-1) for 2 Hz
    if (adjust > 1.0) adjust = 1.0; // adjust 0 - 1.0
    const baseColorIndex = 3 * baseColorInt; // 3 because RGB

    // the loop is language dependent, lets drop it...
    const r = Math.floor(+255.0 * (colormap[baseColorIndex + 0] + adjust * (colormap[baseColorIndex + 3 + 0] - colormap[baseColorIndex + 0])));
    const g = Math.floor(+255.0 * (colormap[baseColorIndex + 1] + adjust * (colormap[baseColorIndex + 3 + 1] - colormap[baseColorIndex + 1])));
    const b = Math.floor(+255.0 * (colormap[baseColorIndex + 2] + adjust * (colormap[baseColorIndex + 3 + 2] - colormap[baseColorIndex + 2])));

    //const negExpVal = (Jcoupling < 0.0); // used to change line type for negative values.                   

    return (["rgb(", r, ",", g, ",", b, ")"].join(""));
  }