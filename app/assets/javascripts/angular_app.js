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
        hourlyGenPastYear: ['charts', function(charts) {
          return charts.getHourlyPastYear('gen');
        }],
        hourlyVsHistorical: ['charts', function(charts) {
          return charts.getHourlyVsHistorical('gen');
        }],
        ytdByYear: ['charts', function(charts) {
          return charts.getYtdByYear('gen');
        }]
      }

    }).state('usage', {
      url: '/usage',
      templateUrl: 'home/_home.html',
      controller: 'UsageCtrl',
      resolve: {
        monthlyUsageYear: ['charts', function(charts) {
          return charts.getMonthlyByYear('use');
        }],
        hourlyUsagePastYear: ['charts', function(charts) {
          return charts.getHourlyPastYear('use');
        }],
        hourlyVsHistorical: ['charts', function(charts) {
          return charts.getHourlyVsHistorical('use');
        }],
        ytdByYear: ['charts', function(charts) {
          return charts.getYtdByYear('use');
        }]

      }
    });


  $urlRouterProvider.otherwise('/home');
}
]);
