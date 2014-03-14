require "nokogiri"
require 'open-uri'
require 'geocoder'

url = 'http://timable.com/time?da=2013-12-30'

doc = Nokogiri::HTML(open(url))

index = 1

doc.css('.tnb_td .tnb_root.tnb_238').each do |box|
	
	## get id

	id = box['id'].gsub('tnb_','').gsub('_0','')
	if id.to_i > 1000
		# puts id
	else
		next
	end

	## get description and title

	# box.css(".tnb_tip_body").children.each do |td|
	# 	if td.attr('class').to_s=="tnb_tip_title"
	# 		puts "title : " + td.text 
	# 	else
	# 		puts "description : " + td.text 
	# 	end
	# end

	## get image	

	# puts box.to_html
	# imgTag = box.css("div.tnb_bg").attr('style').to_s[44,46]
	# puts 'http://timable.com' + imgTag.to_s
	# File.open('img/' + id.to_s + '.jpg' ,'wb') do |f|
	# 	f.write open('http://timable.com' + imgTag.to_s ).read
	# end

	# get location and tags
	# puts box.css(".tnb_head.tnb_crop.tnb_opac").children.to_html

	# get date
	# puts box.css('.tnb_foot.tnb_opac').children.text

end

http

