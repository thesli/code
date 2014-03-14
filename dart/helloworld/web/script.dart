import "dart:html";
import "dart:js";


void main() {

  var pEl = new Element.html("<b>hello world</b>");
  querySelector("#box").append(pEl);
  querySelector("#fuck").style.background = 'red';
}