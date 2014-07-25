var fs = require('fs');
var helpers = require('../config/helpers.js');
// var exec = require('async').exec;
var path = require('path');
var shell = require('shelljs/global');

// TODO: We should be able to read all of this stuff from the environment
// for now...make it work


// var gitlab = require('node-gitlab');
// var gitlabClient = gitlab.create({
//   api: 'http://bitnami-gitlab-b76b.cloudapp.net/api/v3',
//   privateToken: 'AGrAjazL79tTNqJLeABp'
// });

module.exports = {
  create: function (req, res, next) {
    // https://github.com/arturadib/shelljs
    /* if we're going to create a repo on the filesystem, we need to:
      * (where projectname is sanitized)
      * mkdir repositories/<username>/<projectname>
      * cd repositories/<username>/<projectname>
      * fs.writeFile(<projectname>)
      * git init
      * git add <projectname>
      * git commit -m "<commit message>"
      * git remote add origin git@<host>:<username>/<projectname>.git
      * git push -u origin master
      */

    // console.log('reposistory body');
    // console.log(req.body);
    var username = req.body.username;
    var filePath = req.body.file_path;
    var fileContent = req.body.content;
    var repoOrigin = req.body.origin;
    var tmpdir = tempdir();
    // var tempUserDir = TEMPREPODIR + '/' + username;
    // var tempUserRepoDir = tempUserDir + '/' + filePath;
    var tempUserRepoDir = tmpdir + '/' + username + '/' + filePath;

    var commitMsg = req.body.commit_message;

    mkdir('-p', tempUserRepoDir);
    var userFile = tempUserRepoDir + '/' + filePath;
    fileContent.to(userFile);
    // console.log(ls('-lrt', userFile));
    cd(tempUserRepoDir);
    console.log("Attmpting to exec git init");
    if (exec('git init .', {async: false}).code !== 0) {
      console.log("Error: git init of " + tempUserRepoDir + " failed");
    }
    console.log("Attmpting to stage files for commit");
    if (exec('git add .', {async: false}).code !== 0) {
      console.log("Error: git add failed in " + tempUserRepoDir);
    }
    console.log("Attmpting to git commit files");
    if (exec('git commit -m "' + commitMsg + '"', {async: false}).code !== 0) {
      console.log("Error: git commit failed in " + tempUserRepoDir);
    }
    console.log("Attmpting to update remote to passed in origin");
    if (exec('git remote add origin ' + repoOrigin, {async: false}).code !== 0) {
      console.log("Error: failed to add remote git origin for project in " + tempUserRepoDir);
    }
    console.log("Attempting to push to remote ");
    if (exec('git push -u origin master', {async: false}).code !== 0) {
      console.log("Error: failed to push to new project master ");
    }

      // var initRepoCmdList = [
      //   ('cd ' + tempUserRepoDir, tempUserRepoDir),
      //   ('git init', tempUserRepoDir),
      //   ('git add .', tempUserRepoDir),
      //   ('git commit -m "' + commitMsg + '"', tempUserRepoDir),
      //   ('git remote add origin ' + repoOrigin, tempUserRepoDir),
      //   ('git push -u origin master', tempUserRepoDir)
      // ];
      // helpers.execSync(initRepoCmdList);
    // });
  },
  test: function (req, res, next) {
    console.log('Testing, testing, 1, 2, 3...');
  }

};
