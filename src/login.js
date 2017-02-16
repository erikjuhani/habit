import React, { Component } from 'react';
import {
  StyleSheet,
  TouchableHighlight,
  TextInput,
  Text,
  View,
} from 'react-native';

export default class LoginComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: null,
      password1: null,
      password2: null,
      authState: null,
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <View>
          <Text>
            Header
          </Text>
        </View>
        <View>
          <Text>
            Body
          </Text>
          <View>
            <TextInput/>
          </View>
        </View>
        <View>
          <Text>
            Footer
          </Text>
        </View>
      </View>
    )
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
