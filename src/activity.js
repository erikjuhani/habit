/**
* @class
* Contains an activity with a start date and an end date.
* Calculates duration of activity with start date subtracted from end date.
* If dates are in different days. Calculate two separate durations for each day.
*
* Creates a new Category class, if it doesn't exist.
* Creates a new Day class, if it doesn't exist.
*
* @param {number} id
* @param {string} category
* @param {object} startDate
* @param {object} endDate
*
*/
var Activity = function(id, category, startDate, endDate) {
    this.id = id;
    this.startDate = startDate;
    this.endDate = endDate;
    if(startDate && endDate) {
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
            days[key0] = new Day(key0);
            days[key0].activities.push(this);
          }
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

      this.category = categories[key];

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

Activity.prototype.getDuration = function(date) {
  if(this.multiple) {
    if(moment(date).isSame(this.startDate.format(), 'day')) {
      return this.dur0;
    } else {
      return this.dur1;
    }
  } else {
    return this.duration;
  }
}

module.exports = Activity;
