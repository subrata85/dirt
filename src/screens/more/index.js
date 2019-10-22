import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  Alert,
  TouchableOpacity
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from "react-native-responsive-screen";
import AsyncStorage from "@react-native-community/async-storage";
import FooterTabComponent from "../../components/footerTab/footerTabComponent";
const statusBarBackgroundColor = "#1CCBE6";
const barStyle = "light-content";
import HeaderCurve from "../includes/headercurve";
export default class MoreScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      rememberToken: null
    };
  }

  componentDidMount() {
    this._bootstrapAsync();
  }

  _bootstrapAsync = async () => {
    AsyncStorage.multiGet(["rememberToken"]).then(response => {
      this.setState({
        rememberToken: response[0][1]
      });
    });

    //this.props.navigation.navigate(userToken ? 'App' : 'Auth');
  };

  _doLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        {
          text: "OK",
          onPress: () => {
            AsyncStorage.clear();
            this.props.navigation.navigate("authStack");
          }
        }
      ],
      { cancelable: false }
    );
  };

  gotoEditProfile() {
    this.props.navigation.navigate("editProfile");
  }

  render() {
    return (
      <View style={styles.container}>
        <StatusBar
          backgroundColor={statusBarBackgroundColor}
          barStyle={barStyle}
        />

        <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={{ flex: 1, position: "relative" }}>
            <HeaderCurve
              title={"More Options"}
              navigation={this.props.navigation}
              // avatar_location={this.state.avatar_location}
              backButton={true}
              //first_name={this.state.first_name}
              bellIcon={true}
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
                <Text style={styles.headingBold}>More Options</Text>
              </View>
              <View style={styles.containerBackBlock} />
            </View> */}

            <View style={{ flex: 1 }}>
              <View
                style={{
                  flex: 1,
                  marginLeft: 20,
                  marginRight: 20
                }}
              >
                <TouchableOpacity
                  onPress={() => this._doLogout()}
                  style={styles.sendButtonBlock}
                >
                  <Text style={styles.sendButtonText}>Logout</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => this.gotoEditProfile()}
                  style={styles.sendButtonBlock}
                >
                  <Text style={styles.sendButtonText}>Edit Profile</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
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
    width: 70
  },
  sendButtonBlock: {
    marginTop: 20,
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
  }
});
