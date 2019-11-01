import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  Dimensions,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Keyboard
} from 'react-native';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-community/async-storage';

const statusBarBackgroundColor = '#1CCBE6';
const barStyle = 'light-content';
import httpService from '../../services/http/httpService';
import HeaderCurve from '../includes/headercurve';

export default class OtpVerifyScreen extends Component {
	constructor(props) {
		super(props);
		this.state = {
		  loader: false,
		  loaderResendOtp: false,
		  rememberToken: '',
		  success: null,
		  errorMessage: '',
		  successMessage: ''
		};
	  }
	
	  componentDidMount() {
		this._bootstrapAsync();
	  }
	
	  _bootstrapAsync = async () => {	
		AsyncStorage.multiGet([
		  'rememberToken',
		  'email',
		  'password',
			'mobile_number',
			'user___id'
		]).then(response => {
		  this.setState({
			rememberToken: response[0][1],
			email: response[1][1],
			password: response[2][1],
			mobile_number: response[3][1],
			user_id:response[4][1]
		  });
		});
	  };
	
	_doSubmit = () => {
		Keyboard.dismiss();
		this.setState({
		  errorMessage: '',
		  successMessage: ''
		});
	
		let obj = {
			url:'mobile-otp-verification',
			data:{
				otp: this.state.otp1 + this.state.otp2 + this.state.otp3 + this.state.otp4
			},
			authtoken:this.state.rememberToken
		};
	
		let that = this;
		let thatNavigation = this.props.navigation;
	
		setTimeout(function() {
			if (!this.state.errorMessage) {
				this.setState({
					loader: true
				});

				httpService.postHttpCall(obj).then((response)=>{
					if (response.status == 300) {
						that.setState(
						{
							success: false,
							loader: false
						},
						() => {
							that.setState({
							errorMessage: response.message
							});
						}
						);
					} else {
						that.setState(
						{
								success: true,
								loader:false
						});
		
						setTimeout(
						function() {
							thatNavigation.navigate('RegisterTwoPage');
						}.bind(this),
						3000
						);
					}
				}).catch((err)=>{
					that.setState({errorMessage: err.message,loader: false});
				});
			}
		  }.bind(this),
		  500
		);
	  };
	
	  _onChangeText = fieldName => text => {
		this.setState({ [fieldName]: text }, () => {
		  if (fieldName == 'otp1') {
			this.secondTextInput.focus();
		  } else if (fieldName == 'otp2') {
			this.thirdTextInput.focus();
		  } else if (fieldName == 'otp3') {
			this.fourthTextInput.focus();
		  } else if (fieldName == 'otp4') {
			//this.secondTextInput.focus();
		  }
		});
	  };
	
	  _doResendOTP = async () => {
		this.setState({
		  errorMessage: '',
		  successMessage: ''
		});

		let that = this;
		let obj = {
			url:'resend-otp',
			data:{
				user_id: this.state.user_id,
			},
			authtoken:'xyz'
		};

		this.setState({
		  loaderResendOtp: true
		});

		httpService.postHttpCall(obj).then((response)=>{
			if (response.status == 300) {
				that.setState(
				  {
					success: false,
					loaderResendOtp:false
				  },
				  () => {
					that.setState({
					  errorMessage: response.message
					});
				  }
				);
			  } else {
				that.setState(
				  {
					success: true,
					loaderResendOtp:false
				  },
				  () => {
					that.setState({
					  successMessage: response.message
					});
				  }
				);
			}
		}).catch((err)=>{
			that.setState({errorMessage: err.message,loaderResendOtp: false});
		});
	  };
	
	  render() {
		const toasTStyle = this.state.success
		  ? { backgroundColor: '#00CC2C' }
		  : { backgroundColor: '#A40B0B' };
	
		return (
		  <View style={styles.container}>
			<StatusBar
			  backgroundColor={statusBarBackgroundColor}
			  barStyle={barStyle}
			/>
	
			<KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }}>
			  <View style={{ flex: 1, position: 'relative' }}>
			  <HeaderCurve
				title={"Verify your Number"}
				navigation={this.props.navigation}
				avatar_location={this.state.avatar_location}
				backButton={false}
				bellIcon={false}
              />
	
				<View style={{ flex: 1}}>
				  <View
					style={{
					  flex: 1,
					  marginLeft: 20,
					  marginRight: 20,
					}}
				  >
					<View style={styles.imageWrapper}>
					  <Image
						source={require('../../../assets/images/otp.png')}
						resizeMode={'contain'}
						style={{ width: hp('30%'), height: hp('30%') }}
					  />
					</View>
	
					<View style={styles.containerHeaderBlock}>
					  <Text style={styles.containerHeaderSubText}>
						We have sent you an access code
					  </Text>
					  <Text
						style={[styles.containerHeaderSubText, { marginTop: 0 }]}
					  >
						{' '}
						via sms for mobile no varifications
					  </Text>
					  <Text
						style={[
						  styles.containerHeaderSubText,
						  { color: '#929292', marginTop: 10 }
						]}
					  >
						Enter code here
					  </Text>
					</View>
	
