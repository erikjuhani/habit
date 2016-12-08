/**
* @class
* Contains a category with all the category activities.
*
* @param {string} name
* @param {string} color
*/
var Category = function(name, color) {
  this.name = name;
  this.color = color || '#'+Math.floor(Math.random()*16777215).toString(16);
  this.activities = [];
}
