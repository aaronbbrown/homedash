homedash.controller('UsageCtrl', [
'$scope',
'$interval',
'charts',
'monthlyUsageYear',
'hourlyUsagePastYear',
'hourlyVsHistorical',

function($scope, $interval, charts, monthlyUsageYear, hourlyUsagePastYear, hourlyVsHistorical) {
  $scope.muyChartConfig = monthlyUsageYear;
  $scope.hupyChartConfig = hourlyUsagePastYear;
  $scope.hvhChartConfig = hourlyVsHistorical;

  var callHourlyVsHistorical = function() {
    var promise = charts.getHourlyVsHistorical('use');
    promise.then(function(data) {
      if ( typeof $scope.hvhChartConfig.options.plotOptions.series === "undefined" ) {
        $scope.hvhChartConfig.options.plotOptions.series = {};
      };
      $scope.hvhChartConfig.options.plotOptions.series.animation = false;
      for ( var i in data.series ) {
        $scope.hvhChartConfig.series[i].data = data.series[i].data;
      };
      $scope.hvhChartConfig.options.plotOptions.series.animation = true;
    });
  };

  $interval(callHourlyVsHistorical, 15000);

}]);
