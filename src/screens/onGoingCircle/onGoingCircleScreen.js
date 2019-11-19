import React, {Component} from 'react';
import {View,Text,ScrollView,TouchableOpacity} from 'react-native';
import {Container,Content} from 'native-base';
import onGoingCircleStyle from './onGoingCircleStyle';
var moment = require('moment');
import URL from '../../config/url';
import AsyncStorage from '@react-native-community/async-storage';
import HeaderCurve from '../includes/headercurve';
import CommonService from '../../services/common/commonService';
import httpService from '../../services/http/httpService';
import Loading from 'react-native-loader-overlay';
import { ErrorTemplate } from '../../components/error/errorComponent';
let flag = false;
let paybutton = false;
export default class OnGoingCircleScreen extends Component {

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
			paybuttonVisible:false
		}
	}

	componentDidMount(){
		this._bootstrapAsync();
	}

	_bootstrapAsync = async () => {
		let circle_code_id = this.props.navigation.getParam('circle_code_id');
		let selectedDetails = this.props.navigation.getParam('result');
		console.log("seledeeeee", selectedDetails)
		if(circle_code_id !== undefined && circle_code_id !== null && circle_code_id != ''){
			selectedDetails = {circle_code:circle_code_id}
		}
		AsyncStorage.multiGet([
		  'rememberToken',
		  'circle_code',
		  'first_name',
		  'avatar_location',
		  'user_id'
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
			console.log("get circel details", res)
		Loading.hide(this.loading);
		if(res.status !== undefined){
			if (res.status === 100) {
				let details = res.result;
				if(details.status === 1){
					if(details.previous_round_payment_date !==undefined ){
					let currentDate = moment(new Date()).format("YYYY-MM-DD");
					let oldDate = CommonService.allInOneFormatDate(details.previous_round_payment_date,'/','-','reverse');
			      if(currentDate > oldDate){
						this.setState({paybuttonVisible:true})
						paybutton = true;
					}else{
						this.setState({paybuttonVisible:false})
						paybutton = false;
					}
					if(details.previous_round_payment_date === ""){
						this.setState({paybuttonVisible:true})
					}
					}
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

	doLaunchCircle = () => {
		let circle_code = Date.now().toString();
		AsyncStorage.multiSet([
			['circle_code',circle_code]
		],(err)=>{
			AsyncStorage.getItem('circle_code').then((token)=>{
				if(token != null){
					this.props.navigation.navigate('createCirclePage');
				}else{
					CommonService.showSimpleAlert(httpService.appMessege.asyncStorageError);
				}
			}).catch((err)=>{
				CommonService.showSimpleAlert(httpService.appMessege.asyncStorageError);
			});
		});
	};

	render(){
		 const item = this.state.details;
		return(
			<Container>
				<Content>
					{/* <HeaderCurve/> */}
					<HeaderCurve
						//title={"Create Circle"}
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
						<View style={onGoingCircleStyle.mainContent}>
						{
							this.state.apiExecute ? 
							<View>
								<View style={{alignItems:'center'}}>
										<Text style={{flex: 5,
											fontSize:20,
											fontWeight: 'bold',
											paddingBottom:5,
											paddingTop:5,}}>Circle {item.completed_round == item.estimate_round ? 'Completed':'Ongoing'}</Text>
										<Text>N° {item.circle_code}</Text>
									</View>
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
															<Text style={[onGoingCircleStyle.tableText, { color: '#24D19B' }]} numberOfLines={1}>{item.completed_round == item.estimate_round ? 'Completed' : 'Ongoing'}
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
																Start date : {item.previous_round_payment_date}
														</Text>
														<Text style={{fontWeight: 'bold'}}>
																End date : {item.expected_next_payment_date}
														</Text>
										</View>
									</ScrollView>
									
								</View>
								
								{
									item.userWillRecieveCurrentRound != ''?
									<View style={onGoingCircleStyle.tableContentReceiverHistory}>
										<Text style={onGoingCircleStyle.titleTextValue}>
										{item.userWillRecieveCurrentRound}
										</Text>
									</View>:null
								}
								{
									item.login_user_current_round_payment_status == 0 && this.state.paybuttonVisible ? //
									<View style={onGoingCircleStyle.paymentButtonView}>
										<TouchableOpacity 
										onPress={()=>this.props.navigation.navigate('bankDetailsPage',{result:this.state.details,navigate_from:'on_going_details'})} 
										style={[onGoingCircleStyle.paymentButton]}>
											<Text style={onGoingCircleStyle.paymentText}>Pay your Round</Text>
										</TouchableOpacity>
									</View>:null
								}
								
								{
									item.round_complete.map((user_round,round_index) =>
									<View key={round_index} style={onGoingCircleStyle.roundRow}>
										<View style={onGoingCircleStyle.tablePart}>
											<Text style={onGoingCircleStyle.baseText}>
												<Text style={[onGoingCircleStyle.tableText,{fontWeight: 'bold'}]}>Round {user_round.round}- </Text>
												<Text style={[onGoingCircleStyle.tableText,{color:'#20CC94'}]} numberOfLines={5}>Completed</Text>
											</Text>
											<View style={onGoingCircleStyle.rowView}>
												<View style={onGoingCircleStyle.rowViewLeftItem}>
														{user_round.reciever_msg ?
															<Text>{user_round.reciever_msg}</Text> : null}
														<Text>On {user_round.completion_date}</Text>
													</View>
													
											</View>
										</View>
									</View>
									).reverse()
								}
								{/* <View style={onGoingCircleStyle.paymentButtonView}>
									<TouchableOpacity onPress={()=>this.doLaunchCircle()} style={onGoingCircleStyle.terminateButton}>
										<Text style={onGoingCircleStyle.paymentText}>New Savings Circle</Text>
									</TouchableOpacity>
								</View> */}

							</View>:null
						}
						</View>
					}
				</Content>
			</Container>
		);
	}

	getNames(data){
		let names = '';
		data.forEach(element => {
			if(element.current_round_payment_status == 0){
				names+=element.username+', ';
			}
		});
		names=names.substring(0, names.length - 2);
		return names+' ';
	}
}