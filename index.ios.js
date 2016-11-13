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
  View
} from 'react-native';

import Moment from 'moment';
import PieChart from 'react-native-pie-chart';

var dummyDurations = [1, 3, 4, 16];
var dummyActivities = [
  {
    category: 'Default',
    duration: 7,
    color: '#CCCCCC'
  },
  {
    category: 'Sleep',
    duration: 8,
    color: '#00CC00'
  },
  {
    category: 'Work',
    duration: 8,
    color: '#4CAF50'
  },
  {
    category: 'Cooking',
    duration: 1,
    color: '#CC0000'
  },
];
var mockDay = {
  date: new Date(),
  activities: dummyActivities
}

var sliceColor = ['#FFFFFF', '#00CC00', '#4CAF50', '#CCCCCC'];
var chart_wh = 250;

export default class habit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      day: mockDay,
      pie: {
        durations: [],
        colors: []
      }
    }
  }

  componentDidMount() {
    this.getDurations();
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={{flex: 1, justifyContent: 'center'}}>
          <PieChart
            chart_wh={chart_wh}
            series={this.state.pie.durations}
            sliceColor={this.state.pie.colors}
          />
        </View>
        <View style={{flex: 1, alignSelf: 'flex-start', paddingLeft: 30}}>
          <Text>
            Default
          </Text>
        </View>
      </View>
    );
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

  dot() {

  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
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

AppRegistry.registerComponent('habit', () => habit);
