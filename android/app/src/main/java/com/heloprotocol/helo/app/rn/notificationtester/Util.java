package com.heloprotocol.helo.app.rn.notificationtester;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import io.branch.rnbranch.*;

import java.util.Set;


public class Util {
    private static final String TAG = "ReactNative.Util";

    public static void printIntent(Intent intent) {
        Log.i(TAG, "Package: " + intent.getPackage());
        Log.i(TAG, "Action: " + intent.getAction());
        Log.i(TAG, "Type: " + intent.getType());

        Set<String> categories = intent.getCategories();
        if (categories == null) {
            Log.i(TAG, "Categories: null");
        } else {
            if (categories.isEmpty()) {
                Log.i(TAG, "Categories: not null, but empty");
            } else {
                for (String category : categories) {
                    Log.i(TAG, "Category: " + category);
                }
            }
        }

        Bundle bundle = intent.getExtras();
        if (bundle != null) {
            for (String key : bundle.keySet()) {
                Log.i(TAG, key + " : " + (bundle.get(key) != null ? bundle.get(key) : "NULL"));
            }
        }
    }
}
