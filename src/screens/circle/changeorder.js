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
  Animated,
  Easing
} from "react-native";
import FeatherIcon from "react-native-vector-icons/Feather";
import AsyncStorage from "@react-native-community/async-storage";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from "react-native-responsive-screen";

import SortableList from "react-native-sortable-list";

const statusBarBackgroundColor = "#1CCBE6";
const barStyle = "light-content";
import HeaderCurve from "../includes/headercurve";

import axios from "axios";

import URL from "../../config/url";
const ApiConfig = URL;

export default class ChangeOrderParticipantsScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      participantList: [],
      loadingContent: true,
      newOrder: []
    };
  }

  componentDidMount() {
    this._bootstrapAsync();

    let participants = this.props.navigation.getParam("participants", {});
    this.setState({
      participantList: participants
    });

    console.log(participants);

    setTimeout(
      function() {
        this.setState({
          loadingContent: false
        });
      }.bind(this),
      1000
    );
  }

  _bootstrapAsync = async () => {
    AsyncStorage.multiGet([
      "rememberToken",
      "circle_code",
      "first_name",
      "avatar_location"
    ]).then(response => {
      console.log(response[0][0]);
      console.log(response[0][1]);

      console.log(response[1][0]);
      console.log(response[1][1]);

      this.setState({
        rememberToken: response[0][1],
        cicle_code: response[1][1],
        first_name: response[2][1],
        avatar_location: response[3][1]
      });
    });
  };

  _renderRow = ({ data, active }) => {
    return <Row data={data} active={active} />;
  };

  onRelease = (key, currentOrder) => {
    console.log(currentOrder);
    this.setState(
      {
        newOrder: currentOrder
      },
      () => {}
    );
  };

  _doContinue = () => {
    console.log("this.state", this.state.participantList);
    let reorderList = "";
    let reorder = this.state.newOrder;
    let participantList = "";
    let newArray = [...this.state.participantList];

    if (reorder.length) {
      reorder.forEach(element => {
        reorderList += element + ",";
        participantList += newArray[Number(element)].id + ",";
      });
    }

    reorderList = reorderList.replace(/,\s*$/, "");
    console.log(reorderList);
    participantList = participantList.replace(/,\s*$/, "");
    console.log(participantList);

    setTimeout(
      function() {
        let obj = {
          circle_code: this.state.cicle_code,
          reorder: reorderList,
          plist: participantList
        };

        console.log("objecttttttt", obj);
        console.log(
          "request uri==" + ApiConfig.base_url + "reorder-circle-user"
        );
        console.log("final request params==" + JSON.stringify(obj));
        console.log("Token ==" + this.state.rememberToken);

        this.setState({
          loader: true
        });
        let that = this;

        axios
          .post(
            "https://nodejsdapldevelopments.com/dart/public/api/reorder-circle-user",
            JSON.stringify(obj),
            {
              headers: {
                Authorization: "Bearer " + that.state.rememberToken
              }
            }
          )
          .then(function(response) {
            console.log("responsessssssssssssssssss", response);
            that.props.navigation.navigate("circlePreviewPage", {
              participants: response.data.result
            });
          })
          .catch(function(error) {
            console.log("error==" + error);
          })
          .finally(function() {
            console.log("always executed");
            that.setState({
              loader: false
            });
          });
      }.bind(this),
      500
    );
  };

  render() {
    return (
      <View style={styles.container}>
        <StatusBar
          backgroundColor={statusBarBackgroundColor}
          barStyle={barStyle}
        />

        <View style={{ flex: 1 }}>
          <View
            style={{
              flex: 1,
              position: "relative"
            }}
          >
            <HeaderCurve
              backButton={true}
              //title={"Create Circle"}
              navigation={this.props.navigation}
              avatar_location={
                ApiConfig.public_url + "storage/" + this.state.avatar_location
              }
              first_name={this.state.first_name}
              //admin={item.is_admin}
              bellIcon={true}
            />

            <View
              style={{
                flex: 1,
                marginBottom: 20
              }}
            >
              <View
                style={{
                  flex: 1,
                  marginLeft: 20,
                  marginRight: 20,
                  marginTop: 20
                }}
              >
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 20
                  }}
                >
                  <Text style={styles.headingText}>
                    Change order participants
                  </Text>
                </View>

                {!this.state.loadingContent ? (
                  <View style={{ flex: 1, marginTop: 20 }}>
                    <SortableList
                      style={styles.list}
                      contentContainerStyle={styles.contentContainer}
                      data={this.state.participantList}
                      renderRow={this._renderRow}
                      //onChangeOrder={this.onRelease}
                      onReleaseRow={this.onRelease}
                    />

                    <TouchableOpacity
                      onPress={() => this._doContinue()}
                      style={styles.confirmButtonBlock}
                      disabled={this.state.loader}
                    >
                      <Text style={styles.confirmButtonText}>Confirm</Text>

                      {this.state.loader ? (
                        <View style={styles.loading}>
                          <ActivityIndicator size="small" color={"#FFFFFF"} />
                        </View>
                      ) : null}
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center"
                    }}
                  >
                    <ActivityIndicator />
                  </View>
                )}
              </View>
            </View>
          </View>
          <View style={{ marginTop: 20 }} />
        </View>
      </View>
    );
  }
}
class Row extends Component {
  constructor(props) {
    super(props);

    this._active = new Animated.Value(0);

    this._style = {
      ...Platform.select({
        ios: {
          transform: [
            {
              scale: this._active.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.05]
              })
            }
          ],
          shadowRadius: this._active.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 2]
          })
        },

        android: {
          transform: [
            {
              scale: this._active.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.05]
              })
            }
          ],
          elevation: this._active.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 2]
          })
        }
      })
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.active !== nextProps.active) {
      Animated.timing(this._active, {
        duration: 1000,
        easing: Easing.bounce,
        toValue: Number(nextProps.active)
      }).start();
    }
  }

  render() {
    const { data, active } = this.props;

    return (
      <Animated.View style={[styles.listWrapper, this._style]}>
        <View
          style={{
            flex: 1
          }}
        >
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text
              style={{
                fontFamily: "Roboto-Reguler",
                color: "#000000",
                fontSize: 15
              }}
            >
              Name :
            </Text>
            <Text
              style={{
                fontFamily: "Roboto-Reguler",
                color: "#000000",
                fontSize: 15
              }}
            >
              {data.username}
            </Text>
          </View>

          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text
              style={{
                fontFamily: "Roboto-Reguler",
                color: "#000000",
                fontSize: 15
              }}
            >
              Phone
            </Text>

            <Text
              style={{
                fontFamily: "Roboto-Reguler",
                color: "#000000",
                fontSize: 15
              }}
            >
              {data.mobile_number}
            </Text>
          </View>
        </View>
      </Animated.View>
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

  headerMenu: {
    flexDirection: "row",
    height: 40,
    justifyContent: "space-between",
    alignItems: "center",
    paddingLeft: 20,
    paddingRight: 20,
    top: hp("3%")
  },

  avatarImageWrapper: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eeeeee",
    borderRadius: 25,
    backgroundColor: "#FFFFFF",
    top: 20
  },

  headingText: {
    fontFamily: "Roboto-Reguler",
    fontSize: 16,
    color: "#000000"
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
  list: {
    flex: 1
  },
  listWrapper: {
    height: 50,
    flexDirection: "row",
    padding: 10,
    borderRadius: 5,
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#5ac6c6",
    marginLeft: 20,
    marginRight: 20
  },
  confirmButtonBlock: {
    //marginTop: 50,
    height: 50,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#5AC6C6",
    elevation: 2,
    flexDirection: "row"
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Roboto-Reguler"
  },
  contentContainer: {
    flex: 1
  },
  loading: {
    marginLeft: 10
  }
});
