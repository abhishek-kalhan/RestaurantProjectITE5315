// load mongoose since we need it to define a model
var mongoose = require("mongoose");
var Schema = mongoose.Schema;


adressSchema = new Schema({
  building: String,
  coord: Array,
  street: String,
  zipcode: String,
});
gradeSchema = new Schema({
  date: String,
  grade: String,
  score: Number,
});

RestaurantSchema = new Schema({
  address: adressSchema,
  borough: String,
  cuisine: String,
  grades: [gradeSchema],
  name: String,
  restaurant_id: String,
});
module.exports = mongoose.model("restaurant", RestaurantSchema);
