var MongoClient = require('mongodb').MongoClient,
	url = require("./config.json").mongoConnectionUrl,
	path = require("path"),
	args = process.argv.slice(2),
	collectionName = path.basename(args[0], ".json"),
	content = args[0].indexOf("/") > 0 ? require(args[0]) : require("./" + args[0]);

MongoClient.connect(url, function(err, db) {
	if (!err) {
		console.log("Connected correctly to server");
	}

	var collection = db.collection(collectionName);

	collection.insert(content, function(err, result) {
		console.log(err);
		db.close();
	});
});