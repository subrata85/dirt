import React, {Component} from 'react';
import {View,Text,ScrollView,TouchableOpacity,
	ToastAndroid, Alert, ActivityIndicator} from 'react-native';
import {Container,Content} from 'native-base';
import blockCircleOneStyle from './blockCircleOneStyle';
import call from 'react-native-phone-call';
import axios from "axios";
import URL from '../../config/url';
import AsyncStorage from '@react-native-community/async-storage';
import HeaderCurve from '../includes/headercurve';
import CommonService from '../../services/common/commonService';
import httpService from '../../services/http/httpService';
import Loading from 'react-native-loader-overlay';
import { ErrorTemplate } from '../../components/error/errorComponent';
import { Circle } from 'react-native-svg';
import onGoingCircleStyle from '../onGoingCircle/onGoingCircleStyle';
var moment = require('moment');

export default class BlockCercleOneScreen extends Component {
	constructor(props){
		super(props);
		this.state= {
			loader			:	false,
			rememberToken	: 	'',
			cicle_code		: 	'',
			first_name		: 	'',
			avatar_location	: 	'',
			user_id			: 	'',
			errorText       : 	'',
          	subMessage      : 	'',	
			details			:	Object.create(null),
			apiExecute		:	false,
			mobile_number:"",
			request_status:"",
			paybuttonVisible:false,
			btnLoader: false,
			reminderLoader:false
		}
	}

	componentDidMount(){
		this._bootstrapAsync();
	}

	_bootstrapAsync = async () => {
		let selectedDetails = this.props.navigation.getParam('result');
		AsyncStorage.multiGet([
		  'rememberToken',
		  'circle_code',
		  'first_name',
		  'avatar_location',
		  'user_id',
		  'mobile_number'
		]).then(response => {
		  this.setState(
			{
			  rememberToken: response[0][1],
			  cicle_code: response[1][1],
			  first_name: response[2][1],
			  avatar_location: {uri:URL.public_url + 'storage/' + response[3][1]},
			  user_id: response[4][1],
			  mobile_number:response[5][1],
			  details:selectedDetails
			},
			() => {
			  this.getCircleDetailsByCirlceCode(selectedDetails.circle_code,response[0][1]);
			}
		  );
		});
	};

	onError(error){
		this.setState({ avatar_location: require('../../../assets/images/contact.png')})
	}

	getCircleDetailsByCirlceCode(circleCode,token){
		this.loading = Loading.show(CommonService.loaderObj);
		let payload = {
			url:'ongoing-circle-details',
			data:{
				circle_code:circleCode
			},
			authtoken:token
		};

		httpService.postHttpCall(payload).then((res) => {
			console.log("block details", res)
		Loading.hide(this.loading);
		if(res.status !== undefined){
			if (res.status == 100) {
				let details = res.result;
				if(details.status == 2){
					if(details.previous_round_payment_date !==undefined ){
						let currentDate = moment(new Date()).format("YYYY-MM-DD");
						let oldDate = CommonService.allInOneFormatDate(details.previous_round_payment_date,'/','-','reverse');
						if (currentDate > oldDate) {
							this.setState({paybuttonVisible:true})
						} else {
							this.setState({paybuttonVisible:false})
						}
						if(details.previous_round_payment_date === ""){
							this.setState({paybuttonVisible:true})
						}
						}
					this.setState({ details: details });
				}else{
					this.setState({
						errorText: httpService.appMessege.circle_not_found,
						subMessage: httpService.appMessege.circle_sub_msg
					});
				}
			}else{
			this.setState({errorText: res.message});
			}
		}else{
			this.setState({errorText: httpService.appMessege.unknown_error,subMessage:httpService.appMessege.working_progress});
		}
		this.setState({apiExecute:true});
		}).catch((err)=>{
			Loading.hide(this.loading);
			this.setState({errorText: err.message,apiExecute:true});
			if(err.status == 4){
				this.setState({subMessage: httpService.appMessege.internet_sub});
			}
		});
	}

