var Q = require('q'),
	fork = require('child_process').fork,
	edgeDetectionKernel = [
		[0, 1, 0],
		[1, -4, 1],
		[0, 1, 0]
	], boxBlurKernel = [
		[1/9, 1/9, 1/9],
		[1/9, 1/9, 1/9],
		[1/9, 1/9, 1/9]
	],
	maxChildProcesses = 4;

function Convoluter(imageData, kernel) {
	this.deferred = Q.defer();
	this.imageData = imageData;
	this.kernel = kernel;
	this.result = [];
	this.inProgressRows = 0;
	this.finishedRows = 0;
	this.nextRow = 0;
	this.allRows = imageData.length;
}

Convoluter.prototype.startup = function () {
	this.maxOutProcesses();
	return this.deferred.promise;
}

Convoluter.prototype.maxOutProcesses = function () {
	var remainingRows = this.allRows - this.finishedRows - this.inProgressRows,
		availableProcesses = maxChildProcesses - this.inProgressRows,
		newProcessesCount = remainingRows <= availableProcesses ? remainingRows : availableProcesses;

	console.log('NEW PROCESSES COUNT: ' + newProcessesCount);
	for (i = 0; i < newProcessesCount; i++) {
		this.forkRowProcess();
	}
}

Convoluter.prototype.forkRowProcess = function () {
	var child = fork('./worker.js');

	child.send({
		row: this.nextRow,
		imageData: this.imageData,
		kernel: this.kernel
	});

	child.on('message', this.onProcessFinish.bind(this));

	this.inProgressRows++;
	this.nextRow++;
}

Convoluter.prototype.onProcessFinish = function (data) {
	this.finishedRows++;
	this.inProgressRows--;

	this.result[data.row] = data.result;
	//console.log(this.finishedRows + "  " + this.allRows);
	if (this.finishedRows === this.allRows) {
		this.deferred.resolve(this.result);
	} else {
		this.maxOutProcesses();
	}
}

function applyKernel(imageData, kernel) {
	var convoluter = new Convoluter(imageData, kernel);

	return convoluter.startup();
}

module.exports = {
	"monochrome": {
		edgeDetection: function (imageData) { 
			return applyKernel(imageData, edgeDetectionKernel);
		},
		boxBlur: function (imageData) { 
			return applyKernel(imageData, boxBlurKernel);
		},
		applyKernel: function (imageData, kernel) {
			return applyKernel(imageData, kernel);
		}
	},
	"rgb": {
		edgeDetection: function (imageData) { 
			return Q.all([
				applyKernel(imageData.red, edgeDetectionKernel),
				applyKernel(imageData.green, edgeDetectionKernel),
				applyKernel(imageData.blue, edgeDetectionKernel)
			]);
		},
		boxBlur: function (imageData) { 
			return Q.all([
				applyKernel(imageData.red, boxBlurKernel),
				applyKernel(imageData.green, boxBlurKernel),
				applyKernel(imageData.blue, boxBlurKernel)
			]);
		},
		applyKernel: function (imageData, kernel) { 
			return Q.all([
				applyKernel(imageData.red, kernel),
				applyKernel(imageData.green, kernel),
				applyKernel(imageData.blue, kernel)
			]);
		}	
	}
};