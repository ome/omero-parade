
const getHeatmapColor = function(fraction) {
    // we only support one LUT just now
    var red = 0,
        green = 0,
        blue = 0,
        alpha = 1;
    if (fraction > 0.25) {
        red = parseInt(256 * (fraction - 0.25) * 1.3);
    }
    if (fraction < 0.75) {
        green = parseInt(256 * (1 - (fraction * 1.3)));
    }
    return "rgba(" + [red, green, blue, alpha].join(",") + ")";
}

export { getHeatmapColor }
