var http = require("http"),
	fs = require("fs"),
	_ = require("underscore"),
	config = require("./config.json"),
	ArgumentParser = require('argparse').ArgumentParser,
	payload = "",
	parser = new ArgumentParser({}),
	pathMapping = {
		"create": "/chirp",
		"delete": "/chirp",
		"getall": "/all_chirps",
		"getself": "/my_chirps",
		"getusers": "/all_users",
		"register": "/register"
	},
	methodMapping = {
		"create": "POST",
		"delete": "DELETE",
		"getall": "GET",
		"getself": "POST",
		"getusers": "GET",
		"register": "POST"
	},
	callbackMapping = {
		"create": defaultCallback,
		"delete": defaultCallback,
		"getall": defaultCallback,
		"getself": defaultCallback,
		"getusers": defaultCallback,
		"register": registerCallback
	};

parser.addArgument(['--create'], {
	constant: "chirp",
	nargs: "?"
});
parser.addArgument(['--delete'], {
	constant: "chirp",
	nargs: "?"
});
parser.addArgument(["--getall"], {
	constant: "all_chirps",
	nargs: "?"
});
parser.addArgument(["--getself"], {
	constant: "my_chirps",
	nargs: "?"
});
parser.addArgument(["--getusers"], {
	constant: "all_users",
	nargs: "?"
});
parser.addArgument(["--register"], {
	constant: "register",
	nargs: "?"
});
parser.addArgument(["--chirpid"]);
parser.addArgument(["--user"]);
parser.addArgument(["--message"]);
var args = parser.parseArgs(),
	argsKeys = _.map(args, function (value, key) { return key; } );

argsKeys = _.filter(argsKeys, function (key) {return args[key];});
console.log(args);
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
	}),
	data = {
		args: args,
		config: config
	};

	if (method !== "GET") {
		console.log(JSON.stringify(data));
		req.end(JSON.stringify(data));
	} else {
		req.end();
	}
}

function defaultCallback(payload) {
	console.log(payload);
}

function registerCallback(data) {
	var data = JSON.parse(data);

	config.user = data.user;
	config.key = data.key;

	fs.writeFile('./config.json', JSON.stringify(config), function (err) {
		if (err) {
			throw err;
		}

		console.log('config: ' + JSON.stringify(config));
	});
}