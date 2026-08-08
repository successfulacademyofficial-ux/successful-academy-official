import { auth } from "@/lib/firebase";

type SendNotificationInput = {
  title: string;
  body: string;
  url?: string;
};

export async function sendNotificationToStudents({
  title,
  body,
  url = "/",
}: SendNotificationInput) {
  const user = auth.currentUser;

  if (!user) {
    console.warn("Notification not sent: admin not logged in");
    return;
  }

  const idToken = await user.getIdToken();

  const response = await fetch("/api/send-notification", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      title,
      body,
      url,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    console.error("Notification failed:", result);
    return;
  }

  console.log("Notification sent:", result);
}