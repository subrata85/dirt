import React,{Component}  from 'react';
import {Text,StyleSheet} from 'react-native';
import { Footer, FooterTab, Button, Icon } from 'native-base';
import colorCode from '../../config/commonColor';
let tabIndex = 0;
export default class FooterTabComponent extends Component{

    constructor(props){
		super(props);
	}
	
	navigateTo(props,index,stack){
		props.navigation.navigate(stack);
		tabIndex = index;
	}

    render() {
        const {props} = this.props;
        return (
            <Footer>
				<FooterTab style={{backgroundColor:colorCode.lightBlue}}>
					<Button 
					style={tabIndex == 0 ? {opacity:0.7}:undefined}
					onPress={()=>{this.navigateTo(props,0,'homeStack')}}>
                        <Icon style={{ color: 'white' }} name='ios-home' />
                        <Text style={{ color: 'white' }}>Home</Text>
                    </Button>
					{/* <Button>
                        <Icon style={{ color: 'white' }} name='ios-contact' />
                        <Text style={{ color: 'white' }}>Profile</Text>
                    </Button>
                    <Button>
                        <Icon style={{ color: 'white' }} name='ios-settings' />
                        <Text style={{ color: 'white' }}>Settings</Text>
                    </Button> */}
                    <Button style={tabIndex == 3 ? {opacity:0.7}:undefined} onPress={()=>{this.navigateTo(props,3,'moreStack')}}>
                        <Icon style={{ color: 'white' }} name='ios-more' />
                        <Text style={{ color: 'white' }}>More</Text>
                    </Button>
                </FooterTab>
            </Footer>
        );
    }
}