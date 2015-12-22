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
        registerName: function() {
          return 'gen';
        },
        monthlyByYear: ['charts', function(charts) {
          return charts.getMonthlyByYear('gen');
        }],
        hourlyPastYear: ['charts', function(charts) {
          return charts.getHourlyPastYear('gen');
        }],
        hourlyVsHistorical: ['charts', function(charts) {
          return charts.getHourlyVsHistorical('gen');
        }],
        ytdByYear: ['charts', function(charts) {
          return charts.getYtdByYear('gen');
        }],
        daily: ['charts', function(charts) {
          return charts.getDaily('gen');
        }],
        currentWatts: ['charts', function(charts) {
          return charts.getCurrentWatts('gen');
        }]

      }

    }).state('usage', {
      url: '/usage',
      templateUrl: 'home/_home.html',
      controller: 'HomeCtrl',
      resolve: {
        registerName: function() {
          return 'use';
        },
        monthlyByYear: ['charts', function(charts) {
          return charts.getMonthlyByYear('use');
        }],
        hourlyPastYear: ['charts', function(charts) {
          return charts.getHourlyPastYear('use');
        }],
        hourlyVsHistorical: ['charts', function(charts) {
          return charts.getHourlyVsHistorical('use');
        }],
        ytdByYear: ['charts', function(charts) {
          return charts.getYtdByYear('use');
        }],
        daily: ['charts', function(charts) {
          return charts.getDaily('use');
        }],
        currentWatts: ['charts', function(charts) {
          return charts.getCurrentWatts('use');
        }]

      }
    });


  $urlRouterProvider.otherwise('/home');
}
]);
