homedash.controller('HomeCtrl', [
'$scope',
'charts',
'monthlyGenYear',
'dailyGenHour',
'hourlyVsHistorical',

function($scope, charts, monthlyGenYear, dailyGenHour, hourlyVsHistorical) {
  $scope.mgyChartConfig = monthlyGenYear;
  $scope.heatChartConfig = dailyGenHour;
  $scope.hvhChartConfig = hourlyVsHistorical;
}]);
