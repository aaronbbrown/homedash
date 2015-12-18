var homedash = angular.module('homeDash', ['ui.router', 'templates', 'highcharts-ng'])
.config([ '$stateProvider', '$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('home', {
          url: '/home',
          templateUrl: 'home/_home.html',
          controller: 'HomeCtrl'
        });

  $urlRouterProvider.otherwise('/home');
}
]);
