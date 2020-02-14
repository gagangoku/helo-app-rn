package com.heloprotocol.helo.module;

import android.widget.Toast;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
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

import java.util.Map;
import java.util.HashMap;
import java.lang.Exception;

public class ThumbnailModule extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;

    private static final String DURATION_SHORT_KEY = "SHORT";
    private static final String DURATION_LONG_KEY = "LONG";

    ThumbnailModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @Override
    public String getName() {
        return "ThumbnailModule";
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put(DURATION_SHORT_KEY, Toast.LENGTH_SHORT);
        constants.put(DURATION_LONG_KEY, Toast.LENGTH_LONG);
        return constants;
    }

    @ReactMethod
    public void show(String message, int duration) {
        Toast.makeText(getReactApplicationContext(), message, duration).show();
    }

    @ReactMethod
    public void createVideoThumbnail(String filePath, int maxWidth, int maxHeight, int quality, Promise promise) {
        Bitmap bitmap;
        String time;
        try {
            Map<String, Object> map = retriveVideoFrameFromVideo(filePath);
            bitmap = (Bitmap) map.get("bitmap");
            time = (String) map.get("time");
        } catch (Exception e) {
            promise.reject("Failed", e);
            return;
        }

        int h = bitmap.getHeight();
        int w = bitmap.getWidth();
        float scale1 = (float) maxHeight / (float) h;
        float scale2 = (float) maxWidth  / (float) w;
        float scale = Math.min(scale1, scale2);
        bitmap = Bitmap.createScaledBitmap(bitmap, (int) Math.floor(w * scale), (int) Math.floor(h * scale), false);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        bitmap.compress(Bitmap.CompressFormat.JPEG, quality, baos);
        byte[] byteArray = baos.toByteArray();
        String encoded = Base64.encodeToString(byteArray, Base64.DEFAULT);

        WritableMap map = Arguments.createMap();
        map.putString("encoded", encoded);
        map.putInt("width", bitmap.getWidth());
        map.putInt("height", bitmap.getHeight());
        map.putString("time", time);
        promise.resolve(map);
    }

    public static Map<String, Object> retriveVideoFrameFromVideo(String videoPath) {
        MediaMetadataRetriever retriever = null;
        try {
            retriever = new MediaMetadataRetriever();
            if (Build.VERSION.SDK_INT >= 14) {
                retriever.setDataSource(videoPath, new HashMap<String, String>());
            } else {
                retriever.setDataSource(videoPath);
            }

            Bitmap bitmap = retriever.getFrameAtTime();
            String time = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION);

            Map<String, Object> map = new HashMap<>();
            map.put("bitmap", bitmap);
            map.put("time", time);
            return map;
        } finally {
            if (retriever != null) {
                retriever.release();
            }
        }
    }
}
