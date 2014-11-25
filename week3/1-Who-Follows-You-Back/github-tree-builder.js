var request = require('request'),
	DirectedGraph = require('./graph'),
	async = require('async'),
	uuid = require('node-uuid'),
	authenticationParams = "?client_id=e4103666689a6fdd20bb&client_secret=a51b1dac1c519724770f910780eefcea955df5bc",
	parsedUsers = [],
	queuedUsers = [];

function GraphBuilder(username, depth, db, collection) {
	var self = this;

	this.id = uuid.v1();
	this.username = username;
	this.depth = depth;
	this.finishedBuildingGraph = false;
	this.graph = new DirectedGraph();
	this.db = db;
	this.collection = collection;

	console.log('username: ' + username);
	this.collection.insert({
		_id: this.id,
		username: username,
		completed: false,
		graph: null
	}, function () {
		self.buildGraph();
	});
}

GraphBuilder.prototype.buildGraph = function () { 
	queuedUsers = [this.username];
	this.parseUsers(1);
}

GraphBuilder.prototype.parseUsers = function (currentDepth) {
	var self = this;
	console.log("DEPTH : " + currentDepth);
	if (currentDepth > this.depth) {
		this.finishedBuildingGraph = true;
		parsedUsers = [];
		queuedUsers = [];
		this.collection.update({
			_id: this.id
		}, {
			$set: {
				completed: true,
				graph: this.graph
			}
		}, function (err, result) {
			if (err) {
				console.error(err);
			} else {
				console.log("Completed and saved graph for " + self.username);
			}
		});
		return;
	}

	async.eachSeries(copyArray(queuedUsers), this.parseUserFollowers.bind(this), function (err) {
		if (err) {
			console.error(err);
		} else {
			self.parseUsers(++currentDepth);
		}
	});

	queuedUsers = [];
}

GraphBuilder.prototype.parseUserFollowers = function (username, callback) {
	var self = this;

	if (parsedUsers.indexOf(username) >= 0) {
		callback();
		return;
	}

	parsedUsers.push(username);

	console.log('Requesting followers for username: ' + username);

	request({
		url: "https://api.github.com/users/" + username + "/followers" + authenticationParams,
		headers: {
			"User-Agent": "NikolaIliev"
		}
	}, function (error, response, body) {
		var followers;

		if (error) {
			callback("Error fetching followers for username: " + username);
		} else {
			console.log("Successfully fetched followers for username: " + username + ". Followers count: " + JSON.parse(body).length);
			followers = JSON.parse(body).map(function (followerData) {
				return followerData.login;
			});

			followers.forEach(function (follower) {
				self.graph.addEdge(username, follower);
			});

			queuedUsers = queuedUsers.concat(followers.filter(function (follower) {
				return parsedUsers.indexOf(follower) === -1;
			}));

			callback();
		}
	});
}

function copyArray(arr) {
	var result = [],
		i;

	for (i = 0; i < arr.length; i++) {
		result[i] = arr[i];
	}

	return result;
}

module.exports = GraphBuilder;