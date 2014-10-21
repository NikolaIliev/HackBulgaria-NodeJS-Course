var express = require ('express'),
	nodemailer = require('nodemailer'),
	smtpTransport = require('nodemailer-smtp-transport'),
	bodyParser = require('body-parser'),
	localStorage = require('node-persist'),
	utils = require("./utils"),
	app = express(),
	transporter = nodemailer.createTransport(smtpTransport({
		host: "smtp.googlemail.com",
		port: 465,
		secure: true,
		auth: {
				user: 'node.js.mail.testing@gmail.com',
				pass: ''
		}
	}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

utils.initStorage(localStorage);


function sendSubscriptionEmail(subscriber, text) {
	utils.sendEmail({
		email: subscriber.email,
		subject: "Your new batch of articles!",
		text: text
	});
}

function parseComments(allArticles, newArticles) {
	newArticles.forEach(function (article) {
		var commentStory;
		if (article.type === "comment") {
			commentStory = article;
			while (commentStory.type !== "story") {
				commentStory = utils.getById(allArticles, commentStory.parent);
			}
			article.url = commentStory.url;
			article.title = commentStory.title;
		}
	})
}

function buildEmailText(article, articles) {
	var text, commentStory;
	if (article.type === "story") {
		text = "<p><b>Author:</b> " + article.by + "</p><p><b>Title: </b>" + "<a href='" + article.url + "'>" + article.title + "</a></p><hr>";
	} else if (article.type === "comment") {
		text = "<p><b>Comment author:</b> " + article.by + "</p><p><b>Article:</b> <a href='" + article.url + "'>" + article.title + "</a></p><p><b>Comment:</b> " + article.text + "</p><hr>";
	}
	return text;
}

app.post('/newArticles', function (req, res) {
	var subscribers, articlesDB, newArticles;

	utils.initStorage(localStorage);
	ubscribers = localStorage.getItem("subscribers.json"),
	articlesDB = localStorage.getItem("articles.json");
	newArticles = articlesDB.data.filter(function (article) {
		if (!article.sent && article.purpose === "subscription") {
			article.sent = true;
			return true;
		}
		return false;
		});

	parseComments(articlesDB.data, newArticles);

	subscribers.forEach(function (subscriber) {
		var currentArticles = [],
			emailText = "Hello! Your subscription is: " + subscriber.keywords.join(" ");
		newArticles.forEach(function (article) {
			if (utils.isMatchingArticle(article, subscriber)) {
				currentArticles.push(article);
			}
		});

		console.log("NEW ARTICLES: ", newArticles);
			if (currentArticles.length > 0) {
				currentArticles.forEach(function (article) {
				emailText += buildEmailText(article, articlesDB.data);
			});
			sendSubscriptionEmail(subscriber, emailText);
		}

		localStorage.setItem("articles.json", articlesDB);
		res.end();
	});
});


app.listen(3000);


