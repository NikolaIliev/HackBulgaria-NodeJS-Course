module.exports = {
	existsById: function (articles, id) { //TODO: Move to utils module
		return articles.some(function (article) {
			return article.id === id;
		});
	},
	getById: function (articles, id) {
		return articles.filter(function (article) {
			return article.id === id;
		})[0];
	},
	isMatchingArticle: function (article, subscriber) {
		return subscriber.keywords.some(function (keyword) {
			return article.title && (subscriber.type.indexOf(article.type)) >= 0 &&  article.title.split(" ").some(function (titleWord) {
				return titleWord.toLowerCase() === keyword.toLowerCase();
			});
		});
	},
	initStorage: function (storage) {
		storage.initSync({
			dir: "../../../persist",
			stringify: function (obj) {
				return JSON.stringify(obj, null, 4);
			}
		});
	},

	sendEmail: function (options) {
		var mailOptions = {
			from: 'node.js.mail.testing@gmail.com', // sender address
			to: options.email, // list of receivers
			subject: options.subject, //'Your new batch of articles!', // Subject line
			html: options.text // plaintext body
		};
		transporter.sendMail(mailOptions, function(error, info){
			if (error) {
				console.log(error);
			} else {
				console.log('Message sent: ' + info.response);
			}
		});
	}
};