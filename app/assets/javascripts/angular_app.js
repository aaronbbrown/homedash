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
          return charts.getMonthlyByYear('gen');
        }],

        dailyGenHour: ['charts', function(charts) {
          return charts.getHourlyPastYear('gen');
        }]
      }

    })
    .state('usage', {
      url: '/usage',
      templateUrl: 'usage/_usage.html',
      controller: 'UsageCtrl',
      resolve: {
        monthlyUsageYear: ['charts', function(charts) {
          return charts.getMonthlyByYear('use');
        }],

        hourlyUsagePastYear: ['charts', function(charts) {
          return charts.getHourlyPastYear('use');
        }]

      }
    });


  $urlRouterProvider.otherwise('/home');
}
]);
