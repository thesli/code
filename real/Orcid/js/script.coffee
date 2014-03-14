angular.module "Orcid",['ionic']
  .config ["$stateProvider","$urlRouterProvider",($stateProvider,$urlRouterProvider)->
    $stateProvider
    .state 'tabs',
        url: '/tab'
        abstract: true
        templateUrl: 'partials/tabs.html'
    .state 'tabs.home',
        url: '/home'
        views:
          'home-tab':
            templateUrl: 'partials/home.html'
            controller: 'checkoutCtrl'
    .state 'tabs.home.list1',
        url: '/list1'
        views:
          'home-tab':
            template: 'List 1'
    .state 'tabs.home.list2',
        url: '/list2'
        views:
          'home-tab':
            template: 'List 2'

    $urlRouterProvider.otherwise "/tab/home"
  ]
  .controller "tabCtrl",["$scope",($scope)->

  ]
  .controller "checkoutCtrl",["$scope","$rootScope","$timeout",($scope,$rootScope,$timeout)->
        $scope.foods = ["list1","list2","test3"]
        $scope.hello = "hello"
  ]
