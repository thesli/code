// Generated by CoffeeScript 1.6.3
(function() {
  var page, webpage;

  webpage = require('webpage');

  page = webpage.create();

  page.open("http://timable.com/time?da=2013-12-01", function(status) {
    var another;
    if (status === 'success') {
      console.log('success');
      another = webpage.create();
      console.log(another.open("http://timable.com/res/pic/63c08a2e8ce1908b4273b523360c65eb2.jpg"));
      return phantom.exit();
    }
  });

}).call(this);

//# sourceMappingURL=p.map
