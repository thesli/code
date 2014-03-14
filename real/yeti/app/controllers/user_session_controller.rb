class UserSessionController < ApplicationController
  def new
    session[:user_id] = params[:user_id] || nil
    render text: "changed user_id to #{session[:user_id]}"
  end
  def create

  end
  def delete
  end
end
