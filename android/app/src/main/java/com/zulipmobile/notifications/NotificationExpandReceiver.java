package com.zulipmobile.notifications;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class NotificationExpandReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        // Code to expand the notification view
        // This can include launching an activity or fragment that shows detailed notifications
        Intent notificationIntent = new Intent(context, NotificationDetailsActivity.class);
        notificationIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        context.startActivity(notificationIntent);
    }
}

Ensure to register the receiver in the AndroidManifest.xml:

<receiver android:name=".notifications.NotificationExpandReceiver"/>