					<View style={styles.otpBlock}>
					  <TextInput
						style={styles.otpTextBox}
						textAlign={'center'}
						maxLength={1}
						keyboardType={'number-pad'}
						blurOnSubmit={false}
						onChangeText={this._onChangeText('otp1')}
					  />
					  <TextInput
						style={styles.otpTextBox}
						textAlign={'center'}
						maxLength={1}
						keyboardType={'number-pad'}
						blurOnSubmit={false}
						onChangeText={this._onChangeText('otp2')}
						ref={input => {
						  this.secondTextInput = input;
						}}
					  />
					  <TextInput
						style={styles.otpTextBox}
						textAlign={'center'}
						maxLength={1}
						keyboardType={'number-pad'}
						blurOnSubmit={false}
						onChangeText={this._onChangeText('otp3')}
						ref={input => {
						  this.thirdTextInput = input;
						}}
					  />
					  <TextInput
						style={styles.otpTextBox}
						textAlign={'center'}
						maxLength={1}
						keyboardType={'number-pad'}
						blurOnSubmit={false}
						onChangeText={this._onChangeText('otp4')}
						ref={input => {
						  this.fourthTextInput = input;
						}}
					  />
					</View>
	
					<View
					  style={{
						justifyContent: 'center',
						alignItems: 'center'
					  }}
					>
					  {this.state.successMessage ? (
						<Text
						  style={{
							color: 'green',
							fontFamily: 'Roboto-Reguler',
							fontSize: 16
						  }}
						>
						  {this.state.successMessage}
						</Text>
					  ) : (
						<Text
						  style={{
							color: 'red',
							fontFamily: 'Roboto-Reguler',
							fontSize: 16
						  }}
						>
						  {this.state.errorMessage}
						</Text>
					  )}
					</View>
	
					<View style={styles.resendOtpBlock}>
					  <Text
						style={[
						  styles.containerHeaderSubText,
						  { color: '#929292' }
						]}
					  >
						Didn't get code yet?
					  </Text>
	
					  <View
						style={{
						  flexDirection: 'row',
						  alignItems: 'center',
						  justifyContent: 'center',
						  marginTop: 10
						}}
					  >
						<Text
						  style={[
							styles.containerHeaderSubText,
							{ color: '#5AC6C6' }
						  ]}
						  onPress={() => this._doResendOTP()}
						>
						  Resend OTP
						</Text>
	
						{this.state.loaderResendOtp ? (
						  <View style={styles.loading}>
							<ActivityIndicator size="small" color={'green'} />
						  </View>
						) : null}
					  </View>
					</View>
	
					<TouchableOpacity
					  onPress={() => this._doSubmit()}
					  style={styles.sendButtonBlock}
					  disabled={this.state.loader}
					>
					  <Text style={styles.sendButtonText}>Verify</Text>
	
					  {this.state.loader ? (
						<View style={styles.loading}>
						  <ActivityIndicator size="small" color={'#FFFFFF'} />
						</View>
					  ) : null}
					</TouchableOpacity>
				  </View>
				</View>
			  </View>
			  <View style={{ marginTop: 20 }} />
			</KeyboardAwareScrollView>
		  </View>
		);
	  }
	}
	
const styles = StyleSheet.create({
	container: {
	flex: 1,
	backgroundColor: '#FFFFFF'
	},
	containerBackBlock: {
	justifyContent: 'center',
	width: 60
	},

	sendButtonBlock: {
	marginTop: 20,
	height: 50,
	borderRadius: 40,
	justifyContent: 'center',
	alignItems: 'center',
	backgroundColor: '#5AC6C6',
	elevation: 2,
	flexDirection: 'row'
	},
	sendButtonText: {
	color: '#FFFFFF',
	fontSize: 18,
	fontFamily: 'Roboto-Reguler'
	},

	imageWrapper: {
	justifyContent: 'center',
	alignItems: 'center',
	marginTop: 20,
	height: hp('30%')
	},
	headerMenu: {
	flexDirection: 'row',
	height: 40,
	justifyContent: 'space-between',
	alignItems: 'center',
	paddingLeft: 20,
	paddingRight: 20,
	top: hp('3%')
	},
	headingBold: {
	color: '#FFFFFF',
	fontSize: 18,
	fontFamily: 'Roboto-Reguler',
	fontWeight: '600'
	},
	headingLight: {
	color: '#FFFFFF',
	fontSize: 18,
	fontFamily: 'Roboto-Reguler',
	fontWeight: '200'
	},
	containerHeaderBlock: {
	justifyContent: 'center',
	alignItems: 'center',
	marginTop: 10
	},
	containerHeaderSubText: {
	fontFamily: 'Roboto-Reguler',
	fontSize: 16,
	color: '#000000'
	},
	resendOtpBlock: {
	justifyContent: 'center',
	alignItems: 'center',
	marginTop: 10
	},
	otpBlock: {
	flexDirection: 'row',
	justifyContent: 'space-around',
	marginTop: 20,
	marginBottom: 20,
	marginLeft: wp('10%'),
	marginRight: wp('10%')
	},
	otpTextBox: {
	height: 50,
	width: 50,
	borderRadius: 25,
	borderColor: '#8ff1f4',
	borderWidth: 1,
	fontFamily: 'Roboto-Reguler',
	color: '#000000',
	fontSize: 18,
	paddingVertical: 0,
	paddingHorizontal: 0
	},
	loading: {
	marginLeft: 10
	}
});
	