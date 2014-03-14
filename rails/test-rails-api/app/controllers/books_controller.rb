class BooksController < ApplicationController
  # GET /books
  # GET /books.json
  def index
    names = params[:name]
    ids = params[:id]
    @books = Book.where { (name.in names)|(id.in ids) }
    render json: @books
  end

  # GET /books/1
  # GET /books/1.json
  def show
    @book = Book.find(params[:id])
    render json: @book
  end

  # POST /books
  # POST /books.json
  def create
    @book = Book.new(params[:book])
    if @book.save
      render json: @book, status: :created, location: @book
    else
      render json: @book.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /books/1
  # PATCH/PUT /books/1.json
  def update
    @book = Book.find(params[:id])

    if @book.update(params[:book])
      head :no_content
    else
      render json: @book.errors, status: :unprocessable_entity
    end
  end

  # DELETE /books/1
  # DELETE /books/1.json
  def destroy
    @book = Book.find(params[:id])
    @book.destroy

    head :no_content
  end

  def abc
    session[:id] = 10
  end

  def cde
    render json: session[:id]
  end
end
