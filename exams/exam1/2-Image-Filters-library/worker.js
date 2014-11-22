function flipKernel(kernel) {
	var flippedKernel = [], i, j, a, b;

	for (i = 0; i < kernel.length; i++) {
		flippedKernel[i] = [];
		for (j = 0; j < kernel[0].length; j++) {
			flippedKernel[i][j] = kernel[kernel.length - 1 - i][kernel[0].length - 1 - j];
		}
	}

	return flippedKernel;
}
process.on('message', function (data) {
	var origin = Math.floor(data.kernel.length / 2),
		kernel = flipKernel(data.kernel),
		resultRow = [],
		offsetX = data.row - origin, 
		offsetY, row, column, offsetRow, offsetColumn;

	for (var imageColumn = 0; imageColumn < data.imageData[0].length; imageColumn++) {
		resultRow[imageColumn] = 0;
		offsetY = imageColumn - origin;

		for (var kernelRow = 0; kernelRow < kernel.length; kernelRow++) {
			for (var kernelColumn = 0; kernelColumn < kernel[0].length; kernelColumn++) {
				offsetRow = kernelRow - offsetX;
				offsetColumn = kernelColumn - offsetY;
				resultRow[imageColumn] += kernel[kernelRow][kernelColumn] * 
					((offsetRow >= 0 && offsetColumn >= 0 && offsetRow < data.imageData.length && offsetColumn < data.imageData[0].length) ? data.imageData[offsetRow][offsetColumn] : 0);
			}
		}
	}

	process.send({
		row: data.row,
		result: resultRow
	});
});