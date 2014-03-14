class EventsController < ApplicationController
  def abc
    session[:abc] = 'fuck'
    render text: 'fuck'
  end
  def cde
    render json: session[:abc]
  end

  def xyz
    session[:abc] = nil
    render nothing: true
  end

end
