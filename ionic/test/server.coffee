express = require "express"
app = new express()

app.use express.static __dirname+"/"

app.listen 3000
console.log "its running at port 3000"