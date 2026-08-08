"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAppLanguage } from "@/hooks/useAppLanguage";
import {
  LANGUAGE_STORAGE_KEY,
  languageOptions,
  type AppLanguage,
} from "@/lib/appLanguages";

const ADMIN_EMAIL = "successfulacademyofficial@gmail.com";

type UserProfile = {
  name: string;
  email: string;
  phone: string;
};

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  createdAt?: any;
};

type SupportMessage = {
  id: string;
  uid: string;
  email: string;
  message: string;
  reply?: string;
  status?: string;
  createdAt?: any;
  repliedAt?: any;
};

const text = {
  en: {
    loading: "Loading Settings...",
    back: "Back to Home",
    title: "Settings Control Hub",
    subtitle:
      "Manage your account, language, notifications and support.",
    adminMode: "Admin Mode",
    studentMode: "Student Mode",
    account: "Student Details",
    name: "Student Name",
    email: "Email",
    phone: "Phone Number",
    accountType: "Account Type",
    preferences: "App Preferences",
    language: "App Language",
    saveProfile: "Save Profile",
    previousPapers: "Previous Year Papers",
    notifications: "Notification Center",
    addNotification: "Add Notification",
    notificationTitle: "Notification title",
    notificationMessage: "Notification message",
    sendNotification: "Send Notification",
    noNotifications: "No notification added yet.",
    contactSupport: "Contact Support",
    supportPlaceholder: "Write your problem or question...",
    sendMessage: "Send Message",
    noSupport: "No support message yet.",
    adminReply: "Admin Reply",
    replyPlaceholder: "Write reply...",
    sendReply: "Send Reply",
    delete: "Delete",
    signOut: "Sign Out",
    saved: "Saved successfully.",
    messageSent: "Message sent successfully.",
    notificationSent: "Notification sent.",
  },
  hi: {
    loading: "Settings लोड हो रहा है...",
    back: "होम पर वापस जाएं",
    title: "Settings Control Hub",
    subtitle:
      "Account, language, notifications और support manage करें.",
    adminMode: "एडमिन मोड",
    studentMode: "स्टूडेंट मोड",
    account: "Student Details",
    name: "Student Name",
    email: "Email",
    phone: "Phone Number",
    accountType: "Account Type",
    preferences: "App Preferences",
    language: "App Language",
    saveProfile: "Profile Save करें",
    previousPapers: "Previous Year Papers",
    notifications: "Notification Center",
    addNotification: "Notification जोड़ें",
    notificationTitle: "Notification title",
    notificationMessage: "Notification message",
    sendNotification: "Notification भेजें",
    noNotifications: "अभी कोई notification नहीं है।",
    contactSupport: "Contact Support",
    supportPlaceholder: "अपनी problem या question लिखें...",
    sendMessage: "Message भेजें",
    noSupport: "अभी कोई support message नहीं है।",
    adminReply: "Admin Reply",
    replyPlaceholder: "Reply लिखें...",
    sendReply: "Reply भेजें",
    delete: "Delete",
    signOut: "Sign Out",
    saved: "Successfully save हो गया.",
    messageSent: "Message भेज दिया गया.",
    notificationSent: "Notification भेज दिया गया.",
  },
  bn: {
    loading: "Settings লোড হচ্ছে...",
    back: "হোমে ফিরে যান",
    title: "Settings Control Hub",
    subtitle:
      "Account, language, notifications এবং support manage করুন.",
    adminMode: "অ্যাডমিন মোড",
    studentMode: "স্টুডেন্ট মোড",
    account: "Student Details",
    name: "Student Name",
    email: "Email",
    phone: "Phone Number",
    accountType: "Account Type",
    preferences: "App Preferences",
    language: "App Language",
    saveProfile: "Profile Save করুন",
    previousPapers: "Previous Year Papers",
    notifications: "Notification Center",
    addNotification: "Notification যোগ করুন",
    notificationTitle: "Notification title",
    notificationMessage: "Notification message",
    sendNotification: "Notification পাঠান",
    noNotifications: "এখনো কোনো notification নেই।",
    contactSupport: "Contact Support",
    supportPlaceholder: "আপনার problem বা question লিখুন...",
    sendMessage: "Message পাঠান",
    noSupport: "এখনো কোনো support message নেই।",
    adminReply: "Admin Reply",
    replyPlaceholder: "Reply লিখুন...",
    sendReply: "Reply পাঠান",
    delete: "Delete",
    signOut: "Sign Out",
    saved: "Successfully save হয়েছে.",
    messageSent: "Message পাঠানো হয়েছে.",
    notificationSent: "Notification পাঠানো হয়েছে.",
  },
};

