app = angular.module "app",['ui.router','rails']
app
  .factory "Book",["railsResourceFactory",(rrf)->
    rrf
      url: "/books"
      name: 'book'
  ]
  .controller "testCtrl",["$scope","Book",($scope,Book)->
      $scope.make = (bookname)->
        new Book
          name: bookname
        .create()
      Book.query(name:'A').then (data)->
        console.log data
        for d in data
          Book.get(id:d.id).then (bk)->
            bk.name = 'A'
            bk.update()
  ]
#  .controller "testCtrl",["$scope","Book",($scope,Book)->
#    $scope.make = (bookname)->
#      new Book
#        name: bookname
#      .create()
#    Book.query(name:'A').then (data)->
#      console.log data
#      for d in data
#        Book.get(id:d.id).then (bk)->
#          bk.name = "A"
#          bk.update()