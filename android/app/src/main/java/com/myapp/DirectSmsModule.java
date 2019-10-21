package com.myapp;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.uimanager.IllegalViewOperationException;
import android.telephony.SmsManager;
import android.telephony.SmsMessage;

public class DirectSmsModule extends ReactContextBaseJavaModule{

    public DirectSmsModule(ReactApplicationContext reactContext){
        super(reactContext);
    }

    @Override
    public String getName() { 
        return "DirectSms";
    }

    @ReactMethod
    public void sendDirectSms(String phoneNumber, String msg){
        try {      
            SmsManager smsManager = SmsManager.getDefault();
            smsManager.sendTextMessage(phoneNumber, null, msg, null, null);    
        } catch (Exception ex) {
            System.out.println("couldn't send message.");
        } 
    }

    public boolean validedNumber(String phoneNumber){
        if(phoneNumber.matches("\\d{10}")){
            return true;
        }else{
            return false;
        }
    }

}