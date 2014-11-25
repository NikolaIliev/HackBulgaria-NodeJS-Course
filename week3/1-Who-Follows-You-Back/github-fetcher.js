var express = require('express'),
	bodyParser = require('body-parser'),
	GraphBuilder = require('./github-tree-builder'),
	MongoClient = require('mongodb').MongoClient,
	app = express(),
	mongoUrl = "mongodb://localhost:27017/github-social-graph",
	graphs = {},
	db, collection;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post("/createGraphFor", function (req, res) {
	var graphBuilder = new GraphBuilder(req.body.username, req.body.depth, db, collection);

	res.json(graphBuilder.id).end();
});

app.get("/graph/:graphId", function (req, res) {
	collection.findOne({
		_id: req.param("graphId")
	}, function (err, result) {
		if (err) {
			res.end(err);
		}

		if (result) {
			res.end(result.graph.toString());
		} else {
			res.end("Graph with id: " + req.param("graphId") + " does not exist\n");
		}
	});
});

MongoClient.connect(mongoUrl, function (err, database) {
	db = database;
	collection = database.collection("graphs");

	app.listen(8010);
	console.log('Connected to database and started server');
});

process.on('SIGINT', function () {
	console.log('Exiting and closing db connection.');
	db.close(function (err, result) {
		if (err) {
			console.log(err);
		} else {
			process.exit();
		}
	});
});