var express = require ('express'),
    bodyParser = require('body-parser'),
    localStorage = require('node-persist'),
    rand = require('generate-key'),
    nodemailer = require('nodemailer'),
    smtpTransport = require('nodemailer-smtp-transport'),
    transporter = nodemailer.createTransport(smtpTransport({
        host: "smtp.googlemail.com",
        port: 465,
        secure: true,
        auth: {
                user: 'node.js.mail.testing@gmail.com',
                pass: 'node1234'
        }
    }));
    app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

localStorage.initSync({
  dir: "../../../persist",
  stringify: function (obj) {
    return JSON.stringify(obj, null, 4);
  }
});

function validSubscription(data) {
    var subscribers = localStorage.getItem("subscribers.json") || [];

    return !subscribers.some(function (subscriber) {
            return subscriber.email === data.email && (subscriber.keywords.every(function (keyword) {
                return data.keywords.some(function (dataKeyword) {
                    return dataKeyword === keyword;
                });
            }));
        });
}

function sendVerificationEmail(subscriber) {
    var verificationLink = "http://localhost:8000/verify/" + encodeURIComponent(subscriber.email) + "?verificationId=" + subscriber.verificationId,
        mailOptions = {
            from: 'node.js.mail.testing@gmail.com', // sender address
            to: subscriber.email, // list of receivers
            subject: 'Please verify your subscription', // Subject line
            html: "You subscribed for hacker news articles! Click the link below to verify your subscription or you won't receive any articles."
                + "If you did not subscribe to our service, feel free to ignore this e-mail!<hr><b>Verification link:</b><a href='" + verificationLink + "'>Click here</a>" // plaintext body
        };
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
        } else {
            console.log('Message sent: ' + info.response);
        }
    });
}

app.post('/subscribe', function (req, res) {
    var subscribers = localStorage.getItem("subscribers.json") || [],
        subscriberId = subscribers.length + 1,
        newSubscriber;

    if (validSubscription(req.body)) {
        newSubscriber = {
            subscriberId: subscriberId,
            email: req.body.email,
            keywords: req.body.keywords,
            type: req.body.type,
            verificationId: rand.generateKey(),
            verified: false
        };
        subscribers.push(newSubscriber);

        localStorage.setItem("subscribers.json", subscribers);

        res.json({
            "subscriberId": subscriberId,
            "email": req.body.email
        });

        sendVerificationEmail(newSubscriber);
    } else {
        res.status(409);
        res.json({
            "Error": "Invalid subscription"
        });
    }
});

app.post('/unsubscribe', function (req, res) {
    var subscribers = localStorage.getItem("subscribers.json");

    subscribers.forEach(function (subscriber, index) {
        if (subscriber.subscriberId === req.body.subscriberId) {
            subscribers.splice(index, 1);
        }
    });

    localStorage.setItem("subscribers.json", subscribers);
    res.end();
});

app.get('/verify/:email', function (req, res) {
    var subscribers = localStorage.getItem("subscribers.json");

    subscribers.forEach(function (subscriber) {
        if (subscriber.email === decodeURIComponent(req.param("email")) && subscriber.verificationId === req.param("verificationId")) {
            subscriber.verified = true;
            res.end("Subscription verified");
        }
    });

    res.end("Something went wrong :(");

    localStorage.setItem("subscribers.json", subscribers);
});

app.get('/list_subscribers', function (req, res) {
  res.json(localStorage.getItem("subscribers.json"));
});


app.listen(8000);
