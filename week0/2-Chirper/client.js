var http = require("http"),
	_ = require("underscore"),
	config = require("./config.json"),
	ArgumentParser = require('argparse').ArgumentParser,
	payload = "",
	parser = new ArgumentParser({}),
	pathMapping = {
		"getall": "/all_chirps"
		"register": "/register"
	},
	methodMapping = {
		"getall": "GET",
		"register": "POST"
	},
	callbackMapping = {
		"getall": getallCallback,
		"register": registerCallback
	};

parser.addArgument(["--getall"], {
	constant: "all_chirps",
	nargs: "?"
});
var args = parser.parseArgs(),
	argsKeys = _.map(args, function (value, key) { return key; } );

sendRequest(pathMapping[argsKeys[0]], methodMapping[argsKeys[0]], null, callbackMapping[argsKeys[0]]);

function sendRequest(path, method, data, callback) {
	var req = http.request({
		hostname: config["api_url"].replace("http://", "").split(":")[0],
		port: config["api_url"].replace("http://", "").split(":")[1],
		path: path,
		method: method
	}, function (res) {
		res.setEncoding("utf8");
		res.on("data", function (chunk) {
			payload += chunk;
		});
		res.on("end", function () {
			callback(payload);
		});
	});

	if (method === "POST") {
		req.write(data);
	}

	req.end();
}

function getallCallback(payload) {
	console.log(payload);
}

function registerCallback(data) {
	var data = json.parse(data);
}