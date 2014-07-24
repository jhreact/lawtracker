var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');

// set up express
var app = express();
app.use(bodyParser.json());
app.use(express.static(__dirname + "/../client"))

app.post('/api/user/new', function(req, res){
  // echo request to git lab server with an admin token
  // var newUser = req.body;
  var userString = JSON.stringify(req.body);
  console.log(userString)

  var headers = {
     // 30 lines of code just for this line right here
    'PRIVATE-TOKEN': 'AGrAjazL79tTNqJLeABp', // super secret yo
    'Content-Type': 'application/json',
    'Content-Length': userString.length
  };
  var options = {
    host: 'bitnami-gitlab-b76b.cloudapp.net',
    path: '/api/v3/users',
    method: 'POST',
    headers: headers
  };

  var request = http.request(options, function(response) {
    response.setEncoding('utf-8');
    var responseString = '';

    response.on('data', function(data) {
      responseString += data;
    });
    response.on('end', function() {
      res.send(responseString); //send it back to the client making the user
    });
  });
  request.on('error', function(e) {
    console.log("SIGN UP ERROR ->")
    console.log(e)
  });

  request.write(userString);
  request.end();
})

var port = process.env.PORT || 3000;
var server = app.listen(port, function(req, res) {
  console.log('listening on port %d', server.address().port);
});
