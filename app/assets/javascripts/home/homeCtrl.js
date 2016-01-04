homedash.controller('HomeCtrl', [
'$scope',
'$interval',
'charts',
'registerName',
'monthlyByYear',
'hourlyPastYear',
'hourlyVsHistorical',
'ytdByYear',
'daily',
'currentWatts',
'dailyWattHourHistogram',

function($scope, $interval, charts, registerName,
         monthlyByYear,
         hourlyPastYear, hourlyVsHistorical, ytdByYear,
         daily, currentWatts, dailyWattHourHistogram) {
  $scope.myChartConfig = monthlyByYear;
  $scope.hpyChartConfig = hourlyPastYear;
  $scope.hvhChartConfig = hourlyVsHistorical;
  $scope.ytdChartConfig = ytdByYear;
  $scope.dailyChartConfig = daily;
  $scope.currWChartConfig = currentWatts;
  $scope.dailyWattHourChartConfig = dailyWattHourHistogram;
  $scope.intervals = [];

  var callChartPromise = function(chartName, register, chartConfig) {
    var promise ;
    switch(chartName) {
      case 'hvh':
        promise = charts.getHourlyVsHistorical(register);
        break;
      case 'currentWatts':
        promise = charts.getCurrentWatts(register);
        break;
      default:
        return;
    };
    promise.then(function(data) {
      if ( typeof chartConfig.options.plotOptions.series === "undefined" ) {
        chartConfig.options.plotOptions.series = {};
      };
      chartConfig.options.plotOptions.series.animation = false;
      for ( var i in data.series ) {
        chartConfig.series[i].data = data.series[i].data;
      };
      chartConfig.options.plotOptions.series.animation = true;
    });
  };

  $scope.intervals.push($interval(callChartPromise,
                        15000, 0, true, 'hvh', registerName,
                        $scope.hvhChartConfig));
  $scope.intervals.push($interval(callChartPromise,
                        15000, 0, true, 'currentWatts',
                        registerName, $scope.currWChartConfig));

  $scope.$on("$destroy", function() {
    for ( i in $scope.intervals ) {
      $interval.cancel($scope.intervals[i]);
    }
  });
}]);


