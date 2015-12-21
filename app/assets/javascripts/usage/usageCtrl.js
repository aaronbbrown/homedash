homedash.controller('UsageCtrl', [
'$scope',
'charts',
'monthlyUsageYear',
'hourlyUsagePastYear',
'hourlyVsHistorical',

function($scope, charts, monthlyUsageYear, hourlyUsagePastYear, hourlyVsHistorical) {
  $scope.muyChartConfig = monthlyUsageYear;
  $scope.hupyChartConfig = hourlyUsagePastYear;
  $scope.hvhChartConfig = hourlyVsHistorical;
}]);
