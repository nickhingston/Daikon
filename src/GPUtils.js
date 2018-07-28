/*jslint browser: true, node: true */
/*global require, module */

"use strict";

/*** Imports ***/
var daikon = daikon || {};
daikon.GPUtils = daikon.GPUtils || {};

daikon.GPUtils.renderMonochromeKernel = function(gpu, cols, rows) {
	// need to use string, or minification messes things up
	// oooh for es6 `!
	return gpu.createKernel("function(data, cols, rows, slope, intercept, storedBits) {" +
		"var pos = this.thread.x + (rows - this.thread.y) * cols;" +

		"var val = getWord(data, pos);" +

		"val = (val * slope) + intercept;" +
		
		// no bitshift!
		"var currentBits = storedBits;" +
		"while (currentBits > 8) {" +
			"    val = val / 2;" +
		"    currentBits--;" +
		"}" +
		"val = (val % 256) / 255.0;" + // mask and set to float32 colour val

		"this.color(val, val, val);" +
	"}")
		.setOutput([cols, rows])
		.setGraphical(true);
}

// Not used - placeholder in case of moving palette conversion to GPU... 
// daikon.GPUtils.renderRGB8bitKernel = function(gpu, cols, rows) {
// 	// 256 colour 
// 	return gpu.createKernel("function(data, cols, rows, slope, intercept, storedBits) {" +
// 		"var r, g, b;" +
//         "var pos = this.thread.x + (rows - this.thread.y) * cols;" +

// 		"var val = data[pos];" +
		
// 		// RRRGGGBB
// 		"r = Math.floor(val / 32);" + 		// >> 5 
// 		"g = Math.floor((val % 32) / 4);" + // & 00011111 >> 2
// 		"b = Math.floor(val % 4);" + 		// & 00000011
		
// 		// TODO: palette lookup?
// 		"r = (r / 8)" +
// 		"g = (g / 8)" +
// 		"b = (b / 4)" +

//         "this.color(r, g, b);" +
//     "}")
//         .setOutput([cols, rows])
//         .setGraphical(true);
// }

daikon.GPUtils.renderRGBPlanar0Kernel = function(gpu, cols, rows) {
	// planar config 0 = RGBRGBRGB...
	return gpu.createKernel("function(data, cols, rows, slope, intercept, storedBits) {" +
	"var line = (rows - this.thread.y - 1);" +
		"var r, g, b;" +
		"const pos = (this.thread.x * 3) + line * cols * 3;" +

		"r = getWord(data, pos);" +
		"g = getWord(data, pos+1);" +
		"b = getWord(data, pos+2);" +

		"r = (r * slope) + intercept;" +
		"g = (g * slope) + intercept;" +
		"b = (b * slope) + intercept;" +
		
		// no bitshift!"
		"var currentBits = storedBits;" +
		"while (currentBits > 8) {" +
		"   r = r / 2;" +
		"   g = g / 2;" +
		"   b = b / 2;" +
		"   currentBits--;" +
		"}" +
		"r = (r % 256) / 255.0; " +
		"g = (g % 256) / 255.0; " +
		"b = (b % 256) / 255.0; " +

		"this.color(r, g, b);" +
		"}")
		.setOutput([cols, rows])
		.setGraphical(true);
}

daikon.GPUtils.renderRGBPlanar1Kernel = function(gpu, cols, rows) {
	 // planar config 1 = RRR...GGG...BBB
	return gpu.createKernel("function(data, cols, rows, slope, intercept, storedBits) {" +

		"const line = (rows - this.thread.y - 1);" +
		"var r, g, b;" +
		"const pos = this.thread.x;" +
		
		"const lineR = line;" +
		"const lineG = (line + rows);" +
		"const lineB = (line + rows*2);" +

		"r = getWord(data, lineR*cols + pos);" +
		"g = getWord(data, lineG*cols + pos);" +
		"b = getWord(data, lineB*cols + pos);" +
		
		"r = (r * slope) + intercept;" +
		"g = (g * slope) + intercept;" +
		"b = (b * slope) + intercept;" +
		
		// no bitshift!
		"var currentBits = storedBits;" +
		"while (currentBits > 8) {" +
		"	r = r / 2;" +
		"	g = g / 2;" +
		"	b = b / 2;" +
		"	currentBits--;" +
		"}" +
		"r = (r % 256) / 255.0; " +
		"g = (g % 256) / 255.0; " +
		"b = (b % 256) / 255.0; " +
		
		"this.color(r, g, b);" +
		"}")
		.setOutput([cols, rows])
		.setGraphical(true);
}


/*** Exports ***/

var moduleType = typeof module;
if ((moduleType !== 'undefined') && module.exports) {
	module.exports = daikon.GPUtils;
}