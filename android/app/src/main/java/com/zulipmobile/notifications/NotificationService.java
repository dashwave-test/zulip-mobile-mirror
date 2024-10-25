package com.zulipmobile.notifications;

import android.app.Notification;
import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.os.IBinder;
import androidx.annotation.Nullable;
import androidx.core.app.JobIntentService;

public class NotificationService extends JobIntentService {

    private static final int NOTIFICATION_ID = 1;

    @Override
    protected void onHandleWork(@Nullable Intent intent) {
        if (intent != null) {
            String title = intent.getStringExtra("title");
            String summary = intent.getStringExtra("summary");
            String[] topics = intent.getStringArrayExtra("topics");

            Notification notification = NotificationHelper.buildExpandableNotification(this, title, summary, topics);

            NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            notificationManager.notify(NOTIFICATION_ID, notification);
        }
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}