angular.module('lawtracker.services', [])
.factory('GitLab', function($http){
  var APIURL = 'http://bitnami-gitlab-b76b.cloudapp.net/api/v3';

  // REMOVE IN PROD
  // var ADMIN = 'AGrAjazL79tTNqJLeABp';
  // $http.defaults.headers.common['PRIVATE-TOKEN'] = ADMIN;
  // /REMOVE IN PROD


  var user = {}; // closure scope for future access

  var signin = function (user) {
    return $http.post(APIURL + '/session', user)
    .then(function (resp) {
      user = resp.data;
      $http.defaults.headers.common['PRIVATE-TOKEN'] = resp.data.private_token;
      return resp.data.private_token;

    });
  };

  var signup = function (user) {
    return $http.post('/api/user/new', user)
    .then(function (newUser) {
      return signin({email: newUser.email, password: user.password}); //sign in the user with new details
    });
  };


  var getAllBills = function(cb){
    return $http.get(APIURL + '/projects')
    .then(function(resp) {
      return resp.data;
    });
  };

  var getContributionsForBillId = function(billId) {
    return $http.get(APIURL + '/projects/' + billId + '/repository/commits')
    .then(function(resp) {
      return resp.data;
    });
  };

  var getBillById = function(billId){
    return $http.get(APIURL + '/projects/' + billId)
    .then(function(resp) {
      return resp.data;
    })
  };

  var getAllRevisions = function(billId) {
    return $http.get(APIURL + '/projects/' + billId + '/repository/commits')
    .then(function(data) {
      console.log(data)
      return data.data
    })
  }

  var getBillCommitTree = function(billId) {
    return $http.get(APIURL + '/projects/' + billId + '/repository/tree')
    .then(function(commitTree) {
      return commitTree.data;
    })
  }

  var getAllDiffs = function(billId, sha) {
    return $http.get(APIURL + '/projects/' + billId + '/repository/commits/' + sha + '/diff')
    .then(function(diffs){
      return diffs.data;
    })
  }

  var getRawLatestCommitData = function(billId, latestCommitId){
    return $http.get(APIURL + '/projects/' + billId + '/repository/raw_blobs/' + latestCommitId)
    .then(function(billText) {
      return billText.data;
    })

  }

  var getRevisionContent = function(billId, revisionId, fileName) {
    //                                                                                   //todo: make this part better
    return $http.get(APIURL + '/projects/' + billId + '/repository/blobs/' + revisionId + '?filepath=' + fileName)
    .then(function(revisionContent){
      return revisionContent.data;
    })
  }

  var commit = function(billId, fileContent, fileName, commitMsg){
    return $http.put(APIURL + '/projects/' + billId + '/repository/files',
      {'id': billId, 'content': fileContent, 'file_path': fileName, 'branch_name': 'master', 'commit_message': commitMsg}
    ).then(function(resp){
      return resp.data
    })
  };

  var createLocalRepo = function(projectId, filePath, branchName, encoding, fileContent, commitMessage, projectName, username, httpOrigin, sshOrigin) {
    return $http.post('/api/repositories/create', {"id": projectId, "file_path": filePath, "branch_name": branchName, "encoding": encoding, "content": fileContent, "commit_message": commitMessage, "project_name": projectName, "username": username, "http_origin": httpOrigin, "ssh_origin": sshOrigin})
    .then(function(resp) {
      return resp.data;
    });
  };

  var createBill = function(billName, billDescription, billContent) {
    // console.log("Attempting to call createBill");
    return $http.post(APIURL + '/projects', {"name": billName, "description": billDescription} )
    .then(function(resp) {
      var new_project = resp.data;
      console.log(new_project);
      // var commitMsg = bill.commitMsg || "Updated at " + Date.now();
      var commitMsg = "Updated at " + Date.now();

      createLocalRepo(new_project.id, new_project.path, "master", "text", billContent, commitMsg, new_project.path, user.username, new_project.http_url_to_repo, new_project.ssh_url_to_repo)
      .then(function(resp) {
        return resp.data;
      });
    });
  };


  return {
    signin: signin,
    signup: signup,
    getAllBills: getAllBills,
    getContributionsForBillId: getContributionsForBillId,
    getBillById: getBillById,
    getBillCommitTree: getBillCommitTree,
    getRawLatestCommitData: getRawLatestCommitData,
    getAllRevisions: getAllRevisions,
    getAllDiffs: getAllDiffs,
    getRevisionContent: getRevisionContent,
    commit: commit,
    createBill: createBill,
    createLocalRepo: createLocalRepo
  }
});
