"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { deleteDoc, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { getToken, onMessage } from "firebase/messaging";
import { auth, db, getFirebaseMessaging } from "@/lib/firebase";

const TOKEN_COLLECTION = "notificationTokens";
const NOTIFICATION_STATUS_KEY = "successful_academy_notification_status_v1";
const FCM_TOKEN_KEY = "successful_academy_fcm_token_v1";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(NOTIFICATION_STATUS_KEY);
    setEnabled(saved === "on");

    void setupForegroundMessage();
  }, []);

  const setupForegroundMessage = async () => {
    const messaging = await getFirebaseMessaging();

    if (!messaging) return;

    onMessage(messaging, (payload) => {
      const title =
        payload.notification?.title || "Successful Academy Official";
      const body = payload.notification?.body || "New update uploaded.";

      if (Notification.permission === "granted") {
        new Notification(title, {
          body,
          icon: "/favicon.ico",
        });
      } else {
        alert(`${title}\n${body}`);
      }
    });
  };

  const makeSafeTokenId = (token: string) => {
    return token.replaceAll("/", "_");
  };

  const turnOnNotifications = async () => {
    try {
      setWorking(true);

      const user = auth.currentUser;

      if (!user) {
        alert("Pehle login karo.");
        return;
      }

      if (!("Notification" in window)) {
        alert("Is browser me notification support nahi hai.");
        return;
      }

      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        alert("Notification permission allow karna padega.");
        return;
      }

      const messaging = await getFirebaseMessaging();

      if (!messaging) {
        alert("Is browser me Firebase notification support nahi kar raha.");
        return;
      }

      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );

      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: registration,
      });

      if (!token) {
        alert("Notification token create nahi hua.");
        return;
      }

      await setDoc(doc(db, TOKEN_COLLECTION, makeSafeTokenId(token)), {
        token,
        uid: user.uid,
        email: user.email || "",
        enabled: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      localStorage.setItem(NOTIFICATION_STATUS_KEY, "on");
      localStorage.setItem(FCM_TOKEN_KEY, token);

      setEnabled(true);
      setOpen(false);

      alert("Notifications Turn On ho gaya.");
    } catch (error) {
      console.error(error);
      alert("Notification turn on nahi hua. Console me error dekho.");
    } finally {
      setWorking(false);
    }
  };

  const turnOffNotifications = async () => {
    try {
      setWorking(true);

      const savedToken = localStorage.getItem(FCM_TOKEN_KEY);

      if (savedToken) {
        await deleteDoc(doc(db, TOKEN_COLLECTION, makeSafeTokenId(savedToken)));
      }

      localStorage.setItem(NOTIFICATION_STATUS_KEY, "off");
      localStorage.removeItem(FCM_TOKEN_KEY);

      setEnabled(false);
      setOpen(false);

      alert("Notifications Turn Off ho gaya.");
    } catch (error) {
      console.error(error);
      alert("Notification turn off nahi hua. Console me error dekho.");
    } finally {
      setWorking(false);
    }
  };

  return (
    <div style={wrapStyle}>
      <button
        onClick={() => setOpen(!open)}
        style={enabled ? bellOnStyle : bellStyle}
        title="Notifications"
      >
        🔔
      </button>

      {open && (
        <div style={boxStyle}>
          <h3 style={titleStyle}>Notifications</h3>

          <p style={textStyle}>
            New upload ka message paane ke liye Turn On karo.
          </p>

          <button
            onClick={() => void turnOnNotifications()}
            disabled={working}
            style={turnOnStyle}
          >
            Turn On
          </button>

          <button
            onClick={() => void turnOffNotifications()}
            disabled={working}
            style={turnOffStyle}
          >
            Turn Off
          </button>

          <p style={statusStyle}>Status: {enabled ? "On" : "Off"}</p>
        </div>
      )}
    </div>
  );
}

const wrapStyle: CSSProperties = {
  position: "relative",
  zIndex: 999999,
};

const bellStyle: CSSProperties = {
  width: "58px",
  height: "58px",
  border: "none",
  borderRadius: "999px",
  background: "white",
  color: "#2563eb",
  fontSize: "25px",
  cursor: "pointer",
  boxShadow: "0 18px 34px rgba(15,23,42,0.16)",
};

const bellOnStyle: CSSProperties = {
  ...bellStyle,
  background: "linear-gradient(135deg,#2563eb,#7c3aed,#14b8a6)",
  color: "white",
};

const boxStyle: CSSProperties = {
  position: "absolute",
  right: 0,
  top: "70px",
  width: "285px",
  padding: "18px",
  borderRadius: "18px",
  background: "white",
  boxShadow: "0 20px 40px rgba(15,23,42,0.22)",
  border: "1px solid rgba(37,99,235,0.12)",
};

const titleStyle: CSSProperties = {
  margin: 0,
  color: "#1e3a8a",
  fontSize: "18px",
};

const textStyle: CSSProperties = {
  color: "#64748b",
  lineHeight: 1.5,
  fontWeight: "bold",
  fontSize: "13px",
};

const turnOnStyle: CSSProperties = {
  width: "100%",
  padding: "12px",
  border: "none",
  borderRadius: "12px",
  background: "#2563eb",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
  marginTop: "8px",
};

const turnOffStyle: CSSProperties = {
  ...turnOnStyle,
  background: "#ef4444",
};

const statusStyle: CSSProperties = {
  marginBottom: 0,
  color: "#1e3a8a",
  fontWeight: "bold",
  fontSize: "13px",
};