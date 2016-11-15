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

var drawPie = function(date) {
  this.durations = [];
  this.activities = [];
  if(days[date]) {
    var a = days[date].activities;
    for(var i = 0; i < a.length; i++) {
      var activity = a[i];
      if(a[i].multiple) {
        if(moment(date).isSame(activity.startDate.format(), 'day')) {
          this.activities.push(activity);
          this.durations.push(activity.dur0);
        } else {
          this.activities.push(activity);
          this.durations.push(a[i].dur1);
        }
      } else {
        this.activities.push(activity);
        this.durations.push(a[i].duration);
      }
    }
  }
}

var mockActivities = [
  {
    id: 0,
    category: 'Default',
    startDate: moment('2016-11-15 00:00:00'),
    endDate: moment('2016-11-15 23:59:59'),
    duration: function() {return this.endDate.subtract(this.startDate.hours()).hours() + 1;}
  },
  {
    id: 1,
    category: 'Sleep',
    startDate: moment('2016-11-14 23:00:00'),
    endDate: moment('2016-11-15 08:00:00'),
    duration: function() {return moment.duration(this.endDate.diff(this.startDate)).asMilliseconds();}
  }
]

var dummyActivities = [
  {
    id: 0,
    category: 'Default',
    duration: 5,
    color: '#CCCCCC'
  },
  {
    id: 1,
    category: 'Sleep',
    duration: 8,
    color: '#00CC00'
  },
  {
    id: 2,
    category: 'Work',
    duration: 8,
    color: '#4CAF50'
  },
  {
    id: 3,
    category: 'Cooking',
    duration: 1,
    color: '#CC0000'
  },
  {
    id: 4,
    category: 'Watching tv',
    duration: 2,
    color: '#CCC000'
  }
];
var mockDay = {
  date: moment(),
  activities: dummyActivities
}

var sliceColor = ['#FFFFFF', '#00CC00', '#4CAF50', '#CCCCCC'];
var chart_wh = 250;

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

  componentDidMount() {
    this.getDurations();
    this.setState({nav: 'day'});
    console.log('hey');
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

  renderDay() {
    return (
      <View style={styles.container}>
        <View style={{flex:1, justifyContent: 'center', alignItems: 'center', paddingTop: 32}}>
          <Text style={{fontSize: 18}}>
            {this.state.day.date.format('LL')} {mockActivities[1].duration()}
          </Text>
        </View>
        <View style={{flex: 4, justifyContent: 'center'}}>
          <PieChart
            chart_wh={chart_wh}
            series={this.state.pie.durations}
            sliceColor={this.state.pie.colors}
          />
        </View>
        <View style={{flex: 4, alignSelf: 'flex-start', paddingLeft: 30}}>
          {this.categoryList()}
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


  addActivity(date, category) {
  }

  getDurationsAlt(date) {
    var durations = [],
        colors    = [],
        activities = mockActivities;

    for(var i = 0; i < mockActivities.length; i++) {

    }
  }

  categoryList() {
    var dot = function(color) {
      return (
        <View style={{height: 20, width: 20, borderRadius: 20, backgroundColor: color}}></View>
      )
    }
    return this.state.day.activities.map(function(obj, index){
      return (
        <View key={obj.id} style={{flexDirection: 'row', alignItems: 'center', padding: 3}}>
          {dot(obj.color)}

          <Text style={{paddingLeft: 6}}>
            {obj.category}
          </Text>

          <Text>
            :{obj.duration}
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
    backgroundColor: '#F5FCFF',
  },
  defaultFont: {
    color: '#aeaeae'
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
