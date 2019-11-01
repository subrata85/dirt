import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-community/async-storage';
import HeaderCurve from '../includes/headercurve';
const width = Math.round(Dimensions.get('window').width);
const height = Math.round(Dimensions.get('window').height);
import httpService from '../../services/http/httpService';

export default class LoginScreen extends Component {
	constructor(props) {
		super(props);
		this.state = {
		  isSecured: true,
		  eyeIcon: require('../../../assets/images/eye_cross.png'),
		  loader: false,
		  success: null,
		  email: '',
		  errorEmail: false,
		  password: '',
		  errorPassword: false,
			errorMessage: '',
			device_token:''
		};
		}
		
		async componentDidMount(){
			const device_token = await AsyncStorage.getItem('device_token');
			this.setState({device_token:device_token});
		}

		componentWillUnmount(){
			let keys = ['notification_data'];
			AsyncStorage.multiRemove(keys, (err) => {
			});
		}

	  _doLogin = () => {
			this.setState({
				errorEmail: false,
				errorPassword: false,
				errorMessage: ''
			});
			if (this.state.email == '' || this.state.password == '') {
				if (this.state.email == '') {
				this.setState({
					errorEmail: true,
					errorMessage: httpService.appMessege.empty_field
				});
				}
		
				if (this.state.password == '') {
				this.setState({
					errorPassword: true,
					errorMessage: httpService.appMessege.empty_field
				});
				}
			}
			
			setTimeout(
				function() {
				if (!this.state.errorMessage) {
						let that = this;
						let thatNavigation = this.props.navigation;
		
						let obj = {
							url:'user-authentication',
							data:{
								email: this.state.email,
								password: this.state.password,
								device_token:this.state.device_token
							}
						};
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
								that.setState({errorMessage: response.message});
							}
							);
						} else {
							AsyncStorage.clear();
							AsyncStorage.multiSet(
								[
									['user_id', response.result.id.toString()],
									['rememberToken', response.result.remember_token],
									['first_name', response.result.first_name],
									['last_name', response.result.last_name],
									['dob', response.result.dob],
									['email', response.result.email],
									['mobile_number', (response.result.mobile_number).toString()],
									['avatar_location', response.result.avatar_location],
									['loggedIn', 'success']
								],
							);
							
								let notificationDetails = thatNavigation.getParam('result');
								if(notificationDetails !== undefined && notificationDetails != null && notificationDetails != ''){
									thatNavigation.navigate('ongingPage',{result:notificationDetails});
								}else{
									thatNavigation.navigate('homeStack');
								}
							
						}
					}).catch((err)=>{
						that.setState({errorMessage: err.message,loader: false});
					});
				}
				}.bind(this),
				500
			);
	  };
	
	  _doRedirectForgotPassword = () => {
		this.props.navigation.navigate('forgotPasswordPage');
	  };
	
	  _doRedirectCreateAccount = () => {
		this.props.navigation.navigate('registerOnePage');
	  };
	
	  _doChangeView = () => {
		this.setState({
		  isSecured: !this.state.isSecured
		});
	  };
	
	  _doRedirectPrev = () => {
		this.props.navigation.goBack()
	  };
	
	  render() {
		const toasTStyle = this.state.success
		  ? { backgroundColor: '#00CC2C' }
		  : { backgroundColor: '#A40B0B' };
	
		const eyeIcon = this.state.isSecured
		  ? require('../../../assets/images/eye_cross.png')
		  : require('../../../assets/images/eye.png');
	
		const errorEmail = this.state.errorEmail
		  ? styles.inputTextStyleRequired
		  : styles.inputTextStyleInactive;
	
		const errorPassword = this.state.errorPassword
		  ? styles.inputTextStyleRequired
		  : styles.inputTextStyleInactive;
	
		return (
		  <View style={styles.container}>
			<KeyboardAwareScrollView
			  contentContainerStyle={{ flexGrow: 1 }}
			  keyboardShouldPersistTaps={'handled'}
			>
			  <View style={{ flex: 1, position: 'relative' }}>
			  <HeaderCurve
              title={" Login to Your Account"}
              navigation={this.props.navigation}
              backButton={true}
            />
	
				<View style={{ flex: 1 }}>
				  <View
					style={{
					  flex: 1,
					  marginLeft: 20,
					  marginRight: 20,
					
					}}
				  >
					<View style={styles.imageWrapper}>
					  <Image
						source={require('../../../assets/images/login2.png')}
						resizeMode={'contain'}
						style={{ width: hp('35%'), height: hp('35%') }}
					  />
					</View>
	
					<View
					  style={{
						flexDirection: 'row',
						position: 'relative',
						marginTop: 20,
						alignItems: 'center'
					  }}
					>
					  <TextInput
					    autoFocus={true}
						style={errorEmail}
						onChangeText={email => this.setState({ email })}
						placeholder="Email"
						keyboardType="email-address"
						autoCapitalize="none"
						returnKeyType="go"
						onSubmitEditing={()=>this.password.focus()}
					  />
					  <View style={{ position: 'absolute' }}>
						<Image
						  source={require('../../../assets/images/email.png')}
						  style={{
							width: 20,
							height: 20
						  }}
						/>
					  </View>
					</View>
	
					<View
					  style={{
						flexDirection: 'row',
						position: 'relative',
						marginTop: 10,
						alignItems: 'center'
					  }}
					>
					  <TextInput
					    ref={(password)=>this.password = password}
						style={[errorPassword, { paddingRight: 40 }]}
						onChangeText={password => this.setState({ password })}
						placeholder="Password"
						secureTextEntry={this.state.isSecured}
						autoCapitalize="none"
						returnKeyType="done"
						onSubmitEditing={()=>this._doLogin()}
					  />
	
					  <View style={{ position: 'absolute' }}>
						<Image
						  source={require('../../../assets/images/lock.png')}
						  style={{
							width: 20,
							height: 20
						  }}
						/>
					  </View>
	
					  <TouchableOpacity
						style={{
						  position: 'absolute',
						  left: width - 70
						}}
						onPress={() => this._doChangeView()}
					  >
						<Image
						  source={eyeIcon}
						  style={{
							width: 20,
							height: 20
						  }}
						/>
					  </TouchableOpacity>
					</View>
	
					<View
					  style={{
						justifyContent: 'center',
						alignItems: 'center',
						marginTop: 10
					  }}
					>
					  <Text
						style={{
						  color: 'red',
						  fontFamily: 'Roboto-Reguler',
						  fontSize: 16
						}}
					  >
						{this.state.errorMessage}
					  </Text>
					</View>
	
					<View style={styles.forgotPasswordBlock}>
					  <Text
						style={styles.forgotPasswordText}
						onPress={() => this._doRedirectForgotPassword()}
					  >
						Forgot Password?
					  </Text>
					</View>
	
					<TouchableOpacity
					  style={styles.sendButtonBlock}
					  onPress={() => this._doLogin()}
					  disabled={this.state.loader}
					>
					  <Text style={styles.sendButtonText}>Login</Text>
					  {this.state.loader ? (
						<View style={styles.loading}>
						  <ActivityIndicator size="small" color={'#FFFFFF'} />
						</View>
					  ) : null}
					</TouchableOpacity>
	
					<View
					  style={[styles.forgotPasswordBlock, { flexDirection: 'row' }]}
					>
					  <Text
						style={[
						  styles.forgotPasswordText,
						  { color: '#000000', marginRight: 5 }
						]}
					  >
						Don't have an account?
					  </Text>
					  <TouchableOpacity
						onPress={() => this._doRedirectCreateAccount()}
					  >
						<Text style={styles.forgotPasswordText}>Sign up here</Text>
					  </TouchableOpacity>
					</View>
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
	
	  containerHeaderText: {
		color: '#FFFFFF',
		fontSize: 18,
		fontFamily: 'Roboto-Reguler',
		right: 10
	  },
	
	  containerImageBlock: {
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 20,
		height: height / 4,
		backgroundColor: '#C6F3F0'
	  },
	
	  forgotPasswordBlock: {
		marginTop: 20,
		justifyContent: 'center',
		alignItems: 'center'
	  },
	
	  forgotPasswordText: {
		color: '#12c4cc',
		fontSize: 16,
		fontFamily: 'Roboto-Reguler'
	  },
	
	  inputTextStyleInactive: {
		flex: 1,
		height: 40,
		borderBottomColor: '#1DC2E0', // normal
		borderBottomWidth: 1,
		color: '#000000',
		fontSize: 18,
		fontFamily: 'Roboto-Reguler',
		paddingLeft: 40,
		paddingVertical: 0
	  },
	  inputTextStyleRequired: {
		flex: 1,
		height: 40,
		borderBottomColor: 'red', // required
		borderBottomWidth: 1,
		color: '#000000',
		fontSize: 18,
		fontFamily: 'Roboto-Reguler',
		paddingLeft: 40,
		paddingVertical: 0
	  },
	
	  sendButtonBlock: {
		//marginTop: 40,
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
		marginTop: 40,
		height: hp('30%')
	  },
	  headerMenu: {
		flexDirection: 'row',
		height: hp('4%'),
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingLeft: 20,
		paddingRight: 20,
		top: hp('4%')
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
	  loading: {
		marginLeft: 10
	  },
	  borderReqired: {
		borderBottomColor: 'red'
	  }
	});
	