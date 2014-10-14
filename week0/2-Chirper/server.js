var http = require('http'),
  fs = require('fs'),
  pandaCounter = 0,
  routing = {
    "/all_chirps": getAllChirps,
    "/register": registerUser
  };

http.createServer(function (req, res) {
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
  fs.readFile("db.json", function (err, data) {
      if (err) {
        console.error(err); 
        callback(err, null);
      } else {
        callback(null, JSON.stringify(JSON.parse(data.toString()).chirps, null, 4));
      }
  })
}