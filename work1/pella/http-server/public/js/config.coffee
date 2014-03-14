angular.module "Pella",["Pella.config","Pella.factory","Pella.controller"]
  .run ["$rootScope",($rootScope)->
    $rootScope.date = new Date()
  ]


angular.module "Pella.config",['ui.router']
  .config ["$stateProvider",($stateProvider)->
  ]