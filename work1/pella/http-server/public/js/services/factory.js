// Generated by CoffeeScript 1.6.3
(function() {
  angular.module("Pella.factory", ["rails"]).factory("User", [
    "railsResourceFactory", function(rrf) {
      return rrf({
        url: '/user',
        name: 'user'
      });
    }
  ]).factory("Event", [
    "railsResourceFactory", function(rrf) {
      return rrf({
        url: '/event',
        name: 'event'
      });
    }
  ]);

}).call(this);

//# sourceMappingURL=factory.map
