import React, { Component } from "react";
import FooterTabComponent from "../../components/footerTab/footerTabComponent";
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  FlatList
} from "react-native";
import EventEmitter from "react-native-eventemitter";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from "react-native-responsive-screen";
import ProgressCircle from "react-native-progress-circle";
import AsyncStorage from "@react-native-community/async-storage";
import Loading from "react-native-loader-overlay";
import HeaderCurve from "../includes/headercurve";
import httpService from "../../services/http/httpService";
import CommonService from "../../services/common/commonService";
import { ErrorTemplate } from "../../components/error/errorComponent";
import { Container, Content } from "native-base";
const width = Math.round(Dimensions.get("window").width);
const height = Math.round(Dimensions.get("window").height);
const statusBarBackgroundColor = "#1CCBE6";
const barStyle = "light-content";
let tabIndex = 0;
import URL from "../../config/url";
const ApiConfig = URL;
import { withNavigationFocus } from "react-navigation";

class CompletedCircle extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      ongoingApiCalled: false,
      waitingApiCalled: true,
      blockedApiCalled: false,
      suspendApiCalled: false,
      rememberToken: null,
      errorText: "",
      subMessage: "",
      list: [{ key: "1", name: "debanjan" }],
      getList: [],
      first_name: "",
      avatar_location: "",
      dataLoadIndicator: false,
      tabName: ""
    };
  }

  async componentDidMount() {
    this.onGetUserInfo();
    this.getList();
  }

  onGetUserInfo = () => {
    AsyncStorage.multiGet([
      "rememberToken",
      "circle_code",
      "first_name",
      "avatar_location",
      "mobile_number"
    ]).then(response => {
      this.setState({
        first_name: response[2][1],
        avatar_location: {
          uri: ApiConfig.public_url + "storage/" + response[3][1]
        },
        loader: false
      });
    });
  };

  getList = async () => {
    const value = await AsyncStorage.getItem("rememberToken");
    CommonService.resetDataForLaunchNewCircle();
    let payload = {
      url: "circle-list",
      data: {
        circle_status: 4
      },
      authtoken: value
    };

    console.log("payload", payload);

    httpService
      .postHttpCall(payload)
      .then(res => {
        console.log("circle list", res);
        Loading.hide(this.loading);
        if (res.status !== undefined) {
          if (res.status == 100) {
            this.setState({
              getList: res.result,
              loader: false,
              dataLoadIndicator: false
            });
          } else {
            //Loading.hide(this.loading);
            this.setState({
              errorText: res.message,
              loader: false,
              dataLoadIndicator: false
            });
          }
        } else {
          this.setState({
            errorText: httpService.appMessege.unknown_error,
            subMessage: httpService.appMessege.working_progress,
            loader: false,
            dataLoadIndicator: false
          });
        }
      })
      .catch(err => {
        this.setState({ errorText: err.message, loader: false });
        if (err.status == 4) {
          this.setState({
            subMessage: httpService.appMessege.internet_sub,
            loader: false,
            dataLoadIndicator: false
          });
        }
      });
  };

  getNames(data) {
    let names = "";
    data.forEach(element => {
      names += element.username + ", ";
    });
    names = names.substring(0, names.length - 2);
    return names + " ";
  }

  render() {
    return (
      <Container>
        <View style={[styles.container]}>
          <StatusBar
            backgroundColor={statusBarBackgroundColor}
            barStyle={barStyle}
          />

          <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={{ flex: 1, position: "relative" }}>
              <HeaderCurve
                //title={"Completed Circle"}
                first_name={this.state.first_name}
                avatar_location={this.state.avatar_location}
                navigation={this.navigation}
                backButton={false}
                bellIcon={false}
                props={this.props}
              />

              <View style={{ flex: 1 }}>
                <View
                  style={{
                    flex: 1,
                    marginLeft: 20,
                    marginRight: 20,
                    marginTop: 15
                  }}
                >
                  {/* ----------------feature buttons----------------*/}

                  {this.state.errorText != "" ? (
                    <View style={{ alignItems: "center", marginTop: "47%" }}>
                      <ErrorTemplate
                        message={this.state.errorText}
                        subMessage={this.state.subMessage}
                      />
                    </View>
                  ) : (
                    <View>
                      <FlatList
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={item => item.id.toString()}
                        ListHeaderComponent={<View style={{ height: 10 }} />}
                        ListFooterComponent={<View style={{ height: 10 }} />}
                        data={this.state.getList}
                        numColumns={1}
                        renderItem={({ item, index }) => (
                          <TouchableOpacity
                            activeOpacity={1}
                            //onPress={() => this.onPresswaitingTab(item)}
                          >
                            <View style={[styles.listItemWrapper]}>
                              <View style={styles.listLeftWrapper}>
                                <View
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center"
                                  }}
                                >
                                  <Text style={styles.listLeftText}>
                                    Circle :{" "}
                                  </Text>
                                  <Text style={styles.listRightText}>
                                    {item.circle_code}
                                  </Text>
                                </View>

                                <View
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center"
                                  }}
                                >
                                  <Text style={styles.listLeftText}>
                                    Circle Admin :{" "}
                                  </Text>
                                  <Text style={styles.listRightText}>
                                    {item.admin}
                                  </Text>
                                </View>

                                <View
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center"
                                  }}
                                >
                                  <Text style={styles.listLeftText}>
                                    Participants :{" "}
                                  </Text>
                                  <Text
                                    numberOfLines={1}
                                    style={[
                                      styles.listRightText,
                                      { paddingRight: 20 }
                                    ]}
                                  >
                                    {this.getNames(item.get_users)}
                                  </Text>
                                </View>

                                <View
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center"
                                  }}
                                >
                                  <Text style={styles.listLeftText}>
                                    Amount :{" "}
                                  </Text>
                                  <Text style={styles.listRightText}>
                                    €{item.target_achive}
                                  </Text>
                                </View>

                                <View
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center"
                                  }}
                                >
                                  <Text style={styles.listLeftText}>
                                    Launch Date :{" "}
                                  </Text>
                                  <Text style={styles.listRightText}>
                                    {CommonService.formatDate(item.start_date)}
                                  </Text>
                                </View>

                                <View
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center"
                                  }}
                                >
                                  <Text style={styles.listLeftText}>
                                    Last round Date :{" "}
                                  </Text>
                                  <Text style={styles.listRightText}>
                                    {CommonService.formatDate(item.end_date)}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          </TouchableOpacity>
                        )}
                      />
                    </View>
                  )}
                </View>
              </View>
            </View>
            <View style={{ marginTop: 20 }} />
          </KeyboardAwareScrollView>
          <FooterTabComponent props={this.props} />
        </View>
      </Container>
    );
  }
}

