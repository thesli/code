// Generated by CoffeeScript 1.6.3

/*
Module dependencies.
 */

(function() {
  var app, express, http, path;

  express = require("express");

  http = require("http");

  path = require("path");

  app = express();

  app.set("port", process.env.PORT || 3000);

  app.set("views", path.join(__dirname, "views"));

  app.set("view engine", "jade");

  app.set("view options", {
    layout: true
  });

  app.use(express.favicon());

  app.use(express.logger("dev"));

  app.use(express.json());

  app.use(express.urlencoded());

  app.use(express.methodOverride());

  app.use(express.cookieParser("your secret here"));

  app.use(express.session());

  app.use(app.router);

  app.use(express["static"](path.join(__dirname, "public")));

  if ("development" === app.get("env")) {
    app.use(express.errorHandler());
  }

  require("./routes")(app);

  require("./socket")();

  http.createServer(app).listen(app.get("port"), function() {
    return console.log("Express server listening on port " + app.get("port"));
  });

}).call(this);

//# sourceMappingURL=app.map
