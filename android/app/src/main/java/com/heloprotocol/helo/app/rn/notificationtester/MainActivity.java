package com.heloprotocol.helo.app.rn.notificationtester;

import android.webkit.WebView;
import android.os.Bundle;
import android.content.Intent;
import com.facebook.react.ReactActivity;
import io.branch.rnbranch.*;


public class MainActivity extends ReactActivity {
    @Override
    public void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Enable when you want to debug webview. Super useful stuff
        WebView.setWebContentsDebuggingEnabled(false);

    }

    @Override
    protected void onStart() {
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
}
