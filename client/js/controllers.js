angular.module('lawtracker.controllers', [
  'lawtracker.services',
  // 'hljs'
])

.controller('AuthController', function ($scope, $location, $http, GitLab) {
  $scope.user = {};
  $scope.newUser = {};
  $scope.viewBackground = "background-capitol";

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

  $scope.bill = {id: $routeParams.billId};
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
  $scope.bill = {id: $routeParams.billId};

  GitLab.getAllRevisions($routeParams.billId)
  .then(function(revisions) {
    $scope.revisions = revisions;
  })
})
.controller('ViewRevisionController', function($scope, $http, $routeParams, GitLab) {
  $scope.bill = {id: $routeParams.billId};
  GitLab.getAllDiffs($routeParams.billId, $routeParams.sha)
  .then(function(diffs) {
    $scope.bill.diff = diffs[0].diff;
  })

  GitLab.getBillCommitTree($routeParams.billId)
  .then(function(commitTree) {
    var currentFileName = commitTree[0].name;
    GitLab.getRevisionContent($routeParams.billId, $routeParams.sha, currentFileName) //??? on the last arg
    .then(function(revisionContent) {
      $scope.bill.content = revisionContent;
    })
  })

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
  $scope.bill = {id: $routeParams.billId};
  GitLab.getBillById($routeParams.billId)
  .then(function(bill){
    $scope.bill = bill;
  })

  GitLab.getBillCommitTree($routeParams.billId)
  .then(function(commitTree){
    var latestCommit = commitTree[0]
    $scope.bill.fileName = latestCommit.name;

    GitLab.getRawLatestCommitData($routeParams.billId, latestCommit.id)
    .then(function(rawBillData) {
      $scope.bill.content = rawBillData;  
    })
  })

  $scope.master = $scope.bill;

  $scope.update = function(bill) {
    var commitMsg = bill.commitMsg || "Updated at " + Date.now();

    GitLab.commit($scope.bill.id, $scope.bill.content, $scope.bill.fileName, commitMsg)
    .then(function(data) {
      console.log("here's what we got back after trying to edit the file via the web api", data);
      $scope.master = angular.copy(bill);
    })
  };

  $scope.reset = function() {
    $scope.bill = angular.copy($scope.master);
  };

});
