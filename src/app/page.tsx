"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { useAppLanguage } from "@/hooks/useAppLanguage";
import NotificationBell from "@/components/NotificationBell";

const ADMIN_EMAIL = "successfulacademyofficial@gmail.com";
const SELECTED_EXAM_KEY = "selected_exam_v1";

const examOptions = [
  "All Competitive Exams",
  "WBP",
  "KP",
  "WBP/KP 2026",
  "Railway",
  "Banking",
  "SSC CGL",
  "SSC CHSL",
  "RRB",
];

const text = {
  en: {
    loading: "Loading...",
    brand: "Successful Academy Official",
    welcome: "Welcome Back, Students",
    subtitle: "Your complete competitive exam preparation platform.",
    adminMode: "Admin Mode",
    studentMode: "Student Mode",
    currentAffairs: "Daily Current Affairs and Updates",
    studyMaterials: "Study Materials and Notes",
    paidCourses: "Paid Courses",
    liveClasses: "Live Classes",
    open: "Open",
    home: "Home",
    mockTest: "Mock Test",
    jobDetails: "Job Details",
    settings: "Settings",
  },
  hi: {
    loading: "Loading...",
    brand: "Successful Academy Official",
    welcome: "Welcome Back, Students",
    subtitle: "Your complete competitive exam preparation platform.",
    adminMode: "Admin Mode",
    studentMode: "Student Mode",
    currentAffairs: "Daily Current Affairs and Updates",
    studyMaterials: "Study Materials and Notes",
    paidCourses: "Paid Courses",
    liveClasses: "Live Classes",
    open: "Open",
    home: "Home",
    mockTest: "Mock Test",
    jobDetails: "Job Details",
    settings: "Settings",
  },
  bn: {
    loading: "Loading...",
    brand: "Successful Academy Official",
    welcome: "Welcome Back, Students",
    subtitle: "Your complete competitive exam preparation platform.",
    adminMode: "Admin Mode",
    studentMode: "Student Mode",
    currentAffairs: "Daily Current Affairs and Updates",
    studyMaterials: "Study Materials and Notes",
    paidCourses: "Paid Courses",
    liveClasses: "Live Classes",
    open: "Open",
    home: "Home",
    mockTest: "Mock Test",
    jobDetails: "Job Details",
    settings: "Settings",
  },
};

export default function HomePage() {
  const router = useRouter();
  const language = useAppLanguage();
  const t = text[language];

  const [checkingUser, setCheckingUser] = useState(true);
  const [email, setEmail] = useState("");
  const [selectedExam, setSelectedExam] = useState("All Competitive Exams");

  const cleanEmail = email.trim().toLowerCase();
  const isAdmin = cleanEmail === ADMIN_EMAIL;

  const encodedExam = useMemo(() => {
    return encodeURIComponent(selectedExam);
  }, [selectedExam]);

  useEffect(() => {
    const savedExam = localStorage.getItem(SELECTED_EXAM_KEY);

    if (savedExam) {
      setSelectedExam(savedExam);
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      setEmail(user.email || "");
      setCheckingUser(false);
    });

    return () => unsubscribe();
  }, [router]);

  const changeExam = (value: string) => {
    setSelectedExam(value);
    localStorage.setItem(SELECTED_EXAM_KEY, value);
  };

  if (checkingUser) {
    return <main style={loadingStyle}>{t.loading}</main>;
  }

  return (
    <main className="home-page" style={mainStyle}>
      <style>{homeCss}</style>

      <div className="home-bg-grid" />
      <div className="home-orb-one" />
      <div className="home-orb-two" />

      <section style={topBarStyle}>
        <select
          value={selectedExam}
          onChange={(e) => changeExam(e.target.value)}
          style={examSelectStyle}
        >
          {examOptions.map((exam) => (
            <option key={exam} value={exam}>
              {exam}
            </option>
          ))}
        </select>

        <NotificationBell />
      </section>

      <section className="home-hero" style={heroStyle}>
        <div style={modeBadgeStyle}>{isAdmin ? t.adminMode : t.studentMode}</div>

        <p style={brandStyle}>{t.brand}</p>

        <h1 style={heroTitleStyle}>{t.welcome}</h1>

        <h2 style={emailStyle}>{email}</h2>

        <p style={heroTextStyle}>{t.subtitle}</p>
      </section>

      <section style={cardGridStyle}>
        <Link
          href={`/current-affairs?exam=${encodedExam}`}
          className="home-card"
          style={cardStyleOne}
        >
          <span style={cardTitleStyle}>{t.currentAffairs}</span>
          <span style={cardSubStyle}>
            {selectedExam} | {t.open}
          </span>
        </Link>

        <Link
          href={`/study-materials?exam=${encodedExam}`}
          className="home-card"
          style={cardStyleTwo}
        >
          <span style={cardTitleStyle}>{t.studyMaterials}</span>
          <span style={cardSubStyle}>
            {selectedExam} | {t.open}
          </span>
        </Link>

        <Link
          href={`/courses?exam=${encodedExam}`}
          className="home-card"
          style={cardStyleThree}
        >
          <span style={cardTitleStyle}>{t.paidCourses}</span>
          <span style={cardSubStyle}>
            {selectedExam} | {t.open}
          </span>
        </Link>

        <Link
          href={`/live-classes?exam=${encodedExam}`}
          className="home-card"
          style={cardStyleFour}
        >
          <span style={cardTitleStyle}>{t.liveClasses}</span>
          <span style={cardSubStyle}>
            {selectedExam} | {t.open}
          </span>
        </Link>
      </section>

      <nav style={bottomNavStyle}>
        <Link href="/" style={bottomNavItemActiveStyle}>
          {t.home}
        </Link>

        <Link href={`/mock-test?exam=${encodedExam}`} style={bottomNavItemStyle}>
          {t.mockTest}
        </Link>

        <Link href={`/jobs?exam=${encodedExam}`} style={bottomNavItemStyle}>
          {t.jobDetails}
        </Link>

        <Link href="/settings" style={bottomNavItemStyle}>
          {t.settings}
        </Link>
      </nav>
    </main>
  );
}

