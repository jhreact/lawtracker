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

.factory('Auth', function ($http, $location, $window) {
  var APIURL = 'http://bitnami-gitlab-b76b.cloudapp.net/api/v3'

  //uses gitLab's built api to authenticate users
  var signin = function (user) {
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
    console.log('in auth service')
    return $http({
      method: 'POST',
      url: APIURL + '/users',
      data: user
    })
    .then(function (resp) {
      console.log(resp);
      return resp.data.private_token;
    });
  };

  var signout = function () {
  };

  return {
    signin: signin,
    signup: signup
    // signout: signout
  };
});
