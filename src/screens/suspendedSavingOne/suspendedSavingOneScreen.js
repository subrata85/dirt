import React, {Component} from 'react';
import {View, Text,TouchableOpacity,StatusBar,Image, ActivityIndicator, ToastAndroid} from 'react-native';
import {Container,Content,Header,Icon,Left,Body,Right,Button,Title} from 'native-base';
import suspendedSavingOneStyle from './suspendedSavingOneStyle';
import HeaderCurve from "../includes/headercurve";
import FeatherIcon from 'react-native-vector-icons/Feather';
import headerStyle from '../../assets/css/header/headerStyle';
import axios from "axios";
import AsyncStorage from '@react-native-community/async-storage';

export default class SuspendedSavingOneScreen extends Component {
	constructor(props){
		super(props);
		this.state={
			item:"",
			userName:"",
			token :"",
			currency:"",
			payableBalance:"",
			avatar_location: "",
			btnLoader:false
		}
	}

	componentDidMount(){
		let item = this.props.navigation.getParam('result');
		AsyncStorage.multiGet([
			'rememberToken',
			'circle_code',
			'first_name',
			'avatar_location',
		]).then(response => {
			this.setState({
			  token: response[0][1],
			  userName:response[2][1],
			  avatar_location: {uri:URL.public_url + 'storage/' + response[3][1]},
			},()=>{
				this.onGetItemDetails(item.circle_code, this.state.token)
				this.onGetCurrency(this.state.token)
			});
		  });
		
	}
	onGetItemDetails = (circle_code, token) =>{
		if(circle_code){
			let data ={
				"circle_code":circle_code
			}
			axios
			.post("https://nodejsdapldevelopments.com/dart/public/api/ongoing-circle-details", JSON.stringify(data), {
			  headers: {
				Authorization: "Bearer " + token
			  }
			}).then(res =>{
				if(res.data){
					this.setState({item:res.data.result})
				}
			}).catch(err =>{
				ToastAndroid.showWithGravity(
					err.message,
					ToastAndroid.LONG,
					ToastAndroid.BOTTOM,
				  );
			})
		}
	}

	onGetCurrency = (token) =>{
		axios
		.get("https://nodejsdapldevelopments.com/dart/public/api/get-currency", {
		  headers: {
			Authorization: "Bearer " + token
		  }
		}).then(currencyData =>{
			this.setState({currency:currencyData.data.result})
		}).catch(err =>{
			ToastAndroid.showWithGravity(
				err.message,
				ToastAndroid.LONG,
				ToastAndroid.BOTTOM,
			  );
		})
	}

	onCircleReportOrIncident = (user_type) => {
		const {item, token} = this.state
		this.setState({btnLoader:true})
		if (item.circle_code && token) {
			let obj = {
				"circle_code":item.circle_code,
				"user_type":user_type	
			}
			axios
			.post("https://nodejsdapldevelopments.com/dart/public/api/circle-report",JSON.stringify(obj), {
			  headers: {
				Authorization: "Bearer " + token
			  }
			}).then(res => {
				this.setState({ btnLoader: false })
				ToastAndroid.showWithGravity(
					res.data.message,
					ToastAndroid.LONG,
					ToastAndroid.BOTTOM,
				);
				this.props.navigation.navigate('suspendedScreen')
			}).catch(err => {
				this.setState({ btnLoader: false })
				ToastAndroid.showWithGravity(
					err.message,
					ToastAndroid.LONG,
					ToastAndroid.BOTTOM,
				  );
			})
		} else {
			this.setState({ btnLoader: false })
				ToastAndroid.showWithGravity(
					"There is something wrong",
					ToastAndroid.LONG,
					ToastAndroid.BOTTOM,
				  );
		}
		
	}

