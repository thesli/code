angular.module "ft.mobile",['ionic','monospaced.qrcode','ft.mobile.route']
  .controller "sideMenuCtrl",($scope,$rootScope)->
    console.log "sideMenuCtrl"
    $rootScope.toggleLeft = ->
      $scope.sideMenuController.toggleLeft()
    $rootScope.toggleRight = ->
      $scope.sideMenuController.toggleRight()
  .controller "tabsCtrl",($scope,$rootScope)->
    console.log "tabsCtrl"
    $scope.toggleLeft = ->
      $rootScope.toggleLeft()
    $scope.toggleRight = ->
      $rootScope.toggleRight()
  .controller "qrcodeCtrl",["$scope","$rootScope","$http",($scope,$rootScope,$http)->
    $scope.qrSuccess = false
    $scope.testRest = ->
      $http.get("/qrcode").success (data)->
        $scope.qrSuccess = true
        $scope.test = data
  ]
  .run ["$rootScope","$timeout",($rootScope,$timeout)->
      $rootScope.checkoutBtnPos = document.querySelector("[ng-click='toggleRight()']").getBoundingClientRect()
      console.log $rootScope.checkoutBtnPos
      $rootScope.amount = 0
  ]

angular.module "ft.mobile.route",["ngRoute","ngAnimate"]
  .config ["$routeProvider",($routeProvider)->
    $routeProvider
      .when "/",
        template: "<h1>HELLOWORLD HERE</h1><Button ng-click='try()'>{{test}}</Button><button ng-click='ani()'>ani()</button>"
        controller: ["$scope","$rootScope","$animate",($scope,$rootScope,$animate)->
          $scope.test = "fuck you"
          $scope.try = ->
            console.log $rootScope.checkoutBtnPos
          aniObj = document.querySelector("[ng-click='ani()']")
          $scope.ani = ->
            $animate.enter(aniObj,".moveToCheckout")
        ]
  ]

  .animation ".moveToCheckout",->
    return{
      enter: (element,done)->
        console.log "enter"
        console.log element
      leave: ->
        console.log "leave"
    }