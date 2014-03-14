require 'nokogiri'
require 'open-uri'
doc = Nokogiri::HTML open('https://sao.ust.hk/counseling/workshops.html')
doc = doc.css('table[width="857"]').css('tr')

@event = Hash.new do |h,k|
	h[k] = Hash.new &h.default_proc
end

index = 0
count = 0
doc.each do |row|
	row.css("td[class='content style10']").each do |td|		
		i = index % 6
		td.content = td.content.gsub(/\s+/," ").strip
		@event[count][:date] = td.content if i==0
		@event[count][:]
	end
end

puts @event