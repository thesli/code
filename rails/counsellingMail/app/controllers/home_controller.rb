require 'nokogiri'
require 'open-uri'

class HomeController < ApplicationController
  def index
    render 'home/index'
  end

  def getEntries
    doc = Nokogiri::HTML open('https://sao.ust.hk/counseling/workshops.html')
    result = doc.css('table[width="857"]').css('tr').each do |row|

    end
  end

end
