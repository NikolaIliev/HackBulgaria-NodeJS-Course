var request = require('request'),
	express = require('express'),
    natural = require('natural'),
    async = require('async'),
    tokenizer = new natural.WordTokenizer(),
    MongoClient = require('mongodb').MongoClient,
    url = require("./config.json").mongoConnectionUrl,
    app = express(),
    newArticlesCount = 0,
    db, collection;

function saveLastId(id, callback) {
	collection.update({_id: "lastId"}, {lastId: id}, {upsert: true}, function (err, result) {
			if (err) {
				console.log("Error saving last id");
			}
		}
	);
}

function getLastId(callback) {
	collection.findOne({_id: "lastId"}, function (err, result) {
		if (err) {
			console.log("Error getting last id");
		}
		if (result) {
			callback(result.lastId);
		} else {
			saveLastId(0);
			callback(0);
		}
	});
}

function addKeywords(keywords) {
	async.each(keywords, function (keyword) {
		collection.update({keyword: keyword},
		{$inc: {count: 1}},
		{upsert: true}, function () {}
		);
	}, function (err, result) {
		if (err) {
			console.log(err);
		}
	});
}

function getRange(start, size, callback) {
	console.log('start: ' + start + ' size: ' + size);

	collection.find({}, {
		sort: {count: -1},
		skip: start,
		limit: size
	}).toArray(function (err, data) {
		if (err) {
			console.log(err);
			callback(err, null);
		} else {
			callback(null, data);
		}
	});
}

function fetchRecursive(current, remaining) {
	if (remaining === 0) {
		getMaxItem();
	}
	getArticle(current, remaining);
}

function getArticle(articleId, remaining) {
	request("https://hacker-news.firebaseio.com/v0/item/" + articleId + ".json?print=pretty", function (error, response, body) {
		var article = JSON.parse(body),
			articleTitle = article.title || "",
			articleText = (article.text || "").toLowerCase();

		addKeywords(tokenizer.tokenize(articleTitle + articleText));

		saveLastId(articleId);

		console.log('Read article #' + article.id + ". Type: " + article.type);
		fetchRecursive(articleId + 1, remaining - 1);		
	});
}

function getMaxItem() {
	request('https://hacker-news.firebaseio.com/v0/maxitem.json', function (error, response, body) {
		if (!error) {
			console.log("Fetched max item #" + body);
			getLastId(function (id) {
				console.log("GOT LAST ID " + id);
				fetchRecursive(id + 1, body - id);
			});
		} else {
			console.error(123);
		}
	});
}


app.all("*", function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", ["X-Requested-With", "Content-Type", "Access-Control-Allow-Methods"]);
  res.header("Access-Control-Allow-Methods", ["GET"]);
  next();
});


app.get("/keywords", function (req, res) {
	var direction = req.param("direction") || "next",
		start = +req.param("fromPosition");

	start = (direction === "next") ? start : start - 20;
	start = (start >= 0) ? start : 0;	

	getRange(start, 10, function (err, data) {
		if (err) {
			res.end(err);
		} else {
			res.json(data.map(function (item, index) {
				item.rank = start + index + 1;
				return item;
			}));
		}
	});
});

MongoClient.connect(url, function (err, database) {
	db = database;
	collection = database.collection("histogram");
	getMaxItem();
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

app.listen(3010);