	render(){
		const { item, currency, userName } = this.state
		console.log("suspended item", item)
		return item ?
			<Container>
				<Content>
				<HeaderCurve
						navigation={this.props.navigation}
						avatar_location={this.state.avatar_location}
						backButton={true}
						first_name={userName}
						admin = {item.is_admin}
						bellIcon={false}
						props={this.props}
           			 />

					<View style={[suspendedSavingOneStyle.mainContent]}>
					<View style={{ justifyContent:"center", alignItems:"center"}}>
						<Text style={{fontSize:20,
							fontWeight: 'bold'}}
							>Circle Dismantled
							</Text>
						<Text>N° {item.circle_code}</Text>
					</View>
						<View style={{marginTop:15}}>
							<View style={suspendedSavingOneStyle.rowView}>
								<View style={suspendedSavingOneStyle.rowViewLeftItem}>
									<Text style={suspendedSavingOneStyle.rowText}>Target to achieve:</Text>
								</View>
								<View style={suspendedSavingOneStyle.rowViewRightItem}>
									<Text style={suspendedSavingOneStyle.rowTextValue}>{currency.curr_code}{item.target_achive}</Text>
								</View>
							</View>
							<View style={suspendedSavingOneStyle.rowView}>
								<View style={suspendedSavingOneStyle.rowViewLeftItem}>
									<Text style={suspendedSavingOneStyle.rowText}>Round Settlement:</Text>
								</View>
								<View style={suspendedSavingOneStyle.rowViewRightItem}>
									<Text style={suspendedSavingOneStyle.rowTextValue}>{currency.curr_code}{item.round_set}</Text>
								</View>
							</View>
							<View style={suspendedSavingOneStyle.rowView}>
								<View style={suspendedSavingOneStyle.rowViewLeftItem}>
									<Text style={suspendedSavingOneStyle.rowText}>Periodisity of round:</Text>
								</View>
								<View style={suspendedSavingOneStyle.rowViewRightItem}>
									<Text style={suspendedSavingOneStyle.rowTextValue}>{item.p_round}</Text>
								</View>
							</View>
							<View style={suspendedSavingOneStyle.rowView}>
								<View style={suspendedSavingOneStyle.rowViewLeftItem}>
									<Text style={suspendedSavingOneStyle.rowText}>Start date:</Text>
								</View>
								<View style={suspendedSavingOneStyle.rowViewRightItem}>
									<Text style={suspendedSavingOneStyle.rowTextValue}>{item.start_date}</Text>
								</View>
							</View>
							<View style={suspendedSavingOneStyle.rowView}>
								<View style={suspendedSavingOneStyle.rowViewLeftItem}>
									<Text style={suspendedSavingOneStyle.rowText}>Blocked round:</Text>
								</View>
								<View style={suspendedSavingOneStyle.rowViewRightItem}>
									<Text style={suspendedSavingOneStyle.rowTextValue}>{item.current_round}</Text>
								</View>
							</View>
							<View style={{paddingTop:20}}>
								<Text style={suspendedSavingOneStyle.rowText}>Balance of the circle:</Text>
								{item.circleUsers!==undefined?
								<View style={suspendedSavingOneStyle.tableContainer}>
								{/* table header start */}
								<View style={suspendedSavingOneStyle.thView}>
									<View style={[suspendedSavingOneStyle.rowViewCommon,{ flex: 1, alignSelf: 'stretch' }]}>
										<Text style={[suspendedSavingOneStyle.thText,{color:'white'}]}>Name</Text>
									</View>
									<View style={[{ flex: 1, alignSelf: 'stretch' },suspendedSavingOneStyle.rowViewCommon]}>
										<Text style={[suspendedSavingOneStyle.thText,{color:'white'}]}>Round status payment</Text>
									</View>
									<View style={[{ flex: 1, alignSelf: 'stretch' },suspendedSavingOneStyle.rowViewCommon]}>
										<Text style={[suspendedSavingOneStyle.thText,{color:'white'}]}>Paid</Text>
									</View>
									<View style={[{flex: 1, alignSelf: 'stretch' },suspendedSavingOneStyle.rowViewCommon]}>
										<Text style={[suspendedSavingOneStyle.thText,{color:'white'}]}>Collected</Text>
									</View>
									<View style={[{ flex: 1, alignSelf: 'stretch',paddingLeft:5,paddingRight:5 }]}>
										<Text style={[suspendedSavingOneStyle.thText,{color:'white'}]}>Balance</Text>
									</View>
								</View>
								{/* table header end */}

								{/* table row start */}
								{item.circleUsers.map((user, index) =>{
									return(
									<View style={suspendedSavingOneStyle.tdView} key={index}>
									<View style={[suspendedSavingOneStyle.rowViewCommon,{ flex: 1, alignSelf: 'stretch' }]}>
										<Text style={suspendedSavingOneStyle.thText}>{user.username}</Text>
									</View>
									<View style={[{ flex: 1, alignSelf: 'stretch' },suspendedSavingOneStyle.rowViewCommon]}>
										{
											user.current_round_payment_status ===1?
											<Text style={suspendedSavingOneStyle.thText}>Up to date</Text>:
											<Text style={suspendedSavingOneStyle.thTextNotPaid}>Not paid</Text>
										}
									</View>
									<View style={[{ flex: 1, alignSelf: 'stretch' },suspendedSavingOneStyle.rowViewCommon]}>
										<Text style={suspendedSavingOneStyle.thText}>{currency.curr_code}{user.totalPaymentDetails}</Text>
									</View>
									<View style={[{ flex: 1, alignSelf: 'stretch' },suspendedSavingOneStyle.rowViewCommon]}>
										<Text style={suspendedSavingOneStyle.thText}>{currency.curr_code}{user.withdrawDetails}</Text>
									</View>
									<View style={[{ flex: 1, alignSelf: 'stretch',paddingLeft:5,paddingRight:5 }]}>
										<Text style={suspendedSavingOneStyle.thText}>{currency.curr_code}{user.balance}</Text>
									</View>
								</View>
									)
								})}
								
								{/* table row end */}
							</View>
									:null}
								{item.receive_amount !== 0?
								<View style={{padding:5,marginTop:5}}>
									<Text style={suspendedSavingOneStyle.rowTextValue}>
										You should be receiving in the coming days {item.receive_amount} Euros plus you deposit of {item.round_set} Euros, we are waition for the payment form the other members.
									</Text>
								</View>:null}
							</View>
							{item.refund_amount !==undefined && item.refund_amount !== 0 ?
							<View style={suspendedSavingOneStyle.sendButtonView}>
								<TouchableOpacity 
								onPress={() => {
									this.props.navigation.navigate('bankDetailsPage', {
										result:item, navigate_from:'suspend_details'
									});
								  }}
								style={{
									width: "100%",
									borderRadius: 50,
									backgroundColor: "#ffffff",
									alignItems: "center",
									padding: 14,
									borderColor:"#5AC6C6",
									borderWidth:1
								}}>
									<Text style={suspendedSavingOneStyle.sendButtonText1}>Pay {item.refund_amount}{currency.curr_code}</Text>
								</TouchableOpacity>
							</View>:null}

							<View style={suspendedSavingOneStyle.sendButtonView}>
								{item.is_admin === 1 ?
								<TouchableOpacity style={suspendedSavingOneStyle.sendButton}
								 onPress={()=> this.onCircleReportOrIncident(1)}
								>
										<Text style={suspendedSavingOneStyle.sendButtonText}>Report Incident </Text>
										{this.state.btnLoader ? (
												<View style={{ marginLeft: 10 }}>
													<ActivityIndicator size="small" color={"#FFFFFF"} />
												</View>
											) : null}
								</TouchableOpacity>:
								<TouchableOpacity style={suspendedSavingOneStyle.sendButton}
								onPress={()=> this.onCircleReportOrIncident(2)}
								>
										<Text style={suspendedSavingOneStyle.sendButtonText}>
											Report Circle
											</Text>
											{this.state.btnLoader ? (
												<View style={{ marginLeft: 10 }}>
													<ActivityIndicator size="small" color={"#FFFFFF"} />
												</View>
											) : null}
							</TouchableOpacity>
							}
							</View>
						</View>
					</View>
				</Content>
			</Container>:
			<View style={{flex:1, justifyContent:'center', alignItems:"center"}}>
				<ActivityIndicator size="large" color="#0000ff" />
			</View>
	}
}