export default CompletedCircle;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  containerBackBlock: {
    justifyContent: "center",
    width: 50,
    height: 50
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

  inputTextStyleInactive: {
    flex: 1,
    height: 40,
    //borderBottomColor: '#dfdfe1',
    borderBottomColor: "#1DC2E0",
    borderBottomWidth: 1,
    color: "#000000",
    fontSize: 20,
    fontFamily: "Roboto-Reguler",
    paddingLeft: 40,
    paddingVertical: 0
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
    marginLeft: 20,
    marginRight: 20,
    top: hp("3%")
  },
  headingBold: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "Roboto-Reguler",
    fontWeight: "600"
  },
  headingLight: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "Roboto-Reguler",
    fontWeight: "200"
  },
  loading: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center"
  },
  featureBlockWrapper: {
    flexDirection: "row",
    marginTop: 20,
    //height: hp('10%'),
    justifyContent: "space-between",
    alignItems: "center"
  },
  block1Active: {
    width: width / 4.7,
    height: 60,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: "#21c995",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#21c995",
    elevation: 10
  },
  block1ActiveText: {
    color: "#FFFFFF",
    fontSize: hp("1.8%"),
    fontFamily: "Roboto-Bold"
  },
  block1InActive: {
    width: width / 4.7,
    height: 60,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: "#21c995",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    elevation: 10
  },
  block1InActiveText: {
    color: "#21c995",
    fontSize: 14,
    fontFamily: "Roboto-Bold"
  },

  block2Active: {
    width: width / 4.7,
    height: 60,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: "#e3832f",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e3832f",
    elevation: 10
  },
  block2ActiveText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Roboto-Bold"
  },
  block2InActive: {
    width: width / 4.7,
    height: 60,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: "#e3832f",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    elevation: 10
  },
  block2InActiveText: {
    color: "#e3832f",
    fontSize: 14,
    fontFamily: "Roboto-Bold"
  },

  block3Active: {
    width: width / 4.7,
    height: 60,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: "#7792f9",
    alignItems: "center",
    backgroundColor: "#7792f9",
    justifyContent: "center",
    elevation: 10
  },
  block3ActiveText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Roboto-Bold"
  },
  block3InActive: {
    width: width / 4.7,
    height: 60,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: "#7792f9",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    elevation: 10
  },
  block3InActiveText: {
    color: "#7792f9",
    fontSize: 14,
    fontFamily: "Roboto-Bold"
  },
  block4Active: {
    width: width / 4.7,
    height: 60,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: "#de4b5b",
    alignItems: "center",
    justifyContent: "center",
    elevation: 10,
    backgroundColor: "#de4b5b"
  },
  block4ActiveText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Roboto-Bold"
  },
  block4InActive: {
    width: width / 4.7,
    height: 60,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: "#de4b5b",
    alignItems: "center",
    justifyContent: "center",
    elevation: 10,
    backgroundColor: "#FFFFFF"
  },
  block4InActiveText: {
    color: "#de4b5b",
    fontSize: 14,
    fontFamily: "Roboto-Bold"
  },

  listItemWrapper: {
    flexDirection: "row",
    //height: 160,
    marginTop: 5,
    borderBottomWidth: 2,
    borderBottomColor: "#22c691",
    borderLeftWidth: 2,
    borderLeftColor: "#e2e2e2",
    borderTopWidth: 2,
    borderTopColor: "#e2e2e2",
    borderRightWidth: 2,
    borderRightColor: "#e2e2e2",
    backgroundColor: "#FFFFFF",
    borderRadius: 5
  },
  listLeftWrapper: {
    width: wp("65%"),
    padding: 10
  },
  listLeftText: {
    fontFamily: "Roboto-Bold",
    fontSize: 16
  },
  listRightText: {
    fontFamily: "Roboto-Reguler",
    fontSize: 16
  }
});
