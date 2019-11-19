import React, {Component} from 'react';
import {View, Text,TouchableOpacity,StatusBar,Image, ToastAndroid, ActivityIndicator} from 'react-native';
import {Container,Content} from 'native-base';
import invitationCercleTwoStyle from './invitationCercleTwoStyle';
import Icon from 'react-native-vector-icons/Ionicons';
import HeaderCurve from '../includes/headercurve';
import headerStyle from '../../assets/css/header/headerStyle';
import FeatherIcon from 'react-native-vector-icons/Feather';
import URL from '../../config/url';
import AsyncStorage from '@react-native-community/async-storage';
import CommonService from '../../services/common/commonService';
import httpService from '../../services/http/httpService';
var moment = require('moment');
import Loading from 'react-native-loader-overlay';
import { ErrorTemplate } from '../../components/error/errorComponent';
let flag = false;
buttons = false;
import axios from "axios";

export default class InvitationCercleTwoScreen extends Component {

	constructor(props){
		super(props);
		this.state= {
			rememberToken	: 	'',
			cicle_code		: 	'',
			first_name		: 	'',
			avatar_location	: 	'',
			user_id			: 	'',
			errorText       : 	'',
          	subMessage      : 	'',	
			details			:	Object.create(null),
			apiExecute		:	false,
			visiblityButton:true,
			btnLoader:false
		}
	}

	componentDidMount() {
		this.checkWaitingCircle();
		this._bootstrapAsync();
	}

	checkWaitingCircle = () => {
		const item = this.state.details;
		if(item.start_date !== undefined && !flag){
			flag = true;
			let oldDate = CommonService.allInOneFormatDate(item.start_date,'/','-','reverse');
			let CurrentDate = new Date();
			oldDate = new Date(oldDate);
			let formatdate = moment(oldDate).format('llll');
			if(CurrentDate > formatdate){
				buttons = true;
				console.log("Visiblity false")
				this.setState({visiblityButton:false})
			} else {
				console.log("Visiblity true")
				this.setState({visiblityButton:true})
				buttons = false;
			}
		}
	}

	_bootstrapAsync = async () => {
		let selectedDetails = this.props.navigation.getParam('result');
		AsyncStorage.multiGet([
		  'rememberToken',
		  'circle_code',
		  'first_name',
		  'avatar_location',
		  'user_id',
		]).then(response => {
		  this.setState(
			{
			  rememberToken: response[0][1],
			  cicle_code: response[1][1],
			  first_name: response[2][1],
			  avatar_location: {uri:URL.public_url + 'storage/' + response[3][1]},
			  user_id: response[4][1],
			  details:selectedDetails
			},
			() => {
			  this.getCircleDetailsByCirlceCode(selectedDetails.circle_code,response[0][1]);
			}
		  );
		});
	};

