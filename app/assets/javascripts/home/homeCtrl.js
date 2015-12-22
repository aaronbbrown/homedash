homedash.controller('HomeCtrl', [
'$scope',
'$interval',
'charts',
'monthlyGenYear',
'dailyGenHour',
'hourlyVsHistorical',

function($scope, $interval, charts, monthlyGenYear, dailyGenHour, hourlyVsHistorical) {
  $scope.mgyChartConfig = monthlyGenYear;
  $scope.heatChartConfig = dailyGenHour;
  $scope.hvhChartConfig = hourlyVsHistorical;

  var callHourlyVsHistorical = function() {
    var promise = charts.getHourlyVsHistorical('gen');
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


