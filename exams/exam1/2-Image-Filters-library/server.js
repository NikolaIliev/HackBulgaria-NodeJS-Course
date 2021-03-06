var express = require('express'),
    bodyParser = require('body-parser'),
    _ = require('underscore'),
    convolution = require('./convolution'),
    app = express();

app.use(bodyParser.json({limit: '50mb', parameterLimit: 100000000}));
app.use(bodyParser.urlencoded({limit: '50mb', parameterLimit: 100000000, extended: true}));
app.all("*", function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", ["X-Requested-With", "Content-Type", "Access-Control-Allow-Methods"]);
    res.header("Access-Control-Allow-Methods", ["GET"]);
    next();
});
app.post('/applyFilter', function (req, res) {
    var data = {red: [], green: [], blue: []},
        imageData = req.body.imageData.data,
        height = +req.body.imageData.height,
        width = +req.body.imageData.width,
        currentRow = 0,
        currentCol = 0,
        i,
        length = Object.keys(imageData).length;
        console.log(imageData.length);
    for (i = 0; i < length; i+=4) {
        if (!data.red[currentRow]) {
            data.red[currentRow] = [];
            data.green[currentRow] = [];
            data.blue[currentRow] = [];
        }

        data.red[currentRow][currentCol] = +imageData[i];
        data.green[currentRow][currentCol] = +imageData[i + 1];
        data.blue[currentRow][currentCol] = +imageData[i + 2];

        currentCol++;

        if (currentCol === width) {
            currentCol = 0;
            currentRow++;
        }
    }
    convolution.rgb.edgeDetection(data).then(function (result) {
        var imageData = [];
        result[0] = _.flatten(result[0]);
        result[1] = _.flatten(result[1]);
        result[2] = _.flatten(result[2]);
        for (var i = 0, j = 0; i < result[0].length; i++) {
            imageData[j++] = result[0][i];
            imageData[j++] = result[1][i];
            imageData[j++] = result[2][i];
            imageData[j++] = 255;
        }
        res.json(imageData);
    });
});

console.log('Listening on port 3010');
app.listen(3010);