angular.module "app",['ionic','monospaced.qrcode']
  .controller "myCtrl",($scope)->
    $scope.test = "hello world"