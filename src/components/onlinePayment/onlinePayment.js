import React, { Component } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ToastAndroid,
  ActivityIndicator
} from "react-native";
import axios from "axios";
import Stripe from "react-native-stripe-api";
import moment from "moment";
import CreateCircle from "../../components/createCircle";
// const apiKey = "";
// const client = new Stripe(apiKey);

export default class OnlinePaymentModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      number: "4242424242424242",
      exp_month: "09",
      exp_year: "2020",
      cvc: "123",
      loader: false,
      apiKey: ""
    };
  }
  componentDidMount() {
    axios
      .get(
        "https://nodejsdapldevelopments.com/dart/public/api/get-stripe-public-key",
        {
          headers: {
            Authorization: "Bearer " + this.props.token
          }
        }
      )
      .then(res => {
        if (res.data.result) {
          this.setState({
            apiKey: res.data.result
          });
        } else {
          ToastAndroid.show("Payment key not found", ToastAndroid.LONG);
        }
      })
      .catch(err => {
        ToastAndroid.show(
          "Something wrong to get payment key",
          ToastAndroid.LONG
        );
      });
  }

  onlinePyament = async () => {
    const client = new Stripe(this.state.apiKey);

    this.setState({ loader: true });
    let onlinePaymentUrl = "";
    let paymentdata = {};

    const { number, exp_month, exp_year, cvc } = this.state;
    if (number === "") {
      ToastAndroid.show("Enter Card number", ToastAndroid.LONG);
    } else if (exp_month === "") {
      ToastAndroid.show("Enter expiry month", ToastAndroid.LONG);
    } else if (exp_year === "") {
      ToastAndroid.show("Enter expiry year", ToastAndroid.LONG);
    } else if (cvc === "") {
      ToastAndroid.show("Enter cvc number", ToastAndroid.LONG);
    } else {
      const token = await client.createToken({
        number: number,
        exp_month: exp_month,
        exp_year: exp_year,
        cvc: cvc
      });
      if (token.error) {
        ToastAndroid.show(token.error.message, ToastAndroid.LONG);
        this.setState({ loader: false });
      } else {
        if (this.props.buttonText === "Pay the Deposit") {
          onlinePaymentUrl =
            "https://nodejsdapldevelopments.com/dart/public/api/circle-request-accept";
          paymentdata = {
            circle_user_id: this.props.item.circle_user_id,
            circle_code: this.props.circle_code,
            trn_id: "",
            trn_status: "0",
            amount: this.props.amount,
            payment_date: moment(new Date()).format("DD/MM/YYYY"),
            login_mobile_number: this.props.mobileNo,
            join_status: 1,
            reason_id: 9,
            other_reason: "no eason",
            payment_mode: 2,
            stripeToken: token.id
          };
        }
        if (this.props.buttonText === "Pay your Round") {
          onlinePaymentUrl =
            "https://nodejsdapldevelopments.com/dart/public/api/circle-payment";

          paymentdata = {
            circle_code: this.props.circle_code,
            round_no: this.props.current_round,
            trn_id: "",
            trn_status: "0",
            amount: this.props.amount,
            payment_date: moment(new Date()).format("DD/MM/YYYY"),
            payment_mode: 2,
            stripeToken: token.id
          };
        }

        if (this.props.buttonText === "Pay my Round") {
          onlinePaymentUrl =
            "https://nodejsdapldevelopments.com/dart/public/api/block-circle-payment";

          paymentdata = {
            circle_code: this.props.circle_code,
            round_no: this.props.current_round,
            trn_id: "",
            trn_status: "0",
            amount: this.props.amount,
            payment_date: moment(new Date()).format("DD/MM/YYYY"),
            payment_mode: 2,
            stripeToken: token.id
          };
        }

        if (this.props.buttonText === "Suspend Pay") {
          onlinePaymentUrl =
            "https://nodejsdapldevelopments.com/dart/public/api/circle-refund-payment";
          paymentdata = {
            circle_code: this.props.circle_code,
            trn_id: "",
            trn_status: "0",
            amount: this.props.amount,
            payment_date: moment(new Date()).format("DD/MM/YYYY"),
            payment_mode: 2,
            stripeToken: token.id
          };
        }

        axios
          .post(onlinePaymentUrl, JSON.stringify(paymentdata), {
            headers: {
              Authorization: "Bearer " + this.props.token
            }
          })
          .then(res => {
            if (res.data.status === 100) {
              if (
                paymentdata.circle_user_id !== undefined ||
                paymentdata.circle_user_id === 1
              ) {
                CreateCircle.create(
                  this.props.item,
                  this.props.token,
                  this.props.navigation
                );
              } else {
                this.setState({ loader: false });
                ToastAndroid.show(res.data.message, ToastAndroid.LONG);
                this.props.navigation.navigate("dashboardPage");
              }
            }
          })
          .catch(err => {
            this.setState({ loader: false });
          });
      }
    }
  };

  render() {
    return (
      <View>
        <Text>Pay your payment</Text>
        <View style={styles.mainView}>
          <View style={styles.nestedView}>
            <Text style={styles.textStyle}>Card Number:</Text>
            <TextInput
              style={styles.inputStyle}
              value={this.state.number}
              placeholder={"Card number"}
              keyboardType="numeric"
              autoFocus={true}
              onChangeText={evt => this.setState({ number: evt })}
            />
          </View>
          <View style={styles.nestedView}>
            <Text style={styles.textStyle}>Exp Month:</Text>
            <TextInput
              style={styles.inputStyle}
              value={this.state.exp_month}
              placeholder={"Expiry month"}
              keyboardType="numeric"
              onChangeText={evt => this.setState({ exp_month: evt })}
            />
          </View>
          <View style={styles.nestedView}>
            <Text style={styles.textStyle}>Exp Year:</Text>
            <TextInput
              style={styles.inputStyle}
              value={this.state.exp_year}
              placeholder={"Expiry year"}
              keyboardType="numeric"
              onChangeText={evt => this.setState({ exp_year: evt })}
            />
          </View>

          <View style={styles.nestedView}>
            <Text style={styles.textStyle}>CVC:</Text>
            <TextInput
              style={styles.inputStyle}
              value={this.state.cvc}
              keyboardType="numeric"
              placeholder={"Cvc number"}
              onChangeText={evt => this.setState({ cvc: evt })}
            />
          </View>
          <View style={styles.nestedView}>
            <Text style={styles.textStyle}>Pay amount:</Text>
            <TextInput
              style={styles.inputStyle}
              value={this.props.amount.toString()}
              editable={false}
            />
          </View>
        </View>
        <TouchableOpacity
          style={styles.dipositButton}
          onPress={() => this.onlinePyament()}
        >
          <Text style={styles.dipositButtnText}>{this.props.buttonText}</Text>
          {this.state.loader ? (
            <View style={{ marginLeft: 10 }}>
              <ActivityIndicator size="small" color={"#FFFFFF"} />
            </View>
          ) : null}
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainView: {
    marginTop: 10,
    borderColor: "#ccc",
    borderBottomWidth: 0.5
  },
  nestedView: {
    flex: 5,
    justifyContent: "space-between",
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center"
  },
  textStyle: { fontSize: 15, fontWeight: "bold", color: "#494949" },
  inputStyle: {
    backgroundColor: "#ede4e4",
    width: "70%",
    height: 50,
    borderRadius: 10,
    marginLeft: 10,
    padding: 8,
    fontSize: 18
  },
  dipositButton: {
    flexDirection: "row",
    width: "100%",
    borderRadius: 50,
    backgroundColor: "#5AC6C6",
    alignItems: "center",
    padding: 16,
    justifyContent: "center",
    elevation: 2,
    marginTop: 50
  },
  dipositButtnText: { color: "#ffffff", fontSize: 20 }
});
