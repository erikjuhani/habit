/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  ListView,
  TouchableHighlight
} from 'react-native';

import moment from 'moment';
import PieChart from 'react-native-pie-chart';

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

var Category = function(name, color) {
  this.name = name;
  this.color = color || '#CCCCCC';
  this.activities = [];
}

var Day = function(date) {
  this.date = date;
  this.activities = [];
}

/**
* Use days[this.state.day.date.format('YYYY-MM-DD')].getFreeDuration()
* to get the free available duration in the day
*/
Day.prototype.getFreeDuration = function() {
  var duration = 0;

  for(var i = 0; i < this.activities.length; i++) {
    var a = this.activities[i];
    if(a.multiple) {
      if(moment(this.date).isSame(a.startDate.format(), 'day')) {
        duration += a.dur0;
      } else {
        duration += a.dur1;
      }
    } else {
      duration += a.duration;
    }
  }

  return 86400000-duration;
}

var categories = {
  default: new Category('default', '#CCCCCC'),
  sleeping: new Category('sleeping', '#539492'),
  cooking: new Category('cooking', '#a86b00'),
  watchingtv: new Category('watchingTV', '#a21c2f'),
  studying: new Category('studying', '#6323a6'),
  coding: new Category('coding', '#00CC00')
};
var days = {};
var activities = [
  new Activity(0, 'sleeping', moment('2016-11-19 23:00:00'), moment('2016-11-20 08:00:00')),
  new Activity(1, 'cooking', moment('2016-11-20 12:00:00'), moment('2016-11-20 13:00:00')),
  new Activity(2, 'watchingTV', moment('2016-11-20 13:00:00'), moment('2016-11-20 15:30:00')),
  new Activity(3, 'studying', moment('2016-11-20 16:00:00'), moment('2016-11-20 18:30:00')),
  new Activity(4, 'coding', moment('2016-11-20 15:00:00'), moment('2016-11-20 19:00:00')),
  new Activity(5, 'sleeping', moment('2016-11-20 23:00:00'), moment('2016-11-21 08:00:00'))
];

var mockDay = {
  date: moment('2016-11-20')
}

var sliceColor = ['#CCCCCC', '#CC0000', '#4CAF50', '#00CC00', '#00CCCC'];
var chart_wh = 260;

