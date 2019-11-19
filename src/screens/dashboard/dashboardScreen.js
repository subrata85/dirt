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
import multiLang from "../../components/language/multiLang";

class DashboardScreen extends Component {
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
      language: "en",
      first_name: "",
      avatar_location: "",
      dataLoadIndicator: false
    };
  }

  async componentDidMount() {
    const language = await AsyncStorage.getItem("language");
    if (language) {
      this.setState({ language: language });
    }
    // setInterval(() => {
    //   alert("Alert will be fire every 5 sec")
    // }, 10000)
    this.onGetUserInfo();

    this.getList(false, true, false, false, "0");
    EventEmitter.on("validatedCircleCreation", data => {
      if (data) {
        this.getList(false, true, false, false, "0");
      }
    });
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

  componentDidUpdate(prevProps) {
    if (prevProps.isFocused !== this.props.isFocused) {
      this.getList(false, true, false, false, "0");
    }
    setTimeout(() => {
      console.log("hide loader after 5 sec");
      Loading.hide(this.loading);
    }, 5000);
  }

  _doLaunchCircle = () => {
    CommonService.resetDataForLaunchNewCircle();
    let circle_code = Date.now().toString();
    let that = this;
    this.setState({
      loader: true
    });

    AsyncStorage.multiSet([["circle_code", circle_code]], function(error) {
      setTimeout(
        function() {
          that.setState(
            {
              loader: false
            },
            () => {
              that.props.navigation.navigate("createCirclePage");
            }
          );
        }.bind(this),
        1000
      );
    });
  };

  getList = async (ongoing, waiting, block, suspend, status) => {
    tabIndex = status;
    CommonService.resetDataForLaunchNewCircle();
    //this.loading = Loading.show(CommonService.loaderObj);

    const value = await AsyncStorage.getItem("rememberToken");
    this.setState({
      rememberToken: value,
      errorText: "",
      subMessage: "",
      getList: [],
      ongoingApiCalled: ongoing,
      waitingApiCalled: waiting,
      blockedApiCalled: block,
      suspendApiCalled: suspend,
      dataLoadIndicator: true
    });

    let payload = {
      url: "circle-list",
      data: {
        circle_status: status
      },
      authtoken: value
    };

    httpService
      .postHttpCall(payload)
      .then(res => {
        // Loading.hide(this.loading);
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
          {this.state.dataLoadIndicator ? (
            <View
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <ActivityIndicator size="large" color="#1CCBE6" />
            </View>
          ) : null}
          <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={{ flex: 1, position: "relative" }}>
              <HeaderCurve
                title={"Dashboard"}
                // first_name={this.state.first_name}
                // avatar_location={this.state.avatar_location}
                navigation={this.navigation}
                backButton={false}
                bellIcon={false}
                props={this.props}
              />

              {/* <View style={styles.headerMenu}>
                <View style={styles.containerBackBlock} />
                <View
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Text style={styles.headingBold}>Welcome Dashboard</Text>
                </View>
                <View style={styles.containerBackBlock} />
              </View>  */}

              <View style={{ flex: 1 }}>
                <View
                  style={{
                    flex: 1,
                    marginLeft: 20,
                    marginRight: 20,
                    marginTop: 15
                  }}
                >
                  <TouchableOpacity
                    onPress={() => this._doLaunchCircle()}
                    style={styles.sendButtonBlock}
                  >
                    <Text style={styles.sendButtonText}>Launch new Circle</Text>

                    {this.state.loader ? (
                      <View style={{ marginLeft: 10 }}>
                        <ActivityIndicator size="small" color={"#FFFFFF"} />
                      </View>
                    ) : null}
                  </TouchableOpacity>

                  {/* ----------------feature buttons----------------*/}
                  <View style={styles.featureBlockWrapper}>
                    <TouchableOpacity
                      style={[
                        tabIndex == 0
                          ? styles.block2Active
                          : styles.block2InActive
                      ]}
                      onPress={() =>
                        this.getList(false, true, false, false, "0")
                      }
                    >
                      <Text
                        style={[
                          tabIndex == 0
                            ? styles.block2ActiveText
                            : styles.block2InActiveText
                        ]}
                      >
                        Wating
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        tabIndex == 1
                          ? styles.block1Active
                          : styles.block1InActive
                      ]}
                      onPress={() =>
                        this.getList(true, false, false, false, "1")
                      }
                    >
                      <Text
                        style={[
                          tabIndex == 1
                            ? styles.block1ActiveText
                            : styles.block1InActiveText
                        ]}
                      >
                        Ongoing
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        tabIndex == 2
                          ? styles.block3Active
                          : styles.block3InActive
                      ]}
                      onPress={() =>
                        this.getList(false, false, true, false, "2")
                      }
                    >
                      <Text
                        style={[
                          tabIndex == 2
                            ? styles.block3ActiveText
                            : styles.block3InActiveText
                        ]}
                      >
                        Blocked
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        tabIndex == 3
                          ? styles.block4Active
                          : styles.block4InActive
                      ]}
                      onPress={() =>
                        this.getList(false, false, false, true, "3")
                      }
                    >
                      <Text
                        style={[
                          tabIndex == 3
                            ? styles.block4ActiveText
                            : styles.block4InActiveText
                        ]}
                      >
                        Suspended
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {this.state.errorText != "" ? (
                    <View style={{ alignItems: "center", marginTop: "47%" }}>
                      <ErrorTemplate
                        message={this.state.errorText}
                        subMessage={this.state.subMessage}
                      />
                    </View>
                  ) : (
                    <View>
                      {this.state.waitingApiCalled
                        ? this.waitinglistComponent(this.state.getList)
                        : this.state.ongoingApiCalled
                        ? this.onGoingListComponent(this.state.getList)
                        : this.state.blockedApiCalled
                        ? this.blockListComponent(this.state.getList)
                        : this.state.suspendApiCalled
                        ? this.suspendListComponent(this.state.getList)
                        : null}
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

  waitinglistComponent = response => {
    return (
      <FlatList
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        keyExtractor={item => item.id.toString()}
        ListHeaderComponent={<View style={{ height: 10 }} />}
        ListFooterComponent={<View style={{ height: 10 }} />}
        data={response}
        numColumns={1}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            activeOpacity={1}
            onPress={() =>
              this.props.navigation.navigate("rejectJoinPage", { result: item })
            }
          >
            <View style={[styles.listItemWrapper]}>
              <View style={styles.listLeftWrapper}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.listLeftText}>Circle : </Text>
                  <Text style={styles.listRightText}>{item.circle_code}</Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.listLeftText}>Circle Admin : </Text>
                  <Text style={styles.listRightText}>{item.admin}</Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.listLeftText}>Participants : </Text>
                  <Text
                    numberOfLines={1}
                    style={[styles.listRightText, { paddingRight: 20 }]}
                  >
                    {this.getNames(item.get_users)}
                  </Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.listLeftText}>Amount : </Text>
                  <Text style={styles.listRightText}>
                    €{item.target_achive}
                  </Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.listLeftText}>Launch Date : </Text>
                  <Text style={styles.listRightText}>
                    {CommonService.formatDate(item.start_date)}
                  </Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.listLeftText}>Last round Date : </Text>
                  <Text style={styles.listRightText}>
                    {CommonService.formatDate(item.end_date)}
                  </Text>
                </View>
              </View>

              {/* <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <ProgressCircle
                  percent={0}
                  radius={hp('5%')}
                  borderWidth={8}
                  color="#3bdfde"
                  shadowColor="#ececec"
                  bgColor="#fff"
                >
                  <Text style={{ fontSize: 18 }}>{'0%'}</Text>
                </ProgressCircle>
              </View> */}
            </View>
          </TouchableOpacity>
        )}
      />
    );
  };

  onGoingListComponent = response => {
    return (
      <FlatList
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        keyExtractor={item => item.id.toString()}
        ListHeaderComponent={<View style={{ height: 10 }} />}
        ListFooterComponent={<View style={{ height: 10 }} />}
        data={response}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            activeOpacity={1}
            onPress={() =>
              this.props.navigation.navigate("ongingPage", { result: item })
            }
          >
            <View style={styles.listItemWrapper}>
              <View style={styles.listLeftWrapper}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.listLeftText}>Circle : </Text>
                  <Text style={styles.listRightText}>{item.circle_code}</Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.listLeftText}>Admin : </Text>
                  <Text style={styles.listRightText}>{item.admin}</Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.listLeftText}>Participants : </Text>
                  <Text
                    numberOfLines={1}
                    style={[styles.listRightText, { width: wp("33%") }]}
                  >
                    {this.getNames(item.get_users)}
                  </Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.listLeftText}>Amount : </Text>
                  <Text style={styles.listRightText}>
                    €{item.target_achive}
                  </Text>
                </View>

                {/* <View
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                >
                  <Text style={styles.listLeftText}>
                    Launch Date :{' '}
                  </Text>
                  <Text style={styles.listRightText}>{CommonService.formatDate(item.start_date)}</Text>
                </View> */}

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.listLeftText}>Last round Date : </Text>
                  <Text style={styles.listRightText}>
                    {CommonService.formatDate(item.end_date)}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.listLeftText}>
                    Expected payment receive :{" "}
                  </Text>
                  <Text style={styles.listRightText}>
                    {item.expected_payable_date}
                  </Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.listLeftText}>
                    Next expected payment :{" "}
                  </Text>
                  <Text style={styles.listRightText}>
                    {item.expected_next_payment_date}
                  </Text>
                </View>

                {/* <View
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                >
                  <Text style={styles.listLeftText}>
                    Progress Status :{' '}
                  </Text>
                  {
                    item.completed_round == item.estimate_round ?
                    <Text style={styles.listRightText}>Completed</Text>:
                    item.completed_round > 1 ?
                    <Text style={styles.listRightText}>{item.completed_round+' rounds over out of '+item.estimate_round}</Text>:
                    item.completed_round < 2 ?
                    <Text style={styles.listRightText}>{item.completed_round+' round over out of '+item.estimate_round}</Text>:null
                  }
                </View> */}
              </View>

              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  position: "relative",
                  bottom: 10
                }}
              >
                <ProgressCircle
                  percent={CommonService.getPercentage(
                    item.completed_round,
                    item.estimate_round
                  )}
                  radius={hp("5%")}
                  borderWidth={8}
                  color="#3bdfde"
                  shadowColor="#ececec"
                  bgColor="#fff"
                >
                  <Text style={{ fontSize: 18 }}>
                    {CommonService.getPercentage(
                      item.completed_round,
                      item.estimate_round
                    ) + "%"}
                  </Text>
                </ProgressCircle>
              </View>
            </View>
          </TouchableOpacity>
        )}
        numColumns={1}
      />
    );
  };

  blockListComponent = response => {
    console.log("item", response);
    return (
      <FlatList
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        keyExtractor={item => item.id.toString()}
        ListHeaderComponent={<View style={{ height: 10 }} />}
        ListFooterComponent={<View style={{ height: 10 }} />}
        data={response}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            activeOpacity={1}
            onPress={() =>
              this.props.navigation.navigate("blockCircleOnePage", {
                result: item
              })
            }
          >
            <View style={styles.listItemWrapper}>
              <View style={styles.listLeftWrapper}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.listLeftText}>Circle : </Text>
                  <Text style={styles.listRightText}>{item.circle_code}</Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.listLeftText}>Admin : </Text>
                  <Text style={styles.listRightText}>{item.admin}</Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.listLeftText}>Participants : </Text>
                  <Text
                    numberOfLines={1}
                    style={[styles.listRightText, { width: wp("33%") }]}
                  >
                    {this.getNames(item.get_users)}
                  </Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.listLeftText}>Amount : </Text>
                  <Text style={styles.listRightText}>
                    €{item.target_achive}
                  </Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.listLeftText}>Launch Date : </Text>
                  <Text style={styles.listRightText}>
                    {CommonService.formatDate(item.start_date)}
                  </Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.listLeftText}>Last round Date : </Text>
                  <Text style={styles.listRightText}>
                    {CommonService.formatDate(item.end_date)}
                  </Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.listLeftText}>Progress Status : </Text>
                  {item.completed_round == item.estimate_round ? (
                    <Text style={styles.listRightText}>Completed</Text>
                  ) : item.completed_round > 1 ? (
                    <Text style={styles.listRightText}>
                      {item.completed_round +
                        " rounds over out of " +
                        item.estimate_round}
                    </Text>
                  ) : item.completed_round < 2 ? (
                    <Text style={styles.listRightText}>
                      {item.completed_round +
                        " round over out of " +
                        item.estimate_round}
                    </Text>
                  ) : null}
                </View>
              </View>

              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <ProgressCircle
                  percent={CommonService.getPercentage(
                    item.completed_round,
                    item.estimate_round
                  )}
                  radius={hp("5%")}
                  borderWidth={8}
                  color="#3bdfde"
                  shadowColor="#ececec"
                  bgColor="#fff"
                >
                  <Text style={{ fontSize: 18 }}>
                    {CommonService.getPercentage(
                      item.completed_round,
                      item.estimate_round
                    ) + "%"}
                  </Text>
                </ProgressCircle>
              </View>
            </View>
          </TouchableOpacity>
        )}
        numColumns={1}
      />
    );
  };

  suspendListComponent = response => {
    return (
      <FlatList
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        keyExtractor={item => item.id.toString()}
        ListHeaderComponent={<View style={{ height: 10 }} />}
        ListFooterComponent={<View style={{ height: 10 }} />}
        data={response}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            activeOpacity={1}
            onPress={() =>
              this.props.navigation.navigate("suspendedScreen", {
                result: item
              })
            }
          >
            <View style={styles.listItemWrapper}>
              <View style={styles.listLeftWrapper}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.listLeftText}>Circle : </Text>
                  <Text style={styles.listRightText}>{item.circle_code}</Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.listLeftText}>Admin : </Text>
                  <Text style={styles.listRightText}>{item.admin}</Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.listLeftText}>Participants : </Text>
                  <Text
                    numberOfLines={1}
                    style={[styles.listRightText, { width: wp("33%") }]}
                  >
                    {this.getNames(item.get_users)}
                  </Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.listLeftText}>Amount : </Text>
                  <Text style={styles.listRightText}>
                    €{item.target_achive}
                  </Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.listLeftText}>Launch Date : </Text>
                  <Text style={styles.listRightText}>
                    {CommonService.formatDate(item.start_date)}
                  </Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.listLeftText}>Last round Date : </Text>
                  <Text style={styles.listRightText}>
                    {CommonService.formatDate(item.end_date)}
                  </Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.listLeftText}>Progress Status : </Text>
                  {item.completed_round > 1 ? (
                    <Text style={styles.listRightText}>
                      {item.completed_round +
                        " rounds over out of " +
                        item.estimate_round}
                    </Text>
                  ) : (
                    <Text style={styles.listRightText}>
                      {item.completed_round +
                        " round over out of " +
                        item.estimate_round}
                    </Text>
                  )}
                </View>
              </View>

              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <ProgressCircle
                  percent={CommonService.getPercentage(
                    item.completed_round,
                    item.estimate_round
                  )}
                  radius={hp("5%")}
                  borderWidth={8}
                  color="#3bdfde"
                  shadowColor="#ececec"
                  bgColor="#fff"
                >
                  <Text style={{ fontSize: 18 }}>
                    {CommonService.getPercentage(
                      item.completed_round,
                      item.estimate_round
                    ) + "%"}
                  </Text>
                </ProgressCircle>
              </View>
            </View>
          </TouchableOpacity>
        )}
        numColumns={1}
      />
    );
  };
}

export default withNavigationFocus(DashboardScreen);

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
