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
  Button,
  Picker,
  Alert
} from "react-native";
import EventEmitter from "react-native-eventemitter";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import AsyncStorage from "@react-native-community/async-storage";
import FeatherIcon from "react-native-vector-icons/Feather";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from "react-native-responsive-screen";

const width = Math.round(Dimensions.get("window").width);
const height = Math.round(Dimensions.get("window").height);

const statusBarBackgroundColor = "#1CCBE6";
const barStyle = "light-content";
import HeaderCurve from "../includes/headercurve";
import axios from "axios";
import URL from "../../config/url";
import commonService from "../../services/common/commonService";
const ApiConfig = URL;
let count = 0;
var moment = require("moment");
export default class CreateCirclePreviewScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      first_name: "",
      avatar_location: "",
      participants: [],
      loader: false,
      errorMessage: "",
      cicle_code: "",
      mobile_number: ""
    };
  }

  componentDidMount() {
    commonService.getSmsPermission(() => {
      //Sleep
    });
    this._bootstrapAsync();
  }

  _bootstrapAsync = async () => {
    AsyncStorage.multiGet([
      "rememberToken",
      "circle_code",
      "first_name",
      "avatar_location",
      "mobile_number"
    ]).then(response => {
      console.log(response[0][0]);
      console.log(response[0][1]);

      console.log(response[1][0]);
      console.log(response[1][1]);

      this.setState({
        rememberToken: response[0][1],
        cicle_code: response[1][1],
        first_name: response[2][1],
        avatar_location: {
          uri: ApiConfig.public_url + "storage/" + response[3][1]
        },
        mobile_number: response[4][1]
      });
    });
  };
  onError(error) {
    this.setState({
      avatar_location: require("../../../assets/images/contact.png")
    });
  }

  _doRedirectChangeOrder = () => {
    let participants = this.props.navigation.getParam("participants", {});
    this.props.navigation.navigate("changeOrderPage", {
      participants: participants
    });
  };

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  _doRedirectLanding = () => {
    this.props.navigation.goBack();
  };

  _doSubmitFinal = () => {
    this.setState({
      errorMessage: ""
    });

    let start_date = this.props.navigation.getParam("start_date", "");
    let end_date = this.props.navigation.getParam("end_date", "");
    let unsafe_participants = this.props.navigation.getParam(
      "participants",
      {}
    );
    let month_range = Math.abs(
      moment(start_date, "DD/MM/YYYY")
        .startOf("day")
        .diff(moment(end_date, "DD/MM/YYYY").startOf("day"), "months")
    );

    if (month_range > 6) {
      this.setState({
        errorMessage: "The duration of circle should not go above 6 months"
      });
    } else {
      this.setState({
        loader: true
      });

      let obj = {
        circle_code: this.state.cicle_code,
        target_achive: this.props.navigation.getParam("target_achive", "0"),
        round_set: this.props.navigation.getParam("round_set", "0"),
        p_round: this.props.navigation.getParam("p_round", "0"),
        start_date: this.props.navigation.getParam("start_date", "0"),
        reason_for_circle: this.props.navigation.getParam(
          "reason_for_circle",
          "0"
        )
      };

      console.log("request uri==" + ApiConfig.base_url + "create-circle");
      console.log("final request params==" + JSON.stringify(obj));
      console.log("Token ==" + this.state.rememberToken);

      let that = this;
      axios
        .post(ApiConfig.base_url + "create-circle", JSON.stringify(obj), {
          headers: {
            Authorization: "Bearer " + that.state.rememberToken
          }
        })
        .then(function(response) {
          EventEmitter.emit("validatedCircleCreation", true);
          commonService.getSmsPermission(res => {
            if (res) {
              unsafe_participants.forEach(element => {
                console.log("preview emement", element);
                if (
                  element.mobile_number.toString() !=
                  that.state.mobile_number.toString()
                ) {
                  commonService.sendDirectSms(
                    element.mobile_number.toString(),
                    "Hello,\nI have added you to a new circle(" +
                      that.state.cicle_code +
                      ")"
                  );
                }
              });
            }
          });
          console.log("here..............");
          that.props.navigation.navigate("dashboardPage");
        })
        .catch(function(error) {
          console.log("error==" + JSON.stringify(error.response));
        })
        .finally(function() {
          console.log("always executed");
          that.setState({
            loader: false
          });
        });
    }
  };

  render() {
    const participants = this.props.navigation.getParam("participants", {});
    const joinParticipantList = participants.map(function(data, i) {
      console.log("participants", data);
      return (
        <Text key={i} style={[styles.frmLabelRight, { marginTop: 5 }]}>
          {i + 1}. {data.username} ({data.mobile_country_code}
          {data.mobile_number})
        </Text>
      );
    });
    const target_achive = this.props.navigation.getParam("target_achive", "0");

    const round_set = this.props.navigation.getParam("round_set", "0");
    const p_round = this.props.navigation.getParam("p_round", "");
    const start_date = this.props.navigation.getParam("start_date", "");
    const reason_for_circle = this.props.navigation.getParam(
      "reason_for_circle",
      ""
    );

    const end_date = this.props.navigation.getParam("end_date", "");
    const estimate_round = this.props.navigation.getParam(
      "estimate_round",
      "0"
    );
    console.log("state preview", this.state.participants);
    return (
      <View style={styles.container}>
        <StatusBar
          backgroundColor={statusBarBackgroundColor}
          barStyle={barStyle}
        />

        <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View
            style={{
              flex: 1,
              position: "relative"
            }}
          >
            <HeaderCurve
              //title={"Welcome Dashboard"}
              navigation={this.props.navigation}
              avatar_location={this.state.avatar_location}
              backButton={true}
              first_name={this.state.first_name}
              bellIcon={true}
            />
            {/* <HeaderCurve /> */}

            {/*<View style={styles.headerMenu}>
               <TouchableOpacity
                style={styles.containerBackBlock}
                onPress={() => this._doRedirectLanding()}
              >
                <FeatherIcon name="arrow-left" size={25} color="#FFFFFF" />
              </TouchableOpacity> */}

            {/* <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <View style={styles.avatarImageWrapper}>
                  <Image
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20
                    }}
                    source={this.state.avatar_location}
                    onError={this.onError.bind(this)}
                  />
                </View>
                <Text style={styles.avatarName}>{this.state.first_name}</Text>
              </View> */}

            {/* <TouchableOpacity
                style={styles.containerBackBlock}
                onPress={() => this.props.navigation.goBack()}
              >
                <Image
                  style={{
                    width: 20,
                    height: 20,
                    alignSelf: "flex-end"
                  }}
                  source={require("../../../assets/images/notification.png")}
                />

                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationText}>99</Text>
                </View>
              </TouchableOpacity> 
            </View>*/}

            <View
              style={{
                flex: 1,
                marginBottom: 20,
                marginTop: 8
              }}
            >
              <View
                style={{
                  flex: 1,
                  marginLeft: 20,
                  marginRight: 20
                }}
              >
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                  <Text style={styles.headingText}>Create Circle Preview</Text>
                </View>

                <View style={styles.frmInputWrapper}>
                  <Text style={styles.frmLabel}>Target to Achieve:</Text>
                  <Text style={styles.frmLabelRight}>€{target_achive}</Text>
                </View>
                <View style={styles.frmInputWrapper}>
                  <Text style={styles.frmLabel}>Round Settlement:</Text>
                  <Text style={styles.frmLabelRight}>€{round_set}</Text>
                </View>
                <View style={styles.frmInputWrapper}>
                  <Text style={styles.frmLabel}>Periodicity of round:</Text>
                  <Text style={styles.frmLabelRight}>
                    {this.capitalizeFirstLetter(p_round)}
                  </Text>
                </View>
                <View style={styles.frmInputWrapperColumn}>
                  <Text style={styles.frmLabel}>
                    Personal reason for circle:
                  </Text>
                  <Text style={[styles.frmLabelRight, { marginTop: 5 }]}>
                    {reason_for_circle}
                  </Text>
                </View>
                <View style={styles.frmInputWrapper}>
                  <Text style={styles.frmLabel}>Wishing start date:</Text>
                  <Text style={styles.frmLabelRight}>{start_date}</Text>
                </View>

                <View style={styles.frmInputWrapperMargin}>
                  <View style={{ justifyContent: "center" }}>
                    <Text style={styles.frmLabel}>Circle participants:</Text>
                    {joinParticipantList}
                  </View>

                  <TouchableOpacity
                    onPress={() => this._doRedirectChangeOrder()}
                    style={styles.changeOrderButtonBlock}
                  >
                    <Text style={styles.changeOrderButtonText}>
                      Change order
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.frmInputWrapper}>
                  <Text style={styles.frmLabel}>
                    Number of expected rounds:
                  </Text>
                  <Text style={styles.frmLabelRight}>{estimate_round}</Text>
                </View>

                <View style={styles.frmInputWrapper}>
                  <Text style={styles.frmLabel}>Expected end date:</Text>
                  <Text style={styles.frmLabelRight}>{end_date}</Text>
                </View>

                {this.state.errorMessage ? (
                  <View
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      marginTop: 20
                    }}
                  >
                    <Text
                      style={{
                        color: "red",
                        fontFamily: "Roboto-Reguler",
                        fontSize: 16
                      }}
                    >
                      {this.state.errorMessage}
                    </Text>
                  </View>
                ) : null}

                <View style={styles.frmInputWrapper}>
                  <TouchableOpacity
                    style={styles.returnButtonBlock}
                    onPress={() => this._doRedirectLanding()}
                  >
                    <Text style={styles.returnButtonText}>Return</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.validateButtonBlock}
                    onPress={() => this._doSubmitFinal()}
                    disabled={this.state.loader}
                  >
                    <Text style={styles.validateButtonText}>Validate</Text>

                    {this.state.loader ? (
                      <View style={styles.loading}>
                        <ActivityIndicator size="small" color={"#FFFFFF"} />
                      </View>
                    ) : null}
                  </TouchableOpacity>
                </View>
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
    alignItems: "center",
    width: 30
  },

  containerHeaderText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "Roboto-Reguler",
    right: 10
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

  forgotPasswordText: {
    color: "#22e2ef",
    fontSize: 16,
    fontFamily: "Roboto-Reguler"
  },

  inputTextStyleActive: {
    flex: 1,
    height: 25,
    borderBottomColor: "#1DC2E0",
    borderBottomWidth: 1,
    color: "#000000",
    fontSize: 18,
    fontFamily: "Roboto-Reguler",
    paddingVertical: 0
  },

  sendButtonBlock: {
    marginTop: 80,
    height: 50,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#5AC6C6",
    elevation: 2,
    flexDirection: "row"
  },

  imageWrapper: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    height: hp("40%")
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
    fontSize: hp("2.5%"),
    fontFamily: "Roboto-Reguler",
    fontWeight: "200"
  },
  avatarWrapper: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20
  },
  avatarImageWrapper: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eeeeee",
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    top: 20
  },
  frmInputWrapper: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  frmInputWrapperMargin: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: "#dcdcdc",
    borderBottomWidth: 1,
    borderBottomColor: "#dcdcdc"
  },

  frmInputWrapperColumn: {
    marginTop: 20,
    justifyContent: "center"
  },
  headingText: {
    fontFamily: "Roboto-Reguler",
    fontSize: 16,
    //paddingRight: 10,
    //paddingLeft: 10,
    color: "#000000"
  },
  frmLabel: {
    fontFamily: "Roboto-Reguler",
    fontSize: 16,
    color: "#000000",
    fontWeight: "400"
  },
  frmLabelRight: {
    fontFamily: "Roboto-Light",
    fontSize: 16,
    color: "#000000",
    fontWeight: "400"
  },
  inputTextStyleInactive: {
    flex: 1,
    //height: 30,
    borderBottomColor: "#cecece",
    borderBottomWidth: 1,
    color: "#000000",
    fontSize: hp("2.5%"),
    fontFamily: "Roboto-Reguler",
    paddingVertical: 0
    // paddingLeft: 10,
    //paddingRight: 10,
  },
  sendButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Roboto-Reguler"
  },
  idScan: {
    marginTop: 10,
    height: 40,
    width: wp("40%"),
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#5ac6c6",
    elevation: 2,
    flexDirection: "row"
  },
  loading: {
    marginLeft: 10
  },
  loadingCenter: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center"
  },
  inputTextStyleRequired: {
    flex: 1,
    height: 25,
    borderBottomColor: "red", // required
    borderBottomWidth: 1,
    color: "#000000",
    fontSize: 18,
    fontFamily: "Roboto-Reguler",
    paddingVertical: 0
  },
  avatarName: {
    fontSize: 16,
    color: "#FFFFFF",
    fontFamily: "Roboto-Bold",
    top: 20
  },
  notificationBadge: {
    bottom: 30,
    left: 15,
    height: 20,
    width: 20,
    backgroundColor: "red",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  notificationText: {
    color: "#FFFFFF",
    fontFamily: "Roboto-Bold",
    fontSize: 14
  },
  textInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#dcdcdc",
    marginLeft: 5,
    borderRadius: 5,
    fontFamily: "Roboto-Reguler",
    color: "#000000",
    fontSize: 18,
    paddingLeft: 5,
    paddingVertical: 0
  },
  textAreaInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#dcdcdc",
    borderRadius: 5,
    fontFamily: "Roboto-Reguler",
    color: "#000000",
    fontSize: 18,
    paddingLeft: 5,
    paddingVertical: 0
  },
  changeOrderButtonBlock: {
    padding: 10,
    height: 30,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#5ac6c6",
    elevation: 2,
    position: "absolute",
    top: 5,
    right: 0
  },
  changeOrderButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Roboto-Reguler"
  },
  returnButtonBlock: {
    width: width / 2.5,
    marginTop: 20,
    height: 50,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#5AC6C6",
    borderWidth: 1,
    elevation: 2
  },
  returnButtonText: {
    color: "#5AC6C6",
    fontSize: 18,
    fontFamily: "Roboto-Reguler"
  },

  validateButtonBlock: {
    width: width / 2.5,
    marginTop: 20,
    height: 50,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#5AC6C6",
    borderColor: "#5AC6C6",
    borderWidth: 1,
    elevation: 2,
    flexDirection: "row"
  },
  validateButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Roboto-Reguler"
  }
});
