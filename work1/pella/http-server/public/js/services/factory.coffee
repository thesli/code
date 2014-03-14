angular.module "Pella.factory",["rails"]
  .factory "User",["railsResourceFactory",(rrf)->
    return rrf(url:'/user',name:'user')
  ]
  .factory "Event",["railsResourceFactory",(rrf)->
      return rrf(url:'/event',name:'event')
  ]