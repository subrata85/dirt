import React, {Component} from 'react';
import {View, Text,TextInput,TouchableOpacity,Image} from 'react-native';
import {Container,Content,Icon} from 'native-base';
import refusalInvitationStyle from './refusalInvitationStyle';

import URL from '../../config/url';
import AsyncStorage from '@react-native-community/async-storage';
import headerStyle from '../../assets/css/header/headerStyle';
import HeaderCurve from '../includes/headercurve';
import FeatherIcon from 'react-native-vector-icons/Feather';
import CommonService from '../../services/common/commonService';
import httpService from '../../services/http/httpService';
import Loading from 'react-native-loader-overlay';
import { ErrorTemplate } from '../../components/error/errorComponent';
let selectedId = 8;
export default class RefusalInvitationScreen extends Component {

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
			errRejectMsg	:	'',	
			details			:	Object.create(null),
			apiExecute		:	false,
			reason			:	[],
			reasonId		:	selectedId,
			reasonTxt		:	'Other',
			otherReason		:	''
		}
	}

	UNSAFE_componentWillMount(){
		this._bootstrapAsync();
	}
	
	_bootstrapAsync = async () => {
		selectedId = 8;
		let selectedDetails = this.props.navigation.getParam('result');
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
			  	this.getReason();
			}
		  );
		});
	};

	getReason(){
		this.loading = Loading.show(CommonService.loaderObj);
		let payload = {
			url:'get-reason',
			data:{
				type:2
			}
		};

		httpService.postHttpCall(payload).then((res)=>{
		Loading.hide(this.loading);
		if(res.status !== undefined){
			if (res.status == 100) {
			this.setState({reason: res.result});
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

	selectReason(id,txt){
		selectedId = id;
		this.setState({reasonId:id,reasonTxt:txt});
	}

	doReject(){
		let item = this.state.details;
		this.loading = Loading.show(CommonService.loaderObj);
		let payload = {
			url:'circle-request-reject',
			data:{
				circle_code			:	item.circle_code, 
				join_status			:	2,
				reason_id			:	this.state.reasonId,
				other_reason		:	this.state.otherReason,
				mobile_number		:	item.login_user_mobile
			},
			
			authtoken:this.state.rememberToken 
		};
		httpService.postHttpCall(payload).then((res)=>{
		Loading.hide(this.loading);
		if(res.status !== undefined){
			if (res.status == 100) {
				CommonService.showConfirmAlert(res.message,(response)=>{
					if(response){
						this.props.navigation.navigate('dashboardPage');
					}
				});
			}else{
				this.setState({errRejectMsg: res.message});
			}
		}else{
			this.setState({errRejectMsg: httpService.appMessege.unknown_error});
		}
		}).catch((err)=>{
			Loading.hide(this.loading);
			this.setState({errRejectMsg: err.message});
		});
	}

	onError(error){
		this.setState({ avatar_location: require('../../../assets/images/contact.png')})
	}

	render(){
		const item = this.state.details;
		return(
			<Container>
				<Content>
				<HeaderCurve
						//title={"Create Circle"}
						navigation={this.props.navigation}
						avatar_location={this.state.avatar_location}
						backButton={true}
						first_name={this.state.first_name}
						admin = {item.is_admin}
						bellIcon={true}
           			 />
					
					{
						this.state.errorText !=''?
						<View style={{alignItems:'center',marginTop:'50%'}}>
						  <ErrorTemplate
						  message={this.state.errorText}
						  subMessage={this.state.subMessage}
						  />
						</View>:
						<View style={refusalInvitationStyle.mainContent}>
						{
							this.state.apiExecute ?
							<View>
								<View style={refusalInvitationStyle.headerText}>
									<Text style={refusalInvitationStyle.title}>Circle ({item.circle_code}) Refusal</Text>
								</View>
								<View style={refusalInvitationStyle.rowView}>
									<View style={refusalInvitationStyle.rowViewLeftItem}>
										<Text style={{fontSize:20}}>Periodisity of round:</Text>
									</View>
									<View style={refusalInvitationStyle.rowViewRightItem}>
										<View style={refusalInvitationStyle.selectText}>
											<View style={refusalInvitationStyle.childRowView}>
												<View style={refusalInvitationStyle.childRowViewLeftItem}>
													<Text numberOfLines={1}>{this.state.reasonTxt}</Text>
												</View>
												<View style={refusalInvitationStyle.childRowViewRightItem}>
													<Icon 
													name='arrow-down' 
													style={{ fontSize: 18,color:'#A9A9A9' }}
													/>
												</View>
											</View>
										</View>
										<View>
											<View style={[refusalInvitationStyle.unSelectText,{marginTop:10}]}>
												{
													this.state.reason.map((reason_item,reason_index) => 
													<TouchableOpacity key={reason_index} onPress={()=>{this.selectReason(reason_item.id,reason_item.reason)}}>
														<View style={[refusalInvitationStyle.childRowView,refusalInvitationStyle.borderBottom,(reason_item.id == selectedId) ? {backgroundColor:'#E7E7E7'}:{}]}>
															<View style={refusalInvitationStyle.childRowViewLeftItem}>
																<Text numberOfLines={1}>{reason_item.reason}</Text>
															</View>
														</View>
													</TouchableOpacity>
												)
												}
											</View>
										</View>
									</View>
								</View>
								<View style={refusalInvitationStyle.otherResonView}>
								{
									this.state.reasonId == 8 ?
									<View>
										<Text style={{fontSize:20}}>Other reason:</Text>
										<View style={{marginTop:10}}>
											<TextInput
												style={refusalInvitationStyle.textInput}
												multiline = {true}
												onChangeText={otherReason =>
													this.setState({ otherReason })
												  }
											/>
										</View>
									</View>:null
								}
									<View
									style={{
										justifyContent: 'center',
										alignItems: 'center'
									}}
									>
									<Text
										style={{
										color: 'red',
										fontFamily: 'Roboto-Reguler',
										fontSize: 16
										}}
									>
										{this.state.errRejectMsg}
									</Text>
									</View>
									<View style={refusalInvitationStyle.paymentButtonView}>
										<TouchableOpacity onPress={()=>this.doReject()} disabled={(selectedId == 8 && this.state.otherReason == '') ? true : false} style={[(selectedId == 8 && this.state.otherReason == '') ? {opacity:0.8}:{},refusalInvitationStyle.paymentButton]}>
											<Text style={refusalInvitationStyle.paymentText}>Send</Text>
										</TouchableOpacity>
									</View>
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