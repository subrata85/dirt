import axios from "axios";
import URL from "../config/url";
const ApiConfig = URL;
import EventEmitter from "react-native-eventemitter";
import CommonService from "../services/common/commonService";

class CreateCircle {
  create(item, token, navigation) {
    let obj = {
      circle_user_id: item.circle_user_id,
      circle_code: item.circle_code,
      target_achive: item.target_achive,
      round_set: item.round_set,
      p_round: item.p_round,
      start_date: item.start_date,
      reason_for_circle: item.reason_for_circle
    };

    console.log("boh", obj);
    console.log("login_user_mobile", item.login_user_mobile);

    console.log("unsafe_participants create", item.unsafe_participants);

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
          console.log("create permission");
          if (res) {
            console.log(" if condition create permission");
            item.unsafe_participants.forEach(element => {
              if (
                element.mobile_number.toString() !==
                item.login_user_mobile.toString()
              ) {
                CommonService.sendDirectSms(
                  element.mobile_number.toString(),
                  "Hello,\nI have added you to a new circle(" +
                    item.circle_code +
                    ")"
                );
              }
            });
          }
          CommonService.showConfirmAlert(
            "Circle created successfully",
            response => {
              if (response) {
                navigation.navigate("dashboardPage");
              }
            }
          );
        });
      })
      .catch(function(error) {
        console.log("err", error);
      });
  }
}

export default new CreateCircle();
