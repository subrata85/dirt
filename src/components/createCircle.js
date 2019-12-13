import axios from "axios";
import URL from "../config/url";
const ApiConfig = URL;
import EventEmitter from "react-native-eventemitter";
import CommonService from "../services/common/commonService";

class CreateCircle {
  create(item, token) {
    let obj = {
      circle_code: item.circle_code,
      target_achive: item.target_achive,
      round_set: item.round_set,
      p_round: item.p_round,
      start_date: item.start_date,
      reason_for_circle: item.reason_for_circle
    };
    console.log("booooo", obj);
    let that = this;
    axios
      .post(ApiConfig.base_url + "create-circle", JSON.stringify(obj), {
        headers: {
          Authorization: "Bearer " + token
        }
      })
      .then(function(response) {
        EventEmitter.emit("validatedCircleCreation", true);
        CommonService.getSmsPermission(res => {
          if (res) {
            item.unsafe_participants.forEach(element => {
              if (
                element.mobile_number.toString() !=
                that.state.mobile_number.toString()
              ) {
                CommonService.sendDirectSms(
                  element.mobile_number.toString(),
                  "Hello,\nI have added you to a new circle(" +
                    that.state.cicle_code +
                    ")"
                );
              }
            });
          }
        });
        CommonService.showConfirmAlert(res.message, response => {
          if (response) {
            this.props.navigation.navigate("dashboardPage");
          }
        });
      })
      .catch(function(error) {
        console.log("err", error);
      });
  }
}

export default new CreateCircle();
