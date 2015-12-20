homedash.factory('charts', [
'$http',
function($http) {
  var o = {
    chart: {}
  };

  o.niceNameFromRegister = function(register) {
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

  o.getMonthlyByYear = function(register) {
    var nice_name = this.niceNameFromRegister(register);
    return $http.get('/statistics/monthly_'+register+'_year.json')
             .then(function(res) {
                var chartConfig = {
                  options: {
                      chart: { type: 'bar' },
                      xAxis: {
                        categories: res.data.categories
                      }
                  },
                  series: res.data.series,
                  title: { text: 'Monthly '+nice_name+' Generation By Year' },
                  loading: false
                };

               return chartConfig;
             });
  };

  o.getHourlyPastYear = function(register) {
    var nice_name = this.niceNameFromRegister(register);
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

    return $http.get('/statistics/daily_' + register +'_hour.json')
             .then(function(res) {
                var chartConfig = {
                  options: {
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
                        [0.1,'#ffeda0'],
                        [0.3,'#fed976'],
                        [0.4,'#feb24c'],
                        [0.5,'#fd8d3c'],
                        [0.6,'#fc4e2a'],
                        [0.7,'#e31a1c'],
                        [0.8,'#bd0026'],
                        [1.0,'#800026']
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

/*
  o.create = function(post) {
    console.log(post);
    return $http.post('/posts.json', post)
             .success(function(data) {
               o.posts.push(data);
             });
  };
  o.upvote = function(post) {
    return $http.put('/posts/' + post.id + '/upvote.json')
             .success(function(data){
               post.upvotes += 1;
             });
  };

  o.get = function(id) {
    return $http.get('/posts/' + id + '.json')
             .then(function(res) {
               return res.data;
             });
  };
  */
  return o;
}])

