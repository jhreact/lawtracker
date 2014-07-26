var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');

// set up express
var app = express();
app.use(bodyParser.json());
app.use(express.static(__dirname + "/../client"))


require('./config/middleware.js')(app, express);
module.exports = app;

var port = process.env.PORT || 3000;
var server = app.listen(port, function(req, res) {
  console.log('listening on port %d', server.address().port);
});