	getNumberOfDays(curDate,oldDate){
		let oneDay = 24*60*60*1000;
		let cur_Date = new Date(curDate);
		let old_Date = new Date(oldDate);
		return ' '+(Math.round(Math.abs((cur_Date.getTime() - old_Date.getTime())/(oneDay))));
	}

	makeCall(number){
		const args = {
		  number: number,
		  prompt: false,
		};
		call(args).catch(console.error);
	};

	//Terminate circle by admin
	onTerminateCircle = () =>{
		Alert.alert("Terminate confirmation", `Do you want to Terminate ${this.state.details.circle_code} Circle ?`, [
			{ text: "No", onPress: () => (No = "no") },
			{ text: "Yes", onPress: () => this.terminateCircel() }
		  ]);	
	}

	terminateCircel = () =>{
		if(this.state.details.circle_code){
		let obj ={
			circle_code:this.state.details.circle_code
		}
	axios.post('https://nodejsdapldevelopments.com/dart/public/api/circle-terminate', JSON.stringify(obj), {
	  headers: {
		Authorization: "Bearer " + this.state.rememberToken
	  }
	}).then(res =>{
		ToastAndroid.showWithGravityAndOffset(
			res.data.message,
			ToastAndroid.LONG,
			ToastAndroid.BOTTOM,
			25,
			50,
		  );
		  this.props.navigation.navigate('dashboardPage')
	}).catch(err =>{
		ToastAndroid.showWithGravityAndOffset(
			err.message,
			ToastAndroid.LONG,
			ToastAndroid.BOTTOM,
			25,
			50,
		  );
	})
		} else {
			Alert.alert("", "Circle not match")
	}
}

	onRequstToTerminate = () =>{
		Alert.alert("Terminate confirmation", `Do you want to request to Terminate '${this.state.details.circle_code}' Circle ?`, [
			{ text: "No", onPress: () => (No = "no") },
			{ text: "Yes", onPress: () => this.requstToTerminate() }
		  ]);	
	}