const homeCss = `
  .home-page {
    position: relative;
    overflow-x: hidden;
    isolation: isolate;
  }

  .home-bg-grid {
    position: fixed;
    inset: 0;
    z-index: -5;
    background:
      linear-gradient(120deg, rgba(37,99,235,0.08) 0 2px, transparent 2px 76px),
      linear-gradient(60deg, rgba(124,58,237,0.07) 0 2px, transparent 2px 90px),
      linear-gradient(30deg, rgba(20,184,166,0.06) 0 2px, transparent 2px 104px);
    background-size: 112px 112px;
    animation: homeGridMove 12s linear infinite;
    pointer-events: none;
  }

  .home-orb-one {
    position: fixed;
    width: 280px;
    height: 280px;
    right: -100px;
    top: 140px;
    border-radius: 50%;
    filter: blur(30px);
    background: rgba(37,99,235,0.16);
    z-index: -4;
    animation: homeOrbOne 7s ease-in-out infinite;
  }

  .home-orb-two {
    position: fixed;
    width: 260px;
    height: 260px;
    left: -100px;
    bottom: 130px;
    border-radius: 50%;
    filter: blur(30px);
    background: rgba(124,58,237,0.14);
    z-index: -4;
    animation: homeOrbTwo 8s ease-in-out infinite;
  }

  .home-hero,
  .home-card {
    transform-style: preserve-3d;
  }

  .home-hero {
    position: relative;
    overflow: hidden;
    animation: homeHeroFloat 5s ease-in-out infinite;
  }

  .home-hero::before,
  .home-card::before {
    content: "";
    position: absolute;
    inset: -2px;
    background:
      radial-gradient(circle at 18% 20%, rgba(255,255,255,0.58), transparent 28%),
      linear-gradient(120deg, transparent, rgba(255,255,255,0.35), transparent);
    animation: homeShine 5s ease-in-out infinite;
    pointer-events: none;
  }

  .home-hero::after,
  .home-card::after {
    content: "";
    position: absolute;
    inset: 13px;
    border-radius: 24px;
    border: 1px solid rgba(255,255,255,0.45);
    pointer-events: none;
  }

  .home-card {
    position: relative;
    overflow: hidden;
    animation: homeCardEnter 0.55s ease both, homeCardFloat 4.3s ease-in-out infinite;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }

  .home-card:hover {
    transform: translateY(-8px) rotateX(5deg);
    box-shadow: 0 24px 44px rgba(37,99,235,0.16);
  }

  @keyframes homeGridMove {
    from { background-position: 0 0; }
    to { background-position: 112px 112px; }
  }

  @keyframes homeOrbOne {
    0%, 100% { transform: translate(0,0) scale(1); }
    50% { transform: translate(-28px,24px) scale(1.14); }
  }

  @keyframes homeOrbTwo {
    0%, 100% { transform: translate(0,0) scale(1); }
    50% { transform: translate(26px,-24px) scale(1.14); }
  }

  @keyframes homeHeroFloat {
    0%, 100% { transform: translateY(0) rotateX(0deg); }
    50% { transform: translateY(-7px) rotateX(2deg); }
  }

  @keyframes homeShine {
    0% { transform: translateX(-65%); opacity: 0.7; }
    50% { opacity: 1; }
    100% { transform: translateX(65%); opacity: 0.7; }
  }

  @keyframes homeCardEnter {
    from { opacity: 0; transform: translateY(24px) rotateX(14deg) scale(0.96); }
    to { opacity: 1; transform: translateY(0) rotateX(0deg) scale(1); }
  }

  @keyframes homeCardFloat {
    0%, 100% { transform: translateY(0) rotateX(0deg); }
    50% { transform: translateY(-5px) rotateX(2deg); }
  }
`;

