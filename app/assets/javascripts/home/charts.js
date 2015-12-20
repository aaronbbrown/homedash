homedash.factory('charts', [
'$http',
function($http) {
  var o = {
    chart: {}
  };
  o.getMonthlyGenYear = function() {
    return $http.get('/statistics/monthly_gen_year.json')
             .success(function(data) {
               angular.copy(data, o.chart);
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

