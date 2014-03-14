angular.module "app",['ionic']
  .controller "helloCtrl",($scope)->
    $scope.hello = "fuck"
    console.log "loaded"
  .run ($rootScope)->
    $rootScope.test = "fuck you"