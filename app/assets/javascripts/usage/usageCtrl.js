homedash.controller('UsageCtrl', [
'$scope',
'charts',
'monthlyUsageYear',
'hourlyUsagePastYear',

function($scope, charts, monthlyUsageYear, hourlyUsagePastYear) {
console.log(monthlyUsageYear);
  $scope.muyChartConfig = monthlyUsageYear;
  $scope.hupyChartConfig = hourlyUsagePastYear;
}]);
