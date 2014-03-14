require "coffee-script"
express = require "express"
connect = require "connect"
path = require "path"
io = require "socket.io"
      .listen 7777

db = require "mongoskin"
      .db "localhost:12345/test",
        safe: false

app = new express()

_root = path.resolve __dirname+"/../"

app.post "/queue",(req,res)->

app.get "/qrcode",(req,res)->
  res.send "hello world"

app.use express.bodyParser()
app.use "/mobile",express.static _root+"/static/mobile"
app.use "/cp",express.static _root+"/static/cp"



app.listen 3000