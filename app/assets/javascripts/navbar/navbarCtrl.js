homedash.controller('NavbarCtrl', [
'$scope', '$location',
function($scope, $location) {
  $scope.tabs = [
    { name: 'Generation',
      id: 'tab_generation',
      route_path: '/home',
      href: '/#/home',
      register: 'gen',
      active: true },
    { name: 'Usage',
      id: 'tab_usage',
      route_path: '/usage',
      href: '/#/usage',
      register: 'use',
      active: false },
    { name: 'Summary',
      id: 'tab_summary',
      route_path: '/summary',
      href: '/#/summary',
      active: false }
  ];

  $scope.init = function() {
    // set the active tab to be the one that matches the route
    var active_set = false;
    for ( var i = 0; i < $scope.tabs.length; i++ ) {
      $scope.tabs[i].active = ($location.url() == $scope.tabs[i].route_path);
      if ( $scope.tabs[i].active ) {
        active_set = true;
      }
    };

    if ( !active_set ) {
      $scope.tabs[0].active = true;
    }
  };

  $scope.setActive = function(tab) {
    for ( var i = 0; i < $scope.tabs.length; i++ ) {
      $scope.tabs[i].active = false;
    }
    tab.active = true;
  };

}]);
