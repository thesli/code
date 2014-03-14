module.exports = (app)->
  app.get "/",(req,res)->
    console.log req.session["data"]
    res.render "index",
      test: req.session["data"]
  app.get "/session",(req,res)->
    console.log req.sessionID
    req.session["data"] = "1234567"
    res.send "just check session"
  app.get "/tpl/:name.html",(req,res)->
    name = req.params.name
    res.render "tpl/#{name}.jade"