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
  ActivityIndicator
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from "react-native-responsive-screen";
const statusBarBackgroundColor = "#1CCBE6";
const barStyle = "light-content";
import HeaderCurve from "../includes/headercurve";
import AsyncStorage from "@react-native-community/async-storage";
import * as RNLocalize from "react-native-localize";
//new Stripe(context, "pk_test_yourkey");
//import language
import LanguagePicker from "../../components/language/languagePicker";
import {
  PowerTranslator,
  ProviderTypes,
  TranslatorConfiguration,
  TranslatorFactory
} from "react-native-power-translator";

export default class StartScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  async UNSAFE_componentWillMount() {
    const value = await AsyncStorage.getItem("notification_data");
    if (value !== "null" && value != undefined) {
      this.props.navigation.navigate("loginPage", { result: value });
    }
    console.log(RNLocalize.getLocales());
    console.log(RNLocalize.getCurrencies());
    console.log(RNLocalize.getNumberFormatSettings());
    console.log(RNLocalize.findBestAvailableLanguage(["en-US", "en", "fr"]));
  }

  _doRedirectLogin = () => {
    this.props.navigation.navigate("loginPage");
  };

  _doRedirectCreateAccount = () => {
    this.props.navigation.navigate("registerOnePage");
  };

  componentDidMount() {
    <PowerTranslator
      text={
        "Engineering physics or engineering science refers to the study of the combined disciplines of physics"
      }
    />;
  }
  render() {
    const toasTStyle = this.state.success
      ? { backgroundColor: "#00CC2C" }
      : { backgroundColor: "#A40B0B" };

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
            <HeaderCurve />
            {/*  multiLang picker start */}
            {/* <View
              style={{
                alignItems: "flex-end",
                marginRight: 25
              }}
            >
              <LanguagePicker />
            </View> */}
            {/*  multiLang picker end */}

            <View
              style={{
                flex: 1,
                marginTop: hp("5%")
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
                <View style={styles.imageWrapper}>
                  <Image
                    source={require("../../../assets/images/login.png")}
                    resizeMode={"contain"}
                    style={{
                      width: hp("40%"),
                      height: hp("40%")
                    }}
                  />
                </View>

                <View style={styles.containerHeaderBlock}>
                  <Text style={styles.containerHeaderText}>
                    This <Text style={{ fontWeight: "200" }}>is the </Text>
                    Welcome Text
                  </Text>
                  <Text style={styles.containerHeaderSubText} numberOfLines={2}>
                    This is sub heading
                  </Text>
                </View>

                <View style={{ marginTop: hp("2%") }}>
                  <TouchableOpacity
                    onPress={() => this._doRedirectLogin()}
                    style={styles.sendButtonBlock}
                  >
                    <Text style={styles.sendButtonText}>Login</Text>
                  </TouchableOpacity>

                  <View style={styles.sendButtonBlockCreateAccount}>
                    <Text
                      style={styles.createAccountText}
                      onPress={() => this._doRedirectCreateAccount()}
                    >
                      Create Account
                    </Text>
                  </View>
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
    width: 60
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

  containerHeaderBlock: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20
  },
  containerHeaderText: {
    color: "#2B2B2B",
    fontSize: 18,
    fontWeight: "500"
    //marginTop:hp('2%')
  },
  containerHeaderSubText: {
    color: "#4a4a4a",
    fontSize: 16,
    fontFamily: "Roboto-Reguler",
    marginTop: 10
  },
  sendButtonBlock: {
    marginTop: 40,
    height: 50,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#5ac6c6",
    elevation: 2
  },
  createAccountText: {
    color: "#12c4cc",
    fontSize: 16,
    fontFamily: "Roboto-Reguler"
  },

  sendButtonBlockCreateAccount: {
    marginTop: 20,
    justifyContent: "center",
    alignItems: "center"
  }
});
