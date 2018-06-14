/*jslint browser: true, node: true */
/*global require, module */

"use strict";

/*** Imports ***/
var daikon = daikon || {};
daikon.GPUtils = daikon.GPUtils || {};

daikon.GPUtils.renderMonochromeKernel = function(gpu, cols, rows) {
	return gpu.createKernel(function(a0, a1, a2, cols, rows, slope, intercept, storedBits) {
        var line = (rows - this.thread.y - 1);
        var word
        const pos = this.thread.x;

        const arraySize = Math.ceil(rows / 3);
		const arrayNo = Math.floor(line / arraySize);
		
		line = line % arraySize;
		
        if (arrayNo == 2) {
            word = a2[line][pos];
        }
        else if (arrayNo == 1) {
            word = a1[line][pos];
        }
        else {
            word = a0[line][pos];
        }
        
        var val = word;

        val = (val * slope) + intercept;
        
        // no bitshift!
        var currentBits = storedBits;
        while (currentBits > 8) {
            val = val / 2;
            currentBits--;
        }
        val = (val % 256) / 255.0; // mask and set to float32 colour val

        this.color(val, val, val);
    })
        .setOutput([cols, rows])
        .setGraphical(true);
}

// Not used - placeholder in case of moving palette conversion to GPU... 
// daikon.GPUtils.renderRGB8bitKernel = function(gpu, cols, rows) {
// 	// 256 colour 
// 	return gpu.createKernel(function(a0, a1, a2, cols, rows, slope, intercept, storedBits) {
//         var line = (rows - this.thread.y - 1);
//         var r, g, b, val;
//         const pos = this.thread.x;

//         const arraySize = Math.ceil(rows / 4);
// 		const arrayNo = Math.floor(line / arraySize);
		
// 		line = line % arraySize;
		
//         else if (arrayNo == 2) {
//             val = a2[line][pos];
//         }
//         else if (arrayNo == 1) {
//             val = a1[line][pos];
//         }
//         else {
//             val = a0[line][pos];
//         }
		
// 		val = val % 256; 
		
// 		// RRRGGGBB
// 		r = Math.floor(val / 32); 		// >> 5 
// 		g = Math.floor((val % 32) / 4); // & 00011111 >> 2
// 		b = Math.floor(val % 4); 		// & 00000011
		
// 		// TODO: palette lookup?
// 		r = (r * 8) / 255.0; 
// 		g = (g * 8) / 255.0; 
// 		b = (b * 4) / 255.0; 

//         this.color(r, g, b);
//     })
//         .setOutput([cols, rows])
//         .setGraphical(true);
// }

daikon.GPUtils.renderRGBPlanar0Kernel = function(gpu, cols, rows) {
	// planar config 0 = RGBRGBRGB...
	return gpu.createKernel(function(a0, a1, a2, cols, rows, slope, intercept, storedBits) {
        var line = (rows - this.thread.y - 1);
        var r, g, b;
        const pos = this.thread.x * 3;

        const arraySize = Math.ceil(rows / 3);
		const arrayNo = Math.floor(line / arraySize);
		
		line = line % arraySize;
		
        if (arrayNo == 2) {
            r = a2[line][pos];
			g = a2[line][pos+1];
			b = a2[line][pos+2];
        }
        else if (arrayNo == 1) {
            r = a1[line][pos];
			g = a1[line][pos+1];
			b = a1[line][pos+2];
        }
        else {
            r = a0[line][pos];
			g = a0[line][pos+1];
			b = a0[line][pos+2];
        }
        
		r = (r * slope) + intercept;
		g = (g * slope) + intercept;
		b = (b * slope) + intercept;
        
        // no bitshift!
        var currentBits = storedBits;
        while (currentBits > 8) {
			r = r / 2;
			g = g / 2;
			b = b / 2;
            currentBits--;
        }
		r = (r % 256) / 255.0; 
		g = (g % 256) / 255.0; 
		b = (b % 256) / 255.0; 

        this.color(r, g, b);
    })
        .setOutput([cols, rows])
        .setGraphical(true);
}

daikon.GPUtils.renderRGBPlanar1Kernel = function(gpu, cols, rows) {
	 // planar config 1 = RRR...GGG...BBB
	return gpu.createKernel(function(a0, a1, a2, cols, rows, slope, intercept, storedBits) {
		const line = (rows - this.thread.y - 1);
        var r, g, b;
        const pos = this.thread.x;

        const inputArraySize = Math.ceil(rows * 3 / 3);
		
		const lineR = line;
		const lineG = (line + rows);
		const lineB = (line + rows*2);
		
		function getWord(line, arraySize, pos) {
			const arrayNo = Math.floor(line / arraySize);
			line = line % arraySize;
			var word;
			if (arrayNo == 2) {
				word = a2[line][pos];
			}
			else if (arrayNo == 1) {
				word = a1[line][pos];
			}
			else {
				word = a0[line][pos];
			}
			return word;
		}
		
        
		r = getWord(lineR, inputArraySize, pos);
		g = getWord(lineG, inputArraySize, pos);
		b = getWord(lineB, inputArraySize, pos);

        r = (r * slope) + intercept;
		g = (g * slope) + intercept;
		b = (b * slope) + intercept;
        
        // no bitshift!
        var currentBits = storedBits;
        while (currentBits > 8) {
			r = r / 2;
			g = g / 2;
			b = b / 2;
            currentBits--;
        }
		r = (r % 256) / 255.0; 
		g = (g % 256) / 255.0; 
		b = (b % 256) / 255.0; 

        this.color(r, g, b);
    })
        .setOutput([cols, rows])
        .setGraphical(true);
}


/*** Exports ***/

var moduleType = typeof module;
if ((moduleType !== 'undefined') && module.exports) {
    module.exports = daikon.GPUtils;
}