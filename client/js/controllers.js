angular.module('lawtracker.controllers', [
  'lawtracker.services',
  // 'hljs'
])

.controller('AuthController', function ($scope, $location, $http, GitLab) {
  $scope.user = {};
  $scope.newUser = {};

  $scope.signin = function () {
    console.log('called in view', $scope.user)
    GitLab.signin($scope.user)
      .then(function (token) {
        $location.path('/dashboard');
      })
  };


  $scope.signup = function () {
    // this input checking should be done in the view (with angular)
    if ($scope.newUser.password === $scope.newUser.confirmPassword && $scope.newUser.password.length >= 6) {

      $scope.newUser.username = $scope.newUser.name // git lab username will be person's name
      delete $scope.newUser.confirmPassword;

      GitLab.signup($scope.newUser)
        .then(function (token) {
          $location.path('/dashboard');
        })
        .catch(function (error) {
          console.error(error); //todo: clear forms
        });
      
    }
  };
})
.controller('DashController', function ($scope, $http, $routeParams, GitLab) {
  GitLab.getAllBills()
  .then(function(bills) {
    console.log(bills)
    $scope.userBills = bills;
    return bills[0].id
  })
  .then(function(firstBillId) {
    $scope.billIdForContributions =  firstBillId;

    GitLab.getContributionsForBillId(firstBillId)
    .then(function(contributions) {
      $scope.userContributions = contributions;
    })
  })
})
.controller('BillDetailController', function($scope, $http, $routeParams, GitLab) {

  GitLab.getBillById($routeParams.billId)
  .then(function(bill){
    $scope.bill = bill;
  })

  GitLab.getBillCommitTree($routeParams.billId)
  .then(function(commitTree){
    var latestCommitId = commitTree[0].id
    GitLab.getRawLatestCommitData($routeParams.billId, latestCommitId)
    .then(function(rawBillData) {
      $scope.bill.content = rawBillData;  
    })
  })
})
.controller('BillRevisionsController', function($scope, $http, $routeParams, GitLab) {
  GitLab.getAllRevisions($routeParams.billId)
  .then(function(revisions) {
    $scope.revisions = revisions;
  })
})
.controller('ViewRevisionController', function($scope, $http, $routeParams, GitLab) {
    $scope.bill = {id: $routeParams.billId};
    $http.get(APIURL + '/projects/' + $routeParams.billId + '/repository/commits/' + $routeParams.sha + '/diff').success(function(data) {
      $scope.bill.diff = data[0].diff;
    })
    .error(function(err) {
      console.log(err)
    });

    // get the file path
    $http.get(APIURL + '/projects/' + $routeParams.billId + '/repository/tree').success(function(file_path_data) {
      // now look up the raw file content for that sha
      $http.get(APIURL + '/projects/' + $routeParams.billId + '/repository/blobs/' + $routeParams.sha + "&filepath=" + file_path_data[0].name).success(function(revision_content) {
        $scope.bill.content = revision_content;
      })
      .error(function(content_err) {
        console.log(content_err)
      });
    })
    .error(function(revision_content_err) {
      console.log("Error retrieving file content for revision");
      console.log(revision_content_err);
    });

})
.controller('CreateBillController', function($scope, $http, $routeParams, Repository, GitLab) {
    $scope.bill = {};
    // Hardcode this for now...once we get login working we should know who
    // the user is and be able to access info via the api endpoint
    $scope.user = {username: 'user', id: 1};
    // we'll take the filename from the form, sanitize it, and use it for
    // creating the repo

    $scope.master = $scope.bill;

    $scope.create = function(bill) {
      $scope.master = angular.copy(bill);
      Repository.createRepository($scope.user, $scope.bill.filename);
    };

    $scope.reset = function() {
      $scope.bill = angular.copy($scope.master);
    };

    $scope.reset();

})
.controller('EditBillController', function($scope, $http, $routeParams, GitLab) {
    $scope.bill = {};
    // Hardcode this for now...once we get login working we should know who
    // the user is and be able to access info via the api endpoint
    $scope.user = {username: 'user', id: 1};
    $http.get(APIURL + '/projects/' + $routeParams.billId).success(function(data) {
      // console.log(data);
      $scope.bill.id = data.id;
      $scope.bill.description = data.description;
    })
    .error(function(err) {
      console.log(err)
    });

    $http.get(APIURL + '/projects/' + $routeParams.billId + '/repository/tree').success(function(data) {
      var repoTree = data;
      var repoSha = data[0].id;
      $scope.bill.fileName = data[0].name;

      $http.get(APIURL + '/projects/' + $routeParams.billId + '/repository/raw_blobs/' + repoSha).success(function(data) {
        $scope.bill.content = data;
      })
      .error(function(err) {
        console.log(err)
      });
    })
    .error(function(err) {
      console.log(err)
    });

    $scope.master = $scope.bill;

    $scope.update = function(bill) {
      var file_path, branch_name, content, commit_message;
      var commitMsg = bill.commitMsg || "Updated at " + Date.now();

      $http.put(APIURL + '/projects/' + bill.id + '/repository/files', {'id': $scope.bill.id, 'content': $scope.bill.content, 'file_path': $scope.bill.fileName, 'branch_name': 'master', 'commit_message': commitMsg}).success(function(data) {
        console.log("here's what we got back after trying to edit the file via the web api");
        console.log(data);

      $scope.master = angular.copy(bill);
      }).error(function(err) {
        console.log("got an error when trying to update the bill");
        console.log(err);
      });
    };

    $scope.reset = function() {
      $scope.bill = angular.copy($scope.master);
    };

});
