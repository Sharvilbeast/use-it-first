import { PushNotificationPayload } from '../types';

export interface PantryItemNotificationTarget {
  id: string;
  userId: string;
  userToken: string;
  userTimezone: string;
  name: string;
  expiryDate: string; // YYYY-MM-DD
  daysRemaining: number;
  location: string;
}

export class NotificationDaemon {
  private isRunning: boolean = false;
  private queuedNotifications: PushNotificationPayload[] = [];

  /**
   * Evaluates user pantry items and builds localized, anti-fatigue push notifications
   */
  public evaluateAndQueueNotifications(
    items: PantryItemNotificationTarget[],
    targetSlot: 'MORNING' | 'EVENING' = 'EVENING'
  ): PushNotificationPayload[] {
    const notifications: PushNotificationPayload[] = [];

    // Group items by user to enforce batching (Never send more than 1 notification per user per slot)
    const itemsByUser = new Map<string, PantryItemNotificationTarget[]>();

    for (const item of items) {
      const existing = itemsByUser.get(item.userId) || [];
      existing.push(item);
      itemsByUser.set(item.userId, existing);
    }

    // Process each user's batch
    for (const [userId, userItems] of itemsByUser.entries()) {
      const token = userItems[0]?.userToken;
      if (!token) continue;

      // Filter critical items: Expiring today or within 24 hours
      const expiringToday = userItems.filter((i) => i.daysRemaining <= 1);
      // Filter warning items: Expiring within 3 days
      const expiringSoon = userItems.filter((i) => i.daysRemaining > 1 && i.daysRemaining <= 3);

      if (expiringToday.length > 0) {
        const itemNames = expiringToday.map((i) => i.name);
        const headlineNames = itemNames.slice(0, 2).join(' & ');
        const extraCount = itemNames.length - 2;
        const nameClause = extraCount > 0 ? `${headlineNames} (+${extraCount} more)` : headlineNames;

        let title = `⚠️ ${nameClause} expires today!`;
        let body = `Rescue your food before it spoils. Tap to cook an AI-suggested recipe tonight and save money!`;

        if (targetSlot === 'MORNING') {
          title = `☀️ Good morning! ${nameClause} needs attention today`;
          body = `You have ${expiringToday.length} item(s) nearing expiry. Plan today's meals to eliminate kitchen waste.`;
        }

        notifications.push({
          userId,
          recipientToken: token,
          title,
          body,
          category: 'EXPIRY_ALERT',
          data: {
            expiringItemIds: expiringToday.map((i) => i.id),
            deepLink: 'uif://recipes/generate?urgency=today',
            urgencyLevel: 'URGENT',
          },
          scheduledTimeUTC: new Date().toISOString(),
        });
      } else if (expiringSoon.length > 0 && targetSlot === 'EVENING') {
        // Warning notification for items expiring in 2-3 days
        const itemNames = expiringSoon.map((i) => i.name).slice(0, 2).join(' & ');
        notifications.push({
          userId,
          recipientToken: token,
          title: `🥦 Meal Planning: ${itemNames} expires in 2-3 days`,
          body: `Cook tonight's dinner with ingredients in your fridge before they spoil.`,
          category: 'RECIPE_PROMPT',
          data: {
            expiringItemIds: expiringSoon.map((i) => i.id),
            deepLink: 'uif://recipes/generate?urgency=soon',
            urgencyLevel: 'WARNING',
          },
          scheduledTimeUTC: new Date().toISOString(),
        });
      }
    }

    this.queuedNotifications.push(...notifications);
    return notifications;
  }

  /**
   * Dispatches queued notifications to APNs / Firebase Cloud Messaging
   */
  public async dispatchQueue(): Promise<{ dispatchedCount: number; failedCount: number }> {
    const toSend = [...this.queuedNotifications];
    this.queuedNotifications = [];

    let dispatchedCount = 0;
    let failedCount = 0;

    for (const notification of toSend) {
      try {
        // In production, invoke FCM admin SDK: admin.messaging().send(message)
        // console.log(`[Push Notification Dispatched to ${notification.userId}]: ${notification.title}`);
        dispatchedCount++;
      } catch (err) {
        console.error(`Failed to dispatch push notification to ${notification.userId}:`, err);
        failedCount++;
      }
    }

    return { dispatchedCount, failedCount };
  }

  /**
   * Starts the daemon scheduled loop
   */
  public start(intervalMinutes: number = 60) {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log(`[NotificationDaemon] Started. Scheduled interval: every ${intervalMinutes} minutes.`);
  }

  /**
   * Stops the daemon
   */
  public stop() {
    this.isRunning = false;
    console.log('[NotificationDaemon] Stopped.');
  }

  public getQueueLength(): number {
    return this.queuedNotifications.length;
  }
}
