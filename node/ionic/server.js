// Generated by CoffeeScript 1.6.3
(function() {
  var app, express, sio;

  express = require("express");

  sio = require("socket.io");

  app = new express();

  app.use(express.bodyParser());

  app.post("/post", function(req, res) {
    console.log(req.body);
    return res.send("thank you");
  });

  app.use(express["static"](__dirname + '/'));

  app.listen(3000);

  console.log("app listening at port 3000 ");

}).call(this);

//# sourceMappingURL=server.map