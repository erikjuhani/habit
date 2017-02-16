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
  TouchableHighlight,
  TextInput,
  Navigator,
  ScrollView,
  Dimensions
} from 'react-native';

import moment from 'moment';
import PieChart from 'react-native-pie-chart';
import Swiper from 'react-native-swiper';
import Calendar from 'react-native-calendar';
import * as firebase from 'firebase';

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC2MswomuyAqgT8YidVIOEDW3eSdPdnFy0",
  authDomain: "habit-7e89d.firebaseapp.com",
  databaseURL: "https://habit-7e89d.firebaseio.com",
  storageBucket: "habit-7e89d.appspot.com",
  messagingSenderId: "108356244031"
};
const firebaseApp = firebase.initializeApp(firebaseConfig);
var dbRef = firebaseApp.database().ref(),
    userDB = null,
    proRef = null,
    catRef = null,
    actRef = null;

var db = firebaseApp.database();

const auth = firebase.auth();

// auth.signInWithEmailAndPassword(email, pass);

var email = 'dude@email.com',
    pass  = 'helloWorld12345',
    currentUser = null;

function createUser(email, pass) {
  auth.createUserWithEmailAndPassword(email, pass);
}

function signIn(email, pass) {
  auth.signInWithEmailAndPassword(email, pass);
}

//createUser(email, pass);
signIn(email, pass);

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
  this.color = color || '#'+Math.floor(Math.random()*16777215).toString(16);
  this.activities = [];
}

var Day = function(date) {
  this.date = date;
  this.activities = [];
}

var User = function(name, email) {
  this.name = name;
  this.email = email;
  this.days;
  this.activities;
  this.categories;
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
  new Activity(0, 'sleeping', moment('2016-11-16 23:00:00'), moment('2016-11-17 08:00:00')),
  new Activity(1, 'cooking', moment('2016-11-20 12:00:00'), moment('2016-11-20 13:00:00')),
  new Activity(2, 'watchingTV', moment('2016-11-20 13:00:00'), moment('2016-11-20 15:30:00')),
  new Activity(3, 'studying', moment('2016-11-20 16:00:00'), moment('2016-11-20 18:30:00')),
  new Activity(4, 'coding', moment('2016-11-20 15:00:00'), moment('2016-11-20 19:00:00')),
  new Activity(5, 'sleeping', moment('2016-11-20 23:00:00'), moment('2016-11-21 08:00:00'))
];

var user = new User('dude', 'dude@email.com');

