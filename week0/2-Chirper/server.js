var http = require('http'),
  _ = require('underscore'),
  fs = require('fs'),
  routing = {
    "/all_chirps GET": getAllChirps,
    "/all_users GET": getAllUsers,
    "/chirp POST": createChirp,
    "/chirp DELETE": deleteChirp,
    "/my_chirps POST": getMyChirps,
    "/register POST": registerUser
  },
  db = {
    users: [],
    chirps: []
  };

http.createServer(function (req, res) {
  var body = "";
  if (req.method !== "GET") {
    req.on('data', function (chunk) {
      if (chunk) {
        body += chunk;
      }
    });
    req.on('end', function () {
      routing[req.url + " " + req.method](JSON.parse(body), function (err, data) {
        if (err) {
        } else {
          res.writeHead(200, {'Content-Type': 'application/json'});
          res.write(JSON.stringify(data));
          res.end();
        }
      });
    });

  } else {
    routing[req.url](function (err, data) {
      if (err) {
      } else {
        res.writeHead(200, {'Content-Type': "application/json"});
        res.write(JSON.stringify(data));
        res.end();
      }
    });
  }
}).listen(8080);

function createChirp (data, callback) {
  var chirp;

  if (findUser(data.config.user) >= 0) {
    chirp = {
      "userId": db.users[findUser(data.config.user)].userId,
      "chirpId": db.chirps.length,
      "chirpText": data.args.message
    };

    db.chirps.push(chirp);

    callback(null, {
      "chirpId": db.chirps.length - 1
    });
  } else {
    callback("User not found");
  }
}

function deleteChirp(data, callback) {
  db.chirps.splice(_.indexOf(db.chirps, _.findWhere(db.chirps, { chirpId: data.args.chirpid })));
  console.log(db.chirps);
  callback(null, {});
}

function getAllChirps (callback) {
  callback(null, db.chirps);
}

function getAllUsers (callback) {
  callback(null, db.users);
}

function getMyChirps(data, callback) {
  var result;

  if (findUser(data.config.user) >= 0) {
    result = _.where(db.chirps, { userId: db.users[findUser(data.config.user)].userId});

    callback(null, result);
  } else {
    callback("User not found");
  }
}

function registerUser (data, callback) {
  var userIndex = findUser(data.args.user),
      user;
  
  if (userIndex < 0) {
    user = {
      "user": data.args.user,
      "key": "" + db.users.length,
      "userId": db.users.length,
      "chirps": 0
    };
    db.users.push(user);
  } else {
    user = db.users[userIndex];
  }

  console.log(user);

  callback(null, {
    user: user.user,
    key: user.key
  });
}

function findUser(username) {
  var i;

  for (i = 0; i < db.users.length; i++) {
    if (db.users[i].user === username) {
      return i;
    }
  }

  return -1;
}