package net.pella.cater;

import android.app.Service;
import android.content.Intent;
import android.os.Handler;
import android.os.IBinder;
import android.util.Log;
import com.koushikdutta.*;
import com.koushikdutta.async.http.socketio.*;
import org.json.JSONException;
import org.json.JSONObject;

import java.net.Socket;
import java.net.SocketException;

/**
 * Created by sli on 1/2/14.
 */
public class SocketIOService extends Service {

    public IBinder onBind(Intent intent) {
        SocketIOClient.connect("http://192.168.1.103:8888", new ConnectCallback() {
            @Override
            public void onConnectCompleted(Exception e, SocketIOClient client) {

                if (e != null) {
                    e.printStackTrace();
                    return;
                }

                JSONObject handshake = new JSONObject();

                try {
                    handshake.put("hello", "world");
                    handshake.put("fuck","you");
                } catch (JSONException e1) {
                    e1.printStackTrace();
                }

                client.emit(handshake);

                client.setDisconnectCallback(new DisconnectCallback() {
                    @Override
                    public void onDisconnect(Exception e) {

                    }
                });

                client.setErrorCallback(new ErrorCallback() {
                    @Override
                    public void onError(String s) {

                    }
                });

                client.setJSONCallback(new JSONCallback() {
                    @Override
                    public void onJSON(JSONObject jsonObject, Acknowledge acknowledge) {

                    }
                });

                client.setReconnectCallback(new ReconnectCallback() {
                    @Override
                    public void onReconnect() {

                    }
                });
            }
        }, new Handler());
        return null;
    }

}