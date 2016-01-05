var homedash = angular.module('homeDash', [
'ui.router',
'templates',
'highcharts-ng'])
.config([ '$stateProvider', '$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: 'home/_home.html',
      controller: 'HomeCtrl',
      resolve: {
        registerName: function() { return 'gen'; }
      }

    }).state('usage', {
      url: '/usage',
      templateUrl: 'home/_home.html',
      controller: 'HomeCtrl',
      resolve: {
        registerName: function() { return 'use'; }
      }
    });


  $urlRouterProvider.otherwise('/home');
}
]);
