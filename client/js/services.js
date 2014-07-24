angular.module('lawtracker.services', [])

.factory('Repository', function($http) {
  var createRepository = function(data) {
    return $http({
      method: 'POST',
      url: '/api/repositories/create',
      data: JSON.stringify(data)
    });
  };

  var getRepositories = function() {
    // stub
  };

  return {
    createRepository: createRepository
  };
});

