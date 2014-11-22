
var convolution = require('./convolution'),
      xMarksTheSpot = [
        [1, 0, 1],
        [0, 1, 0],
        [1, 0, 1]
      ],
      verticalBlur = [
        [0, 0.5, 0],
        [0,   0, 0],
        [0,   1, 0]
      ],
      startTimestamp = +new Date();	

    convolution.monochrome.applyKernel(xMarksTheSpot, verticalBlur).then(function (result) {
    	console.log("RESULT: " + JSON.stringify(result, null, 4));
    	console.log("Finished in: " + (+new Date() - startTimestamp) + "ms");
    	process.exit();
    });