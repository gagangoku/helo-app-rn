package com.heloprotocol.helo.chat.app.rn.notificationtester;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import com.google.android.gms.auth.api.phone.SmsRetriever;
import com.google.android.gms.common.api.CommonStatusCodes;
import com.google.android.gms.common.api.Status;


/**
 * BroadcastReceiver to wait for SMS messages. This can be registered either
 * in the AndroidManifest or at runtime.  Should filter Intents on
 * SmsRetriever.SMS_RETRIEVED_ACTION.
 */
public class MySMSBroadcastReceiver extends BroadcastReceiver {
    private static final String TAG = "ReactNative.MySMSBroadcastReceiver";

    @Override
    public void onReceive(Context context, Intent intent) {
        Log.i(TAG, "MySMSBroadcastReceiver onReceive: " + intent.getAction());
        if (SmsRetriever.SMS_RETRIEVED_ACTION.equals(intent.getAction())) {
            Bundle extras = intent.getExtras();
            Status status = (Status) extras.get(SmsRetriever.EXTRA_STATUS);

            Intent newIntent = new Intent("otp-broadcast");

            switch(status.getStatusCode()) {
                case CommonStatusCodes.SUCCESS:
                    // Get SMS message contents
                    String message = (String) extras.get(SmsRetriever.EXTRA_SMS_MESSAGE);
                    Log.e(TAG, "OTP message: " + message);
                    // Extract one-time code from the message and complete verification
                    // by sending the code back to your server.

                    newIntent.putExtra("status", "success");
                    newIntent.putExtra("message", message);
                    break;

                case CommonStatusCodes.TIMEOUT:
                    // Waiting for SMS timed out (5 minutes)
                    // Handle the error ...
                    Log.e(TAG, "OTP message timed out");

                    newIntent.putExtra("status", "timeout");
                    newIntent.putExtra("message", "");
                    break;
            }

            context.sendBroadcast(newIntent);
        }
    }
}
