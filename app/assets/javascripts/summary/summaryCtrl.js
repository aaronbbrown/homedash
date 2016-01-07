homedash.controller('SummaryCtrl', [
'$scope',
'$interval',
'charts',

function($scope, $interval, charts) {
  var intervals = [];

  var callChartPromise = function(chartName) {
    var promise ;
    switch(chartName) {
    default:
      return;
    };
    return promise.then(function(data) {
      switch(chartName) {
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
  charts.getPercentGenLastYear().then(function(data) { $scope.percentGenCC = data; });

  // set intervals for the charts
  // intervals.push($interval(callChartPromise, 60*60*1000, 0, true, 'dailyWhHistogram', registerName));

  // destroy all the intervals from above so we don't
  // keep them around beyond the life of the controller
  $scope.$on("$destroy", function() {
    for ( var i in intervals ) {
      $interval.cancel(intervals[i]);
    }
  });
}]);


