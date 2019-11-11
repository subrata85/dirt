import React, { Component } from "react";
import {
  Text,
  View,
  StyleSheet,
  Animated,
  TouchableOpacity
} from "react-native";

export default class CustomToast extends Component {
  state = {
    animation: new Animated.Value(1)
  };

  componentDidMount() {
    Animated.timing(this.state.animation, {
      toValue: 0,
      duration: 5000
    }).start();
  }

  render() {
    const animationStyles = {
      opacity: this.state.animation
    };
    return (
      <View style={styles.container}>
        <Animated.View
          style={{
            opacity: this.state.animation,
            height: 250,
            width: 200,
            margin: 5,
            borderRadius: 12,
            backgroundColor: "#347a2a",
            justifyContent: "center"
          }}
        >
          <Text style={{color:"red"}}>Fade </Text>
        </Animated.View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center"
  },
  item: {},
 