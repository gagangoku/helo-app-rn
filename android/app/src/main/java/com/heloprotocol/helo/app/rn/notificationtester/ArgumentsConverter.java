package com.heloprotocol.helo.app.rn.notificationtester;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import java.util.ArrayList;
import java.util.List;


/**
 * NOTE: Shamelessly copied from https://www.programcreek.com/java-api-examples/?code=de-code/react-native-android-speech-recognizer/react-native-android-speech-recognizer-master/android/src/main/java/de/siteof/rn/androidspeechrecognizer/ArgumentsConverter.java
 *
 * Amended com.facebook.react.bridge.Arguments to handle:
 * <ul>
 *   <li>List</li>
 *   <li>byte[]</li>
 *   <li>ReadableArray to List<String> conversion</li>
 *   <li>toStringList</li>
 * </ul>
 */
public class ArgumentsConverter {
    private static final String TAG = "ReactNative.ArgumentsConverter";

    private ArgumentsConverter() {
        // prevent instantiation
    }

    public static void pushObject(WritableArray a, Object v) {
        Log.i(TAG, "pushObject processing: " + v);
        if (v == null) {
            a.pushNull();
        } else if (v instanceof String) {
            a.pushString((String) v);
        } else if (v instanceof Bundle) {
            a.pushMap(fromBundle((Bundle) v));
        } else if (v instanceof Byte) {
            a.pushInt(((Byte) v) & 0xff);
        } else if (v instanceof Integer) {
            a.pushInt((Integer) v);
        } else if (v instanceof Float) {
            a.pushDouble((Float) v);
        } else if (v instanceof Double) {
            a.pushDouble((Double) v);
        } else if (v instanceof Boolean) {
            a.pushBoolean((Boolean) v);
        } else if (v instanceof android.net.Uri) {
            a.pushString(((android.net.Uri) v).toString());
        } else {
            Log.e(TAG, "pushObject: Could not convert: " + v.getClass());
        }
    }

    public static WritableArray fromArray(Object array) {
        Log.i(TAG, "fromArray processing: " + array);

        WritableArray catalystArray = Arguments.createArray();
        if (array instanceof String[]) {
            for (String v: (String[]) array) {
                catalystArray.pushString(v);
            }
        } else if (array instanceof Bundle[]) {
            for (Bundle v: (Bundle[]) array) {
                catalystArray.pushMap(fromBundle(v));
            }
        } else if (array instanceof byte[]) {
            for (byte v: (byte[]) array) {
                catalystArray.pushInt(v & 0xff);
            }
        } else if (array instanceof int[]) {
            for (int v: (int[]) array) {
                catalystArray.pushInt(v);
            }
        } else if (array instanceof float[]) {
            for (float v: (float[]) array) {
                catalystArray.pushDouble(v);
            }
        } else if (array instanceof double[]) {
            for (double v: (double[]) array) {
                catalystArray.pushDouble(v);
            }
        } else if (array instanceof boolean[]) {
            for (boolean v : (boolean[]) array) {
                catalystArray.pushBoolean(v);
            }
        } else if (array instanceof android.net.Uri[]) {
            for (android.net.Uri v : (android.net.Uri[]) array) {
                catalystArray.pushString(v.toString());
            }
        } else if (array instanceof Object[]) {
            for (Object v: (Object[]) array) {
                pushObject(catalystArray, v);
            }
        } else {
            Log.e(TAG, "fromArray: Could not convert: " + array.getClass());
        }
        return catalystArray;
    }

    public static WritableMap fromBundle(Bundle bundle) {
        WritableMap map = Arguments.createMap();
        if (bundle != null) {
            for (String key: bundle.keySet()) {
                Object value = bundle.get(key);
                Log.i(TAG, "fromBundle processing: " + key + " - " + value);

                if (key.equals(Intent.EXTRA_STREAM)) {
                }

                if (value == null) {
                    map.putNull(key);
                } else if (value.getClass().isArray()) {
                    map.putArray(key, fromArray(value));
                } else if (value instanceof String) {
                    map.putString(key, (String) value);
                } else if (value instanceof android.net.Uri) {
                    map.putString(key, ((android.net.Uri) value).toString());
                } else if (value instanceof Number) {
                    if (value instanceof Integer) {
                        map.putInt(key, (Integer) value);
                    } else {
                        map.putDouble(key, ((Number) value).doubleValue());
                    }
                } else if (value instanceof Boolean) {
                    map.putBoolean(key, (Boolean) value);
                } else if (value instanceof Bundle) {
                    map.putMap(key, fromBundle((Bundle) value));
                } else if (value instanceof List) {
                    map.putArray(key, fromArray(((List) value).toArray()));
                } else {
                    Log.e(TAG, "fromBundle: Could not convert: " + value.getClass());
                }
            }
        }
        return map;
    }

    public static List<String> toStringList(ReadableArray a) {
        int size = a.size();
        List<String> list = new ArrayList<String>(size);
        for (int i = 0; i < size; i++) {
            list.add(a.getString(i));
        }
        return list;
    }
}
