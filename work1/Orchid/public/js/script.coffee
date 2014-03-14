angular.module "orchid",['ionic']
  .run ["Socket",(socket)->
    socket.on "hello",(data)->
        console.log data
        socket.emit "fuck",
          "no": "data here"
  ]
  .controller "testCtrl",["$scope",($scope)->
    $scope.test = "test"
  ]
  .factory "Socket",->
    socket = io.connect "http://localhost:3001"
  .config ["$stateProvider","$urlRouterProvider",($stateProvider,$urlRouterProvider)->
        $stateProvider
          .state "tabs",
            url: "/tab"
            templateUrl: "tpl/tabs.html"
            abstract: true
          .state "tabs.home",
            url: "/home"
            views:
              templateUrl: "tpl/tabs.home.html"
              controller: ($scope)->
                console.log "homeCtrl"
          .state "tabs.about",
            url: "/about"
            views:
              templateUrl: "tpl/about.html"
        $urlRouterProvider.otherwise "/tab/home"
      ]

