importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyD8o6MZn_bVC5AwljMfYpVMhDKV0IMEUwU",
  authDomain: "successful-academy-offic-74120.firebaseapp.com",
  projectId: "successful-academy-offic-74120",
  storageBucket: "successful-academy-offic-74120.firebasestorage.app",
  messagingSenderId: "461090970133",
  appId: "1:461090970133:web:bc4096d195d6504ddd0c1c",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "Successful Academy Official";
  const options = {
    body: payload.notification?.body || "New update uploaded.",
    icon: "/favicon.ico",
  };

  self.registration.showNotification(title, options);
});