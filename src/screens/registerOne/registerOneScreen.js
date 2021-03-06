import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  Dimensions,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  BackHandler
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import PhoneInput from "react-native-phone-input";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from "react-native-responsive-screen";
import AsyncStorage from "@react-native-community/async-storage";
const width = Math.round(Dimensions.get("window").width);
const statusBarBackgroundColor = "#1CCBE6";
const barStyle = "light-content";
import HeaderCurve from "../includes/headercurve";
import httpService from "../../services/http/httpService";

import OneSignal from "react-native-onesignal";

export default class RegisterOneScreen extends Component {
  _didFocusSubscription;
  _willBlurSubscription;
  constructor(props) {
    super(props);
    this._didFocusSubscription = props.navigation.addListener(
      "didFocus",
      payload =>
        BackHandler.addEventListener("hardwareBackPress", this.onGoBack)
    );
    this.state = {
      screen: "login2",
      isSecured: true,
      eyeIcon: require("../../../assets/images/eye_cross.png"),
      loader: false,
      success: null,

      email: "",
      errorEmail: false,
      mobile_number: "",
      errorMobileNumber: false,
      password: "",
      errorPassword: false,
      errorMessage: "",
      successMessage: "",
      device_token: "",
      cca2: "",
      valid: true,
      type: "",
      value: "",
      countyCode: ""
    };

    OneSignal.setLogLevel(6, 0);
    OneSignal.inFocusDisplaying(2);
    OneSignal.init("192b5885-9d77-4e2d-b5eb-d641e8e74bba", {
      kOSSettingsKeyAutoPrompt: true,
      kOSSettingsKeyInFocusDisplayOption: 2
    });

    OneSignal.addEventListener("ids", this.onIds);
  }

  async componentDidMount() {
    this.updateInfo();
    // const device_token = await AsyncStorage.getItem("device_token");
    // console.log("regis token", device_token);
    // alert(device_token);
    // this.setState({ device_token: device_token });
    this._willBlurSubscription = this.props.navigation.addListener(
      "willBlur",
      payload =>
        BackHandler.removeEventListener("hardwareBackPress", this.onGoBack)
    );
    OneSignal.addEventListener("ids", device => {
      // console.log("[OneSignal]>>ids: ", device);
      //alert(device.userId);
      if (device.userId) {
        this.setState({
          device_token: device.userId
        });
      }
    });
  }
  componentWillUnmount() {
    OneSignal.removeEventListener("ids", this.onIds);
  }

