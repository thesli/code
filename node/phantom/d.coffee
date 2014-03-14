fs = require('fs')

gEventList = []

fs.readFile 'test.json','utf-8',(err,data)->
  if err
    console.log err
    break
  else
    console.log data
    gEventList = JSON.parse(data)
    console.log gEventList

numEvents = 0

getPagination = ->
  casper = require("casper").create()
  casper.start "http://timable.com/time?da=2013-12-01",->
    numEvents = @evaluate ->
      txt = $('nobr.fs_L.bold.spec').html()
      regExp = /\(([^)]+)\)/
      count = regExp.exec txt
      return count[1]
  casper.then ->
    i = 1
    casper.thenOpen "http://timable.com/time?da=2013-12-01&page="+i, ->
      i++
      events = @evaluate ->
        eventList = []
        $('#tnb_div0').children().each (index,box)->
          $box = $(box)
          event = {}
          tagloc = $box.find('.tnb_head.tnb_crop.tnb_opac').text()
          event.id = box.id.substr(4,6)
          event.title = $box.find('.tnb_tip_title').html()
          event.description = $box.find('.tnb_tip_body>p:not(.tnb_tip_title)').html()
          event.image = $box.find('.tnb_bg').attr('style').toString().substr(44,46)
          event.tag = tagloc.substr(0,tagloc.indexOf('@')-1)
          event.location = tagloc.substr(tagloc.indexOf('@')+1)
          event.date = $box.find('.tnb_foot.tnb_opac').text()
          event.isFree = $box.find('img[src="/res/img/box/tnb_acc_free_en.png"]').length
          eventList.push(event)
        return eventList
        console.log events
  casper.run()

getPagination()