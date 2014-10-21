var request = require('request'),
	express = require('express'),
    localStorage = require('node-persist'),
    natural = require('natural'),
    tokenizer = new natural.WordTokenizer(),
    utils = require("./utils"),
    app = express(),
    newArticlesCount = 0,
    articlesDB;

utils.initStorage(localStorage);
histogram = localStorage.getItem("histogram.json");
histogram.lastId = histogram.lastId || 0;
histogram.data = histogram.data || {};

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
			histogram.data[currentWord] = histogram.data[currentWord] ? histogram.data[currentWord] + 1 : 1;
		});

		histogram.lastId = articleId;

		localStorage.setItem("histogram.json", histogram);

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

app.get("/keywords", function (req, res) {
	var result = [];

	for (var key in histogram.data) {
		result.push({
			word: key,
			count: histogram.data[key]
		});
	} 

	result.sort(function (a, b) {
		return a.count <= b.count ? 1 : -1;
	});

	res.write("<table style='border-collapse: collapse; border: 1px solid #454545; background-color: #343434; text-align: center; color: white; font-size: 18px;'>")

	result.forEach(function (data) {
		res.write("<tr>");
		res.write("<td style='border: 1px solid #454545; padding: 10px 15px'>" + data.word + "</td>");
		res.write("<td style='border: 1px solid #454545; padding: 10px 15px'>" + data.count + "</td>");
		res.write("</tr>")
	});

	res.end("</table>");
});

getMaxItem();

app.listen(3010);