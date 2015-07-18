angular.module('routes', []).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $routeProvider
    // home page
    .when('/admin', {
      templateUrl: 'views/Admin.html'
    })
    .when('/admin/products', {
      templateUrl: 'views/Product.html',
      controller: 'ProductController'
    });
    $locationProvider.html5Mode(true);
}]);