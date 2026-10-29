importScripts(
  "https://www.gstatic.com/firebasejs/13.0.0/firebase-app-compat.js",
  "https://www.gstatic.com/firebasejs/13.0.0/firebase-messaging-compat.js",
);

const params = new URL(self.location.href).searchParams;

firebase.initializeApp({
  apiKey: params.get("apiKey"),
  projectId: params.get("projectId"),
  messagingSenderId: params.get("messagingSenderId"),
  appId: params.get("appId"),
});

const FIXED_KEYS = ["notificationId", "type", "title", "body"];
const DEFAULT_TITLE = "Solaria";
const MESSAGE_SOURCE = "solaria-push";

function extras(data) {
  const rest = {};
  for (const key of Object.keys(data)) {
    if (!FIXED_KEYS.includes(key)) rest[key] = data[key];
  }
  return rest;
}

firebase.messaging().onBackgroundMessage((payload) => {
  const data = payload.data || {};
  return self.registration.showNotification(data.title || DEFAULT_TITLE, {
    body: data.body || "",
    tag: data.notificationId || undefined,
    data: { type: data.type || "", data: extras(data), notificationId: data.notificationId || "" },
  });
});

async function openApp(target) {
  const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  const existing = windows.find((client) => new URL(client.url).origin === self.location.origin);
  if (existing) {
    await existing.focus();
    existing.postMessage({ source: MESSAGE_SOURCE, target });
    return;
  }
  const launch = new URL("/", self.location.origin);
  launch.searchParams.set("push", JSON.stringify(target));
  await self.clients.openWindow(launch.href);
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data;
  if (target && target.type) event.waitUntil(openApp(target));
});
