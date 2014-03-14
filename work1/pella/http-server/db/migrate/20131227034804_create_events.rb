class CreateEvents < ActiveRecord::Migration
  def change
    create_table :events do |t|
      t.string :title
      t.integer :author_id
      t.text :description
      t.timestamps
    end
  end
end