export default class habit extends Component {
  constructor(props) {
    super(props);
    //const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      selectedDate: moment(),
      pie: {
        durations: [],
        colors: []
      },
      startTime: null,
      endTime: null,
      running: false,
      timeElapsed: null,
      showCalendar: false,
      route: 0,
      currentActId: null,
      categories: {},
      activities: {},
      days: null,
      database:
        {
          userDB: null,
          proRef: null,
          catRef: null,
          actRef: null,
        },
      currentUser: null,
    }
  }

  getPie() {
    var date = this.state.selectedDate.format('YYYY-MM-DD');
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
    this.setState({route: 1});
    var self = this;

    firebase.auth().onAuthStateChanged(function(authData) {
      if(authData) {

        self.setState({
          currentUser: {
            uid: authData.uid,
            email: authData.email
          }
        });

        var success = [false, false]

        var userDB = db.ref('users/' + authData.uid),
            proRef = db.ref('users/' + authData.uid + 'profile'),
            catRef = userDB.child('categories'),
            actRef = userDB.child('activities');

        var name = 'sleeping',
            color = '#539492';

        catRef.child(name).set({
          name: name,
          color: color
        });
        /*
        actRef.push({
          category: 'coding',
          startDate: '2016-12-13 15:30:00',
          endDate: '2016-12-13 18:30:00'
        });
        */


        proRef.once('value', function(snapshot) {
          if(!snapshot.val()) {
            proRef.set(currentUser);
          }
        });

        catRef.once('value', function(snapshot) {
            self.setState({categories: snapshot.val()});
            success[0] = true;

            if(success[0] && success[1]) {
              self.setState({route: 0});
            }
        });

        actRef.once('value', function(snapshot) {
            snapshot.forEach((child) => {
              var id = child.key;
              if(!activities[id]) {
                var category = child.val().category,
                    startDate = child.val().startDate,
                    endDate = child.val().endDate;

                var activity = new Activity(id, category, moment(startDate), moment(endDate));
                activities[id] = activity;
              }

            });

            self.setState({activities: snapshot.val()});
            success[1] = true;
            if(success[0] && success[1]) {
              self.setState({route: 0});
            }
        });

        self.setState(
          {
            database: {
                userDB: userDB,
                proRef: proRef,
                catRef: catRef,
                actRef: actRef,
              }
          }
        );


      } else {
        currentUser = null;
      }

      actRef.on('child_added', function(snapshot) {
          var id = snapshot.key;
          if(!activities[id]) {
            var category = snapshot.val().category,
                startDate = snapshot.val().startDate,
                endDate = snapshot.val().endDate;

            var activity = new Activity(id, category, moment(startDate), moment(endDate));
            activities[id] = activity;
          }
      });

      catRef.on('child_added', function(snapshot) {
          var key = snapshot.key;
          if(!categories[key]) {
            categories[key] = new Category(key, snapshot.val().color);
          }
      });

    });
  }

  renderMain() {

  }

  render() {
    if(this.state.route === 1) return this.loading();
    if(this.state.route === 2) return this.renderNewActivity();
    if(this.state.route === 3) return this.renderNewCategory();
    if(this.state.route === 4) return this.renderActivity(this.state.currentActId);
    return (
      <Swiper
        style={{backgroundColor: '#282828'}}
        bounces={true}
        loop={false}
        index={1}
        dot={<View style={{backgroundColor: '#545454', width: 13, height: 13, borderRadius: 7, marginLeft: 7, marginRight: 5}} />}
        activeDot={<View style={{backgroundColor: '#fff', width: 17, height: 17, borderRadius: 8, marginLeft: 8, marginRight: 8}} />}
        paginationStyle={{
              bottom: 24
        }}
      >
        {this.renderProfile()}
        {this.renderDay()}
        {this.renderTimer()}
      </Swiper>
    )
    /*
    if(this.state.nav === 'day') {
      return this.renderDay();
    } else if(this.state.nav === 'timer') {
      return this.renderTimer();
    } else if(this.state.nav === 'newCat') {
      return this.renderNewCategory();
    }
    return this.loading();
    */
  }

  renderProfile() {
    return (
      <View style={[styles.container, {paddingTop: 20, alignItems: 'center'}]}>
        <View style={{flex:.1}}>
          <Text style={styles.defaultFont}>
            {this.state.categories.sleeping ? this.state.categories.sleeping.name : ''}
          </Text>
        </View>
        <View style={{flex:.2}}>
          <Text style={styles.defaultFont}>
            {this.state.currentUser ? this.state.currentUser.email : ''}
          </Text>
        </View>
        <View style={{flex:.7}}>
          <Text style={styles.defaultFont}>
            {this.state.route}
          </Text>
        </View>
      </View>
    )
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

  newCategory() {
    var category = {};
    category[this.state.catName] = this.state.catName;
  }

  renderNewCategory() {
    return (
      <View style={{flex:1, padding: 20}}>
        <View>
          <Text>
            Category name:
          </Text>
          <TextInput
            style={{height: 40, borderWidth: 2, padding: 10}}
            onChangeText={(catName) => this.setState({catName})}
            value={this.state.catName}
          />
        </View>
        <View>
          <Text>
            {categories.playing}
          </Text>
        </View>
        <View>
          <Text>
            Category color:
          </Text>
          <TextInput
            style={{height: 40, borderWidth: 2, padding: 10}}
            onChangeText={(catColor) => this.setState({catColor})}
            value={this.state.catColor}
          />
        </View>
        <TouchableHighlight
          style={[timerStyles.sqrButton, {backgroundColor: '#00CC00'}]}
          onPress={this.newCategory.bind(this)}
        >
          <Text>
            SAVE
          </Text>
        </TouchableHighlight>
      </View>
    )
  }

  pressBack() {
    if(this.state.route > 0) { this.setState({route: this.state.route - this.state.route}) }
  }

  pressActivitySaveButton() {
    const startTime = moment(this.state.activityStartTime);
    const endTime   = moment(this.state.activityEndTime);

    //let activity = new Activity(, this.state.currentCategory, startTime, endTime);

    this.state.database.actRef.push({
      category: this.state.currentCategory,
      startDate: startTime.format('YYYY-MM-DD HH:MM:SS'),
      endDate: endTime.format('YYYY-MM-DD HH:MM:SS')
    });

    this.setState({currentCategory: null, activityStartTime: null, activityEndTime: null});
  }

  renderNewActivity() {
    return (
      <View style={styles.container}>
        <TouchableHighlight
          onPress={this.pressBack.bind(this)}
          style={{padding: 30, flex:.1}}
        >
          <Text style={styles.defaultFont}>
            Back
          </Text>
        </TouchableHighlight>
        <View style={{flex:.2, alignItems: 'center'}}>
          <Text style={[styles.defaultFont, {fontSize: 20}]}>
            Add new activity
          </Text>
        </View>
        <View style={{flex:.2}}>
          <Text style={styles.defaultFont}>
            Category
          </Text>
          <TextInput
            style={{height: 40, borderWidth: 2, padding: 10}}
            onChangeText={(currentCategory) => this.setState({currentCategory})}
            value={this.state.currentCategory}
          />
        </View>
        <View style={{flex:.2}}>
          <Text style={styles.defaultFont}>
            Start Time
          </Text>
          <TextInput
            style={{height: 40, borderWidth: 2, padding: 10}}
            onChangeText={(activityStartTime) => this.setState({activityStartTime})}
            value={this.state.activityStartTime}
          />
        </View>
        <View style={{flex:.2}}>
          <Text style={styles.defaultFont}>
            End Time or Duration
          </Text>
          <TextInput
            style={{height: 40, borderWidth: 2, padding: 10}}
            onChangeText={(activityEndTime) => this.setState({activityEndTime})}
            value={this.state.activityEndTime}
          />
        </View>
        <TouchableHighlight
          onPress={this.pressActivitySaveButton.bind(this)}
        >
          <Text style={[styles.defaultFont,{fontSize: 20, fontWeight: '300'}]}>
            SAVE
          </Text>
        </TouchableHighlight>
      </View>
    )
  }

  renderActivity(id) {
    var self     = this;
    var activity = activities[id];
    var category,
        start,
        end;
    return (
      <View style={styles.container}>
        <TouchableHighlight
          onPress={this.pressBack.bind(this)}
          style={{padding: 30, flex:.1}}
        >
          <Text style={styles.defaultFont}>
            Back
          </Text>
        </TouchableHighlight>
        <View style={{flex:.2, alignItems: 'center'}}>
          <Text style={[styles.defaultFont, {fontSize: 20}]}>
            Edit Activity
          </Text>
        </View>
        <View style={{flex:.2}}>
          <Text style={styles.defaultFont}>
            Category:
          </Text>
          <Text>
            Change a category
          </Text>
        </View>
        <View style={{flex:.2}}>
          <Text style={styles.defaultFont}>
            Start time
          </Text>
          <TextInput
            style={{height: 40, borderWidth: 2, padding: 10}}
            onChangeText={(e) => {start = e;}}
            value={activity.startDate.format('YYYY-MM-DD HH:MM:SS')}
          />
        </View>
        <View style={{flex:.2}}>
          <Text style={styles.defaultFont}>
            End Time or Duration {activity.id}
          </Text>
          <TextInput
            style={{height: 40, borderWidth: 2, padding: 10}}
            onChangeText={(e) => {end = e;}}
            value={activity.endDate.format('YYYY-MM-DD HH:MM:SS')}
          />
        </View>
        <TouchableHighlight
          onPress={function() {
            self.state.database.actRef.child(activity.id).set({
              category: activity.category,
              startDate: activity.startDate.format('YYYY-MM-DD HH:MM:SS'),
              endDate: activity.endDate.format('YYYY-MM-DD HH:MM:SS')
            });
            delete activities[id];
          }}
        >
          <Text style={[styles.defaultFont,{fontSize: 20, fontWeight: '300'}]}>
            SAVE EDIT
          </Text>
        </TouchableHighlight>
      </View>
    )
  }

  getCalendarEvents() {
    var arr = [];
    Object.keys(days).map(function(key, index) {
      var day = {
        date: key,
        hasEventCircle: {backgroundColor: 'lightslategrey'}
      }
      arr.push(day);
    });
    return arr;
  }

  renderDay() {
    var pie = this.getPie();
    var durations = pie.durations;
    var offset = {x:0, y:285}
    return (
      <View style={styles.container}>
        <ScrollView
          ref={(scrollView) => { _scrollView = scrollView; }}
          contentOffset={offset}
          scrollEnabled={false}
          centerContent={false}
          contentInset={{bottom: 315}}
          style={{paddingTop:20}}
        >
          <Calendar
            ref='calendar'
            eventDates={['2016-11-19', '2016-11-20', '2016-11-21', '2016-11-22']}
            events={this.getCalendarEvents()}
            showControls
            titleFormat={'MMMM YYYY'}
            prevButtonText={'Prev'}
            nextButtonText={'Next'}
            customStyle={{
              calendarContainer: {backgroundColor: '#545454'},
              day: {fontSize: 16, color: '#282828'},
              dayButton: {borderTopColor: '#545454'},
              calendarHeading: {borderColor: '#343434'},
              selectedDayCircle: {backgroundColor: '#282828'},
              currentDayCircle: {backgroundColor: 'cadetblue'},
              currentDayText: {color: '#fff', fontWeight: '600'}
            }}
            onDateSelect={(date) => this.setState({ selectedDate: moment(date) })}
          />
          <TouchableHighlight
            style={{borderBottomWidth: 1, paddingTop: 50, backgroundColor: '#545454'}}
            onPress={() => {
              if(this.state.showCalendar) {
                _scrollView.scrollTo({y: 285});
                this.state.showCalendar = false;
              } else {
                _scrollView.scrollTo({y: 0});
                this.state.showCalendar = true;
              }
            }}
          >
            <View></View>
          </TouchableHighlight>
          <View style={{alignSelf:'center', padding: 20}}>
            <TouchableHighlight
              onPress={function(){return;}}
              style={{borderRadius: 10, padding: 4}}
            >
              <Text style={[{fontSize: 18}, styles.defaultFont]}>
                {this.state.selectedDate.format('LL')}
              </Text>
            </TouchableHighlight>
          </View>
          <View style={{alignSelf:'center'}}>
            <PieChart
              chart_wh={260}
              series={durations}
              sliceColor={pie.colors}
            />
          </View>
          <View style={{paddingLeft: 30, paddingTop: 20, paddingRight: 30}}>
            {this.categoryList(pie, this)}
          </View>
        </ScrollView>
      </View>
    );
    this.refs._scrollView.scrollTo({x: 0, y: 265, animated: true})
  }

  pressTimerButton() {
    if(this.state.running) {
      clearInterval(this.interval);
      this.setState({running:false, endTime: moment()});
      return;
    } else if(this.state.startTime){
      this.setState({startTime: this.state.startTime});
    } else {
      this.setState({startTime: moment()});
    }

    this.interval = setInterval(() => {
      this.setState({
        timeElapsed: moment() - this.state.startTime,
        running: true
      });
    }, 30);
  }

  pressClearButton() {
    if(!this.state.running) {
      this.setState({startTime: null, running: false, timeElapsed: null, endTime: null});
    }
  }

  pressSaveButton() {
    if(this.state.startTime && !this.state.running && this.state.timeElapsed >= 120000) {
      new Activity(6, 'unknown', this.state.startTime, moment());
      //activities.push(activity);
      this.setState({startTime: null, running: false, timeElapsed: null, endTime: null, nav:'day'});
    }
  }

  pressAddButton() {
    this.setState({route: 2});
  }

  renderTimer() {
    return(
      <View style={timerStyles.wrapper}>
        <View style={timerStyles.header}>
          <Text style={[timerStyles.textDisplay, styles.defaultFont]}>
            Start Activity
          </Text>
        </View>

        <View style={{alignItems: 'center', paddingBottom: 10}}>
          <Text style={[styles.defaultFont, {fontSize: 18, width: 165}]}>
            Start time: {this.state.startTime ? this.state.startTime.format('HH:mm:ss') : '00:00:00'}
          </Text>
        </View>
        <View style={timerStyles.timer}>
          <Text style={[styles.defaultFont, {fontSize: 24, width: 163}]}>
            {this.state.timeElapsed ? moment.utc(this.state.timeElapsed).format('HH:mm:ss.SSS') : '00:00:00.000'}
          </Text>
        </View>
        <View style={timerStyles.buttonWrapper}>
          <TouchableHighlight
            style={this.state.running ? timerStyles.stopButton : timerStyles.startButton}
            onPress={this.pressTimerButton.bind(this)}
          >
            <Text style={timerStyles.buttonFont}>
              {this.state.running ? 'STOP' : this.state.timeElapsed ? 'CONTINUE' : 'START'}
            </Text>
          </TouchableHighlight>
        </View>
        <View style={timerStyles.footer}>
          <TouchableHighlight
            style={timerStyles.sqrButton}
            onPress={this.pressSaveButton.bind(this)}
          >
            <Text style={[styles.defaultFont,{fontSize: 20, fontWeight: '300'}]}>
              SAVE
            </Text>
          </TouchableHighlight>
          <TouchableHighlight
            style={timerStyles.sqrButton}
            onPress={this.pressClearButton.bind(this)}
          >
            <Text style={[styles.defaultFont,{fontSize: 20, fontWeight: '300'}]}>
              CLEAR
            </Text>
          </TouchableHighlight>
        </View>
        <View style={timerStyles.footer}>
          <TouchableHighlight
            style={timerStyles.sqrButton}
            onPress={this.pressAddButton.bind(this)}
          >
            <Text style={[styles.defaultFont,{fontSize: 20, fontWeight: '300'}]}>
              ADD
            </Text>
          </TouchableHighlight>
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

  pressActivityListItem(key, parent) {
    parent.setState({currentActId: key, route: 4});
  }

  categoryList(pie, parent) {
    var dot = function(color) {
      return (
        <View style={{height: 20, width: 20, borderRadius: 20, backgroundColor: color}}></View>
      )
    }
    return pie.activities.map(function(obj, index){
      return (
        <TouchableHighlight key={index}
          onPress={() => {parent.pressActivityListItem(obj.id, parent)}}
          style={{borderRadius: 10, padding: 2}}
        >
          <View key={obj.id} style={{flexDirection: 'row', padding: 3}}>
            {dot(obj.category.color)}
            <Text style={[{fontSize: 17, paddingLeft: 6}, styles.defaultFont]}>
              {obj.category.name}
            </Text>
            <Text style={[{fontSize: 17}, styles.defaultFont]}>
              : {obj.duration ? moment.duration(obj.getDuration(parent.state.selectedDate.format('YYYY-MM-DD')), 'milliseconds').humanize() : 0}
            </Text>
          </View>
        </TouchableHighlight>
      )
    });
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'space-between',
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
    justifyContent: 'center',
    paddingTop: 12
  },
  textDisplay: {
    fontSize: 18,
  },
  buttonWrapper: {
    flex: 2,
    alignItems: 'center'
  },
  startButton: {
    backgroundColor: '#545454',
    borderColor: '#aeaeae',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 80,
    width: 160,
    height: 160
  },
  stopButton: {
    backgroundColor: '#a21c2f',
    borderColor: '#aeaeae',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 80,
    width: 160,
    height: 160
  },
  buttonFont: {
    fontSize: 16,
    color: '#aeaeae',
    fontWeight: '400'
  },
  sqrButton: {
    width: 120,
    height: 50,
    borderWidth: 2,
    borderColor: '#aeaeae',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#545454'
  },
  timer: {
    flex: 1,
    alignItems: 'center'
  },
  footer: {
    flex: 1,
    justifyContent: 'space-around',
    flexDirection: 'row'
  }

});

AppRegistry.registerComponent('habit', () => habit);
