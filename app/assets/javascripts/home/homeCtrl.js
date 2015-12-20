homedash.controller('HomeCtrl', [
'$scope',
'charts',
'monthlyGenYear',
'dailyGenHour',

function($scope, charts, monthlyGenYear, dailyGenHour) {
console.log(monthlyGenYear);
  $scope.mgyChartConfig = monthlyGenYear;
  $scope.heatChartConfig = dailyGenHour;
}]);
