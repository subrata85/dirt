import { StyleSheet, Platform } from "react-native";

const bankDetailsStyle = StyleSheet.create({
  mainContent: {
    padding: 20
  },
  headerText: {
    alignItems: "center"
  },
  title: {
    fontSize: 20,
    fontWeight: "bold"
  },
  rowView: {
    flexDirection: "row",
    marginTop: 25
  },
  rowViewLeftItem: {
    flex: 1,
    alignSelf: "flex-start"
  },
  rowViewRightItem: {
    flex: 0,
    alignSelf: "flex-end"
  },
  selectText: {
    width: 180,
    borderColor: "#ccc",
    borderRadius: 8,
    borderWidth: 0.7,
    padding: 10
  },
  childRowView: {
    flexDirection: "row"
  },
  childRowViewLeftItem: {
    flex: 6,
    alignSelf: "flex-start"
  },
  childRowViewRightItem: {
    flex: 0,
    alignSelf: "flex-end"
  },
  borderBottom: {
    borderColor: "#ccc",
    borderBottomWidth: 0.7,
    padding: 10
  },
  unSelectText: {
    width: 180,
    borderColor: "#ccc",
    borderRadius: 8,
    borderWidth: 0.7
  },
  otherResonView: {
    marginTop: 20
  },
  textInput: {
    flex: 1,
    height: 100,
    borderWidth: 1,
    borderColor: "#dcdcdc",
    borderRadius: 5,
    ...Platform.select({
      android: {
        fontFamily: "Roboto-Reguler"
      }
    }),
    color: "#000000",
    fontSize: 18,
    paddingLeft: 5,
    paddingVertical: 0,
    textAlignVertical: "top"
  },
  paymentButtonView: {
    marginTop: 30
  },
  paymentButton: {
    width: "100%",
    borderRadius: 50,
    backgroundColor: "#5AC6C6",
    alignItems: "center",
    padding: 16,
    justifyContent: "center",
    elevation: 2,
    flexDirection: "row"
  },
  paymentText: {
    color: "white",
    fontSize: 18
  },
  rowView: {
    flexDirection: "row",
    borderColor: "#ccc",
    borderBottomWidth: 0.5
  },
  rowViewLeftItem: {
    flex: 5,
    alignSelf: "flex-start",
    paddingBottom: 20,
    paddingTop: 20
  },
  rowViewRightItem: {
    flex: 0,
    alignSelf: "flex-end",
    paddingBottom: 20,
    paddingTop: 20
  },
  rowText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#494949"
  },
  rowTextValue: {
    color: "#4A4A4A"
  },
  newButton: {
    marginTop: 20,
    height: 50,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#5AC6C6",
    elevation: 2,
    flexDirection: "row"
  }
});

export default bankDetailsStyle;
