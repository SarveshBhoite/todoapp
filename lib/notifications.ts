import * as Notifications from "expo-notifications";

// ===================================================
// 🔔 GLOBAL HANDLER (Required in latest Expo SDK)
// ===================================================
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true, // required
    shouldShowList: true,   // required
  }),
});

// ===================================================
// ASK PERMISSION
// ===================================================
export async function requestNotifyPermission() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

// ===================================================
// 🔥 INSTANT NOTIFICATION
// ===================================================
export async function sendInstantNotification(title: string, body: string) {
  if (!(await requestNotifyPermission())) return;

  return Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: null // fires immediately
  });
}

// ===================================================
// ⏰ SCHEDULE USING DATE (WORKING FIXED VERSION)
// ===================================================
export async function scheduleReminder(date: Date, title: string, body: string) {
  if (!(await requestNotifyPermission())) return;

  return Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE, // FIX ⚡
      date,   // Date object supported
    },
  });
}

// ===================================================
// OPTIONAL: REPEATING DAILY AT SPECIFIC TIME
// ===================================================
export async function dailyReminder(hour: number, minute: number, title: string, body: string) {
  return Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY, // FIX ⚡
      hour,
      minute,
    },
  });
}
