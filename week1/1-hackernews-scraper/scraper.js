var express = require ('express'),
	http = require('http'),
	request = require('request'),
	nodemailer = require('nodemailer'),
    bodyParser = require('body-parser'),
    localStorage = require('node-persist'),
    url = require("url");

localStorage.initSync({
  dir: "../../../persist",
  stringify: function (obj) {
	return JSON.stringify(obj, null, 4);
  }
});
var articlesDB = localStorage.getItem("articles.json"),
	newArticlesCount = 0;

function recurseCalls(count) {
	if (count === 0) {
		console.log('Done! New articles count: ' + newArticlesCount);
		if (newArticlesCount > 0) {
			request.post("http://localhost:8010/newArticles", function (error, response, body) {
				if (!error) {
					console.log('Notifier sent e-mails. Fetching again in 10 seconds.');
					setTimeout(getMaxItem, 10000);
				}
			});
		} else {
			console.log("No new articles. Fetching again in 10 seconds.");
			setTimeout(getMaxItem, 10000);
		}
		
		return;
	}
	getArticle(articlesDB.maxItem, count, "subscription");
	articlesDB.maxItem++;
}

function getArticle(articleId, count, purpose) {
	articlesDB = localStorage.getItem("articles.json");
	request("https://hacker-news.firebaseio.com/v0/item/" + articleId + ".json?print=pretty", function (error, response, body) {
		var article = JSON.parse(body),
			parentArticle, result;
		console.log('Read article #' + article.id + ".");
		if (article.type === "story") {
			result = {
				id: article.id,
				by: article.by,
				title: article.title,
				url: article.url,
				type: article.type,
				purpose: purpose
			}
			console.log(result);
			articlesDB.data.push(result);
			newArticlesCount++;
			localStorage.setItem("articles.json", articlesDB);
			recurseCalls(count - 1);
		} else if (article.type === "comment") {
			result = {
				id: article.id,
				by: article.by,
				text: article.text,
				type: article.type,
				parent: article.parent,
				purpose: purpose
			}
			console.log(result);
			articlesDB.data.push(result);
			newArticlesCount++;
			localStorage.setItem("articles.json", articlesDB);
			parentArticle = article.parent;
			while (parentArticle && existsById(articlesDB.data, parentArticle.id)) {
				parentArticle = parentArticle.parent;
			}
			if (parentArticle) {
				getArticle(parentArticle, count, "additional-info");
			} else {
				recurseCalls(count - 1);
			}
		}
		
	});
}

function existsById (articles, id) { //TODO: Move to utils module
	return articles.some(function (article) {
		return article.id === id;
	});
}

function getMaxItem() {
	localStorage.initSync({
		dir: "../../../persist",
		stringify: function (obj) {
			return JSON.stringify(obj, null, 4);
		}
	});
	request('https://hacker-news.firebaseio.com/v0/maxitem.json', function (error, response, body) {
		if (!error) {
			console.log("Fetched max item #" + body);
			if (articlesDB.maxItem == null) {
				articlesDB.maxItem = body;
				localStorage.setItem("articles.json", articlesDB);
			}

			if (body > articlesDB.maxItem) {
				console.log("Started fetching articles. Expected new articles length: " + (body - articlesDB.maxItem));
				newArticlesCount = 0;
				recurseCalls(body - articlesDB.maxItem);
			} else {
				setTimeout(getMaxItem, 10000);
			}
		} else {
			console.error(123);
		}
	});
}

getMaxItem();