	requstToTerminate = () =>{
		if(this.state.details.circle_code && this.state.mobile_number){
		let obj ={
			circle_code:this.state.details.circle_code,
			mobile_number:this.state.mobile_number
		}
	axios.post('https://nodejsdapldevelopments.com/dart/public/api/circle-terminate-request', JSON.stringify(obj), {
	  headers: {
		Authorization: "Bearer " + this.state.rememberToken
	  }
	}).then(res =>{
		ToastAndroid.showWithGravityAndOffset(
			res.data.message,
			ToastAndroid.LONG,
			ToastAndroid.BOTTOM,
			25,
			50,
		  );
		  this.props.navigation.navigate('dashboardPage')
	}).catch(err =>{
		ToastAndroid.showWithGravityAndOffset(
			err.message,
			ToastAndroid.LONG,
			ToastAndroid.BOTTOM,
			25,
			50,
		  );
	})
	}else{
		alert("Something wrong")
	}
}

onSendReminder = (userType, screen) =>{
	const {details, rememberToken} = this.state;
	this.setState({reminderLoader:true})
	if(details.circle_code && rememberToken){
		let obj = {
			"circle_code":details.circle_code,
			"user_type":userType,  
			"screen": screen 
		}
		axios.post('https://nodejsdapldevelopments.com/dart/public/api/send-reminder', JSON.stringify(obj), {
			headers: {
			  Authorization: "Bearer " + rememberToken
			}
		}).then(res => {
			  this.setState({reminderLoader:false})
			  ToastAndroid.showWithGravityAndOffset(
				  res.data.message,
				  ToastAndroid.LONG,
				  ToastAndroid.BOTTOM,
				  25,
				  50,
				);
				this.props.navigation.navigate('dashboardPage')
		}).catch(err => {
			this.setState({reminderLoader:false})
			ToastAndroid.showWithGravityAndOffset(
				err.message,
				ToastAndroid.LONG,
				ToastAndroid.BOTTOM,
				25,
				50,
			  );
		  })
	}else{
		this.setState({reminderLoader:false})
			ToastAndroid.showWithGravityAndOffset(
				"Circle details not found",
				ToastAndroid.LONG,
				ToastAndroid.BOTTOM,
				25,
				50,
			  );
	}	
}
	render(){
		const item = this.state.details;
		console.log("block item", item)
		return(
			<Container>
				<Content>
				<HeaderCurve
						navigation={this.props.navigation}
						avatar_location={this.state.avatar_location}
						backButton={true}
						first_name={this.state.first_name}
						admin = {item.is_admin}
						bellIcon={true}
						props = {this.props}
           			 />
					{
						this.state.errorText !=''?
						<View style={{alignItems:'center',marginTop:'50%'}}>
						  <ErrorTemplate
						  message={this.state.errorText}
						  subMessage={this.state.subMessage}
						  />
						</View>:
						<View style={blockCircleOneStyle.mainContent}>
						{
							this.state.apiExecute ? 
							<View>
								<View style={{alignItems:'center'}}>
										<Text style={{flex: 5,
										fontSize:20,
										fontWeight: 'bold',
											paddingBottom:5,
											paddingTop:5,}}>Circle Blocked</Text>
										<Text>N° {item.circle_code}</Text>
									</View>
								
											{/* //NEW PASTED */}
											<View>
								<View style={{borderBottomWidth:1,borderColor:'#ccc',padding:5}}>
									<View style={onGoingCircleStyle.rowView}>
										<View style={onGoingCircleStyle.rowViewLeftItem}>
											<Text style={onGoingCircleStyle.rowText}>Circle Admin:</Text>
										</View>
										<View style={[onGoingCircleStyle.rowViewRightItem,{flexDirection:'row'}]}>
											<Text style={[onGoingCircleStyle.rowTextValue,{marginRight:10}]}>{item.admin}</Text>
										</View>
									</View>
									<View style={onGoingCircleStyle.rowView}>
										<View style={onGoingCircleStyle.rowViewLeftItem}>
											<Text style={onGoingCircleStyle.rowText}>Total amount:</Text>
										</View>
										<View style={onGoingCircleStyle.rowViewRightItem}>
											<Text style={onGoingCircleStyle.rowTextValue}>€{item.target_achive}</Text>
										</View>
									</View>
									<View style={onGoingCircleStyle.rowView}>
										<View style={onGoingCircleStyle.rowViewLeftItem}>
											<Text style={onGoingCircleStyle.rowText}>Round amount:</Text>
										</View>
										<View style={onGoingCircleStyle.rowViewRightItem}>
											<Text style={onGoingCircleStyle.rowTextValue}>€{item.round_set}</Text>
										</View>
										</View>
												
										<View style={onGoingCircleStyle.rowView}>
										<View style={onGoingCircleStyle.rowViewLeftItem}>
											<Text style={onGoingCircleStyle.rowText}>Periodicity:</Text>
										</View>
										<View style={onGoingCircleStyle.rowViewRightItem}>
											<Text style={onGoingCircleStyle.rowTextValue}>{item.p_round}</Text>
										</View>
									</View>
									
									<View style={onGoingCircleStyle.rowView}>
										<View style={onGoingCircleStyle.rowViewLeftItem}>
											<Text style={onGoingCircleStyle.rowText}>Start date:</Text>
										</View>
										<View style={onGoingCircleStyle.rowViewRightItem}>
											<Text style={onGoingCircleStyle.rowTextValue}>{CommonService.formatDate(item.start_date)}</Text>
										</View>
										</View>
												
												<View style={onGoingCircleStyle.rowView}>
										<View style={onGoingCircleStyle.rowViewLeftItem}>
											<Text style={onGoingCircleStyle.rowText}>End date:</Text>
										</View>
										<View style={onGoingCircleStyle.rowViewRightItem}>
											<Text style={onGoingCircleStyle.rowTextValue}>{CommonService.formatDate(item.end_date)}</Text>
										</View>
									</View>
									<View style={{paddingTop:20}}>
										<Text style={onGoingCircleStyle.rowText}>Circle participants:</Text>
										<View style={[onGoingCircleStyle.rowViewNew,{paddingBottom:20}]}>
											{
												item.circleUsers !== undefined ?
												item.circleUsers.map((user_item,user_index) => 
												<View key={user_index} style={{flexDirection:'row'}}>
													<View style={onGoingCircleStyle.nextRowViewLeftItem}>
													<Text style={onGoingCircleStyle.rowTextValue}>{user_index+1}.{user_item.username}({user_item.mobile_country_code}{user_item.mobile_number})</Text>
													</View>
												</View>
												):null
											}
										</View>
									</View>
									<View style={{flexDirection: 'row'}}>
										<View style={onGoingCircleStyle.rowViewLeftItem}>
											<Text style={onGoingCircleStyle.rowText}>Progress:</Text>
										</View>
										<View style={onGoingCircleStyle.rowViewRightItem}>
										{
											item.completed_round == item.estimate_round ?
											<Text style={onGoingCircleStyle.rowTextValue}>Completed</Text>:
											item.completed_round > 1 ?
											<Text style={onGoingCircleStyle.rowTextValue}>{item.completed_round+' rounds over out of '+item.estimate_round}</Text>:
											item.completed_round < 2 ?
											<Text style={onGoingCircleStyle.rowTextValue}>{item.completed_round+' round over out of '+item.estimate_round}</Text>:null
										}
										</View>
									</View>
									<View style={{flexDirection: 'row',paddingTop:3}}>
										<View style={onGoingCircleStyle.rowViewLeftItem}>
											<Text style={onGoingCircleStyle.rowText}>End date:</Text>
										</View>
										<View style={onGoingCircleStyle.rowViewRightItem}>
											<Text style={onGoingCircleStyle.rowTextValue}>{CommonService.formatDate(item.end_date)}</Text>
										</View>
									</View>
								</View>
								
								<View style={onGoingCircleStyle.tableContent}>
									<ScrollView>
										<View style={onGoingCircleStyle.tablePart}>
											<Text style={onGoingCircleStyle.baseText}>
												<Text style={[onGoingCircleStyle.tableText,{fontWeight: 'bold'}]}>Round {item.current_round}- </Text>
													<Text style={[onGoingCircleStyle.tableText, { color: '#000000', fontWeight:"bold" }]} numberOfLines={1}>Overdue
													</Text>
												</Text>
												
											<View>
												{
													item.circleUsers.map((user_item,user_index) => 
													<View key={user_index} style={onGoingCircleStyle.rowView}>
														<View style={onGoingCircleStyle.rowViewLeftItem}>
																<Text style={onGoingCircleStyle.rowTextValue}>{user_item.username}</Text>
																
														</View>
														<View style={onGoingCircleStyle.rowViewRightItem}>
															{
																user_item.current_round_payment_status == 0 ?
																<Text style={{color:'#E15862'}}>Not paid yet</Text>:
																user_item.current_round_payment_status == 3 ?
																<Text style={{color:'#E15862'}}>Pending</Text>:
																user_item.current_round_payment_status == 1 ?
																<Text style={{color:'#23CB97'}}>Paid</Text>:null
															}
														</View>
													</View>
													)
												}
														</View>
														<Text style={{fontWeight: 'bold'}}>
															Start date :
											{item.round_start_date}
														</Text>
														<Text style={{fontWeight: 'bold'}}>
															End date :{item.round_end_date}
														</Text>
														
									
														<View style={blockCircleOneStyle.tableContentPaymentHistory}>
									<ScrollView>
										<View style={blockCircleOneStyle.tablePart}>
											<Text style={blockCircleOneStyle.baseText}>
												<Text style={blockCircleOneStyle.titleText}>Payments due 
												{
													this.getNumberOfDays(CommonService.getDateMonthFirst(),CommonService.formatDateMontFirst(item.current_round_payment_date))
												}
												days ago from</Text>
											</Text>
											{
												item.circleUsers.map((user_item,user_index) => 
												<View key={user_index} >
													{
														user_item.current_round_payment_status == 0 ?
														<View style={blockCircleOneStyle.rowView}>
															<View style={blockCircleOneStyle.rowViewLeftItem}>
																<Text>{user_item.username}</Text>
															</View>
														</View>:null
													}
												</View>
												)
											}
										</View>
									</ScrollView>
											</View>
								
										</View>
									</ScrollView>
								</View>
							</View>
								{/* && item.login_user_current_round_payment_status == 0) */}
								{
									item.is_admin == 1 ?
									<View style={blockCircleOneStyle.paymentButtonView}>
										<TouchableOpacity style={blockCircleOneStyle.paymentButton}
											onPress={()=>this.onSendReminder(1,2)}
										>
											<Text style={blockCircleOneStyle.paymentText}>Send Payment Reminders</Text>
											{this.state.reminderLoader ? (
												<View style={{ marginLeft: 10 }}>
													<ActivityIndicator size="small" color={"#FFFFFF"} />
												</View>
											) : null}
										</TouchableOpacity>
									</View>:null
								}
								{
									item.login_user_current_round_payment_status === 0 && this.state.paybuttonVisible? //pay button visible
									<View style={blockCircleOneStyle.paymentButtonView}>
										<TouchableOpacity 
										onPress={()=>this.props.navigation.navigate('bankDetailsPage',{result:this.state.details,navigate_from:'block_details'})}
										style={blockCircleOneStyle.terminateButton}>
											<Text style={blockCircleOneStyle.paymentText}>Pay My Round</Text>
										</TouchableOpacity>
									</View>:null
								}
								{
									item.is_admin === 0 ? 
									<View>
										<View style={blockCircleOneStyle.paymentButtonView}>
											<TouchableOpacity onPress={()=>this.makeCall((item.admin_mobile).toString())} style={blockCircleOneStyle.paymentButton}>
												<Text style={blockCircleOneStyle.paymentText}>Call the Admin for Action</Text>
											</TouchableOpacity>
										</View>
										<View style={blockCircleOneStyle.paymentButtonView}>
											<TouchableOpacity style={blockCircleOneStyle.remiderButton}
											onPress={()=>this.onSendReminder( 2, 2)}
											>
												<Text style={blockCircleOneStyle.remiderText}>Send Reminders</Text>
												{this.state.reminderLoader ? (
												<View style={{ marginLeft: 10 }}>
													<ActivityIndicator size="small" color={"green"} />
												</View>
											) : null}
											</TouchableOpacity>
										</View>
									</View>:null
								}
								{
									item.round_complete.map((user_round,round_index) =>
									<View key={round_index} style={blockCircleOneStyle.roundRow}>
										<ScrollView>
											<View style={blockCircleOneStyle.tablePart}>
												<Text style={blockCircleOneStyle.baseText}>
													<Text style={blockCircleOneStyle.titleText}>Round {user_round.round}- </Text>
													<Text style={[blockCircleOneStyle.tableText,{color:'#20CC94'}]} numberOfLines={5}>Completed</Text>
												</Text>
												<View style={blockCircleOneStyle.rowView}>
													<View style={blockCircleOneStyle.rowViewLeftItem}>
														<Text>{user_round.reciever_msg}</Text>
													</View>
												</View>
											</View>
										</ScrollView>
									</View>
									).reverse()
								}
								{
									item.is_admin === 0 && item.termination_request_sent === 0 ? 
									<View style={blockCircleOneStyle.paymentButtonView}>
										<TouchableOpacity style={blockCircleOneStyle.terminateButton}
											onPress={()=>{this.onRequstToTerminate()}} 
										>
											<Text style={blockCircleOneStyle.paymentText}>Request Terminate</Text>
											{this.state.btnLoader ? (
												<View style={{ marginLeft: 10 }}>
													<ActivityIndicator size="small" color={"#FFFFFF"} />
												</View>
											) : null}
										</TouchableOpacity>
									</View>:null
								}
								{
									item.is_admin === 1 ? 
									<View style={blockCircleOneStyle.paymentButtonView}>
										<TouchableOpacity style={blockCircleOneStyle.terminateButton}
											onPress={()=>this.onTerminateCircle()} // Terminate circle by admin
										>
											<Text style={blockCircleOneStyle.paymentText}>Terminate the Savings Circle</Text>
										</TouchableOpacity>
									</View>:null
								}
							</View>:null
						}
						</View>
					}
				</Content>
			</Container>
		);
	}
}