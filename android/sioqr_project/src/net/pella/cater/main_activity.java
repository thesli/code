package net.pella.cater;

import android.app.Activity;
import android.content.Entity;
import android.content.pm.ActivityInfo;
import android.os.Bundle;
import android.os.StrictMode;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.TextView;
import android.hardware.Camera;

import net.sourceforge.zbar.*;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.protocol.HTTP;
import org.apache.http.util.EntityUtils;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.List;

public class main_activity extends Activity {
    Camera cam;
    FrameLayout frameLayout;
    Button scanTextBtn;
    TextView scanText;
    boolean barcodeScanned;
    boolean previewing;
    ImageScanner imageScanner;
    CameraPreview cameraPreview;
    Camera.PreviewCallback previewCallback;
    Camera.AutoFocusCallback autoFocusCallback;
    HttpClient httpClient;
    HttpPost httpPost;
    static {
        System.loadLibrary("iconv");
    }

    public void initFields(){
        cam = getFrontFacingCameraInstance();
        frameLayout = (FrameLayout) findViewById(R.id.frontCamFrame);
        scanTextBtn = (Button) findViewById(R.id.scanTextBtn);
        scanText = (TextView) findViewById(R.id.scanText);
        barcodeScanned = false;
        imageScanner = new ImageScanner();
        previewing = false;
        httpClient = new DefaultHttpClient();
        httpPost = new HttpPost("http://192.168.1.103:3000/post");
        imageScanner.setConfig(0,Config.X_DENSITY,3);
        imageScanner.setConfig(0,Config.Y_DENSITY,3);
        previewCallback = new Camera.PreviewCallback() {
            @Override
            public void onPreviewFrame(byte[] data, Camera camera) {
               Camera.Parameters parameters = camera.getParameters();
                Camera.Size size = parameters.getPreviewSize();
                Image barcode = new Image(size.width,size.height,"Y800");
                barcode.setData(data);
                int result = imageScanner.scanImage(barcode);
                if(result!=0){
                    previewing = false;
                    cam.setPreviewCallback(null);
                    cam.stopPreview();
                    SymbolSet symbolSet = imageScanner.getResults();
                    for(Symbol symbol :symbolSet){
                        scanText.setText("barcode result: " + symbol.getData());
                        barcodeScanned = true;
                    }
                }
            }
        };
        autoFocusCallback = null;
        cameraPreview = new CameraPreview(getApplicationContext(),cam,previewCallback,autoFocusCallback);
        frameLayout.addView(cameraPreview);
        scanTextBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                sendPostRequest("hello world");
                if(barcodeScanned){
                    barcodeScanned = false;
                    scanText.setText("scanning...");
                    cam.setPreviewCallback(previewCallback);
                    cam.startPreview();
                    previewing = true;
                    cam.autoFocus(autoFocusCallback);
                }
            }
        });
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
        super.onCreate(savedInstanceState);
        setContentView(R.layout.main);
        StrictMode.ThreadPolicy policy = new StrictMode.ThreadPolicy.Builder().permitAll().build();
        StrictMode.setThreadPolicy(policy);
        initFields();
    }

    public static Camera getFrontFacingCameraInstance() {
        Camera c = null;
        int numCams = Camera.getNumberOfCameras();
        int foundId = -1;
        for (int camId = 0; camId < numCams; camId++) {
            Camera.CameraInfo info = new Camera.CameraInfo();
            Camera.getCameraInfo(camId, info);
            if (info.facing == Camera.CameraInfo.CAMERA_FACING_FRONT) {
                foundId = camId;
                break;
            }
        }
        try {
            c = Camera.open(foundId);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return c;
    }

    public void sendPostRequest(String val){
        List<NameValuePair> nameValuePairs = new ArrayList<NameValuePair>(2);
        nameValuePairs.add(new BasicNameValuePair("request_id",val));
        nameValuePairs.add(new BasicNameValuePair("Token","someRandomSercet"));
        try {
            httpPost.setEntity(new UrlEncodedFormEntity(nameValuePairs));
            HttpResponse httpResponse = httpClient.execute(httpPost);
            String response = EntityUtils.toString(httpResponse.getEntity());
            Log.d("DEBUG_TAG", response);
            scanText.setText(response);
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        } catch (ClientProtocolException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