	/**
	 * @param {Strting} circleCode 
	 * @param {String} token 
	 */
	getCircleDetailsByCirlceCode(circleCode,token){
		this.loading = Loading.show(CommonService.loaderObj);
		let payload = {
			url:'ongoing-circle-details',
			data:{
				circle_code:circleCode
			},
			authtoken:token
		};

		httpService.postHttpCall(payload).then((res)=>{
		Loading.hide(this.loading);
		if(res.status !== undefined){
			if (res.status == 100) {
				let details = res.result;
				if (details.status == 0) {
					console.log("circle details", details)
					this.setState({details: details});
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

	whatsppIconEnable(mobile_no_one,mobile_no_two){
		let mob_one = mobile_no_one.toString();
		let mob_two = mobile_no_two.toString();
		return (mob_one == mob_two) ? true : false;
	}

	onError(error){
		this.setState({ avatar_location: require('../../../assets/images/contact.png')})
	}

	onSendReminder = () =>{
		const {details, rememberToken} = this.state;
		this.setState({btnLoader:true})
		if(details.circle_code && rememberToken){
			let obj ={
				"circle_code": details.circle_code,
				"user_type":1,   //1->admin, 2->user
				"screen": 1   //1->waiting, 2->block
			}
			axios.post('https://nodejsdapldevelopments.com/dart/public/api/send-reminder', JSON.stringify(obj), {
				headers: {
				  Authorization: "Bearer " + rememberToken
				}
			}).then(res => {
				this.setState({btnLoader:false})
				  ToastAndroid.showWithGravityAndOffset(
					  res.data.message,
					  ToastAndroid.LONG,
					  ToastAndroid.BOTTOM,
					  25,
					  50,
					);
					this.props.navigation.navigate('dashboardPage')
			  }).catch(err =>{
				  this.setState({ btnLoader: false })
				  alert(err.message)
				ToastAndroid.showWithGravityAndOffset(
					err.message,
					ToastAndroid.LONG,
					ToastAndroid.BOTTOM,
					25,
					50,
				  );
			  })
		}else{
			this.setState({btnLoader:false})
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
		console.log("item", item)
		// if(item.start_date !== undefined && !flag){
		// 	flag = true;
		// 	let oldDate = CommonService.allInOneFormatDate(item.start_date,'/','-','reverse');
		// 	let CurrentDate = new Date();
		// 	oldDate = new Date(oldDate);
		// 	let formatdate = moment(oldDate).format('llll');
		// 	if(CurrentDate > formatdate){
		// 		buttons = true;
		// 		this.setState({visiblityButton:false})
		// 	}else{
		// 		this.setState({visiblityButton:true})
		// 		buttons = false;
		// 	}
		// }
		return(
			<Container>
				<Content>
					<HeaderCurve
					navigation={this.props.navigation}
					avatar_location={this.state.avatar_location}
					backButton={true}
					first_name={this.state.first_name}
					admin = {item.is_admin}
						bellIcon={false}
						props={this.props}
					/>
					<StatusBar backgroundColor="#1CCBE6" />
					{
						this.state.errorText !=''?
						<View style={{alignItems:'center',marginTop:'50%'}}>
						  <ErrorTemplate
						  message={this.state.errorText}
						  subMessage={this.state.subMessage}
						  />
						</View>:
						
						<View style={invitationCercleTwoStyle.mainContent}>
							{
								this.state.apiExecute ?
								<View>
									<View style={invitationCercleTwoStyle.headerText}>
										<Text style={invitationCercleTwoStyle.title}>Circle Waiting</Text>
										<Text>N° {item.circle_code}</Text>
									</View>
									<View style={{marginTop:25}}>
										<View style={invitationCercleTwoStyle.rowView}>
											<View style={invitationCercleTwoStyle.rowViewLeftItem}>
												<Text style={invitationCercleTwoStyle.rowText}>Circle Admin:</Text>
											</View>
											<View style={[invitationCercleTwoStyle.rowViewRightItem,{flexDirection:'row'}]}>
												<Text style={[invitationCercleTwoStyle.rowTextValue,{marginRight:10}]}>{item.admin}</Text>
												{
													!this.whatsppIconEnable(item.admin_mobile_code+item.admin_mobile, item.login_user_mobile_code+item.login_user_mobile) ?
													<TouchableOpacity onPress={()=>CommonService.openWhatsApp(item.admin_mobile_code+item.admin_mobile)}>
														<Icon name="logo-whatsapp" size={20} color="#64B161"/>
													</TouchableOpacity>:null
												}
												
											</View>
										</View>
										<View style={invitationCercleTwoStyle.rowView}>
											<View style={invitationCercleTwoStyle.rowViewLeftItem}>
												<Text style={invitationCercleTwoStyle.rowText}>Target to achieve:</Text>
											</View>
											<View style={invitationCercleTwoStyle.rowViewRightItem}>
												<Text style={invitationCercleTwoStyle.rowTextValue}>€{item.target_achive}</Text>
											</View>
										</View>
										<View style={invitationCercleTwoStyle.rowView}>
											<View style={invitationCercleTwoStyle.rowViewLeftItem}>
												<Text style={invitationCercleTwoStyle.rowText}>Round Settlement:</Text>
											</View>
											<View style={invitationCercleTwoStyle.rowViewRightItem}>
												<Text style={invitationCercleTwoStyle.rowTextValue}>€{item.round_set}</Text>
											</View>
										</View>
										<View style={invitationCercleTwoStyle.rowView}>
											<View style={invitationCercleTwoStyle.rowViewLeftItem}>
												<Text style={invitationCercleTwoStyle.rowText}>Periodisit of round:</Text>
											</View>
											<View style={invitationCercleTwoStyle.rowViewRightItem}>
												<Text style={invitationCercleTwoStyle.rowTextValue}>{item.p_round}</Text>
											</View>
										</View>
										<View style={invitationCercleTwoStyle.rowView}>
											<View style={invitationCercleTwoStyle.thPadding}>
												<Text style={invitationCercleTwoStyle.rowText}>Personal reason for the circle:</Text>
												<Text style={invitationCercleTwoStyle.rowTextValue}>{item.reason_for_circle}</Text>
											</View>
										</View>
										<View style={invitationCercleTwoStyle.rowView}>
											<View style={invitationCercleTwoStyle.rowViewLeftItem}>
												<Text style={invitationCercleTwoStyle.rowText}>Wishing start date:</Text>
											</View>
											<View style={invitationCercleTwoStyle.rowViewRightItem}>
												<Text style={invitationCercleTwoStyle.rowTextValue}>{CommonService.formatDate(item.start_date)}</Text>
											</View>
										</View>
										<View style={{paddingTop:20}}>
											<Text style={invitationCercleTwoStyle.rowText}>Circle participants:</Text>
											<View style={[invitationCercleTwoStyle.rowViewNew,{paddingBottom:20}]}>
												{
													item.circleUsers !== undefined ?
													item.circleUsers.map((user_item,user_index) => {
														return(
															<View key={user_index} style={{flexDirection:'row'}}>
														<View style={invitationCercleTwoStyle.nextRowViewLeftItem}>
														<Text style={invitationCercleTwoStyle.rowTextValue}>{user_index+1}.{user_item.username} {" "}
														({user_item.mobile_country_code}{user_item.mobile_number})</Text>
														</View>
														<View style={invitationCercleTwoStyle.rowViewMiddleItem}>
														{
															user_item.accept_status == 1 ?
															<Icon name="ios-checkmark-circle-outline" size={20} color="#5AC6C6" />:null
														}

														{
															user_item.accept_status == 3 ?
															<Icon name="ios-time" size={20} color="#5AC6C6" />:null
														}
														
														</View>
														<View style={invitationCercleTwoStyle.nextRowViewRightItem}>
														{
															!this.whatsppIconEnable(user_item.mobile_number,item.login_user_mobile) ?
															<TouchableOpacity onPress={()=>CommonService.openWhatsApp(user_item.mobile_country_code, user_item.mobile_number)}>
																<Icon name="logo-whatsapp" size={20} color="#64B161" />
															</TouchableOpacity>:null
														}
														</View>
													</View>
														)
													}
													):null
												}
											</View>
										</View>
										<View style={invitationCercleTwoStyle.rowView}>
											<View style={invitationCercleTwoStyle.rowViewLeftItem}>
												<Text style={invitationCercleTwoStyle.rowText}>Number of expected rounds:</Text>
											</View>
											<View style={invitationCercleTwoStyle.rowViewRightItem}>
												<Text style={invitationCercleTwoStyle.rowTextValue}>{item.estimate_round}</Text>
											</View>
										</View>
										<View style={invitationCercleTwoStyle.rowView}>
											<View style={invitationCercleTwoStyle.rowViewLeftItem}>
												<Text style={invitationCercleTwoStyle.rowText}>Expected end date:</Text>
											</View>
											<View style={invitationCercleTwoStyle.rowViewRightItem}>
												<Text style={invitationCercleTwoStyle.rowTextValue}>{CommonService.formatDate(item.end_date)}</Text>
											</View>
										</View>
										<View style={{flexDirection: 'row'}}>
											<View style={invitationCercleTwoStyle.rowViewLeftItem}>
												<Text style={invitationCercleTwoStyle.rowText}>Expected payment receive:</Text>
											</View>
											<View style={invitationCercleTwoStyle.rowViewRightItem}>
												<Text style={invitationCercleTwoStyle.rowTextValue}>{item.expected_payable_date}</Text>
											</View>
										</View>
										{
											this.state.visiblityButton ?
											<View>
												{
													item.request_accept_status == 0?
													<View>
														{
															item.is_admin == 1 ?
															<View style={invitationCercleTwoStyle.paymentButtonView}>
																<TouchableOpacity onPress={()=>this.props.navigation.navigate('bankDetailsPage',{result:this.state.details,reason_id:'',other_reason:'',navigate_from:'accept_screen'})} style={[invitationCercleTwoStyle.paymentButton]}>
																	<Text style={invitationCercleTwoStyle.paymentText}>Pay the Deposit</Text>
																</TouchableOpacity>
															</View>:
															<View style={invitationCercleTwoStyle.buttonView}>
																<TouchableOpacity 
																style={invitationCercleTwoStyle.rejectButton}
																onPress={()=>this.props.navigation.navigate('refusalPage',{result:item})}
																>
																	<Text style={invitationCercleTwoStyle.buttonText}>Reject</Text>
																</TouchableOpacity>
																<TouchableOpacity 
																style={invitationCercleTwoStyle.joinButton}
																onPress={()=>this.props.navigation.navigate('acceptInvitaionPage',{result:item})}
																>
																	<Text style={invitationCercleTwoStyle.buttonText}>Join</Text>
																</TouchableOpacity>
															</View>
														}
													</View>:
													item.is_admin == 1 && item.status == 0 ?
													<View style={invitationCercleTwoStyle.sendButtonView}>
														<TouchableOpacity style={invitationCercleTwoStyle.sendButton}
														 onPress={()=>this.onSendReminder()}
														>
															<Text style={invitationCercleTwoStyle.sendButtonText}>Send Reminder</Text>
															{this.state.btnLoader ? (
														<View style={{ marginLeft: 10 }}>
															<ActivityIndicator size="small" color={"#FFFFFF"} />
														</View>
														) : null}
														</TouchableOpacity>
														
													</View>:
													item.request_accept_status == 3?
													<Text>Note:Waiting for admin approval</Text>:null
												}
											</View>:null
										}
									</View>
								</View>:null
							}
						</View>
					}
				</Content>
			</Container>
		);
	}
}