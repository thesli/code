fs = require "fs"
gEventList = []
numPage = 0
gIndex = 0
urls = [1..12]
ids = []

startRun = (uri)->
  casper = require('casper').create()
  casper
    .start uri ,->
      numPage = @evaluate ->
        txt = $('nobr.fs_L.bold.spec').html()
        regExp = /\(([^)]+)\)/
        count = regExp.exec txt
        return Math.ceil(count[1]/30)
      console.log "Step1: " + "Total Count = " + numPage
    .then ->
      ct(1)
  ct = (i)->
    if i < 3 # numPage + 1
      url = uri+"&page="+i
      console.log url
      casper.thenOpen url,->
        events = @evaluate ->
          eventList = []
          $('#tnb_div0').children().each (index,box)->
            $box = $(box)
            event = {}
            tagloc = $box.find('.tnb_head.tnb_crop.tnb_opac').text()
            idRegexp = /_(.*?)_/
            event.id = idRegexp.exec(box.id)[1]
            event.title = $box.find('.tnb_tip_title').html()
            event.description = $box.find('.tnb_tip_body>p:not(.tnb_tip_title)').html()
            event.image = $box.find('.tnb_bg').attr('style').toString().substr(44,46)
            event.tag = tagloc.substr(0,tagloc.indexOf('@')-1)
            event.location = tagloc.substr(tagloc.indexOf('@')+1)
            event.date = $box.find('.tnb_foot.tnb_opac').text()
            event.isFree = $box.find('img[src="/res/img/box/tnb_acc_free_en.png"]').length
            eventList.push(event)
          return eventList
        for event in events
          url = "http://timable.com" + event.image
          console.log url
          @download(url,'img/'+event.id+'.jpg')
          delete event.image
        gEventList.push(events)
      casper.then ->
        console.log "Step2: " + i + "/" + numPage + "done"
        i++
        ct(i)
  casper.run ->
    json = JSON.stringify(gEventList,undefined ,2)
    fs.write((gIndex+1).toString()+'.json',json,'w')
    setTimeout ->
      gIndex++
      startRun("http://timable.com/time?da=2013-"+urls[gIndex]+"-01")
    ,10000

startRun("http://timable.com/time?da=2013-"+urls[gIndex]+"-01")