var Activity = function(id, category, startDate, endDate) {
    this.id = id;
    this.startDate = startDate;
    this.endDate = endDate;
    this.duration = moment.duration(this.endDate.diff(this.startDate)).asMilliseconds();
    this.multiple = false;

    if(!(this.startDate.isSame(this.endDate.format(), 'day'))) {
      var s = this.startDate.clone().endOf('day').format(),
          e = this.endDate.clone().startOf('day').format();
      this.dur0 = moment.duration(moment(s).diff(this.startDate)).asMilliseconds();
      this.dur1 = moment.duration(this.endDate.diff(e)).asMilliseconds();
      this.multiple = true;

      var key0 = this.startDate.format('YYYY-MM-DD');
        if(days[key0]) {
          days[key0].activities.push(this);
        } else {
          days[key0] = new Day(key0);
          days[key0].activities.push(this);
        }
      var key1 = this.endDate.format('YYYY-MM-DD');
        if(days[key1]) {
          days[key1].activities.push(this);
        } else {
          days[key1] = new Day(key1);
          days[key1].activities.push(this);
        }
    } else {
      var key0 = this.startDate.format('YYYY-MM-DD');
        if(days[key0]) {
          days[key0].activities.push(this);
        } else {
          days[keys0] = new Day(key0);
          days[key0].activities.push(this);
        }
    }

    this.category = function(category) {
      var key = category.toLowerCase();
      if(categories[key]) {
        categories[key].activities.push(this);
      } else {
        categories[key] = new Category(key);
        categories[key].activities.push(this);
      }

      this.category = category;
    };

    this.category(category);
}

Activity.prototype.getAsObject = function() {
  return {
    id: this.id.toString(),
    category: this.category,
    startDate: this.startDate,
    endDate: this.endDate,
    duration: this.duration
  }
}

categories = {};
days = {};
var Category = function(name) {
  this.name = name;
  this.activities = [];
}

var Day = function(date) {
  this.activities = [];
}
module.exports(Activity);
