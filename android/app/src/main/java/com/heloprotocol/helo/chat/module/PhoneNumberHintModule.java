package com.heloprotocol.helo.module;

import android.widget.Toast;
import android.os.Bundle;
import android.app.PendingIntent;
import android.content.Intent;
import android.app.Activity;
import android.util.Log;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ActivityEventListener;
import android.media.ThumbnailUtils;
import android.graphics.Bitmap;
import android.provider.MediaStore;
import com.facebook.react.bridge.Callback;
import java.io.ByteArrayOutputStream;
import android.util.Base64;
import android.media.MediaMetadataRetriever;
import android.os.Build;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Promise;
import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.auth.api.credentials.HintRequest;
import com.google.android.gms.auth.api.credentials.Credential;
import com.google.android.gms.auth.api.Auth;

import java.util.Map;
import java.util.HashMap;
import java.lang.Exception;

public class PhoneNumberHintModule extends ReactContextBaseJavaModule
        implements ActivityEventListener, GoogleApiClient.ConnectionCallbacks, GoogleApiClient.OnConnectionFailedListener {
    private static ReactApplicationContext reactContext;
    private GoogleApiClient apiClient;
    private Promise promise;

    private static final String TAG = "ReactNative.PhoneNumberHintModule";
    private static final int RESOLVE_HINT = 1001;
    private static final String DURATION_SHORT_KEY = "SHORT";
    private static final String DURATION_LONG_KEY = "LONG";

    PhoneNumberHintModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;

        this.apiClient = new GoogleApiClient.Builder(getReactApplicationContext())
                .addConnectionCallbacks(this)
//                .enableAutoManage(getCurrentActivity(), this)
                .addApi(Auth.CREDENTIALS_API)
                .build();
    }

    @Override
    public String getName() {
        return "PhoneNumberHintModule";
    }

    @Override
    public void initialize() {
        super.initialize();
        getReactApplicationContext().addActivityEventListener(this);
        Log.i(TAG, "initialize");
    }

    @Override
    public void onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy();
        getReactApplicationContext().removeActivityEventListener(this);
        this.apiClient.disconnect();
        Log.i(TAG, "onCatalystInstanceDestroy");
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put(DURATION_SHORT_KEY, Toast.LENGTH_SHORT);
        constants.put(DURATION_LONG_KEY, Toast.LENGTH_LONG);
        return constants;
    }

    @ReactMethod
    public void showHint(String message, int duration, Promise promise) {
        Toast.makeText(getReactApplicationContext(), message, duration).show();
        WritableMap map = Arguments.createMap();
        map.putString("message", message);
        promise.resolve(map);
        Log.i(TAG, "showHint");
    }

    @ReactMethod
    public void phoneNumberSelector(Promise promise) {
        Log.i(TAG, "phoneNumberSelector");
        this.promise = promise;
        HintRequest hintRequest = new HintRequest.Builder()
                .setPhoneNumberIdentifierSupported(true)
                .build();

        Activity mActivity = getCurrentActivity();
        PendingIntent intent = Auth.CredentialsApi.getHintPickerIntent(apiClient, hintRequest);

        try {
            mActivity.startIntentSenderForResult(intent.getIntentSender(), RESOLVE_HINT, null, 0, 0, 0);
        } catch (Exception e) {
            Log.e(TAG, "Exception in startIntentSenderForResult: ", e);
        }
    }

    @Override
    public void onNewIntent(Intent intent) {
        Log.i(TAG, "onNewIntent");
    }

    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
        Log.i(TAG, "onActivityResult: " + requestCode + ", " + resultCode + ", " + data.toUri(0).toString());
        WritableMap map = Arguments.createMap();
        map.putString("phone", "");

        if (requestCode == RESOLVE_HINT) {
            if (resultCode == Auth.CredentialsApi.ACTIVITY_RESULT_NO_HINTS_AVAILABLE) {
                // The device does not support phone number selector, or maybe its an emulator
                map.putString("error", "ACTIVITY_RESULT_NO_HINTS_AVAILABLE");
            }
            if (resultCode == Activity.RESULT_OK) {
                Credential credential = data.getParcelableExtra(Credential.EXTRA_KEY);
                String phone = credential.getId();      // credential.getId(); <-- E.164 format phone number on 10.2.+ devices
                map.putString("phone", phone);
            }
            this.promise.resolve(map);
            this.promise = null;
        }
    }

    @Override
    public void onConnected(Bundle bundle) {
        Log.i(TAG, "onConnected");
    }

    @Override
    public void onConnectionSuspended(int i) {
        Log.i(TAG, "onConnectionSuspended");
    }

    @Override
    public void onConnectionFailed(ConnectionResult connectionResult) {
        Log.i(TAG, "onConnectionFailed");
    }
}
