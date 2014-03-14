express = require "express"
app = new express()

app.get "/state1",(req,res)->
  res.sendfile __dirname+"/index.html"
app.get "/state2/*",(req,res)->
  res.sendfile __dirname+"/index.html"

app.use "/",express.static __dirname+"/"

app.listen(3000)
console.log "listening @ 3000"