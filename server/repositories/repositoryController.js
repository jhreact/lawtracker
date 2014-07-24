var fs = require('fs');
var gitlab = require('node-gitlab');

module.exports = {
  create: function (req, res, next) {
    console.log('In create reposistory');
    var repositoryName = req.body.repository;
  },
  test: function (req, res, next) {
    console.log('Testing, testing, 1, 2, 3...');
  }

};
