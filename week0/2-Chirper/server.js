var http = require('http'),
  fs = require('fs'),
  pandaCounter = 0,
  routing = {
    "/all_chirps": getAllChirps,
    "/register": registerUser
  },
  data = {
    users: [],
    chirps: []
  };

http.createServer(function (req, res) {
  console.log(req);
  routing[req.url](function (err, data) {
    if (err) {
    } else {
      res.writeHead(200, {'Content-Type': "application/json"});
      res.write(data);
      res.end();
    }
  });
}).listen(8080);

function getAllChirps (callback) {
  callback(null, JSON.stringify(data.chirps));
}

function registerUser () {
  callback(null, " ???" );
}