require "coffee-script"
path = require "path"
require "./io"
m = require "mongoskin"
  .db "localhost:12345",
      database: "food"
      safe: false

express = require "express"

app = new express()


app.use express.bodyParser()

app.post "/changePosition", (req,res)->
  console.log req.body
  m
    .collection "position"
    .insert
      hello: "world"


app.use express.static path.resolve __dirname+"/../"

app.listen 3000