export default class habit extends Component {
  constructor(props) {
    super(props);
    //const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      day: mockDay,
      pie: {
        durations: [],
        colors: []
      },
      nav: 'loading',
    }
  }

  getPie() {
    var date = this.state.day.date.format('YYYY-MM-DD');
    var durations = [86400000];
    var activities = [new Activity(-1, 'default')];
    var colors = ['#CCCCCC'];
    if(days[date]) {
      var a = days[date].activities;
      for(var i = 0; i < a.length; i++) {
        var activity = a[i];
        var category = activity.category;
        colors.push(activity.category.color);
        if(a[i].multiple) {
          if(moment(date).isSame(activity.startDate.format(), 'day')) {
            durations.splice(i, 0, activity.dur0);
            durations[durations.length-1] -= activity.dur0;
          } else {
            durations.splice(i, 0, activity.dur1);
            durations[durations.length-1] -= activity.dur1;
          }
        } else {
          durations.splice(i, 0, activity.duration);
          durations[durations.length-1] -= activity.duration;
        }
        activities.splice(i, 0, activity);
        colors.splice(i, 0, activity.category.color);
      }
    }
    activities[activities.length-1].duration = durations[durations.length-1];
    return {durations: durations, activities: activities, colors: colors};
  }

  componentDidMount() {
    this.setState({nav: 'day'});
  }

  render() {
    if(this.state.nav === 'day') {
      return this.renderDay();
    } else if(this.state.nav === 'timer') {
      return this.renderTimer();
    }
    return this.loading();
  }

  loading() {
    return(
      <View style={{flex:1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>
          Loading...
        </Text>
      </View>
    )
  }

  pressActivity() {

  }

  renderActivity(id) {
    var activity = activities[id];
    return (
      <View style={styles.container}>
        <View>
          <Text>
            Category {activity.category.name}
          </Text>
        </View>
        <View>
          <Text>
            Start Date: {activity.startDate.format('ll')}
          </Text>
        </View>
        <View>
          <Text>
            End Date: {activity.endDate.format('ll')}
          </Text>
        </View>
        <View>
          <Text>
            Save btn ///// Delete btn
          </Text>
        </View>
      </View>
    )
  }

  renderDay() {
    var pie = this.getPie();
    var durations = pie.durations;
    return (
      <View style={styles.container}>
        <View style={{flex:1, justifyContent: 'center', alignItems: 'center', paddingTop: 32}}>
          <Text style={[{fontSize: 18}, styles.defaultFont]}>
            {this.state.day.date.format('LL')}
          </Text>
        </View>
        <View style={{flex: 4, justifyContent: 'center'}}>
          <PieChart
            chart_wh={chart_wh}
            series={durations}
            sliceColor={pie.colors}
          />
        </View>
        <View style={{flex: 4, alignSelf: 'flex-start', paddingLeft: 30}}>
          {this.categoryList(pie, this)}
        </View>
      </View>
    );
  }

  startStopButton() {

  }

  renderTimer() {
    return(
      <View style={timerStyles.wrapper}>
        <View style={timerStyles.header}>
          <Text style={[timerStyles.textDisplay, styles.defaultFont]}>
            Start Activity
          </Text>
        </View>
        <View style={timerStyles.buttonWrapper}>
          <View style={timerStyles.button}>
            <Text style={timerStyles.buttonFont}>
              START
            </Text>
          </View>
        </View>
        <View style={timerStyles.timer}>
          <Text style={[styles.defaultFont, {fontSize: 18}]}>
            00:00:00
            {moment().toString()}
          </Text>
        </View>
        <View style={timerStyles.footer}>
          <View style={timerStyles.sqrButton}>
            <Text style={[styles.defaultFont,{fontSize: 20, fontWeight: '400'}]}>
              SAVE
            </Text>
          </View>
        </View>
      </View>
    )
  }

  renderWeek() {

  }
/*
  getDurations() {
    var durations = [],
        colors    = [],
        activities = this.state.day.activities;
    for(var i = 0; i < activities.length; i++) {
      durations.push(activities[i].duration);
      colors.push(activities[i].color);
    }

    this.setState({pie: {durations: durations, colors: colors}});

  }
  */

  addActivity(date, category) {
  }

  categoryList(pie, parent) {
    var dot = function(color) {
      return (
        <View style={{height: 20, width: 20, borderRadius: 20, backgroundColor: color}}></View>
      )
    }
    return pie.activities.map(function(obj, index){
      return (
        <View key={obj.id} style={{flexDirection: 'row', alignItems: 'center', padding: 3}}>
          {dot(obj.category.color)}
          <Text style={[{fontSize: 17, paddingLeft: 6}, styles.defaultFont]}>
            {obj.category.name}
          </Text>

          <Text style={[{fontSize: 17}, styles.defaultFont]}>
            : {obj.duration ? moment.duration(obj.getDuration(parent.state.day.date.format('YYYY-MM-DD')), 'milliseconds').humanize() : 0}
          </Text>
        </View>
      )
    });
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#282828',
  },
  defaultFont: {
    color: '#aeaeae',
    fontWeight: '400'
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

const timerStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#282828'
  },
  header: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  textDisplay: {
    fontSize: 18,
  },
  buttonWrapper: {
    flex: 2,
    alignItems: 'center'
  },
  button: {
    backgroundColor: '#545454',
    borderColor: '#aeaeae',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 90,
    width: 180,
    height: 180
  },
  buttonFont: {
    fontSize: 16,
    color: '#aeaeae',
    fontWeight: '400'
  },
  sqrButton: {
    width: 200,
    height: 50,
    borderWidth: 2,
    borderColor: '#aeaeae',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#418b10'
  },
  timer: {
    flex: 2,
    alignItems: 'center'
  },
  footer: {
    flex: 2,
    alignItems: 'center'
  }

});

AppRegistry.registerComponent('habit', () => habit);
