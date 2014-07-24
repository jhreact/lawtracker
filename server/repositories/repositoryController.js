var fs = require('fs');
var gitlab = require('node-gitlab');
var gitlabClient = gitlab.create({
  api: 'http://bitnami-gitlab-b76b.cloudapp.net/api/v3',
  privateToken: 'AGrAjazL79tTNqJLeABp'
});

module.exports = {
  create: function (req, res, next) {
    console.log('reposistory body');
    console.log(req.body);

    var repositoryName = req.body.repository;
  },
  test: function (req, res, next) {
    console.log('Testing, testing, 1, 2, 3...');
  }

};