const loadingStyle: CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#eff6ff",
  color: "#2563eb",
  fontSize: "22px",
  fontWeight: "bold",
};

const mainStyle: CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(180deg,#ffffff 0%,#eff6ff 45%,#f5f3ff 100%)",
  paddingTop: "24px",
  paddingRight: "24px",
  paddingBottom: "110px",
  paddingLeft: "24px",
};

const topBarStyle: CSSProperties = {
  position: "relative",
  zIndex: 100000,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "18px",
  marginBottom: "24px",
};

const examSelectStyle: CSSProperties = {
  width: "100%",
  maxWidth: "450px",
  padding: "18px 26px",
  border: "none",
  borderRadius: "18px",
  background: "rgba(255,255,255,0.96)",
  color: "#0f172a",
  fontSize: "20px",
  fontWeight: "900",
  boxShadow: "0 18px 34px rgba(15,23,42,0.10)",
  outline: "none",
  cursor: "pointer",
};

const heroStyle: CSSProperties = {
  position: "relative",
  zIndex: 3,
  padding: "34px",
  borderRadius: "30px",
  background:
    "linear-gradient(135deg, rgba(99,102,241,0.92), rgba(124,58,237,0.82), rgba(20,184,166,0.72))",
  color: "white",
  boxShadow:
    "0 24px 55px rgba(37,99,235,0.18), inset 0 0 30px rgba(255,255,255,0.18)",
  border: "1px solid rgba(255,255,255,0.55)",
};

const modeBadgeStyle: CSSProperties = {
  position: "absolute",
  right: "24px",
  top: "24px",
  zIndex: 5,
  padding: "12px 18px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.22)",
  color: "white",
  fontWeight: "900",
  border: "1px solid rgba(255,255,255,0.35)",
};

const brandStyle: CSSProperties = {
  position: "relative",
  zIndex: 5,
  margin: 0,
  fontWeight: "900",
  fontSize: "18px",
};

const heroTitleStyle: CSSProperties = {
  position: "relative",
  zIndex: 5,
  marginTop: "18px",
  marginBottom: "14px",
  fontSize: "34px",
  lineHeight: 1.2,
  fontWeight: "500",
};

const emailStyle: CSSProperties = {
  position: "relative",
  zIndex: 5,
  margin: 0,
  fontSize: "22px",
  fontWeight: "900",
};

const heroTextStyle: CSSProperties = {
  position: "relative",
  zIndex: 5,
  marginTop: "18px",
  opacity: 0.96,
  lineHeight: 1.6,
  fontWeight: "700",
};

const cardGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "22px",
  marginTop: "26px",
};

const baseCardStyle: CSSProperties = {
  position: "relative",
  zIndex: 3,
  display: "grid",
  gap: "34px",
  minHeight: "150px",
  padding: "26px",
  borderRadius: "26px",
  color: "white",
  textDecoration: "none",
  boxShadow: "0 22px 44px rgba(37,99,235,0.14)",
  border: "1px solid rgba(255,255,255,0.45)",
};

const cardStyleOne: CSSProperties = {
  ...baseCardStyle,
  background: "linear-gradient(135deg,#38bdf8,#2563eb,#7c3aed)",
};

const cardStyleTwo: CSSProperties = {
  ...baseCardStyle,
  background: "linear-gradient(135deg,#a78bfa,#7c3aed,#38bdf8)",
};

const cardStyleThree: CSSProperties = {
  ...baseCardStyle,
  background: "linear-gradient(135deg,#f97316,#ef4444,#7c3aed)",
};

const cardStyleFour: CSSProperties = {
  ...baseCardStyle,
  background: "linear-gradient(135deg,#14b8a6,#2563eb,#7c3aed)",
};

const cardTitleStyle: CSSProperties = {
  position: "relative",
  zIndex: 4,
  fontSize: "22px",
  fontWeight: "900",
};

const cardSubStyle: CSSProperties = {
  position: "relative",
  zIndex: 4,
  fontSize: "17px",
  fontWeight: "900",
};

const bottomNavStyle: CSSProperties = {
  position: "fixed",
  left: "24px",
  right: "24px",
  bottom: "20px",
  zIndex: 9999,
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  alignItems: "center",
  minHeight: "56px",
  padding: "6px",
  borderRadius: "18px",
  background: "rgba(255,255,255,0.96)",
  boxShadow: "0 18px 34px rgba(15,23,42,0.16)",
  border: "1px solid rgba(37,99,235,0.08)",
};

const bottomNavItemStyle: CSSProperties = {
  color: "#2563eb",
  textAlign: "center",
  fontWeight: "900",
  fontSize: "13px",
  textDecoration: "none",
};

const bottomNavItemActiveStyle: CSSProperties = {
  ...bottomNavItemStyle,
  color: "#1d4ed8",
};