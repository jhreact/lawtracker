angular.module('lawtracker.services', [])

.factory('Repository', function($http) {
  var createRepository = function(user, repoName) {
    return $http({
      method: 'POST',
      url: '/api/repositories/create',
      data: JSON.stringify({user: user, repositoryName: repoName})
    });
  };

  var getRepositories = function() {
    // stub
  };

  return {
    createRepository: createRepository
  };
})
.factory('GitLab', function($http){
  var APIURL = 'http://bitnami-gitlab-b76b.cloudapp.net/api/v3'

  var signin = function (user) {
    console.log(user);
    return $http({
      method: 'POST',
      url: APIURL + '/session', 
      data: user
    })
    .then(function (resp) {
      return resp.data.private_token;
    });
  };

  var signup = function (user) {
    console.log(user)
    return $http({
      method: 'POST',
      url: '/api/user/new',
      data: user
    })
    .success(function (resp) {
      return signin({email: resp.data.email, password: user.password}); //sign in the user with new details
    })
    .error(function (e){
      throw e; //todo: clear forms
    });
  };

  
  var getAllBills = function(cb){
    $http({
      method: 'GET',
      url: APIURL + '/projects'
    }).success(function(bills) {
      cb(bills);
    });
  }

  var getContributionsForBillId = function(billId, cb) {
    console.log('getting commits')
    $http({
      method: 'GET',
      url: APIURL + '/projects/' + billId + '/repository/commits'
    }).success(function(commits) {
      console.log(commits)
      cb(commits, billId);
    });
  }

  return {
    signin: signin,
    signup: signup,
    getAllBills: getAllBills,
    getContributionsForBillId: getContributionsForBillId
  }
});
