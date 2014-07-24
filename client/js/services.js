angular.module('lawtracker.services', [])
.factory('GitLab', function($q, $http){
  var APIURL = 'http://bitnami-gitlab-b76b.cloudapp.net/api/v3';
  var user = {}; // closure scope for future access

  var signin = function (user) {
    console.log('in service: ', user);
    return $http.post(APIURL + '/session', user)
    .then(function (resp) {
      user = resp.data;
      $http.defaults.headers.common['PRIVATE-TOKEN'] = resp.data.private_token; 
      return resp.data.private_token;
    });
  };

  var signup = function (user) {
    console.log(user)
    return $http.post('/api/user/new', user)
    .then(function (newUser) {
      console.log(newUser)
      return signin({email: newUser.email, password: user.password}); //sign in the user with new details
    });
  };

  
  var getAllBills = function(cb){
    return $http.get(APIURL + '/projects')
    .then(function(resp) {
      return resp.data;
    });
  }

  var getContributionsForBillId = function(billId) {
    return $http.get(APIURL + '/projects/' + billId + '/repository/commits')
    .then(function(resp) {
      return resp.data;
    })
  }

  return {
    signin: signin,
    signup: signup,
    getAllBills: getAllBills,
    getContributionsForBillId: getContributionsForBillId
  }
});
