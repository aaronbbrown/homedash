homedash.controller('HomeCtrl', [
'$scope',
'charts',
'monthlyGenYear',
'dailyGenHour',

function($scope, charts, monthlyGenYear, dailyGenHour) {
  $scope.test = 'Hello, world!';

  $scope.mgyChartConfig = {
      options: {
          chart: { type: 'bar' },
          xAxis: {
            categories: monthlyGenYear.categories
          }
      },
      series: monthlyGenYear.series,
      title: { text: 'Monthly Solar Generation By Year' },
      loading: false
  };

  $scope.heatChartConfig = {
    options: {
      chart: {
        type: 'heatmap',
        margin: [60, 10, 80, 50]
      },
      title: {
        text: 'Hourly Solar Generation'
      },
      xAxis: {
        type: 'datetime',
        min: Date.UTC(2014, 12, 19),
        max: Date.UTC(2015, 12, 19),
        labels: {
          align: 'left',
          x: 5,
          y: 14,
          format: '{value:%B}' // long month
        },
        showLastLabel: false,
        tickLength: 16
      },

      yAxis: {
        title: {
            text: null
        },
        labels: {
          format: '{value}:00'
        },
        minPadding: 0,
        maxPadding: 0,
        startOnTick: false,
        endOnTick: false,
        tickPositions: [0, 6, 12, 18, 24],
        tickWidth: 1,
        min: 5,
        max: 21,
        reversed: true
      },
      colorAxis: {
        stops: [
            [0, '#3060cf'],
            [0.2, '#fffbbc'],
            [0.9, '#c4463a'],
            [1, '#c4463a']
        ],
        min: 0,
        max: 4000,
        startOnTick: false,
        endOnTick: false,
        labels: {
          format: '{value} Wh',
          rotation: -30
        }
      },
    },
    series: [{
      data: dailyGenHour.series.data,
      nullColor: '#3060cf',
      tooltip: {
        headerFormat: 'Solar Wh<br/>',
        pointFormat: '{point.x:%e %b, %Y} {point.y}:00: <b>{point.value} Wh</b>'
      },
      borderWidth: 0,
      colsize: 24 * 36e5 // possible daylight hours
    }]

  }
}]);
