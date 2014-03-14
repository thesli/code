casper = require('casper').create()
utils = require "utils"
fs = require 'fs'

eventList = []

casper.start "http://timable.com/time?da=2013-12-01",->
  numEvent = @evaluate ->
    txt = $('.fs_L.bold.spec').html()
    regExp = /\(([^)]+)\)/
    count = regExp.exec txt
    return count
  console.log numEvent
  events = @evaluate(->
    eventList = []
    $('#tnb_div0').children().each (index,box)->
      $box = $(box)
      event = {}
      tagloc = $box.find('.tnb_head.tnb_crop.tnb_opac').text()
      event.id = box.id.substr(4,6)
      event.title = $box.find('.tnb_tip_title').html()
      event.description = $box.find('.tnb_tip_body>p:not(.tnb_tip_title)').html()
      event.image = $box.find('.tnb_bg').attr('style').toString().substr(44,46)
      event.tag = tagloc.substr(0,tagloc.indexOf('@'))
      event.location = tagloc.substr(tagloc.indexOf('@')+1)
      event.date = $box.find('.tnb_foot.tnb_opac').text()
      event.isFree = $box.find('img[src="/res/img/box/tnb_acc_free_en.png"]').length
      eventList.push(event)
    return eventList
  )
  for event in events
    url = "http://timable.com" + event.image
    console.log url
    @download(url,'img/'+event.id+'.jpg')
  fs.write('test.json',JSON.stringify(events,undefined ,2),'w')

casper.run ->
  @.echo("done").exit()