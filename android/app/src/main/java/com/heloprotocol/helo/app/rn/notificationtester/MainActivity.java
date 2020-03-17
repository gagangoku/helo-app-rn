package com.heloprotocol.helo.app.rn.notificationtester;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;
import android.webkit.WebView;
import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.heloprotocol.helo.app.rn.notificationtester.ArgumentsConverter;
import com.heloprotocol.helo.app.rn.notificationtester.Util;
import io.branch.rnbranch.*;
import io.branch.rnbranch.RNBranchModule;

import java.util.ArrayList;
import java.util.List;


public class MainActivity extends ReactActivity {
    private static final String TAG = "ReactNative.MainActivity";
    private static final String SHARE_INTENT_NAME = "receivedShareIntent";
    private static final String OTP_INTENT_NAME = "receivedOtp";
    private ReactContext reactContext;
    private List<WritableMap> buffer = new ArrayList<>();

    private BroadcastReceiver broadcastReceiver =  new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            WritableMap data = ArgumentsConverter.fromBundle(intent.getExtras());
            Log.e(TAG, "newmesage: " + data);
            ReactContext reactContext = MainActivity.this.reactContext;
            if (reactContext != null) {
                reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(OTP_INTENT_NAME, data);
            }
        }
    };

    @Override
    public void onNewIntent(Intent intent) {
        Log.i(TAG, "onNewIntent");
        super.onNewIntent(intent);
        setIntent(intent);
        sendIntentToJS(intent);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        Log.i(TAG, "onCreate");
        super.onCreate(savedInstanceState);
        // Enable when you want to debug webview. Super useful stuff
        WebView.setWebContentsDebuggingEnabled(false);

        getReactContext();
        registerReceiver(this.broadcastReceiver, new IntentFilter("otp-broadcast"));
    }

    @Override
    protected ReactActivityDelegate createReactActivityDelegate() {
        return new ReactActivityDelegate(this, getMainComponentName()) {
            @Override
            protected Bundle getLaunchOptions() {
                Log.i(TAG, "getLaunchOptions");
                Intent intent = MainActivity.this.getIntent();
                MainActivity.this.sendIntentToJS(intent);
                Bundle bundle = intent.getExtras();
                return bundle;
            }
        };
    }

    @Override
    protected void onStart() {
        Log.i(TAG, "onStart");
        super.onStart();
        RNBranchModule.initSession(getIntent().getData(), this);
    }

    /**
     * Returns the name of the main component registered from JavaScript. This is used to schedule
     * rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "helo_app_rn";
    }

    private void getReactContext() {
        ReactContext reactContext = getReactNativeHost().getReactInstanceManager().getCurrentReactContext();
        Log.i(TAG, "getReactContext: reactContext: " + reactContext);

        if (reactContext != null) {
            this.reactContext = reactContext;
            processBufferedIntents();
            return;
        }

        Log.i(TAG, "getReactContext: Didnt get reactContext, schedule for later: " + reactContext);
        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                MainActivity.this.getReactContext();
            }
        }, 500);
    }

    private void sendIntentToJS(Intent intent) {
        try {
            Util.printIntent(intent);
            ReactContext reactContext = this.reactContext;
            Log.i(TAG, "sendIntentToJS: Using reactContext: " + reactContext);

            WritableMap data = Arguments.createMap();
            data.putString("package", defaultIfNull(intent.getPackage(), ""));
            data.putString("action", defaultIfNull(intent.getAction(), ""));
            data.putString("type", defaultIfNull(intent.getType(), ""));
            data.putMap("extras", ArgumentsConverter.fromBundle(intent.getExtras()));
            Log.i(TAG, "sendIntentToJS: data: " + data);

            if (reactContext != null) {
                reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(SHARE_INTENT_NAME, data);
            } else {
                Log.i(TAG, "sendIntentToJS: Buffering: " + data);
                buffer.add(data);
            }
        } catch (Exception e) {
            Log.e(TAG, "sendIntentToJS: Exception in processing intent: ", e);
        }
    }

    private void processBufferedIntents() {
        Log.i(TAG, "processBufferedIntents: Got reactContext: " + this.reactContext);

        if (!buffer.isEmpty()) {
            Log.i(TAG, "processBufferedIntents: Dispatching buffered intent: " + buffer.get(0));
            this.reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(SHARE_INTENT_NAME, buffer.get(0));
            buffer.clear();
        }
    }

    public static <T> T defaultIfNull(T object, T defaultValue) {
        return object == null ? defaultValue : object;
    }
}
