app = angular.module "APP",["ui.router"]

app.config ($stateProvider,$urlRouterProvider,$locationProvider)->
  $locationProvider.html5Mode true
  $stateProvider
    .state "state1",
      url: "/state1"
      templateUrl: "partials/state1.html"
    .state "state2",
      url: "/state2"
      templateUrl: "partials/state2.html"
    .state "state2.list",
      url: "/list"
      templateUrl: "partials/state2.list.html"
      controller: ($scope)->
        $scope.list = ["abc","cde","def"]