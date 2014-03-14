package net.pella.cater;

import android.content.Context;
import android.hardware.Camera;
import android.view.SurfaceHolder;
import android.view.SurfaceView;

import java.io.IOException;

/**
 * Created by sli on 1/2/14.
 */
public class CameraPreview extends SurfaceView implements SurfaceHolder.Callback {
    private SurfaceHolder mHolder;
    Camera cam;
    Camera.PreviewCallback previewCallback;
    Camera.AutoFocusCallback autoFocusCallback;
    public CameraPreview(Context context, Camera camera, Camera.PreviewCallback pCB, Camera.AutoFocusCallback aCB) {
        super(context);
        cam = camera;
        previewCallback = pCB;
        autoFocusCallback = aCB;
        mHolder = getHolder();
        mHolder.addCallback(this);
    }

    @Override
    public void surfaceCreated(SurfaceHolder holder) {
        try{
            cam.setPreviewDisplay(holder);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void surfaceChanged(SurfaceHolder holder, int format, int width, int height) {
        if(mHolder.getSurface()==null){
            return  ;
        }

        try{
            cam.stopPreview();
        }catch (Exception e){
            e.printStackTrace();
        }

        try{
            cam.setDisplayOrientation(90);
            cam.setPreviewDisplay(mHolder);
            cam.setPreviewCallback(previewCallback);
            cam.startPreview();
            cam.autoFocus(autoFocusCallback);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void surfaceDestroyed(SurfaceHolder holder) {

    }
}
