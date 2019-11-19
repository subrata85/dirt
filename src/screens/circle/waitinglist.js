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
  FlatList
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from "react-native-responsive-screen";
import AsyncStorage from "@react-native-community/async-storage";
import ProgressCircle from "react-native-progress-circle";

const width = Math.round(Dimensions.get("window").width);
const height = Math.round(Dimensions.get("window").height);

const statusBarBackgroundColor = "#1CCBE6";
const barStyle = "light-content";
import HeaderCurve from "../includes/headercurve";
import FooterTabComponent from "../../components/footerTab/footerTabComponent";
export default class WaitingListScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      rememberToken: null,
      list: [{ key: "1", name: "debanjan" }]
    };
  }

  componentDidMount() {
    this._bootstrapAsync();
  }

  _bootstrapAsync = async () => {
    AsyncStorage.multiGet([
      "rememberToken",
      "first_name",
      "avatar_location"
    ]).then(response => {
      this.setState({
        rememberToken: response[0][1],
        first_name: response[1][1],
        avatar_location: response[2][1]
      });
    });

    //this.props.navigation.navigate(userToken ? 'App' : 'Auth');
  };

  _doLaunchCircle = () => {
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
              that.props.navigation.navigate("CreateCircleScreen");
            }
          );
        }.bind(this),
        1000
      );
    });
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

  _getWaitingList = () => {
    let obj = {};
  };

  _getOngoingList = () => {
    this.props.navigation.navigate("ongoingListPage");
  };

  _getBlockedList = () => {};

  _getSuspendedList = () => {};

  render() {
    return (
      <View style={styles.container}>
        <StatusBar
          backgroundColor={statusBarBackgroundColor}
          barStyle={barStyle}
        />

        <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={{ flex: 1, position: "relative" }}>
            <HeaderCurve props={this.props} navigation={this.navigation} />

            <View style={styles.headerMenu}>
              <View style={styles.containerBackBlock} />
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Text style={styles.headingBold}>Welcome Dashboard</Text>
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
                    style={styles.block2Active}
                    onPress={() => this._getWaitingList()}
                  >
                    <Text style={styles.block2ActiveText}>Wating</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.block1InActive}
                    onPress={() => this._getOngoingList()}
                  >
                    <Text style={styles.block1InActiveText}>Ongoings</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.block3InActive}
                    onPress={() => this._getBlockedList()}
                  >
                    <Text style={styles.block3InActiveText}>Blocked</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.block4InActive}
                    onPress={() => this._getSuspendedList()}
                  >
                    <Text style={styles.block4InActiveText}>Suspended</Text>
                  </TouchableOpacity>
                </View>

                <FlatList
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false}
                  keyExtractor={item => item.key.toString()}
                  ListHeaderComponent={<View style={{ height: 10 }} />}
                  ListFooterComponent={<View style={{ height: 10 }} />}
                  data={this.state.list}
                  renderItem={({ item }) => (
                    <View style={styles.listItemWrapper}>
                      <View style={styles.listLeftWrapper}>
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <Text style={styles.listLeftText}>Circle : </Text>
                          <Text style={styles.listRightText}>1</Text>
                        </View>

                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <Text style={styles.listLeftText}>Admin : </Text>
                          <Text style={styles.listRightText}>Noel</Text>
                        </View>

                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <Text style={styles.listLeftText}>
                            Participants :{" "}
                          </Text>
                          <Text style={styles.listRightText}>deb1,deb2</Text>
                        </View>

                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <Text style={styles.listLeftText}>Amount : </Text>
                          <Text style={styles.listRightText}>€100</Text>
                        </View>

                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <Text style={styles.listLeftText}>
                            Launch Date :{" "}
                          </Text>
                          <Text style={styles.listRightText}>04/07/2019</Text>
                        </View>

                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <Text style={styles.listLeftText}>
                            Last round Date :{" "}
                          </Text>
                          <Text style={styles.listRightText}>04/07/2019</Text>
                        </View>
                      </View>

                      <View
                        style={{
                          justifyContent: "center",
                          alignItems: "center"
                        }}
                      >
                        <ProgressCircle
                          percent={0}
                          radius={hp("5%")}
                          borderWidth={8}
                          color="#3bdfde"
                          shadowColor="#ececec"
                          bgColor="#fff"
                        >
                          <Text style={{ fontSize: 18 }}>{"0%"}</Text>
                        </ProgressCircle>
                      </View>
                    </View>
                  )}
                  numColumns={1}
                />
              </View>
            </View>
          </View>
          <View style={{ marginTop: 20 }} />
        </KeyboardAwareScrollView>
        <FooterTabComponent props={this.props} />
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
    width: 50,
    height: 50
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

  inputTextStyleInactive: {
    flex: 1,
    height: 40,
    //borderBottomColor: '#dfdfe1',
    borderBottomColor: "#1DC2E0",
    borderBottomWidth: 1,
    color: "#000000",
    fontSize: 20,
    ...Platform.select({
      android: {
        fontFamily: "Roboto-Reguler"
      }
    }),
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
    ...Platform.select({
      android: {
        fontFamily: "Roboto-Reguler"
      }
    })
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
    ...Platform.select({
      android: {
        fontFamily: "Roboto-Reguler"
      }
    }),
    fontWeight: "600"
  },
  headingLight: {
    color: "#FFFFFF",
    fontSize: 20,
    ...Platform.select({
      android: {
        fontFamily: "Roboto-Reguler"
      }
    }),
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
    ...Platform.select({
      android: {
        fontFamily: "Roboto-Reguler"
      }
    }),
    fontSize: 16
  }
});
