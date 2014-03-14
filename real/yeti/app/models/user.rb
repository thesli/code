class User < ActiveRecord::Base
  has_many :friends, through: :friendship
  validates :username, presence: true, uniqueness: true
  validates :password, presence: true
end