fn = ->
  io = require("socket.io").listen(3001)
  io.set "log level",0
  io.sockets.on "connection",(socket)->
    socket.emit "hello",
      "welcome": true

module.exports = fn