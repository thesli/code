express = require "express"
sio = require "socket.io"
app = new express()

app.use express.bodyParser()

app.post "/post",(req,res)->
  console.log req.body
  res.send "thank you"

app.use express.static __dirname+'/'

app.listen 3000
console.log "app listening at port 3000 "