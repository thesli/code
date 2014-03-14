$ ->
  $loading = $ "#loading"
  $errJSON = $ '#errJSON'
  getFacebook = (id)->
    fbid = id
    $.ajax
      'url': 'http://graph.facebook.com/'
      'method': 'get'
      'data':
        'id': fbid
      'beforeSend': ->
        $loading.css 'opacity',1
        $errJSON.css 'opacity',0
        clearFacebookInfo()
    .fail (err)->
        $errJSON.css 'opacity',1
        $errJSON
          .html err.responseText
        $loading.css 'opacity',0
    .success (data)->
        $ "#firstname"
          .html data.first_name
        $ "#lastname"
          .html data.last_name
        $ "#gender"
          .html data.gender
        $loading.css 'opacity',0
        $errJSON.css 'opacity',0

  $ 'input.form-control'
    .on "input",->
      getFacebook($(this).val())

  clearFacebookInfo = ->
    items = ["#firstname","#lastname","#gender"]
    for item in items
      $(item).html ""