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
  Keyboard,
  Alert,
  BackHandler,
  ToastAndroid
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import DateTimePicker from "react-native-modal-datetime-picker";
import FeatherIcon from "react-native-vector-icons/Feather";
import AsyncStorage from "@react-native-community/async-storage";
import global from "../../services/global/globalService";
import { NavigationEvents } from "react-navigation";
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
import CommonService from "../../services/common/commonService";
const ApiConfig = URL;
export default class CreateCircleScreen extends Component {
  _didFocusSubscription;
  _willBlurSubscription;
  constructor(props) {
    super(props);
    this._didFocusSubscription = props.navigation.addListener(
      "didFocus",
      payload =>
        BackHandler.addEventListener(
          "hardwareBackPress",
          this._doRedirectLanding
        )
    );
    this.state = {
      first_name: "",
      mobile_number: "",
      avatar_location: "",
      target_amount: "",
      errorTargetAmount: false,
      round_settelment: "",
      errorRoundSettlement: false,
      start_date: "",
      errorStartDate: false,
      cicle_code: "",
      reason: "",
      periodicity: "weekly",

      loader: false,
      errorMessage: "",
      successMessage: "",
      tempData: []
    };
  }

  componentDidMount() {
    global.phone_data = null;
    global.perticipant_info = [];
    this._bootstrapAsync();

    this._willBlurSubscription = this.props.navigation.addListener(
      "willBlur",
      payload =>
        BackHandler.removeEventListener(
          "hardwareBackPress",
          this._doRedirectLanding
        )
    );
  }

  componentWillUnmount() {
    this._didFocusSubscription && this._didFocusSubscription.remove();
    this._willBlurSubscription && this._willBlurSubscription.remove();
  }

