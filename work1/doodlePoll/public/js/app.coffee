angular.module "app",['dangle']
  .controller "testCtrl",($scope,$timeout)->
    $scope.data =
      terms: [
        {term: "type-A"
        count: 100}
        {term: "type-B"
        count: 200}
        {term: "type-C"
        count: 300}
        {term: "type-D"
        count: 400}
        {term: "type-E"
        count: 500}
        {term: "type-F"
        count: 600}
        {term: "type-G"
        count: 700}
      ]