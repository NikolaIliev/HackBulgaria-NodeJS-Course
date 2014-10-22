var request = require('request'),
	express = require('express'),
    localStorage = require('node-persist'),
    natural = require('natural'),
    tokenizer = new natural.WordTokenizer(),
    utils = require("./utils"),
    MongoClient = require('mongodb').MongoClient,
    url = require("./config.json").mongoConnectionUrl,
    app = express(),
    newArticlesCount = 0,
    articlesDB;

utils.initStorage(localStorage);
histogram = localStorage.getItem("histogram.json");
histogram.lastId = histogram.lastId || 0;
histogram.data = histogram.data || {};

function addKeyword(keyword) {
	MongoClient.connect(url, function(err, db) {
		if (!err) {
			console.log("Connected correctly to server");
		}

		var collection = db.collection("histogram");

		collection.find({keyword: keyword}).toArray(function (err, data) {
			if (data) {

			} else {
				collection.insert({
					keyword: keyword,
					count: 1
				}, function (err, result) {
					console.log(result);
				});
			}
		});

		
	});
}

function fetchRecursive(current, remaining) {
	if (remaining === 0) {
		return;
	}
	getArticle(current, remaining);
}

function getArticle(articleId, remaining) {
	request("https://hacker-news.firebaseio.com/v0/item/" + articleId + ".json?print=pretty", function (error, response, body) {
		var article = JSON.parse(body),
			articleTitle = article.title || "",
			articleText = article.text || "";

		tokenizer.tokenize(articleTitle + articleText).forEach(function (word) {
			var currentWord	 = word.toLowerCase();
			addKeyword(currentWord);
		});

		histogram.lastId = articleId;

		console.log('Read article #' + article.id + ". Type: " + article.type);
		fetchRecursive(articleId + 1, remaining - 1);		
	});
}

function getMaxItem() {
	request('https://hacker-news.firebaseio.com/v0/maxitem.json', function (error, response, body) {
		if (!error) {
			console.log("Fetched max item #" + body);
			fetchRecursive(histogram.lastId + 1 || 1, body);
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
	var result = [],
		from = +req.param("fromPosition"),
		direction = req.param("direction") || "next";

	from = (from && !isNaN(from)) ? from : 0;
	if (direction === "prev" && from < 10) {
		direction = "next";
		from = 0;
	}

	for (var key in histogram.data) {
		result.push({
			keyword: key,
			count: histogram.data[key]
		});
	}

	result.sort(function (a, b) {
		return a.count <= b.count ? 1 : -1;
	});

	result.forEach(function (item, index) {
		item.rank = index + 1;
	});

	result = (direction === "next") ? result.slice(from, from + 10) : result.slice(from - 20, from - 10);

	res.json(result);
});

getMaxItem();

app.listen(3010);