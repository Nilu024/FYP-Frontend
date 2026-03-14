import { notificationsAPI } from "./api";

const ENABLE_PUSH = import.meta.env.VITE_ENABLE_PUSH_NOTIFICATIONS === "true";

/**
 * Register service worker and subscribe to push notifications
 */
export const registerPushNotifications = async (): Promise<boolean> => {
  if (!ENABLE_PUSH) return false;
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("Push notifications not supported in this browser.");
    return false;
  }

  try {
    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Push notification permission denied.");
      return false;
    }

    // Register service worker
    const registration = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;

    // Get VAPID public key from backend
    const { data } = await notificationsAPI.getVapidKey();
    const vapidPublicKey = data.publicKey;

    // Subscribe
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    // Send subscription to backend
    await notificationsAPI.subscribe(subscription.toJSON());
    console.log("✅ Push notifications enabled");
    return true;
  } catch (err) {
    console.error("Push registration failed:", err);
    return false;
  }
};

/**
 * Unsubscribe from push notifications
 */
export const unregisterPushNotifications = async (): Promise<void> => {
  if (!("serviceWorker" in navigator)) return;

  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) return;

  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return;

  await notificationsAPI.unsubscribe(subscription.endpoint);
  await subscription.unsubscribe();
  console.log("Push notifications disabled.");
};

/**
 * Check if push is currently subscribed
 */
export const isPushSubscribed = async (): Promise<boolean> => {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;
  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) return false;
  const sub = await registration.pushManager.getSubscription();
  return !!sub;
};

// Helper: convert VAPID key
const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
};
