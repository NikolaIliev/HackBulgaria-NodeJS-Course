var request = require('request'),
    localStorage = require('node-persist'),
    utils = require("./utils"),
    newArticlesCount = 0,
    articlesDB;

utils.initStorage(localStorage);
articlesDB = localStorage.getItem("articles.json");

function fetchRecursive(remaining) {
	if (remaining === 0) {
		console.log('Done! New articles count: ' + newArticlesCount);
		if (newArticlesCount > 0) {
			request.post("http://localhost:3000/newArticles", function (error, response, body) {
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
	getArticle(articlesDB.maxItem, remaining, "subscription");
	articlesDB.maxItem++;
}

function getArticle(articleId, remaining, purpose) {
	articlesDB = localStorage.getItem("articles.json");
	request("https://hacker-news.firebaseio.com/v0/item/" + articleId + ".json?print=pretty", function (error, response, body) {
		var article = JSON.parse(body),
			parentArticle, result;
		console.log('Read article #' + article.id + ".");

		result = {
			id: article.id,
			by: article.by,
			type: article.type,
			purpose: purpose
		};

		if (article.type === "story") {
			result.title = article.title;
			result.url = article.url;
			console.log(result);

			articlesDB.data.push(result);
			newArticlesCount++;
			localStorage.setItem("articles.json", articlesDB);
			fetchRecursive(remaining - 1);
		} else if (article.type === "comment") {
			result.text = article.text;
			result.parent = article.parent;
			console.log(result);

			articlesDB.data.push(result);
			newArticlesCount++;
			localStorage.setItem("articles.json", articlesDB);
			parentArticle = article.parent;

			while (parentArticle && utils.existsById(articlesDB.data, parentArticle.id)) {
				//move up the parent tree locally
				parentArticle = parentArticle.parent;
			}
			if (parentArticle) {
				//parentArticle is not cached, fetch it from HackerNews
				getArticle(parentArticle, remaining, "cache");
			} else {
				fetchRecursive(remaining - 1);
			}
		}
		
	});
}

function getMaxItem() {
	utils.initStorage(localStorage);

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
				fetchRecursive(body - articlesDB.maxItem);
			} else {
				setTimeout(getMaxItem, 10000);
			}
		} else {
			console.error(123);
		}
	});
}

getMaxItem();