  _bootstrapAsync = async () => {
    AsyncStorage.multiGet([
      "rememberToken",
      "circle_code",
      "first_name",
      "avatar_location",
      "mobile_number"
    ]).then(response => {
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

  showDateTimePicker = () => {
    this.setState({
      isDateTimePickerVisible: true
    });
  };

  hideDateTimePicker = () => {
    this.setState({
      isDateTimePickerVisible: false
    });
  };

  handleDatePicked = date => {
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();

    if (day < 10) {
      day = "0" + day;
    }
    if (month < 10) {
      month = "0" + month;
    }
    var __date = day + "/" + month + "/" + year;

    // var date =
    //   ('0' + day).slice(-2) + '/' + ('0' + month).slice(-2) + '/' + year;

    this.setState({
      start_date: __date,
      isDateTimePickerVisible: false
    });
  };

  _doContinue = () => {
    Keyboard.dismiss();
    this.setState({
      errorTargetAmount: false,
      errorRoundSettlement: false,
      errorStartDate: false,
      errorMessage: "",
      successMessage: ""
    });
    if (
      this.state.target_amount == "" ||
      this.state.round_settelment == "" ||
      this.state.start_date == ""
    ) {
      if (this.state.target_amount == "") {
        this.setState({
          errorTargetAmount: true,
          errorMessage: "Above fields are required"
        });
      }

      if (this.state.round_settelment == "") {
        this.setState({
          errorRoundSettlement: true,
          errorMessage: "Above fields are required"
        });
      }

      if (this.state.start_date == "") {
        this.setState({
          errorStartDate: true,
          errorMessage: "Above fields are required"
        });
      }
      if (this.state.tempData.length <= 0) {
        this.setState({
          errorMessage: "Please assign a user first"
        });
      }
    } else {
      if (
        this.state.periodicity == "weekly" &&
        this.state.round_settelment > 500
      ) {
        this.setState({
          errorMessage:
            "The instalment per user cannot be above €500 for a Weekly round"
        });
      }

      if (
        this.state.periodicity == "bi-weekly" &&
        this.state.round_settelment > 750
      ) {
        this.setState({
          errorMessage:
            "The instalment per user cannot be above €750 for a Bi weekly round"
        });
      }

      if (
        this.state.periodicity == "every-10-days" &&
        this.state.round_settelment > 750
      ) {
        this.setState({
          errorMessage:
            "The instalment per user cannot be above €750 for a Every 10 days round"
        });
      }

      if (
        this.state.periodicity == "monthly" &&
        this.state.round_settelment > 1000
      ) {
        this.setState({
          errorMessage:
            "The instalment per user cannot be above €1000 for a Monthly round"
        });
      }

      if (
        Number(this.state.round_settelment) >= Number(this.state.target_amount)
      ) {
        this.setState({
          errorMessage:
            "Target amount must be greater than of round settlement amount"
        });
      }
      if (this.state.tempData.length <= 0) {
        this.setState({
          errorMessage: "Please assign a user first"
        });
      }
    }

    setTimeout(
      function() {
        if (!this.state.errorMessage) {
          let obj = {
            circle_code: this.state.cicle_code,
            target_achive: this.state.target_amount,
            round_set: this.state.round_settelment,
            p_round: this.state.periodicity,
            start_date: this.state.start_date,
            reason_for_circle: this.state.reason
          };
          this.setState({
            loader: true
          });

          let that = this;

          axios
            .post(ApiConfig.base_url + "circle-details", JSON.stringify(obj), {
              headers: {
                Authorization: "Bearer " + that.state.rememberToken
              }
            })
            .then(function(response) {
              if (response.data.status == 300) {
                that.setState(
                  {
                    success: false
                  },
                  () => {
                    that.setState({
                      errorMessage: response.data.message
                    });
                  }
                );
              } else {
                that.setState(
                  {
                    success: true
                  },
                  () => {
                    if (response.data.exceed_amount > 0) {
                      let buttonObj = {
                        cancelTxt: "No",
                        submitTxt: "Yes",
                        message:
                          "The following amount is exceed after all round payment, which you will not gain",
                        title: "Please confirm"
                      };
                      CommonService.__showConfirmAlert(buttonObj, res => {
                        if (res) {
                          that.props.navigation.navigate("circlePreviewPage", {
                            target_achive: that.state.target_amount,
                            round_set: that.state.round_settelment,
                            p_round: that.state.periodicity,
                            start_date: that.state.start_date,
                            reason_for_circle: that.state.reason,
                            participants: response.data.result,
                            end_date: response.data.end_date,
                            estimate_round: response.data.estimate_round
                          });
                        }
                      });
                    } else {
                      that.props.navigation.navigate("circlePreviewPage", {
                        target_achive: that.state.target_amount,
                        round_set: that.state.round_settelment,
                        p_round: that.state.periodicity,
                        start_date: that.state.start_date,
                        reason_for_circle: that.state.reason,
                        participants: response.data.result,
                        end_date: response.data.end_date,
                        estimate_round: response.data.estimate_round
                      });
                    }
                  }
                );
              }
            })
            .catch(function(error) {
              ToastAndroid.showWithGravity(
                error.response,
                ToastAndroid.LONG,
                ToastAndroid.BOTTOM
              );
            })
            .finally(function() {
              that.setState({
                loader: false
              });
            });

          // this.props.navigation.navigate('CreateCirclePreviewScreen');
        } else {
          ToastAndroid.showWithGravity(
            this.state.errorMessage,
            ToastAndroid.LONG,
            ToastAndroid.BOTTOM
          );
        }
      }.bind(this),
      1000
    );
  };

  _doRedirectJoinPerticipants = () => {
    this.props.navigation.navigate("searchParticipantPage");
  };

  makeid(length) {
    var result = "";
    var characters = "0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  temporaryData() {
    this.setState({ tempData: global.perticipant_info });
  }

  _doRedirectLanding = () => {
    if (
      this.state.tempData.length ||
      this.state.reason != "" ||
      this.state.target_amount != "" ||
      this.state.round_settelment != "" ||
      this.state.start_date != ""
    ) {
      Alert.alert("Confirmation", "You will lose unsave data", [
        { text: "No", onPress: () => (No = "no") },
        { text: "OK", onPress: () => this.props.navigation.goBack() }
      ]);
      return true;
    } else {
      this.props.navigation.goBack();
    }
    return true;
  };

  onError(error) {
    this.setState({
      avatar_location: require("../../../assets/images/contact.png")
    });
  }

  onDeleteContact = index => {
    let tempData = this.state.tempData;
    let contact = tempData[index];
    Alert.alert(
      "Delete Request",
      `Do you want to delete ${contact.username}`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "OK",
          onPress: () => {
            let obj = {
              circle_code: this.state.cicle_code,
              mobile_number: contact.mobile
            };
            let that = this;
            axios
              .post(
                "https://nodejsdapldevelopments.com/dart/public/api/delete-circle-user",
                JSON.stringify(obj),
                {
                  headers: {
                    Authorization: "Bearer " + that.state.rememberToken
                  }
                }
              )
              .then(res => {
                if (res.data.status === 100) {
                  tempData.splice(index, 1);
                  global.contacts_data.splice(index, 1);
                  this.setState({
                    tempData
                  });
                  ToastAndroid.showWithGravity(
                    res.data.message,
                    ToastAndroid.SHORT,
                    ToastAndroid.BOTTOM
                  );
                } else {
                  ToastAndroid.showWithGravity(
                    res.data.message,
                    ToastAndroid.LONG,
                    ToastAndroid.BOTTOM
                  );
                }
              })
              .catch(err => {
                ToastAndroid.showWithGravity(
                  err,
                  ToastAndroid.LONG,
                  ToastAndroid.BOTTOM
                );
              });
          }
        }
      ],
      { cancelable: false }
    );
  };

  render() {
    const errorTargetAmount = this.state.errorTargetAmount
      ? styles.inputTextStyleRequired
      : styles.inputTextStyleActive;

    const errorRoundSettlement = this.state.errorRoundSettlement
      ? styles.inputTextStyleRequired
      : styles.inputTextStyleActive;

    const errorStartDate = this.state.errorStartDate
      ? styles.inputTextStyleRequired
      : styles.inputTextStyleActive;

    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 2);

    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 10);

