homedash.controller('HomeCtrl', [
'$scope',
'$interval',
'charts',
'registerName',

function($scope, $interval, charts, registerName) {
  var intervals = [];

  var callChartPromise = function(chartName, register) {
    var promise ;
    switch(chartName) {
      case 'hvh':
        promise = charts.getHourlyVsHistorical(register);
        break;
      case 'currentWatts':
        promise = charts.getCurrentWatts(register);
        break;
      case 'monthlyByYear':
        promise = charts.getMonthlyByYear(register);
        break;
      case 'hourlyPastYear':
        promise = charts.getHourlyPastYear(register);
        break;
      case 'ytdByYear':
        promise = charts.getYtdByYear(register);
        break;
      case 'daily':
        promise = charts.getDaily(register);
        break;
      case 'dailyWhHistogram':
        promise = charts.getDailyWattHourHistogram(register);
        break;
      default:
        return;
    };
    return promise.then(function(data) {
      switch(chartName) {
        case 'hvh':
          chartConfig = $scope.hvhChartConfig;
          break;
        case 'currentWatts':
          chartConfig = $scope.currWChartConfig;
          break;
        case 'monthlyByYear':
          chartConfig = $scope.myChartConfig;
          break;
        case 'hourlyPastYear':
          chartConfig = $scope.hpyChartConfig;
          break;
        case 'ytdByYear':
          chartConfig = $scope.ytdChartConfig;
          break;
        case 'daily':
          chartConfig = $scope.dailyChartConfig;
          break;
        case 'dailyWhHistogram':
          chartConfig = $scope.dailyWattHourChartConfig;
          break;
        default:
          return false;
      };

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

  // load the charts once
  charts.getDailyWattHourHistogram(registerName).then(function(data) { $scope.dailyWattHourChartConfig = data; });
  charts.getDaily(registerName).then(function(data) { $scope.dailyChartConfig = data; });
  charts.getYtdByYear(registerName).then(function(data) { $scope.ytdChartConfig = data; });
  charts.getHourlyPastYear(registerName).then(function(data) { $scope.hpyChartConfig = data; });
  charts.getMonthlyByYear(registerName).then(function(data) { $scope.myChartConfig = data; });
  charts.getHourlyVsHistorical(registerName).then(function(data) { $scope.hvhChartConfig = data; });
  charts.getCurrentWatts(registerName).then(function(data) { $scope.currWChartConfig = data; });

  // set intervals for the charts
  intervals.push($interval(callChartPromise, 60*60*1000, 0, true, 'dailyWhHistogram', registerName));
  intervals.push($interval(callChartPromise, 60*60*1000, 0, true, 'daily', registerName));
  intervals.push($interval(callChartPromise, 60*60*1000, 0, true, 'hourlyPastYear', registerName));
  intervals.push($interval(callChartPromise, 60*60*1000, 0, true, 'monthlyByYear', registerName));
  intervals.push($interval(callChartPromise, 60*1000, 0, true, 'hvh', registerName));
  intervals.push($interval(callChartPromise, 60*1000, 0, true, 'currentWatts', registerName));

  // destroy all the intervals from above so we don't
  // keep them around beyond the life of the controller
  $scope.$on("$destroy", function() {
    for ( var i in intervals ) {
      $interval.cancel(intervals[i]);
    }
  });
}]);


