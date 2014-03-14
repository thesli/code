container = document.querySelector "#container"
ms = new Masonry container,
  columnWidth: 20
  gutter: 1
  itemSelector: '.item'

$(document).ready ->
  setTimeout ->
    $("#container").append $("<div class='item'></div>")
    $("#container").append $("<div class='item w2'></div>")
    $("#container").append $("<div class='item'></div>")
    $("#container").append $("<div class='item w2'></div>")
    $("#container").prepend $("<div class='item'></div>")
    $("#container").prepend $("<div class='item w2'></div>")
    $("#container").prepend $("<div class='item'></div>")
    $("#container").prepend $("<div class='item w2'></div>")
    ms = new Masonry container,
      columnWidth: 200,
      itemSelector: '.item'
    console.log "triggered"
  ,2000