    return (
      <View style={styles.container}>
        <NavigationEvents onWillFocus={() => this.temporaryData()} />
        <StatusBar
          backgroundColor={statusBarBackgroundColor}
          barStyle={barStyle}
        />

        <KeyboardAwareScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={{
              flex: 1,
              position: "relative"
            }}
          >
            <HeaderCurve
              navigation={this.props.navigation}
              avatar_location={this.state.avatar_location}
              backButton={true}
              first_name={this.state.first_name}
              bellIcon={true}
              backAlert={
                this.state.tempData.length ||
                this.state.reason != "" ||
                this.state.target_amount != "" ||
                this.state.round_settelment != "" ||
                this.state.start_date != ""
                  ? true
                  : false
              }
            />

            <View
              style={{
                flex: 1,
                marginTop: hp("5%"),
                marginBottom: 20
              }}
            >
              <View
                style={{
                  flex: 1,
                  marginLeft: 20,
                  marginRight: 20
                  // marginTop: 5
                }}
              >
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                  <Text style={styles.headingText}>Create Circle</Text>
                </View>

                <View style={styles.frmInputWrapper}>
                  <Text style={[styles.frmLabel, { width: width / 2 }]}>
                    Target to Achieve:
                  </Text>

                  <View
                    style={{
                      justifyContent: "center",
                      alignItems: "center"
                    }}
                  >
                    <Text style={styles.frmLabel}>€</Text>
                  </View>
                  <TextInput
                    style={errorTargetAmount}
                    onChangeText={target_amount =>
                      this.setState({ target_amount })
                    }
                    value={this.state.target_amount}
                    autoFocus={true}
                    keyboardType="numeric"
                    autoCapitalize="none"
                    returnKeyType="next"
                    //onSubmitEditing={() => this.sattelment.focus()}
                  />
                </View>

                <View style={styles.frmInputWrapper}>
                  <Text style={[styles.frmLabel, { width: width / 2 }]}>
                    Round Settlement:
                  </Text>

                  <View
                    style={{
                      justifyContent: "center",
                      alignItems: "center"
                    }}
                  >
                    <Text style={styles.frmLabel}>€</Text>
                  </View>

                  <TextInput
                    style={errorRoundSettlement}
                    onChangeText={round_settelment =>
                      this.setState({ round_settelment })
                    }
                    value={this.state.round_settelment}
                    // ref={sattelment => (this.sattelment = sattelment)}
                    keyboardType="numeric"
                    autoCapitalize="none"
                    returnKeyType="next"
                    //onSubmitEditing={() => this.picker.focus()}
                  />
                </View>

                <View
                  style={{
                    height: 40,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 20
                  }}
                >
                  <View style={{ width: width / 2 + 12 }}>
                    <Text style={styles.frmLabel}>Periodicity of round: </Text>
                  </View>

                  <View
                    style={{
                      borderRadius: 5,
                      borderWidth: 1,
                      borderColor: "#dcdcdc",
                      paddingLeft: 5,
                      flex: 1
                    }}
                  >
                    <Picker
                      //ref={picker => (this.picker = picker)}
                      selectedValue={this.state.periodicity}
                      style={{
                        height: 40,
                        padding: 5
                      }}
                      onValueChange={(itemValue, itemIndex) =>
                        this.setState({ periodicity: itemValue })
                      }
                    >
                      <Picker.Item label="Weekly" value="weekly" />
                      <Picker.Item label="Bi-weekly" value="bi-weekly" />
                      <Picker.Item
                        label="Every 10 Days"
                        value="every-10-days"
                      />
                      <Picker.Item label="Monthly" value="monthly" />
                    </Picker>
                  </View>
                </View>

                <View style={styles.frmInputWrapperColumn}>
                  <Text style={styles.frmLabel}>
                    Personal Reason for the Circle:{" "}
                  </Text>

                  <TextInput
                    style={[styles.textAreaInput, { marginTop: 5 }]}
                    onChangeText={reason => this.setState({ reason })}
                    multiline={true}
                  />
                </View>

                <View style={[styles.frmInputWrapper]}>
                  <Text style={[styles.frmLabel, { width: width / 2 + 12 }]}>
                    Wishing start date:
                  </Text>

                  <View
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      position: "relative"
                    }}
                  >
                    <TextInput
                      editable={false}
                      style={[errorStartDate, { paddingRight: 20 }]}
                      value={this.state.start_date}
                    />
                    <TouchableOpacity
                      style={{
                        width: 20,
                        height: 20,
                        right: 10,
                        top: 10,
                        position: "absolute"
                      }}
                      onPress={() => this.showDateTimePicker()}
                    >
                      <Image
                        source={require("../../../assets/images/calendar.png")}
                        style={{
                          width: 20,
                          height: 20
                        }}
                      />
                    </TouchableOpacity>
                  </View>

                  <DateTimePicker
                    isVisible={this.state.isDateTimePickerVisible}
                    onConfirm={this.handleDatePicked}
                    onCancel={this.hideDateTimePicker}
                    datePickerModeAndroid={"spinner"}
                    minimumDate={minDate}
                    maximumDate={maxDate}
                  />
                </View>

                <View
                  style={[
                    styles.frmInputWrapper,
                    { justifyContent: "space-between" }
                  ]}
                >
                  <Text style={styles.frmLabel}>
                    Add participants to this savings
                  </Text>

                  <TouchableOpacity
                    onPress={() => this._doRedirectJoinPerticipants()}
                  >
                    <Image
                      source={require("../../../assets/images/plus.png")}
                      style={{
                        width: 20,
                        height: 20
                      }}
                    />
                  </TouchableOpacity>
                </View>
                <View>
                  {this.state.tempData.length ? (
                    <View>
                      {
                        <View>
                          <Text
                            style={[styles.frmLabelRight, { marginTop: 5 }]}
                          >
                            {"1"}. {this.state.first_name}(Admin) (
                            {this.state.mobile_number})
                          </Text>
                          {/* {joinParticipantList} */}
                          {this.state.tempData.map((contact, index) => {
                            return (
                              <View
                                key={index}
                                style={{
                                  flexDirection: "row",
                                  justifyContent: "space-between"
                                }}
                              >
                                <Text
                                  style={[
                                    styles.frmLabelRight,
                                    { marginTop: 5 }
                                  ]}
                                >
                                  {index + 2}. {contact.username} (
                                  {contact.code}
                                  {contact.mobile})
                                </Text>
                                <TouchableOpacity
                                  onPress={() => this.onDeleteContact(index)}
                                >
                                  <Image
                                    source={require("../../../assets/images/delete.png")}
                                    style={{
                                      width: 20,
                                      height: 20
                                    }}
                                  />
                                </TouchableOpacity>
                              </View>
                            );
                          })}
                        </View>
                      }
                    </View>
                  ) : null}
                </View>

                {this.state.errorMessage && this.state.tempData.length <= 0 ? (
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
                        ...Platform.select({
                          android: {
                            fontFamily: "Roboto-Reguler"
                          }
                        }),
                        fontSize: 16
                      }}
                    >
                      {this.state.errorMessage}
                    </Text>
                  </View>
                ) : null}

                {this.state.successMessage ? (
                  <View
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      marginTop: 10
                    }}
                  >
                    <Text
                      style={{
                        color: "green",
                        ...Platform.select({
                          android: {
                            fontFamily: "Roboto-Reguler"
                          }
                        }),
                        fontSize: 16
                      }}
                    >
                      {this.state.successMessage}
                    </Text>
                  </View>
                ) : null}

                <TouchableOpacity
                  onPress={() => this._doContinue()}
                  style={styles.sendButtonBlock}
                  disabled={this.state.loader}
                >
                  <Text style={styles.sendButtonText}>Continue</Text>

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
    alignItems: "center",
    width: 30
  },

  containerHeaderText: {
    color: "#FFFFFF",
    fontSize: 20,
    ...Platform.select({
      android: {
        fontFamily: "Roboto-Reguler"
      }
    }),
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
    ...Platform.select({
      android: {
        fontFamily: "Roboto-Reguler"
      }
    })
  },

  inputTextStyleActive: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#dcdcdc",
    marginLeft: 5,
    borderRadius: 5
  },

  inputTextStyleRequired: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "red",
    marginLeft: 5,
    borderRadius: 5
  },

  sendButtonBlock: {
    marginTop: 20,
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
    ...Platform.select({
      android: {
        fontFamily: "Roboto-Reguler"
      }
    }),
    fontWeight: "600"
  },
  headingLight: {
    color: "#FFFFFF",
    fontSize: hp("2.5%"),
    ...Platform.select({
      android: {
        fontFamily: "Roboto-Reguler"
      }
    }),
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
    justifyContent: "center",
    alignItems: "center"
  },
  frmInputWrapperColumn: {
    marginTop: 20,
    justifyContent: "center"
  },
  headingText: {
    ...Platform.select({
      android: {
        fontFamily: "Roboto-Reguler"
      }
    }),
    fontSize: 16,
    color: "#000000"
  },
  frmLabel: {
    ...Platform.select({
      android: {
        fontFamily: "Roboto-Reguler"
      }
    }),
    fontSize: 14,
    color: "#000000"
  },
  inputTextStyleInactive: {
    flex: 1,
    borderBottomColor: "#cecece",
    borderBottomWidth: 1,
    color: "#000000",
    fontSize: hp("2.5%"),
    ...Platform.select({
      android: {
        fontFamily: "Roboto-Reguler"
      }
    }),
    paddingVertical: 0
  },
  sendButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    ...Platform.select({
      android: {
        fontFamily: "Roboto-Reguler"
      }
    })
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
    ...Platform.select({
      android: {
        fontFamily: "Roboto-Reguler"
      }
    }),
    color: "#000000",
    fontSize: 18,
    paddingLeft: 5,
    paddingVertical: 0
  },
  textAreaInput: {
    flex: 1,
    height: 100,
    borderWidth: 1,
    borderColor: "#dcdcdc",
    borderRadius: 5,
    ...Platform.select({
      android: {
        fontFamily: "Roboto-Reguler"
      }
    }),
    color: "#000000",
    fontSize: 18,
    paddingLeft: 5,
    paddingVertical: 0,
    textAlignVertical: "top"
  },
  frmLabelRight: {
    fontFamily: "Roboto-Light",
    fontSize: 16,
    color: "#000000",
    fontWeight: "400"
  }
});
