import React, { Component } from "react";
import { View, TouchableOpacity, ToastAndroid, Alert } from "react-native";
import StatusBarComponent from "../../components/statusBar/statusBarComponent";
import HeaderCurve from "../includes/headercurve";
import Ionicons from "react-native-vector-icons/Ionicons";
import { ListItem, CheckBox } from "react-native-elements";
import SearchBar from "react-native-searchbar";
import { Container, Content } from "native-base";
import Contacts from "react-native-contacts";
import CommonService from "../../services/common/commonService";
import Loading from "react-native-loader-overlay";
import global from "../../services/global/globalService";
import { NavigationEvents } from "react-navigation";
import AsyncStorage from "@react-native-community/async-storage";
let list = [];

export default class PhoneContacsScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchText: "",
      searchResult: [],
      contactList: false,
      defaultIcon: true,
      selectedLists: [],
      isChecked: [],
      mobile_number: "",
      mobile_country_code: ""
    };
  }

  componentDidMount() {
    const { isChecked } = this.state;
    global.contacts_data.map(d => {
      isChecked[d.rawContactId] = true;
      this.setState({ isChecked: isChecked });
    });
    this.setState({
      selectedLists: global.contacts_data
    });
    AsyncStorage.multiGet(["mobile_number", "mobile_country_code"]).then(
      response => {
        console.log("mobile", response);
        this.setState({
          mobile_number: response[0][1],
          mobile_country_code: response[1][1]
        });
      }
    );
    this.getContactList();
  }

  getContactList() {
    this.loading = Loading.show(CommonService.loaderObj);
    Contacts.getAll((err, contacts) => {
      if (err !== null) {
        ToastAndroid.showWithGravity(
          err,
          ToastAndroid.LONG,
          ToastAndroid.BOTTOM
        );
      } else {
        try {
          let sortedContact = contacts.sort(function(a, b) {
            if (a.displayName != null && b.displayName != null) {
              var nameA = a.displayName.toUpperCase(); // ignore upper and lowercase
              var nameB = b.displayName.toUpperCase();
              if (nameA < nameB) {
                return -1;
              } else {
                return 1;
              }
            }
          });
          let contactArr = [];
          const regex = /^\*|\#+$/;
          sortedContact.forEach(ele => {
            if (ele.phoneNumbers.length) {
              if (!regex.test(ele.phoneNumbers[0].number)) {
                if (
                  ele.displayName != "" &&
                  ele.displayName != null &&
                  ele.displayName != undefined &&
                  ele.displayName.toLowerCase() != "unknown"
                ) {
                  let phone = ele.phoneNumbers[0].number;
                  phone = phone.split(".").join("");
                  phone = phone.split(" ").join("");
                  phone = phone.split("-").join("");
                  phone = phone.split("(").join("");
                  phone = phone.split(")").join("");
                  let obj = {
                    username: ele.displayName,
                    mobile: phone,
                    rawContactId: ele.rawContactId
                  };
                  contactArr.push(obj);
                }
              }
            }
          });
          list = contactArr;
          this.setState({ contactList: true });
          if (list.length) {
            Loading.hide(this.loading);
          }
        } catch (err) {
          alert("catch error in contact1 " + err);
          if (err !== null) {
            alert("catch error in contact2 " + err);
          }
        }
      }
    });
  }

  showSearchBar = () => {
    this.setState({ defaultIcon: false });
    this.searchBar.show();
  };

  hideSearchBar() {
    this.setState({ defaultIcon: true, searchResult: [] });
    this.searchBar.hide();
  }

  search = searchText => {
    let newData = list.filter(function(item) {
      let name = item.username.toUpperCase();
      let mobile = item.mobile.toUpperCase();
      let textData = searchText.toUpperCase();
      return name.indexOf(textData) > -1 || mobile.indexOf(textData) > -1;
    });
    this.setState({ searchResult: newData });
  };

  chooseContact = (listItem, mobile, index) => {
    let mobileNumber = "";
    if (listItem.mobile[0] === "0") {
      if (listItem.mobile[1] === "6" || listItem.mobile[1] === "7") {
        mobileNumber = listItem.mobile.replace(
          "0",
          this.state.mobile_country_code
        );
      }
    } else if (listItem.mobile.slice(0, 3) === this.state.mobile_country_code) {
      if (listItem.mobile[3] === "6" || listItem.mobile[3] === "7") {
        mobileNumber = listItem.mobile;
      }
    }
    // else if (listItem.mobile.slice(0, 3) !== "+33") {
    //   if (listItem.mobile[0] === "6" || listItem.mobile[0] === "7") {
    //     mobileNumber = "+33" + listItem.mobile;
    //   }
    // }

    // if (listItem.mobile[0] === "+") {
    //   if (listItem.mobile[1] === "3" || listItem.mobile[2] === "3") {
    //     mobileNumber = listItem.mobile;
    //   }
    // }

    if (mobileNumber !== "") {
      console.log("listItem", listItem);
      // listItem["mobile"] = mobileNumber;
      let matchContact = mobileNumber.match(this.state.mobile_number);
      if (matchContact === null) {
        let { isChecked, selectedLists } = this.state;
        //let dIndex = selectedLists.indexOf(listItem.mobile);
        // let dIndex = selectedLists.indexOf(listItem.rawContactId, 0);
        const contactNumber = /['^£$%&*()}{@#~?><>,|=_¬-]/;
        let listData = {
          mobile: mobileNumber,
          rawContactId: listItem.rawContactId,
          username: listItem.username
        };
        if (contactNumber.test(listData.mobile) !== true) {
          let dIndex = selectedLists.findIndex(x => x.mobile === mobile);

          isChecked[listData.rawContactId] = !isChecked[listData.rawContactId];
          this.setState({ isChecked: isChecked });
          if (isChecked[listData.rawContactId] == true) {
            selectedLists.push(listData);
            this.setState({
              selectedLists
            });
          } else {
            selectedLists.splice(dIndex, 1);
            this.setState({
              selectedLists
            });
          }
        } else {
          Alert.alert("", `Not a valid phone number`);
        }
      }
    } else {
      Alert.alert("", `Not a valid number`);
    }
  };

  submitContactsData = () => {
    global.contacts_data = this.state.selectedLists;
    global.update_contact_data = true;
    this.props.navigation.goBack();
  };

  // onWillFocus() {
  //   if (global.contacts_data.length) {
  //     global.contacts_data.forEach((ele, i) => {
  //       this.chooseContact(ele, ele.mobile);
  //     });
  //   }
  // }

  render() {
    console.log("mobile_country_code", this.state.mobile_country_code);
    return (
      <Container>
        <Content>
          {/* <NavigationEvents onWillFocus={() => this.onWillFocus()} /> */}
          <StatusBarComponent />
          <View style={{ flex: 1, position: "relative", height: 120 }}>
            {this.state.defaultIcon ? (
              <HeaderCurve
                title={"Phone Contacts"}
                navigation={this.props.navigation}
                searchIcon={true}
                showSearchBar={this.showSearchBar}
                backButton={true}
                bellIcon={true}
              />
            ) : (
              <HeaderCurve
                navigation={this.props.navigation}
                searchIcon={true}
                showSearchBar={this.showSearchBar}
                bellIcon={false}
              />
            )}

            <SearchBar
              ref={ref => (this.searchBar = ref)}
              handleChangeText={this.search}
              backgroundColor={"transparent"}
              iconColor={"white"}
              textColor={"white"}
              placeholderTextColor={"white"}
              heightAdjust={16}
              onBack={() => this.hideSearchBar()}
            />
          </View>
          <View style={{ paddingBottom: "10%" }}>
            {this.state.searchResult.length
              ? this.state.searchResult.map((l, i) => this.listItem(l, i))
              : list.length
              ? list.map((l, i) => this.listItem(l, i))
              : null}
          </View>
        </Content>
        {this.state.selectedLists.length ? (
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => this.submitContactsData()}
            style={{
              marginTop: 20,
              height: 50,
              borderRadius: 40,
              justifyContent: "center",
              alignItems: "center",
              elevation: 2,
              position: "absolute",
              bottom: 5,
              right: 5
            }}
          >
            <Ionicons name="ios-checkmark-circle" size={60} color="#5AC6C6" />
          </TouchableOpacity>
        ) : null}
      </Container>
    );
  }
  listItem(l, i) {
    return (
      <ListItem
        key={i}
        leftIcon={{
          name: "md-contact",
          type: "ionicon",
          size: 45,
          color: "#5AC6C6"
        }}
        title={l.username}
        subtitle={l.mobile}
        rightElement={
          <CheckBox
            ref={"check_box"}
            checkedIcon={
              <Ionicons
                name="ios-checkmark-circle-outline"
                size={20}
                color="#5AC6C6"
              />
            }
            uncheckedIcon={
              <Ionicons name="ios-radio-button-off" size={20} color="#ccc" />
            }
            checked={this.state.isChecked[l.rawContactId]}
            onPress={() => this.chooseContact(l, l.mobile, i)}
          />
        }
      />
    );
  }
}
