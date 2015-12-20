homedash.controller('HomeCtrl', ['$scope', 'charts',
function($scope, monthlyGenYear) {
  $scope.test = 'Hello, world!';

  $scope.chartConfig = {
      options: {
          chart: { type: 'bar' },
          xAxis: {
            categories: monthlyGenYear.chart.categories
          }
      },
      series: monthlyGenYear.chart.series,
      title: { text: 'Monthly Solar Generation By Year' },
      loading: false
  }

  console.log($scope.chartConfig);
}]);
