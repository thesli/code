$ ->
  $(document).on "DOMNodeInserted","img",(event)->
    $(event.target).addClass("ani")

  $('button').on "click",->
    setInterval ->
      randNum = Math.round 500*Math.random(),0
      $('body').prepend "<img src='http://placekitten.com/#{randNum}/#{randNum}' alt=''/>"
    ,2000
  test = (a,b,c='fuck')->
    console.log a
    console.log b
    console.log c
  test('abc','dasdasd',null)
