import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  StatusBar,
  Dimensions,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Keyboard
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import FeatherIcon from "react-native-vector-icons/Feather";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from "react-native-responsive-screen";
import AsyncStorage from "@react-native-community/async-storage";

const width = Math.round(Dimensions.get("window").width);
const height = Math.round(Dimensions.get("window").height);

const statusBarBackgroundColor = "#1CCBE6";
const barStyle = "light-content";

import HeaderCurve from "../includes/headercurve";
import httpService from "../../services/http/httpService";
export default class ForgotPasswordScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      success: null,
      rememberToken: null,
      email: "",
      errorEmail: false,
      errorMessage: "",
      successMessage: ""
    };
  }

  componentWillMount() {}

  componentDidUpdate() {}

  componentWillUnmount() {}

  componentDidMount() {
    this._bootstrapAsync();
  }

  _bootstrapAsync = async () => {
    AsyncStorage.multiGet(["rememberToken"]).then(response => {
      this.setState({
        rememberToken: response[0][1]
      });
    });
  };

  _doRecoverPassword = () => {
    Keyboard.dismiss();
    this.setState({
      errorEmail: false,
      errorMessage: "",
      successMessage: ""
    });

    if (this.state.email == "") {
      this.setState({
        errorEmail: true,
        errorMessage: "Email is required"
      });
    }

    setTimeout(
      function() {
        if (!this.state.errorMessage) {
          let that = this;
          let thatNavigation = this.props.navigation;
          let obj = {
            url: "forget-password",
            data: {
              email: this.state.email
            }
          };

          this.setState({
            loader: true
          });

          httpService
            .postHttpCall(obj)
            .then(response => {
              if (response.status == 300) {
                that.setState(
                  {
                    success: false,
                    loader: false
                  },
                  () => {
                    that.setState({
                      errorMessage: response.message
                    });
                  }
                );
              } else {
                that.setState({
                  successMessage: response.message
                });
                setTimeout(
                  function() {
                    thatNavigation.navigate("loginPage");
                  }.bind(this),
                  3000
                );
              }
            })
            .catch(err => {
              that.setState({ errorMessage: err.message, loader: false });
            });
        }
      }.bind(this),
      500
    );
  };

  _doRedirectPrev = () => {
    this.props.navigation.navigate("LoginScreen1");
  };

  render() {
    const errorEmail = this.state.errorEmail
      ? styles.inputTextStyleRequired
      : styles.inputTextStyleInactive;

    return (
      <View style={styles.container}>
        <StatusBar
          backgroundColor={statusBarBackgroundColor}
          barStyle={barStyle}
        />

        <KeyboardAwareScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ flex: 1, position: "relative" }}>
            <HeaderCurve />

            <View style={styles.headerMenu}>
              <TouchableOpacity
                style={styles.containerBackBlock}
                onPress={() => this.props.navigation.goBack()}
              >
                <FeatherIcon name="arrow-left" size={25} color="#FFFFFF" />
              </TouchableOpacity>
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Text style={styles.headingBold}>
                  Forgot <Text style={styles.headingLight}> your </Text>Password
                </Text>
              </View>
              <View style={styles.containerBackBlock} />
            </View>

            <View style={{ flex: 1, marginTop: hp("5%") }}>
              <View
                style={{
                  flex: 1,
                  marginLeft: 20,
                  marginRight: 20,
                  marginTop: 20
                }}
              >
                <View style={styles.imageWrapper}>
                  <Image
                    source={require("../../../assets/images/forgot.png")}
                    resizeMode={"contain"}
                    style={{ width: hp("35%"), height: hp("35%") }}
                  />
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    position: "relative",
                    marginTop: 10,
                    alignItems: "center"
                  }}
                >
                  <TextInput
                    autoFocus={true}
                    style={errorEmail}
                    onChangeText={email => this.setState({ email })}
                    placeholder="Email"
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                  <View style={{ position: "absolute" }}>
                    <Image
                      source={require("../../../assets/images/email.png")}
                      style={{
                        width: 20,
                        height: 20
                      }}
                    />
                  </View>
                </View>
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 5
                  }}
                >
                  {this.state.successMessage ? (
                    <Text
                      style={{
                        color: "green",
                        fontFamily: "Roboto-Reguler",
                        fontSize: 16
                      }}
                    >
                      {this.state.successMessage}
                    </Text>
                  ) : (
                    <Text
                      style={{
                        color: "red",
                        fontFamily: "Roboto-Reguler",
                        fontSize: 16
                      }}
                    >
                      {this.state.errorMessage}
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  onPress={() => this._doRecoverPassword()}
                  style={styles.sendButtonBlock}
                  disabled={this.state.loader}
                >
                  <Text style={styles.sendButtonText}>Send</Text>

                  {this.state.loader ? (
                    <View style={styles.loading}>
                      <ActivityIndicator size="small" color={"#FFFFFF"} />
                    </View>
                  ) : null}
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View style={{ marginTop: 20 }} />
        </KeyboardAwareScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  containerBackBlock: {
    justifyContent: "center",
    width: 60
  },

  containerImageBlock: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    height: height / 4,
    backgroundColor: "#C6F3F0"
  },

  forgotPasswordBlock: {
    marginTop: 20,
    justifyContent: "center",
    alignItems: "center"
  },

  inputTextStyleInactive: {
    flex: 1,
    height: 40,
    borderBottomColor: "#1DC2E0",
    borderBottomWidth: 1,
    color: "#000000",
    fontSize: 18,
    fontFamily: "Roboto-Reguler",
    paddingLeft: 40,
    paddingVertical: 0
  },

  sendButtonBlock: {
    marginTop: 50,
    height: 50,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#5AC6C6",
    elevation: 2,
    flexDirection: "row"
  },
  sendButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Roboto-Reguler"
  },

  imageWrapper: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    height: hp("30%")
  },
  headerMenu: {
    flexDirection: "row",
    height: 40,
    justifyContent: "space-between",
    alignItems: "center",
    paddingLeft: 20,
    paddingRight: 20,
    top: hp("3%")
  },
  headingBold: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Roboto-Reguler",
    fontWeight: "600"
  },
  headingLight: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Roboto-Reguler",
    fontWeight: "200"
  },
  loading: {
    marginLeft: 20
  },
  inputTextStyleRequired: {
    flex: 1,
    height: 40,
    borderBottomColor: "red",
    borderBottomWidth: 1,
    color: "#000000",
    fontSize: 18,
    fontFamily: "Roboto-Reguler",
    paddingLeft: 40,
    paddingVertical: 0
  }
});
