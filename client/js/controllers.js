angular.module('lawtracker.controllers', [
  'lawtracker.services',
  // 'hljs'
])

.controller('AuthController', function ($scope, $location, $http, GitLab) {
  $scope.user = {};
  $scope.newUser = {};
  $scope.viewBackground = "background-capitol";

  $scope.signin = function () {
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
  GitLab.getUserAuthenticated().
  then(function(user){
    $scope.username = user.username;
    console.log(user.username, "This is the authenticated user");
    console.log($scope.username, "This is the user in the scope")
  })
  GitLab.getAllUsers()
  .then(function(users){
    console.log(users, "these are the users in the dash controller");
    $scope.users = users;
    console.log("This should be user", users[0].username);
    // return users[0].id;
  })
  GitLab.getAllBills()
  .then(function(bills) {
    console.log(bills, "this is the bills object");
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
.controller('CreateBillController', function($scope, $http, $routeParams, GitLab) {
  $scope.bill = {};
  // Hardcode this for now...once we get login working we should know who
  // the user is and be able to access info via the api endpoint
  $scope.user = {username: 'user', id: 1};

  $scope.master = $scope.bill;

  $scope.create = function(bill) {
    var sanitizedName = $scope.bill.filename.replace(' ', '-');

    GitLab.createBill(sanitizedName, $scope.bill.description, $scope.bill.content)
    .then(function(billData) {
      $scope.bill = billData;
    });
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
      $scope.master = angular.copy(bill);
    })
  };

  $scope.reset = function() {
    $scope.bill = angular.copy($scope.master);
  };

});
