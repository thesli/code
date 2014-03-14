express = require "express"
io = require("socket.io").listen 3030

db = require "mongoskin"
  .db 'localhost:12345',
    database:'doodlePoll'
    safe:false

app = new express()

app.use express.static __dirname+"/public"

app.listen 3000
