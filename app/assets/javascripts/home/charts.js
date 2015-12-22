homedash.factory('charts', [
'$http',
function($http) {
  var o = {
    chart: {}
  };
  var pointWidth = 7;

  function niceNameFromRegister(register) {
    var result = '';
    switch(register) {
    case 'gen':
      result = 'Solar';
      break;
    case 'use':
      result = 'Usage';
      break;
    };
    return result;
  };

  o.getYtdByYear = function(register) {
    var nice_name = niceNameFromRegister(register);
    return $http.get('/statistics/ytd_by_year/'+register+'.json')
             .then(function(res) {
                var chartConfig = {
                  options: {
                    credits: { enabled: false },
                    chart: { type: 'column' },
                    xAxis: {
                      categories: res.data.categories
                    },
                    legend: { enabled: false }
                  },
                  series: res.data.series,
                  title: { text: 'Year-to-date '+nice_name+' by Year' },
                  loading: false
                };

               return chartConfig;
             });
  };

  o.getHourlyVsHistorical = function(register) {
    var nice_name = niceNameFromRegister(register);
    return $http.get('/statistics/hourly_vs_historical/'+register+'.json')
             .then(function(res) {
                var chartConfig = {
                  options: {
                    credits: { enabled: false },
                    chart: { type: 'column' },
                    xAxis: {
                      categories: res.data.categories
                    },
                    plotOptions: {}
                  },
                  series: res.data.series,
                  title: { text: 'Hourly '+nice_name+' vs Historical' },
                  loading: false
                };

               return chartConfig;
             });
  };

  o.getMonthlyByYear = function(register) {
    var nice_name = niceNameFromRegister(register);
    return $http.get('/statistics/monthly_by_year/'+register+'.json')
             .then(function(res) {
                var chartConfig = {
                  options: {
                    credits: { enabled: false },
                    chart: { type: 'column' },
                    xAxis: {
                      categories: res.data.categories
                    },
                    plotOptions: {
                      column: {
                        pointWidth: pointWidth,
                        groupPadding: 0.1
                      }
                    }

                  },
                  series: res.data.series,
                  title: { text: 'Monthly '+nice_name+' By Year' },
                  loading: false
                };

               return chartConfig;
             });
  };

  o.getHourlyPastYear = function(register) {
    var nice_name = niceNameFromRegister(register);
    var min_hour = 0;
    var max_hour = 23;

    switch(register) {
    case 'gen':
      min_hour = 5;
      max_hour = 21;
      break;
    case 'use':
      break;
    };

    return $http.get('/statistics/hourly_past_year/' + register +'.json')
             .then(function(res) {
                var chartConfig = {
                  options: {
                    credits: { enabled: false },
                    chart: {
                      type: 'heatmap',
                      margin: [60, 10, 80, 50]
                    },
                    title: {
                      text: 'Hourly '+nice_name
                    },
                    xAxis: {
                      type: 'datetime',
                      min: res.data.series.data[0][0],
                      max: res.data.series.data[res.data.series.data.length-1][0],
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
                      min: min_hour,
                      max: max_hour,
                      reversed: true
                    },
                    colorAxis: {
                      stops: [
                        [0.0,'#ffffff'],
                        [0.1, '#c6dbef'],
                        [0.3,'#9ecae1'],
                        [0.4,'#6baed6'],
                        [0.5,'#3182bd'],
                        [1.0,'#08306b']
                      ],
                      min: 0,
                      max: Math.ceil(res.data.series.max_value/1000)*1000,
                      startOnTick: false,
                      endOnTick: false,
                      labels: {
                        format: '{value} Wh',
                        rotation: -30
                      }
                    },
                  },
                  series: [{
                    data: res.data.series.data,
                    nullColor: '#3060cf',
                    tooltip: {
                      headerFormat: nice_name +' Wh<br/>',
                      pointFormat: '{point.x:%e %b, %Y} {point.y}:00: <b>{point.value} Wh</b>'
                    },
                    borderWidth: 0,
                    colsize: 24 * 36e5 // possible daylight hours
                  }]
                }
                return chartConfig;
             });
  };

  return o;
}])

