package com.heloprotocol.helo.app.rn.notificationtester;

import com.facebook.react.HeadlessJsTaskService;
import com.facebook.react.jstasks.HeadlessJsTaskConfig;
import android.content.Intent;
import android.os.Bundle;
import javax.annotation.Nullable;
import com.facebook.react.bridge.Arguments;
import android.util.Log;
import com.heloprotocol.helo.app.rn.notificationtester.ArgumentsConverter;


public class MyTaskService extends HeadlessJsTaskService {
    private static final String TAG = "MyTaskService";

    @Override
    public void onCreate() {
        Log.i(TAG, "onCreate");
        super.onCreate();
    }

    @Override
    public void onStart(Intent intent, int startId) {
        Log.i(TAG, "onStart");
        super.onStart(intent, startId);
    }

    @Override
    public void onDestroy() {
        Log.i(TAG, "onDestroy");
        super.onDestroy();
    }

    @Override
    protected @Nullable HeadlessJsTaskConfig getTaskConfig(Intent intent) {
        Bundle extras = intent.getExtras();
        if (extras != null) {
            return new HeadlessJsTaskConfig(
                    "SomeTaskName",
                    ArgumentsConverter.fromBundle(extras),
                    5000, // timeout for the task
                    false // optional: defines whether or not  the task is allowed in foreground. Default is false
            );
        }
        return null;
    }
}
