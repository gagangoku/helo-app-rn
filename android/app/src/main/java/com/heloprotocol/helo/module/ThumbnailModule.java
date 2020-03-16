package com.heloprotocol.helo.module;

import android.graphics.Bitmap;
import android.media.MediaMetadataRetriever;
import android.os.AsyncTask;
import android.os.Build;
import android.util.Base64;
import android.util.Log;
import android.widget.Toast;
import com.facebook.react.bridge.*;

import java.io.ByteArrayOutputStream;
import java.util.HashMap;
import java.util.Map;


public class ThumbnailModule extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;
    private static final String TAG = "ReactNative.ThumbnailModule";

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
        return constants;
    }

    @ReactMethod
    public void show(String message, int duration) {
        Toast.makeText(getReactApplicationContext(), message, duration).show();
    }

    @ReactMethod
    public void createVideoThumbnail(String filePath, int maxWidth, int maxHeight, int quality, Promise promise) {
        Log.i(TAG, "createVideoThumbnail started");
        AsyncTask asyncTask = new ThumbnailTask(filePath, maxWidth, maxHeight, quality, promise);
        asyncTask.execute(new String[] {});
        Log.i(TAG, "createVideoThumbnail finished");
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

    private class ThumbnailTask extends AsyncTask<String, String, String> {
        private String filePath;
        private int maxWidth;
        private int maxHeight;
        private int quality;
        private Promise promise;
        public ThumbnailTask(String filePath, int maxWidth, int maxHeight, int quality, Promise promise) {
            super();
            this.filePath = filePath;
            this.maxWidth = maxWidth;
            this.maxHeight = maxHeight;
            this.quality = quality;
            this.promise = promise;
        }

        @Override
        protected void onPreExecute() {
            super.onPreExecute();
        }

        @Override
        protected String doInBackground(String... x) {
            Log.i(TAG, "createVideoThumbnail doInBackground");
            createThumbnail(this.filePath, this.maxWidth, this.maxHeight, this.quality, this.promise);
            return "";
        }

        @Override
        protected void onPostExecute(String bitmap) {
            super.onPostExecute(bitmap);
        }

        public void createThumbnail(String filePath, int maxWidth, int maxHeight, int quality, Promise promise) {
            Log.i(TAG, "createThumbnail started");
            Bitmap bitmap;
            String time;
            try {
                Map<String, Object> map = ThumbnailModule.retriveVideoFrameFromVideo(filePath);
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
            Log.i(TAG, "createThumbnail finished");
        }
    }
}
