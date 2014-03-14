require 'mechanize'

agent = Mechanize.new

page = agent.get "http://timable.com/time?da=2013-12-30"

image = agent.get('http://timable.com/res/pic/59beadbc61e7d7ed32503a2e4c6d1c322.jpg').save('hello.jpg')


