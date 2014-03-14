class UsersController < ApplicationController
  def new_user_params
    params.require(:user).permit(:username,:password)
  end

  def new

  end

  def create
    @user = User.new(new_user_params)
    if @user.save
      render json: "success"
    else
      render json: "fail"
    end
  end

  def show
    id = params[:id]
    render json: User.find(id)
  end

  def all
    render json: User.find(:all)
  end

  def update

  end

  def destroy
    id = params[:id] || nil
    user = User.find(id)
    render text: "please enter a valid user ID to delete a user" if !id
    render text: "User of #{id} is not found" if user.nil?
    render text: "#{user.username} is now deleted" if !user.nil?
  end
end
