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

  o.getPercentGenLastYear = function() {
    return $http.get('/statistics/percent_gen_last_year.json')
      .then(function(res) {
        var chartConfig = {
          options: {
            credits: { enabled: false },
            chart: { type: 'pie' },
            tooltip: { pointFormat: '<b>{point.y} Wh</b>' },
            plotOptions: {
              pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: { format: '<b>{point.name}</b>: {point.percentage:.0f} %' }
              }
            }
          },
          series: res.data.series,
          title: {
            text: 'Percent Electricity Generated vs Grid Since ' +
                   Highcharts.dateFormat('%m/%d/%Y', res.data.since)
          }
        };
        return chartConfig;
    });
  };


  o.getMonthlyBoxplot = function(register) {
    var niceName = niceNameFromRegister(register);
    return $http.get('/statistics/monthly_percentiles/'+register+'.json')
      .then(function(res) {
      var chartConfig = {
        options: {
          credits: { enabled: false },
          chart: { type: 'boxplot' },
          xAxis: { type: 'datetime' },
          legend: { enabled: false }
        },
        series: res.data.series
      };
      return chartConfig;
    });
  };

  o.getDailyWattHourHistogram = function(register) {
    var niceName = niceNameFromRegister(register);
    return $http.get('/statistics/daily_watt_hour_histogram/'+register+'.json')
             .then(function(res) {
                var chartConfig = {
                  options: {
                    credits: { enabled: false },
                    chart: { type: 'area' },
                    xAxis: {
                      categories: res.data.categories,
                      title: { text: 'Watt-hours' }
                    },
                    yAxis: {
                      title: {
                        text: 'Days'
                      }
                    },
                    plotOptions: {
                      area: { 
                        stacking: 'normal'
                      }
                    }
                  },
                  series: res.data.series,
                  title: { text: 'Daily Watt Hours Per Year '+niceName },
                  loading: false
                };

               return chartConfig;
             });
  };


  o.getCurrentWatts = function(register) {
    var niceName = niceNameFromRegister(register);
    return $http.get('/statistics/current_watts/'+register+'.json')
             .then(function(res) {
                var chartConfig = {
                  options: {
                    credits: { enabled: false },
                    chart: { type: 'solidgauge' },
                    xAxis: {
                      categories: res.data.categories
                    },
                    yAxis: {
                      stops: [
                          [0.3, '#55BF3B'], // green
                          [0.6, '#DDDF0D'], // yellow
                          [0.9, '#DF5353'] // red
                      ],
                      max: res.data.yAxis.max,
                      min: 0,
                      title: {
                        text: niceName + ' Watts',
                        y: -90
                      },
                      labels: { y: 16 }
                    },
                    pane: {
//                      center: ['50%', '85%'],
                      startAngle: -90,
                      endAngle: 90,
                      background: {
                        backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
                        innerRadius: '60%',
                        outerRadius: '100%',
                        shape: 'arc'
                      }
                    },
                    plotOptions: {
                      solidgauge: {
                        dataLabels: {
                          y: -40,
                          borderWidth: 0,
                          useHTML: true
                        }
                      }
                    }
                  },
                  series: res.data.series,
                  title: { text: 'Current '+niceName },
                  loading: false
                };
              chartConfig.series[0].dataLabels = {
                format: '<div style="text-align:center"><span style="font-size:25px;color:' +
                    ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y} W</span>'
              }

               return chartConfig;
             });
  };

  o.getDaily = function(register) {
    var niceName = niceNameFromRegister(register);
    return $http.get('/statistics/daily/'+register+'.json')
             .then(function(res) {
                var chartConfig = {
                  options: {
                    credits: { enabled: false },
                    chart: { type: 'column' },
                    xAxis: {
                      categories: res.data.categories
                    },
                    yAxis: {
                      title: {
                        text: 'Watt-hours'
                      }
                    },
                    legend: { enabled: false }
                  },
                  series: res.data.series,
                  title: { text: 'Daily '+niceName },
                  loading: false
                };

               return chartConfig;
             });
  };

  o.getYtdByYear = function(register) {
    var niceName = niceNameFromRegister(register);
    return $http.get('/statistics/ytd_by_year/'+register+'.json')
             .then(function(res) {
                var chartConfig = {
                  options: {
                    credits: { enabled: false },
                    chart: { type: 'column' },
                    xAxis: {
                      categories: res.data.categories
                    },
                    yAxis: {
                      title: {
                        text: 'Watt-hours'
                      }
                    },
                    legend: { enabled: false }
                  },
                  series: res.data.series,
                  title: { text: 'Year-to-date '+niceName+' by Year' },
                  loading: false
                };

               return chartConfig;
             });
  };

  o.getHourlyVsHistorical = function(register) {
    var niceName = niceNameFromRegister(register);
    return $http.get('/statistics/hourly_vs_historical/'+register+'.json')
             .then(function(res) {
                var chartConfig = {
                  options: {
                    credits: { enabled: false },
                    chart: { type: 'area' },
                    xAxis: {
                      categories: res.data.categories
                    },
                    yAxis: {
                      title: {
                        text: 'Watt-hours'
                      }
                    },
                    plotOptions: {
                      area: { fillOpacity: 0.25 }
                    }
                  },
                  series: res.data.series,
                  title: { text: 'Hourly '+niceName+' vs Historical' },
                  loading: false
                };

               return chartConfig;
             });
  };

  o.getMonthlyByYear = function(register) {
    var niceName = niceNameFromRegister(register);
    return $http.get('/statistics/monthly_by_year/'+register+'.json')
             .then(function(res) {
                var chartConfig = {
                  options: {
                    credits: { enabled: false },
                    chart: { type: 'column' },
                    xAxis: {
                      categories: res.data.categories
                    },
                    yAxis: {
                      title: {
                        text: 'Watt-hours'
                      }
                    },
                    plotOptions: {
//                      area: { fillOpacity: 0.25 }
                    }

                  },
                  series: res.data.series,
                  title: { text: 'Monthly '+niceName+' By Year' },
                  loading: false
                };

               return chartConfig;
             });
  };

  o.getHourlyPastYear = function(register) {
    var niceName = niceNameFromRegister(register);
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
                      text: 'Hourly '+niceName
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
                      headerFormat: niceName +' Wh<br/>',
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