  _doRegister = () => {
    // alert(this.state.device_token);
    const numRgex = /^\+\d+$/;
    const email_rejex = /^\w+([\D.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    this.setState({
      errorEmail: false,
      errorMobileNumber: false,
      errorPassword: false,
      errorMessage: "",
      successMessage: ""
    });
    if (
      this.state.email == "" ||
      this.state.mobile_number == "" ||
      this.state.password == "" ||
      this.state.device_token == ""
    ) {
      if (this.state.email == "") {
        this.setState({
          errorEmail: true,
          errorMessage: httpService.appMessege.empty_field
        });
      }

      if (this.state.mobile_number == "") {
        this.setState({
          errorMobileNumber: true,
          errorMessage: httpService.appMessege.empty_field
        });
      }

      if (this.state.password == "") {
        this.setState({
          errorPassword: true,
          errorMessage: httpService.appMessege.empty_field
        });
      }
      if (this.state.device_token == "") {
        this.setState({
          errorMessage: "Device token not found"
        });
      }
    } else {
      if (email_rejex.test(this.state.email) !== true) {
        this.setState({
          errorEmail: true,
          errorMessage: "Please provide a valid email address"
        });
      }
      // if (!this.state.device_token) {
      //   this.setState({
      //     errorMobileNumber: true,
      //     errorMessage: "Please refresh again. Device token not found"
      //   });
      // }
      if (!this.state.valid) {
        this.setState({
          errorMobileNumber: true,
          errorMessage: "Please provide a valid mobile number"
        });
      }
    }
    setTimeout(
      function() {
        if (!this.state.errorMessage) {
          let that = this;
          let thatNavigation = this.props.navigation;
          let mobileNo = this.state.mobile_number.replace(
            this.state.countyCode,
            ""
          );
          let obj = {
            url: "signup",
            data: {
              email: this.state.email,
              mobile_number: mobileNo,
              mobile_country_code: this.state.countyCode,
              password: this.state.password,
              device_token: this.state.device_token
            },
            authtoken: "XYZ"
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
                      errorMessage: response.message,
                      loader: false
                    });
                  }
                );
              } else {
                that.setState(
                  {
                    success: true,
                    loader: false
                  },
                  () => {
                    that.setState({
                      successMessage: response.message,
                      loader: false
                    });
                  }
                );
                AsyncStorage.multiSet(
                  [
                    ["email", that.state.email],
                    ["password", that.state.password],
                    ["mobile_number", that.state.mobile_number],
                    ["screen", "registerOnePage"],
                    ["rememberToken", response.result.remember_token],
                    ["user___id", response.result.id.toString()]
                  ],
                  function(error) {
                    setTimeout(
                      function() {
                        thatNavigation.navigate("otpVerifyPage");
                      }.bind(this),
                      5000
                    );
                  }
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

  _doRedirectForgotPassword = () => {
    this.props.navigation.navigate("forgotPasswordPage");
  };

  _doChangeView = () => {
    this.setState({
      isSecured: !this.state.isSecured
    });
  };

  _doRedirectPrev = () => {
    this.props.navigation.navigate("LoginScreen1");
  };

  updateInfo() {
    this.setState({
      value: this.phone.getDialCode(),
      mobile_number: this.phone.getDialCode(),
      valid: this.phone.isValidNumber(),
      countyCode: "+" + this.phone.getCountryCode()
    });
  }

  onChangePhoneNumber() {
    this.setState({
      mobile_number: this.phone.getValue(),
      valid: this.phone.isValidNumber(),
      countyCode: "+" + this.phone.getCountryCode()
    });
  }

  onGoBack = () => {
    if (this.state.email != "" || this.state.password != "") {
      Alert.alert("Confirmation", "You will lose unsave data", [
        { text: "No", onPress: () => (No = "no") },
        { text: "OK", onPress: () => this.props.navigation.goBack() }
      ]);
      return true;
    } else {
      this.props.navigation.goBack();
      return true;
    }
    return true;
  };

  render() {
    const eyeIcon = this.state.isSecured
      ? require("../../../assets/images/eye_cross.png")
      : require("../../../assets/images/eye.png");

    const errorEmail = this.state.errorEmail
      ? styles.inputTextStyleRequired
      : styles.inputTextStyleInactive;

    const errorMobileNumber = this.state.errorMobileNumber
      ? styles.inputTextStyleRequiredMob
      : styles.inputTextStyleInactiveMob;

    const errorPassword = this.state.errorPassword
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
          keyboardShouldPersistTaps={"handled"}
        >
          <View
            style={{
              flex: 1,
              position: "relative"
            }}
          >
            <HeaderCurve
              title={"Create Account"}
              navigation={this.props.navigation}
              backButton={true}
              backAlert={
                this.state.email != "" || this.state.password != ""
                  ? true
                  : false
              }
            />

            <View
              style={{
                flex: 1
              }}
            >
              <View
                style={{
                  flex: 1,
                  marginLeft: 20,
                  marginRight: 20
                }}
              >
                <View style={styles.imageWrapper}>
                  <Image
                    source={require("../../../assets/images/registration.png")}
                    resizeMode={"contain"}
                    style={{
                      width: hp("35%"),
                      height: hp("35%")
                    }}
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
                    returnKeyType="go"
                    keyboardType="email-address"
                    onSubmitEditing={() => this.phone.focus()}
                  />
                  <View
                    style={{
                      position: "absolute"
                    }}
                  >
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
                    flexDirection: "row",
                    position: "relative",
                    marginTop: 10,
                    alignItems: "center"
                  }}
                >
                  <PhoneInput
                    ref={ref => {
                      this.phone = ref;
                    }}
                    textProps={{ placeholder: "Phone Number", fontSize: 18 }}
                    value={this.state.value}
                    initialCountry={"in"}
                    onChangePhoneNumber={() => this.onChangePhoneNumber()}
                    allowZeroAfterCountryCode={false}
                    style={errorMobileNumber}
                    buttonColor={"#5AC6C6"}
                    confirmTextStyle={{ color: "#5AC6C6" }}
                    cancelTextStyle={{ color: "#5AC6C6" }}
                    onSelectCountry={() => this.updateInfo()}
                    returnKeyType="next"
                    onSubmitEditing={() => this.password.focus()}
                  />

                  {/* <View
						style={{
						  position: 'absolute'
						}}
					  >
						<Image
						  source={require('../../../assets/images/phone.png')}
						  style={{
							width: 20,
							height: 20
						  }}
						/>
					  </View> */}
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
                    style={[
                      errorPassword,
                      {
                        paddingRight: 40
                      }
                    ]}
                    onChangeText={password => this.setState({ password })}
                    placeholder="Password"
                    secureTextEntry={this.state.isSecured}
                    autoCapitalize="none"
                    returnKeyType="done"
                    onSubmitEditing={() => this._doRegister()}
                  />
                  <View
                    style={{
                      position: "absolute"
                    }}
                  >
                    <Image
                      source={require("../../../assets/images/lock.png")}
                      style={{
                        width: 20,
                        height: 20
                      }}
                    />
                  </View>

                  <TouchableOpacity
                    style={{
                      position: "absolute",
                      left: width - 70
                    }}
                    onPress={() => this._doChangeView()}
                  >
                    <Image
                      source={eyeIcon}
                      style={{
                        width: 20,
                        height: 20
                      }}
                    />
                  </TouchableOpacity>
                </View>

                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 10
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
                  onPress={() => this._doRegister()}
                  style={styles.sendButtonBlockActive}
                  disabled={this.state.loader}
                >
                  <Text style={styles.sendButtonText}>Create Account</Text>

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
  inputTextStyleActive: {
    flex: 1,
    height: 40,
    //borderBottomColor: '#dfdfe1',
    borderBottomColor: "#1DC2E0",
    borderBottomWidth: 1,
    color: "#000000",
    fontSize: 18,
    fontFamily: "Roboto-Reguler",
    paddingLeft: 40,
    paddingVertical: 0
  },
  sendButtonBlockActive: {
    marginTop: 50,
    height: 50,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#5AC6C6",
    elevation: 2,
    flexDirection: "row"
  },
  sendButtonBlockInActive: {
    marginTop: 40,
    height: 50,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#5AC6C6",
    elevation: 2
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
  loading: {
    marginLeft: 10
  },
  inputTextStyleInactive: {
    flex: 1,
    height: 40,
    borderBottomColor: "#1DC2E0", // normal
    borderBottomWidth: 1,
    color: "#000000",
    fontSize: 18,
    fontFamily: "Roboto-Reguler",
    paddingLeft: 40,
    paddingVertical: 0
  },
  inputTextStyleRequired: {
    flex: 1,
    height: 40,
    borderBottomColor: "red", // required
    borderBottomWidth: 1,
    color: "#000000",
    fontSize: 18,
    fontFamily: "Roboto-Reguler",
    paddingLeft: 40,
    paddingVertical: 0
  },

  inputTextStyleInactiveMob: {
    flex: 1,
    height: 40,
    borderBottomColor: "#1DC2E0", // normal
    borderBottomWidth: 1,
    color: "#000000",
    fontSize: 18,
    fontFamily: "Roboto-Reguler",
    paddingVertical: 0
  },
  inputTextStyleRequiredMob: {
    flex: 1,
    height: 40,
    borderBottomColor: "red", // required
    borderBottomWidth: 1,
    color: "#000000",
    fontSize: 18,
    fontFamily: "Roboto-Reguler",
    paddingVertical: 0
  }
});
