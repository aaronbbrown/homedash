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
        monthlyGenYear: ['charts', function(charts) {
          return charts.getMonthlyGenYear();
        }],

        dailyGenHour: ['charts', function(charts) {
          return charts.getDailyGenHour();
        }]
      }
    });

  $urlRouterProvider.otherwise('/home');
}
]);
