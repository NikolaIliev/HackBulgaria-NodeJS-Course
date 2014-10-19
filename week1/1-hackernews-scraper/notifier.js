var express = require ('express'),
	nodemailer = require('nodemailer'),
	smtpTransport = require('nodemailer-smtp-transport'),
	bodyParser = require('body-parser'),
	localStorage = require('node-persist'),
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

localStorage.initSync({
	dir: "../../../persist",
	stringify: function (obj) {
		return JSON.stringify(obj, null, 4);
	}
});

function getArticleById(articles, id) {
	return articles.filter(function (article) {
		return article.id === id;
	})[0];
}

function isMatchingArticle(article, subscriber) {
	return subscriber.keywords.some(function (keyword) {
		return article.title && (subscriber.type.indexOf(article.type)) >= 0 &&  article.title.split(" ").some(function (titleWord) {
			return titleWord.toLowerCase() === keyword.toLowerCase();
		})
	})
}

function sendEmail(subscriber, text) {
	var mailOptions = {
			from: 'node.js.mail.testing@gmail.com', // sender address
			to: subscriber.email, // list of receivers
			subject: 'Your new batch of articles!', // Subject line
			html: text // plaintext body
	};
	transporter.sendMail(mailOptions, function(error, info){
			if(error){
					console.log(error);
			}else{
					console.log('Message sent: ' + info.response);
			}
	});
}

function parseComments(allArticles, newArticles) {
	newArticles.forEach(function (article) {
		var commentStory;
		if (article.type === "comment") {
			commentStory = article;
			while (commentStory.type !== "story") {
				commentStory = getArticleById(allArticles, commentStory.parent);
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
	localStorage.initSync({
		dir: "../../../persist",
		stringify: function (obj) {
			return JSON.stringify(obj, null, 4);
		}
	});
	var subscribers = localStorage.getItem("subscribers.json"),
			articlesDB = localStorage.getItem("articles.json");
	var	newArticles = articlesDB.data.filter(function (article) {
		debugger;
		if (!article.sent && article.purpose === "subscription") {
			article.sent = true;
			return true;
		}
		return false;
		});

	debugger;

	parseComments(articlesDB.data, newArticles);

	subscribers.forEach(function (subscriber) {
		var currentArticles = [],
			emailText = "Hello! Your subscription is: " + subscriber.keywords.join(" ");
		newArticles.forEach(function (article) {
			if (isMatchingArticle(article, subscriber)) {
				currentArticles.push(article);
			}
		});
		console.log("NEW ARTICLES: ", newArticles);
			if (currentArticles.length > 0) {
				currentArticles.forEach(function (article) {
				emailText += buildEmailText(article, articlesDB.data);
			});
			sendEmail(subscriber, emailText);
		}

		localStorage.setItem("articles.json", articlesDB);
		res.end();
	});
});


app.listen(8010);


