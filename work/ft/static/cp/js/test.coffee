angular.module "test",["ionic"]
  .controller "testCtrl",($scope)->
    $scope.re = (el,start,end)->
      console.log el,start,end
    $scope.test = "hello"
    $scope.items = ["item1","item2","item3","item4","item5"]