angular.module('lawtracker', [
  'ngRoute',
  'lawtracker.controllers',
  'hljs'
])
.config(function($routeProvider, $httpProvider) {
  $routeProvider
    .when('/auth', {
      templateUrl: 'partials/auth-view.html',
      controller: 'AuthController'
    })
    .when('/dashboard', {
      templateUrl: 'partials/dashboard-view.html',
      controller: 'DashController'
    })
    .when('/bills/create', {
      templateUrl: 'partials/create-bill.html',
      controller: 'CreateBillController'
    })
    .when('/bills/:billId/edit', {
      templateUrl: 'partials/edit-bill.html',
      controller: 'EditBillController'
    })
    .when('/bills/:billId/revisions/:sha', {
      templateUrl: 'partials/view-revision.html',
      controller: 'ViewRevisionController'
    })
    .when('/bills/:billId/revisions', {
      templateUrl: 'partials/bill-revisions.html',
      controller: 'BillRevisionsController'
    })
    .when('/bills/:billId', {
      templateUrl: 'partials/bill-detail.html',
      controller: 'BillDetailController'
    })
     .when('/about', {
      templateUrl: 'partials/about-view.html',
      controller: 'DashController'
    })
     .when('/help', {
      templateUrl: 'partials/help-view.html',
      controller: 'DashController'
    })
    .otherwise({
      redirectTo: '/auth'
    });
});
