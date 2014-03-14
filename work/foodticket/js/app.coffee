angular.module "food.ControlPanel",['ui.sortable']
  .controller "cpCtrl", ["$scope",($s)->
    $s.items = [
      {
        "id": '001'
        "name": "hello",
        "list":{
          "01":1
          "02":2
        }
      },
      {
        "id": "002"
        "name": "bello"
        "list":{
          "01":1
          "02":3
        }
      }
      {
        "id": "003"
        "name": "kello"
        "list":{
          "01":1
          "02":3
        }
      }
    ]
    $s.oldList = []
    $s.sortableOption =
      update: ->
        console.log "update",$s.items
      stop: ->
        console.log "stop",$s.items
  ]
  