export default function SettingsPage() {
  const router = useRouter();
  const language = useAppLanguage();
  const t = text[language];

  const [checkingUser, setCheckingUser] = useState(true);
  const [uid, setUid] = useState("");
  const [email, setEmail] = useState("");

  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    phone: "",
  });

  const [selectedLanguage, setSelectedLanguage] = useState<AppLanguage>("en");

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);

  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");

  const [supportText, setSupportText] = useState("");
  const [replyText, setReplyText] = useState<Record<string, string>>({});

  const isAdmin = email.trim().toLowerCase() === ADMIN_EMAIL;

  useEffect(() => {
    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);

    if (
      savedLanguage === "en" ||
      savedLanguage === "hi" ||
      savedLanguage === "bn"
    ) {
      setSelectedLanguage(savedLanguage);
    }

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      setUid(user.uid);
      setEmail(user.email || "");

      await loadUserProfile(user.uid, user.email || "");

      setCheckingUser(false);
    });

    return () => unsubscribeAuth();
  }, [router]);

  useEffect(() => {
    if (!uid) return;

    const notificationQuery = query(
      collection(db, "notifications"),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const unsubscribeNotifications = onSnapshot(
      notificationQuery,
      (snapshot) => {
        const items: NotificationItem[] = snapshot.docs.map((item) => ({
          id: item.id,
          ...(item.data() as Omit<NotificationItem, "id">),
        }));

        setNotifications(items);
      },
      () => {
        setNotifications([]);
      }
    );

    const supportQuery = query(
      collection(db, "supportMessages"),
      orderBy("createdAt", "desc"),
      limit(80)
    );

    const unsubscribeSupport = onSnapshot(
      supportQuery,
      (snapshot) => {
        const items: SupportMessage[] = snapshot.docs.map((item) => ({
          id: item.id,
          ...(item.data() as Omit<SupportMessage, "id">),
        }));

        if (isAdmin) {
          setSupportMessages(items);
        } else {
          setSupportMessages(items.filter((item) => item.uid === uid));
        }
      },
      () => {
        setSupportMessages([]);
      }
    );

    return () => {
      unsubscribeNotifications();
      unsubscribeSupport();
    };
  }, [uid, isAdmin]);

  const extractProfileFromData = (
    data: any,
    userEmail: string
  ): UserProfile => {
    return {
      name:
        String(
          data.name ||
            data.fullName ||
            data.userName ||
            data.username ||
            data.studentName ||
            data.displayName ||
            ""
        ).trim() || auth.currentUser?.displayName || "",
      email: userEmail,
      phone: String(
        data.phone ||
          data.mobile ||
          data.mobileNumber ||
          data.phoneNumber ||
          data.contactNumber ||
          ""
      ).trim(),
    };
  };

  const loadUserProfile = async (userId: string, userEmail: string) => {
    const cleanEmail = userEmail.trim().toLowerCase();

    const fallbackProfile: UserProfile = {
      name: auth.currentUser?.displayName || "",
      email: userEmail,
      phone: "",
    };

    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setProfile(extractProfileFromData(userSnap.data(), userEmail));
        return;
      }

      const emailLowerQuery = query(
        collection(db, "users"),
        where("emailLower", "==", cleanEmail),
        limit(1)
      );

      const emailLowerSnap = await getDocs(emailLowerQuery);

      if (!emailLowerSnap.empty) {
        setProfile(
          extractProfileFromData(emailLowerSnap.docs[0].data(), userEmail)
        );
        return;
      }

      const emailQuery = query(
        collection(db, "users"),
        where("email", "==", cleanEmail),
        limit(1)
      );

      const emailSnap = await getDocs(emailQuery);

      if (!emailSnap.empty) {
        setProfile(extractProfileFromData(emailSnap.docs[0].data(), userEmail));
        return;
      }

      const originalEmailQuery = query(
        collection(db, "users"),
        where("email", "==", userEmail),
        limit(1)
      );

      const originalEmailSnap = await getDocs(originalEmailQuery);

      if (!originalEmailSnap.empty) {
        setProfile(
          extractProfileFromData(originalEmailSnap.docs[0].data(), userEmail)
        );
        return;
      }

      setProfile(fallbackProfile);
    } catch {
      setProfile(fallbackProfile);
    }
  };

  const updateProfile = (field: keyof UserProfile, value: string) => {
    setProfile({
      ...profile,
      [field]: value,
    });
  };

  const saveProfile = async () => {
    if (!uid) return;

    try {
      await setDoc(
        doc(db, "users", uid),
        {
          name: profile.name.trim(),
          fullName: profile.name.trim(),
          studentName: profile.name.trim(),
          displayName: profile.name.trim(),

          email: profile.email.trim().toLowerCase(),
          emailLower: profile.email.trim().toLowerCase(),

          phone: profile.phone.trim(),
          mobile: profile.phone.trim(),
          mobileNumber: profile.phone.trim(),
          phoneNumber: profile.phone.trim(),
          contactNumber: profile.phone.trim(),

          language: selectedLanguage,
          role: isAdmin ? "admin" : "student",
          updatedAt: serverTimestamp(),
        },
        {
          merge: true,
        }
      );

      localStorage.setItem(LANGUAGE_STORAGE_KEY, selectedLanguage);
      window.dispatchEvent(new Event("app-language-change"));

      alert(t.saved);
    } catch {
      alert("Save nahi hua. Internet/Firebase connection check karo.");
    }
  };

  const changeLanguage = (value: AppLanguage) => {
    setSelectedLanguage(value);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, value);
    window.dispatchEvent(new Event("app-language-change"));
  };

  const addNotification = async () => {
    if (!isAdmin) return;

    if (!notificationTitle.trim() || !notificationMessage.trim()) {
      alert("Notification title aur message likho.");
      return;
    }

    try {
      await addDoc(collection(db, "notifications"), {
        title: notificationTitle.trim(),
        message: notificationMessage.trim(),
        createdAt: serverTimestamp(),
      });

      setNotificationTitle("");
      setNotificationMessage("");

      alert(t.notificationSent);
    } catch {
      alert("Notification send nahi hua. Firestore connection check karo.");
    }
  };

  const deleteNotification = async (id: string) => {
    if (!isAdmin) return;
    if (!confirm("Notification delete karna hai?")) return;

    try {
      await deleteDoc(doc(db, "notifications", id));
    } catch {
      alert("Delete nahi hua.");
    }
  };

  const sendSupportMessage = async () => {
    if (!uid) return;

    if (!supportText.trim()) {
      alert("Message likho.");
      return;
    }

    try {
      await addDoc(collection(db, "supportMessages"), {
        uid,
        email,
        message: supportText.trim(),
        reply: "",
        status: "pending",
        createdAt: serverTimestamp(),
      });

      setSupportText("");
      alert(t.messageSent);
    } catch {
      alert("Message send nahi hua. Firestore connection check karo.");
    }
  };

  const sendReply = async (id: string) => {
    if (!isAdmin) return;

    const reply = replyText[id]?.trim();

    if (!reply) {
      alert("Reply likho.");
      return;
    }

    try {
      await updateDoc(doc(db, "supportMessages", id), {
        reply,
        status: "replied",
        repliedAt: serverTimestamp(),
      });

      setReplyText({
        ...replyText,
        [id]: "",
      });
    } catch {
      alert("Reply send nahi hua.");
    }
  };

  const deleteSupportMessage = async (id: string) => {
    if (!isAdmin) return;
    if (!confirm("Support message delete karna hai?")) return;

    try {
      await deleteDoc(doc(db, "supportMessages", id));
    } catch {
      alert("Delete nahi hua.");
    }
  };

  const logout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (checkingUser) {
    return <main style={loadingStyle}>{t.loading}</main>;
  }

  return (
    <main className="settings-page" style={mainStyle}>
      <style>{settingsCss}</style>

      <div className="settings-grid-bg" />
      <div className="settings-orb settings-orb-one" />
      <div className="settings-orb settings-orb-two" />
      <div className="settings-orb settings-orb-three" />

      <Link href="/" style={backLinkStyle}>
        ← {t.back}
      </Link>

      <section className="settings-hero" style={heroStyle}>
        <div className="settings-gear settings-gear-one">⚙️</div>
        <div className="settings-gear settings-gear-two">🛡️</div>
        <div className="settings-chip">CONTROL</div>

        <p style={brandStyle}>Successful Academy Official</p>

        <h1 style={heroTitleStyle}>{t.title}</h1>

        <p style={heroTextStyle}>{t.subtitle}</p>

        <div style={modeBadgeStyle}>
          {isAdmin ? t.adminMode : t.studentMode}
        </div>
      </section>

      <section className="settings-card" style={cardStyle}>
        <div className="settings-card-icon">👤</div>

        <h2 style={sectionTitleStyle}>{t.account}</h2>

        <label style={labelStyle}>{t.name}</label>
        <input
          value={profile.name}
          onChange={(e) => updateProfile("name", e.target.value)}
          placeholder={t.name}
          style={inputStyle}
        />

        <label style={labelStyle}>{t.email}</label>
        <input value={profile.email} readOnly style={readOnlyInputStyle} />

        <label style={labelStyle}>{t.phone}</label>
        <input
          value={profile.phone}
          onChange={(e) => updateProfile("phone", e.target.value)}
          placeholder={t.phone}
          style={inputStyle}
        />

        <label style={labelStyle}>{t.accountType}</label>
        <input
          value={isAdmin ? t.adminMode : t.studentMode}
          readOnly
          style={readOnlyInputStyle}
        />
      </section>

      <section className="settings-card preferences-card" style={cardStyle}>
        <div className="settings-card-icon">🎛️</div>

        <h2 style={sectionTitleStyle}>{t.preferences}</h2>

        <label style={labelStyle}>{t.language}</label>
        <select
          value={selectedLanguage}
          onChange={(e) => changeLanguage(e.target.value as AppLanguage)}
          style={inputStyle}
        >
          {languageOptions.map((item) => (
            <option key={item.code} value={item.code}>
              {item.label}
            </option>
          ))}
        </select>

        <button
          onClick={saveProfile}
          className="settings-main-btn"
          style={mainButtonStyle}
        >
          💾 {t.saveProfile}
        </button>
      </section>

      <section className="quick-action-grid" style={quickGridStyle}>
        <Link
          href="/previous-papers"
          className="quick-card"
          style={quickCardOneStyle}
        >
          <span className="quick-emoji">📚</span>
          <strong>{t.previousPapers}</strong>
          <span>Open →</span>
        </Link>

        {isAdmin && (
          <Link
            href="/knowledge-base"
            className="quick-card"
            style={quickCardOneStyle}
          >
            <span className="quick-emoji">🧠</span>
            <strong>AI Knowledge Box</strong>
            <span>Admin Only →</span>
          </Link>
        )}

        <Link href="/about" className="quick-card" style={quickCardOneStyle}>
          <span className="quick-emoji">ℹ️</span>
          <strong>About Us</strong>
          <span>Open →</span>
        </Link>

        <Link href="/contact" className="quick-card" style={quickCardTwoStyle}>
          <span className="quick-emoji">📩</span>
          <strong>Contact Us</strong>
          <span>Open →</span>
        </Link>

        <Link href="/privacy-policy" className="quick-card" style={quickCardOneStyle}>
          <span className="quick-emoji">🔒</span>
          <strong>Privacy Policy</strong>
          <span>Open →</span>
        </Link>

        <Link
          href="/terms-and-conditions"
          className="quick-card"
          style={quickCardTwoStyle}
        >
          <span className="quick-emoji">📜</span>
          <strong>Terms and Conditions</strong>
          <span>Open →</span>
        </Link>
      </section>

      <section className="settings-card notification-card" style={cardStyle}>
        <div className="settings-card-icon">🔔</div>

        <h2 style={sectionTitleStyle}>{t.notifications}</h2>

        {isAdmin && (
          <div style={adminBoxStyle}>
            <h3 style={{ color: "#7c3aed", marginTop: 0 }}>
              ➕ {t.addNotification}
            </h3>

            <input
              value={notificationTitle}
              onChange={(e) => setNotificationTitle(e.target.value)}
              placeholder={t.notificationTitle}
              style={inputStyle}
            />

            <textarea
              value={notificationMessage}
              onChange={(e) => setNotificationMessage(e.target.value)}
              placeholder={t.notificationMessage}
              style={textAreaStyle}
            />

            <button
              onClick={addNotification}
              className="settings-main-btn"
              style={mainButtonStyle}
            >
              {t.sendNotification}
            </button>
          </div>
        )}

        {notifications.length === 0 && (
          <div style={emptyBoxStyle}>{t.noNotifications}</div>
        )}

        <div style={{ display: "grid", gap: "12px", marginTop: "14px" }}>
          {notifications.map((item) => (
            <div key={item.id} className="notice-item" style={noticeItemStyle}>
              <h3 style={{ margin: 0, color: "#7c3aed" }}>📢 {item.title}</h3>

              <p style={{ color: "#475569", lineHeight: 1.6 }}>
                {item.message}
              </p>

              <p style={dateTextStyle}>{formatDate(item.createdAt)}</p>

              {isAdmin && (
                <button
                  onClick={() => deleteNotification(item.id)}
                  style={dangerButtonStyle}
                >
                  {t.delete}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="settings-card support-card" style={cardStyle}>
        <div className="settings-card-icon">💬</div>

        <h2 style={sectionTitleStyle}>{t.contactSupport}</h2>

        {!isAdmin && (
          <>
            <textarea
              value={supportText}
              onChange={(e) => setSupportText(e.target.value)}
              placeholder={t.supportPlaceholder}
              style={textAreaStyle}
            />

            <button
              onClick={sendSupportMessage}
              className="settings-main-btn"
              style={mainButtonStyle}
            >
              {t.sendMessage}
            </button>
          </>
        )}

        {supportMessages.length === 0 && (
          <div style={emptyBoxStyle}>{t.noSupport}</div>
        )}

        <div style={{ display: "grid", gap: "12px", marginTop: "14px" }}>
          {supportMessages.map((item) => (
            <div
              key={item.id}
              className="support-message"
              style={supportItemStyle}
            >
              <p style={supportEmailStyle}>{item.email}</p>

              <p style={{ color: "#475569", lineHeight: 1.6 }}>
                {item.message}
              </p>

              <p style={dateTextStyle}>{formatDate(item.createdAt)}</p>

              {item.reply && (
                <div style={replyBoxStyle}>
                  <strong style={{ color: "#0f766e" }}>{t.adminReply}</strong>

                  <p style={{ color: "#475569", lineHeight: 1.6 }}>
                    {item.reply}
                  </p>
                </div>
              )}

              {isAdmin && (
                <>
                  <textarea
                    value={replyText[item.id] || ""}
                    onChange={(e) =>
                      setReplyText({
                        ...replyText,
                        [item.id]: e.target.value,
                      })
                    }
                    placeholder={t.replyPlaceholder}
                    style={textAreaStyle}
                  />

                  <div style={buttonRowStyle}>
                    <button
                      onClick={() => sendReply(item.id)}
                      style={smallGreenButtonStyle}
                    >
                      {t.sendReply}
                    </button>

                    <button
                      onClick={() => deleteSupportMessage(item.id)}
                      style={dangerButtonStyle}
                    >
                      {t.delete}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      <button onClick={logout} className="logout-btn" style={logoutButtonStyle}>
        🚪 {t.signOut}
      </button>
    </main>
  );
}

function formatDate(value: any) {
  try {
    if (!value) return "";

    const date =
      typeof value.toDate === "function" ? value.toDate() : new Date(value);

    return date.toLocaleString();
  } catch {
    return "";
  }
}

const settingsCss = `
  .settings-page {
    position: relative;
    overflow-x: hidden;
    isolation: isolate;
  }

  .settings-grid-bg {
    position: fixed;
    inset: 0;
    z-index: -5;
    background:
      linear-gradient(120deg, rgba(124,58,237,0.10) 0 2px, transparent 2px 74px),
      linear-gradient(60deg, rgba(20,184,166,0.09) 0 2px, transparent 2px 86px),
      linear-gradient(30deg, rgba(251,113,133,0.08) 0 2px, transparent 2px 96px);
    background-size: 110px 110px;
    animation: settingsGridMove 11s linear infinite;
    pointer-events: none;
  }

  .settings-orb {
    position: fixed;
    border-radius: 50%;
    filter: blur(26px);
    z-index: -4;
    pointer-events: none;
  }

  .settings-orb-one {
    width: 270px;
    height: 270px;
    right: -95px;
    top: 110px;
    background: rgba(124,58,237,0.20);
    animation: settingsOrbOne 7s ease-in-out infinite;
  }

  .settings-orb-two {
    width: 250px;
    height: 250px;
    left: -95px;
    bottom: 120px;
    background: rgba(20,184,166,0.18);
    animation: settingsOrbTwo 8s ease-in-out infinite;
  }

  .settings-orb-three {
    width: 210px;
    height: 210px;
    right: 50px;
    bottom: 175px;
    background: rgba(251,113,133,0.17);
    animation: settingsOrbThree 6.5s ease-in-out infinite;
  }

  .settings-hero {
    overflow: hidden;
    transform-style: preserve-3d;
    animation: settingsHeroFloat 5s ease-in-out infinite;
  }

  .settings-hero::before {
    content: "";
    position: absolute;
    inset: -2px;
    background:
      radial-gradient(circle at 18% 20%, rgba(255,255,255,0.72), transparent 28%),
      radial-gradient(circle at 82% 16%, rgba(167,243,208,0.55), transparent 30%),
      linear-gradient(120deg, transparent, rgba(255,255,255,0.55), transparent);
    animation: settingsHeroSweep 5s ease-in-out infinite;
    pointer-events: none;
  }

  .settings-hero::after {
    content: "";
    position: absolute;
    inset: 13px;
    border-radius: 25px;
    border: 1px solid rgba(255,255,255,0.55);
    transform: translateZ(34px);
    pointer-events: none;
  }

  .settings-gear {
    position: absolute;
    z-index: 4;
    pointer-events: none;
  }

  .settings-gear-one {
    right: 24px;
    top: 28px;
    font-size: 52px;
    animation: gearRotateOne 6s linear infinite;
    filter: drop-shadow(0 15px 22px rgba(124,58,237,0.24));
  }

  .settings-gear-two {
    right: 92px;
    bottom: 28px;
    font-size: 38px;
    animation: shieldFloat 4s ease-in-out infinite;
  }

  .settings-chip {
    position: absolute;
    right: 24px;
    top: 92px;
    z-index: 4;
    padding: 10px 14px;
    border-radius: 16px;
    color: white;
    font-weight: 900;
    letter-spacing: 1px;
    background: linear-gradient(135deg,#7c3aed,#14b8a6,#fb7185);
    box-shadow: 0 18px 30px rgba(124,58,237,0.22);
    animation: chipFloat 4.8s ease-in-out infinite;
    pointer-events: none;
  }

  .settings-card {
    position: relative;
    overflow: hidden;
    transform-style: preserve-3d;
    animation: settingsCardEnter 0.55s ease both;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }

  .settings-card:hover,
  .quick-card:hover,
  .notice-item:hover,
  .support-message:hover {
    transform: translateY(-7px) rotateX(4deg);
    box-shadow: 0 24px 42px rgba(124,58,237,0.14);
  }

  .settings-card::before {
    content: "";
    position: absolute;
    width: 210px;
    height: 210px;
    right: -90px;
    top: -90px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(124,58,237,0.16), transparent 65%);
    pointer-events: none;
  }

  .settings-card-icon {
    width: 54px;
    height: 54px;
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg,#7c3aed,#14b8a6,#fb7185);
    box-shadow: 0 15px 25px rgba(124,58,237,0.18);
    font-size: 25px;
    animation: settingsIconFloat 3.8s ease-in-out infinite;
  }

  .preferences-card .settings-card-icon {
    background: linear-gradient(135deg,#14b8a6,#38bdf8,#a78bfa);
  }

  .notification-card .settings-card-icon {
    background: linear-gradient(135deg,#fb7185,#f59e0b,#7c3aed);
  }

  .support-card .settings-card-icon {
    background: linear-gradient(135deg,#38bdf8,#14b8a6,#7c3aed);
  }

  .settings-main-btn,
  .logout-btn {
    position: relative;
    overflow: hidden;
    transform-style: preserve-3d;
    animation: settingsButtonPulse 2.8s ease-in-out infinite;
  }

  .settings-main-btn::before,
  .logout-btn::before {
    content: "";
    position: absolute;
    inset: 0;
    left: -130%;
    background: linear-gradient(120deg, transparent, rgba(255,255,255,0.65), transparent);
    animation: settingsButtonShine 3.6s ease-in-out infinite;
  }

  .quick-card {
    position: relative;
    overflow: hidden;
    transform-style: preserve-3d;
    animation: quickCardFloat 4.4s ease-in-out infinite;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }

  .quick-card::before {
    content: "";
    position: absolute;
    inset: -2px;
    background:
      radial-gradient(circle at 18% 20%, rgba(255,255,255,0.55), transparent 30%),
      linear-gradient(120deg, transparent, rgba(255,255,255,0.38), transparent);
    animation: quickShine 4.5s ease-in-out infinite;
    pointer-events: none;
  }

  .quick-emoji {
    position: relative;
    z-index: 4;
    font-size: 42px;
    animation: quickEmojiFloat 3.6s ease-in-out infinite;
  }

  .notice-item,
  .support-message {
    transform-style: preserve-3d;
    animation: settingsCardEnter 0.45s ease both;
    transition: transform 0.24s ease, box-shadow 0.24s ease;
  }

  @keyframes settingsGridMove {
    from { background-position: 0 0; }
    to { background-position: 110px 110px; }
  }

  @keyframes settingsOrbOne {
    0%, 100% { transform: translate(0,0) scale(1); }
    50% { transform: translate(-30px,26px) scale(1.15); }
  }

  @keyframes settingsOrbTwo {
    0%, 100% { transform: translate(0,0) scale(1); }
    50% { transform: translate(28px,-26px) scale(1.15); }
  }

  @keyframes settingsOrbThree {
    0%, 100% { transform: translate(0,0) scale(1); }
    50% { transform: translate(-18px,-24px) scale(1.2); }
  }

  @keyframes settingsHeroFloat {
    0%, 100% { transform: translateY(0) rotateX(0deg); }
    50% { transform: translateY(-7px) rotateX(2deg); }
  }

  @keyframes settingsHeroSweep {
    0% { transform: translateX(-60%); opacity: 0.72; }
    50% { opacity: 1; }
    100% { transform: translateX(60%); opacity: 0.72; }
  }

  @keyframes gearRotateOne {
    from { transform: rotate(0deg) translateY(0); }
    to { transform: rotate(360deg) translateY(0); }
  }

  @keyframes shieldFloat {
    0%, 100% { transform: translateY(0) rotateY(0deg); }
    50% { transform: translateY(-10px) rotateY(24deg); }
  }

  @keyframes chipFloat {
    0%, 100% { transform: translateY(0) rotateY(0deg); }
    50% { transform: translateY(-10px) rotateY(24deg); }
  }

  @keyframes settingsCardEnter {
    from { opacity: 0; transform: translateY(18px) rotateX(10deg); }
    to { opacity: 1; transform: translateY(0) rotateX(0deg); }
  }

  @keyframes settingsIconFloat {
    0%, 100% { transform: translateY(0) rotateY(0deg); }
    50% { transform: translateY(-8px) rotateY(22deg); }
  }

  @keyframes settingsButtonPulse {
    0%, 100% { transform: translateY(0); box-shadow: 0 14px 28px rgba(124,58,237,0.20); }
    50% { transform: translateY(-4px); box-shadow: 0 22px 36px rgba(20,184,166,0.22); }
  }

  @keyframes settingsButtonShine {
    0% { left: -130%; }
    50% { left: 130%; }
    100% { left: 130%; }
  }

  @keyframes quickCardFloat {
    0%, 100% { transform: translateY(0) rotateX(0deg); }
    50% { transform: translateY(-5px) rotateX(2deg); }
  }

  @keyframes quickShine {
    0% { transform: translateX(-70%); opacity: 0.7; }
    50% { opacity: 1; }
    100% { transform: translateX(70%); opacity: 0.7; }
  }

  @keyframes quickEmojiFloat {
    0%, 100% { transform: translateY(0) rotateY(0deg); }
    50% { transform: translateY(-8px) rotateY(22deg); }
  }
`;

const loadingStyle: CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#f5f3ff",
  color: "#7c3aed",
  fontSize: "22px",
  fontWeight: "bold",
};

const mainStyle: CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(180deg,#f5f3ff 0%,#ecfeff 48%,#fff1f2 100%)",
  padding: "20px",
  paddingBottom: "90px",
};

const backLinkStyle: CSSProperties = {
  position: "relative",
  zIndex: 3,
  color: "#7c3aed",
  fontWeight: "bold",
  textDecoration: "none",
};

const heroStyle: CSSProperties = {
  position: "relative",
  zIndex: 2,
  marginTop: "20px",
  padding: "28px",
  borderRadius: "30px",
  background:
    "linear-gradient(135deg, rgba(124,58,237,0.92), rgba(20,184,166,0.78), rgba(251,113,133,0.70))",
  color: "white",
  boxShadow:
    "0 24px 55px rgba(124,58,237,0.20), inset 0 0 30px rgba(255,255,255,0.18)",
  border: "1px solid rgba(255,255,255,0.55)",
};

const brandStyle: CSSProperties = {
  position: "relative",
  zIndex: 5,
  margin: 0,
  fontWeight: "bold",
  color: "white",
  letterSpacing: "0.4px",
};

const heroTitleStyle: CSSProperties = {
  position: "relative",
  zIndex: 5,
  marginTop: "14px",
  fontSize: "31px",
  lineHeight: 1.2,
};

const heroTextStyle: CSSProperties = {
  position: "relative",
  zIndex: 5,
  marginTop: "10px",
  opacity: 0.96,
  lineHeight: 1.6,
};

const modeBadgeStyle: CSSProperties = {
  position: "relative",
  zIndex: 5,
  display: "inline-block",
  marginTop: "14px",
  padding: "8px 12px",
  background: "rgba(255,255,255,0.22)",
  border: "1px solid rgba(255,255,255,0.45)",
  borderRadius: "999px",
  fontWeight: "bold",
  color: "#fef3c7",
};

const cardStyle: CSSProperties = {
  position: "relative",
  zIndex: 3,
  marginTop: "18px",
  padding: "18px",
  borderRadius: "24px",
  background: "rgba(255,255,255,0.92)",
  border: "1px solid rgba(124,58,237,0.14)",
  boxShadow:
    "0 22px 44px rgba(124,58,237,0.11), inset 0 0 24px rgba(255,255,255,0.45)",
  backdropFilter: "blur(12px)",
};

const sectionTitleStyle: CSSProperties = {
  color: "#7c3aed",
  marginBottom: "16px",
};

const labelStyle: CSSProperties = {
  display: "block",
  color: "#0f766e",
  fontWeight: "bold",
  marginTop: "12px",
};

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "12px",
  marginTop: "8px",
  borderRadius: "13px",
  border: "1px solid rgba(124,58,237,0.20)",
  background: "white",
  color: "#4c1d95",
  fontSize: "15px",
};

const readOnlyInputStyle: CSSProperties = {
  ...inputStyle,
  background: "#f8fafc",
  color: "#64748b",
};

const textAreaStyle: CSSProperties = {
  ...inputStyle,
  minHeight: "95px",
  resize: "vertical",
};

const mainButtonStyle: CSSProperties = {
  width: "100%",
  marginTop: "15px",
  padding: "13px",
  border: "none",
  borderRadius: "14px",
  background: "linear-gradient(135deg,#7c3aed,#14b8a6,#fb7185)",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
};

const quickGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "16px",
  marginTop: "18px",
};

const quickCardOneStyle: CSSProperties = {
  position: "relative",
  zIndex: 3,
  display: "grid",
  gap: "8px",
  padding: "20px",
  borderRadius: "24px",
  background: "linear-gradient(135deg,#38bdf8,#7c3aed,#a78bfa)",
  color: "white",
  textDecoration: "none",
  boxShadow: "0 22px 44px rgba(124,58,237,0.14)",
};

const quickCardTwoStyle: CSSProperties = {
  ...quickCardOneStyle,
  background: "linear-gradient(135deg,#14b8a6,#fb7185,#f59e0b)",
};

const adminBoxStyle: CSSProperties = {
  marginTop: "12px",
  padding: "14px",
  borderRadius: "18px",
  background: "linear-gradient(135deg,#f5f3ff,#ecfeff)",
  border: "1px solid rgba(124,58,237,0.12)",
};

const emptyBoxStyle: CSSProperties = {
  marginTop: "14px",
  padding: "14px",
  borderRadius: "16px",
  background: "rgba(255,255,255,0.80)",
  color: "#64748b",
  border: "1px solid rgba(124,58,237,0.12)",
};

const noticeItemStyle: CSSProperties = {
  padding: "15px",
  borderRadius: "18px",
  background: "linear-gradient(135deg,#ffffff,#f5f3ff,#ecfeff)",
  border: "1px solid rgba(124,58,237,0.12)",
  boxShadow: "0 14px 28px rgba(124,58,237,0.08)",
};

const supportItemStyle: CSSProperties = {
  ...noticeItemStyle,
  background: "linear-gradient(135deg,#ffffff,#ecfeff,#fff1f2)",
};

const supportEmailStyle: CSSProperties = {
  color: "#7c3aed",
  fontWeight: "bold",
  marginTop: 0,
};

const replyBoxStyle: CSSProperties = {
  padding: "12px",
  borderRadius: "15px",
  background: "linear-gradient(135deg,#ecfdf5,#f0fdfa)",
  border: "1px solid rgba(20,184,166,0.16)",
};

const dateTextStyle: CSSProperties = {
  color: "#94a3b8",
  fontSize: "12px",
  fontWeight: "bold",
};

const buttonRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
  marginTop: "12px",
};

const smallGreenButtonStyle: CSSProperties = {
  padding: "9px 12px",
  border: "none",
  borderRadius: "10px",
  background: "#14b8a6",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
};

const dangerButtonStyle: CSSProperties = {
  ...smallGreenButtonStyle,
  background: "#ef4444",
};

const logoutButtonStyle: CSSProperties = {
  position: "relative",
  zIndex: 3,
  width: "100%",
  marginTop: "18px",
  padding: "15px",
  border: "none",
  borderRadius: "17px",
  background: "linear-gradient(135deg,#ef4444,#fb7185,#f97316)",
  color: "white",
  fontWeight: "bold",
  fontSize: "16px",
  cursor: "pointer",
};