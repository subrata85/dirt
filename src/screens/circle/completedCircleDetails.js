import React, { Component } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Container, Content } from "native-base";
import onGoingCircleStyle from "../onGoingCircle/onGoingCircleStyle";
var moment = require("moment");
import URL from "../../config/url";
import AsyncStorage from "@react-native-community/async-storage";
import HeaderCurve from "../includes/headercurve";
import CommonService from "../../services/common/commonService";
import httpService from "../../services/http/httpService";
import Loading from "react-native-loader-overlay";
import { ErrorTemplate } from "../../components/error/errorComponent";
let flag = false;
let paybutton = false;
import { NavigationActions } from "react-navigation";

export default class CompletedCircleDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      rememberToken: "",
      cicle_code: "",
      first_name: "",
      avatar_location: "",
      user_id: "",
      errorText: "",
      subMessage: "",
      details: Object.create(null),
      apiExecute: true,
      paybuttonVisible: false
    };
  }

  componentDidMount() {
    this._bootstrapAsync();
  }

  _bootstrapAsync = async () => {
    let selectedDetails = this.props.navigation.getParam("result");
    console.log("sele", selectedDetails);
    AsyncStorage.multiGet([
      "rememberToken",
      "circle_code",
      "first_name",
      "avatar_location",
      "user_id"
    ]).then(response => {
      this.setState({
        rememberToken: response[0][1],
        cicle_code: response[1][1],
        first_name: response[2][1],
        avatar_location: { uri: URL.public_url + "storage/" + response[3][1] },
        user_id: response[4][1],
        details: selectedDetails
      });
    });
  };

  render() {
    const item = this.state.details;
    return (
      <Container>
        <Content>
          {/* <HeaderCurve/> */}
          <HeaderCurve
            //title={"Create Circle"}
            navigation={this.props.navigation}
            avatar_location={this.state.avatar_location}
            backButton={true}
            first_name={this.state.first_name}
            admin={item.is_admin}
            bellIcon={true}
            props={this.props}
          />

          {this.state.errorText != "" ? (
            <View style={{ alignItems: "center", marginTop: "50%" }}>
              <ErrorTemplate
                message={this.state.errorText}
                subMessage={this.state.subMessage}
              />
            </View>
          ) : (
            <View style={onGoingCircleStyle.mainContent}>
              <View>
                <View style={{ alignItems: "center" }}>
                  <Text
                    style={{
                      flex: 5,
                      fontSize: 20,
                      fontWeight: "bold",
                      paddingBottom: 5
                      // paddingTop: 5
                    }}
                  >
                    Circle{" "}
                    {item.status === 5
                      ? "Completed"
                      : item.status === 4
                      ? "Rejected"
                      : null}
                  </Text>
                  <Text>N° {item.circle_code}</Text>
                </View>
                <View
                  style={{
                    borderBottomWidth: 1,
                    borderColor: "#ccc",
                    padding: 5
                  }}
                >
                  <View style={onGoingCircleStyle.rowView}>
                    <View style={onGoingCircleStyle.rowViewLeftItem}>
                      <Text style={onGoingCircleStyle.rowText}>
                        Circle Admin:
                      </Text>
                    </View>
                    <View
                      style={[
                        onGoingCircleStyle.rowViewRightItem,
                        { flexDirection: "row" }
                      ]}
                    >
                      <Text
                        style={[
                          onGoingCircleStyle.rowTextValue,
                          { marginRight: 10 }
                        ]}
                      >
                        {item.admin}
                      </Text>
                    </View>
                  </View>
                  <View style={onGoingCircleStyle.rowView}>
                    <View style={onGoingCircleStyle.rowViewLeftItem}>
                      <Text style={onGoingCircleStyle.rowText}>
                        Total amount:
                      </Text>
                    </View>
                    <View style={onGoingCircleStyle.rowViewRightItem}>
                      <Text style={onGoingCircleStyle.rowTextValue}>
                        €{item.target_achive}
                      </Text>
                    </View>
                  </View>
                  <View style={onGoingCircleStyle.rowView}>
                    <View style={onGoingCircleStyle.rowViewLeftItem}>
                      <Text style={onGoingCircleStyle.rowText}>
                        Round amount:
                      </Text>
                    </View>
                    <View style={onGoingCircleStyle.rowViewRightItem}>
                      <Text style={onGoingCircleStyle.rowTextValue}>
                        €{item.round_set}
                      </Text>
                    </View>
                  </View>

                  <View style={onGoingCircleStyle.rowView}>
                    <View style={onGoingCircleStyle.rowViewLeftItem}>
                      <Text style={onGoingCircleStyle.rowText}>
                        Periodicity:
                      </Text>
                    </View>
                    <View style={onGoingCircleStyle.rowViewRightItem}>
                      <Text style={onGoingCircleStyle.rowTextValue}>
                        {item.p_round}
                      </Text>
                    </View>
                  </View>

                  <View style={onGoingCircleStyle.rowView}>
                    <View style={onGoingCircleStyle.rowViewLeftItem}>
                      <Text style={onGoingCircleStyle.rowText}>
                        Start date:
                      </Text>
                    </View>
                    <View style={onGoingCircleStyle.rowViewRightItem}>
                      {item.start_date ? (
                        <Text style={onGoingCircleStyle.rowTextValue}>
                          {CommonService.formatDate(item.start_date)}
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  <View style={onGoingCircleStyle.rowView}>
                    <View style={onGoingCircleStyle.rowViewLeftItem}>
                      <Text style={onGoingCircleStyle.rowText}>End date:</Text>
                    </View>
                    <View style={onGoingCircleStyle.rowViewRightItem}>
                      {item.end_date ? (
                        <Text style={onGoingCircleStyle.rowTextValue}>
                          {CommonService.formatDate(item.end_date)}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                  <View style={{ paddingTop: 20 }}>
                    <Text style={onGoingCircleStyle.rowText}>
                      Circle participants:
                    </Text>
                    <View
                      style={[
                        onGoingCircleStyle.rowViewNew,
                        { paddingBottom: 20 }
                      ]}
                    >
                      {item.get_users !== undefined
                        ? item.get_users.map((user_item, user_index) => (
                            <View
                              key={user_index}
                              style={{ flexDirection: "row" }}
                            >
                              <View
                                style={onGoingCircleStyle.nextRowViewLeftItem}
                              >
                                <Text style={onGoingCircleStyle.rowTextValue}>
                                  {user_index + 1}.{user_item.username}(
                                  {user_item.mobile_country_code}
                                  {user_item.mobile_number})
                                </Text>
                              </View>
                            </View>
                          ))
                        : null}
                    </View>
                  </View>
                  <View style={{ flexDirection: "row" }}>
                    <View style={onGoingCircleStyle.rowViewLeftItem}>
                      <Text style={onGoingCircleStyle.rowText}>Progress:</Text>
                    </View>
                    <View style={onGoingCircleStyle.rowViewRightItem}>
                      {item.completed_round == item.estimate_round ? (
                        <Text style={onGoingCircleStyle.rowTextValue}>
                          Completed
                        </Text>
                      ) : item.completed_round > 1 ? (
                        <Text style={onGoingCircleStyle.rowTextValue}>
                          {item.completed_round +
                            " rounds over out of " +
                            item.estimate_round}
                        </Text>
                      ) : item.completed_round < 2 ? (
                        <Text style={onGoingCircleStyle.rowTextValue}>
                          {item.completed_round +
                            " round over out of " +
                            item.estimate_round}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", paddingTop: 3 }}>
                    <View style={onGoingCircleStyle.rowViewLeftItem}>
                      <Text style={onGoingCircleStyle.rowText}>End date:</Text>
                    </View>
                    <View style={onGoingCircleStyle.rowViewRightItem}>
                      {item.end_date ? (
                        <Text style={onGoingCircleStyle.rowTextValue}>
                          {CommonService.formatDate(item.end_date)}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </View>

                <View style={onGoingCircleStyle.tableContent}>
                  <ScrollView>
                    <View style={onGoingCircleStyle.tablePart}>
                      <Text style={onGoingCircleStyle.baseText}>
                        <Text
                          style={[
                            onGoingCircleStyle.tableText,
                            { fontWeight: "bold" }
                          ]}
                        >
                          Round Completed:{" "}
                        </Text>
                        <Text
                          style={[
                            onGoingCircleStyle.tableText,
                            { color: "#24D19B" }
                          ]}
                          numberOfLines={1}
                        >
                          {item.completed_round}
                        </Text>
                      </Text>
                      {item.get_users !== undefined ? (
                        <View>
                          {item.get_users.map((user_item, user_index) => (
                            <View
                              key={user_index}
                              style={onGoingCircleStyle.rowView}
                            >
                              <View style={onGoingCircleStyle.rowViewLeftItem}>
                                <Text style={onGoingCircleStyle.rowTextValue}>
                                  {user_item.username}
                                  {user_item.reject_reason !== " "
                                    ? ":" + " " + user_item.reject_reason
                                    : null}
                                </Text>
                              </View>
                            </View>
                          ))}
                        </View>
                      ) : null}
                      {/* <Text style={{ fontWeight: "bold" }}>
                        Start date : {item.previous_round_payment_date}
                      </Text>
                      <Text style={{ fontWeight: "bold" }}>
                        End date : {item.expected_next_payment_date}
                      </Text> */}
                    </View>
                  </ScrollView>
                </View>

                {/* {item.userWillRecieveCurrentRound != "" ? (
                  <View style={onGoingCircleStyle.tableContentReceiverHistory}>
                    <Text style={onGoingCircleStyle.titleTextValue}>
                      {item.userWillRecieveCurrentRound}
                    </Text>
                  </View>
                ) : null} */}
                {/* {item.login_user_current_round_payment_status == 0 &&
                this.state.paybuttonVisible ? ( //
                  <View style={onGoingCircleStyle.paymentButtonView}>
                    <TouchableOpacity
                      onPress={() =>
                        this.props.navigation.navigate("bankDetailsPage", {
                          result: this.state.details,
                          navigate_from: "on_going_details"
                        })
                      }
                      style={[onGoingCircleStyle.paymentButton]}
                    >
                      <Text style={onGoingCircleStyle.paymentText}>
                        Pay your Round
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : null} */}

                {/* {item.round_complete
                  .map((user_round, round_index) => (
                    <View key={round_index} style={onGoingCircleStyle.roundRow}>
                      <View style={onGoingCircleStyle.tablePart}>
                        <Text style={onGoingCircleStyle.baseText}>
                          <Text
                            style={[
                              onGoingCircleStyle.tableText,
                              { fontWeight: "bold" }
                            ]}
                          >
                            Round {user_round.round}-{" "}
                          </Text>
                          <Text
                            style={[
                              onGoingCircleStyle.tableText,
                              { color: "#20CC94" }
                            ]}
                            numberOfLines={5}
                          >
                            Completed
                          </Text>
                        </Text>
                        <View style={onGoingCircleStyle.rowView}>
                          <View style={onGoingCircleStyle.rowViewLeftItem}>
                            {user_round.reciever_msg ? (
                              <Text>{user_round.reciever_msg}</Text>
                            ) : null}
                            <Text>On {user_round.completion_date}</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  ))
                  .reverse()} */}
              </View>
            </View>
          )}
        </Content>
      </Container>
    );
  }

  getNames(data) {
    let names = "";
    data.forEach(element => {
      if (element.current_round_payment_status == 0) {
        names += element.username + ", ";
      }
    });
    names = names.substring(0, names.length - 2);
    return names + " ";
  }
}
