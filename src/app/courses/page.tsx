"use client";

import Link from "next/link";

export default function CoursesPage() {
  return (
    <main className="courses-page">
      <style>
        {`
          .courses-page {
            min-height: 100vh;
            background: linear-gradient(135deg, #111827, #1e3a8a, #7c3aed);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            color: white;
            overflow: hidden;
          }

          .box {
            max-width: 520px;
            width: 100%;
            background: rgba(255,255,255,0.12);
            border: 1px solid rgba(255,255,255,0.25);
            border-radius: 28px;
            padding: 35px 25px;
            text-align: center;
            backdrop-filter: blur(12px);
            box-shadow: 0 20px 50px rgba(0,0,0,0.35);
            animation: floatBox 3s ease-in-out infinite;
          }

          .icon {
            font-size: 70px;
            animation: pulse 1.6s ease-in-out infinite;
          }

          .title {
            font-size: 36px;
            margin-top: 18px;
            font-weight: 800;
          }

          .subtitle {
            margin-top: 12px;
            font-size: 17px;
            color: #e0e7ff;
            line-height: 1.6;
          }

          .badge {
            margin-top: 25px;
            display: inline-block;
            padding: 10px 18px;
            border-radius: 999px;
            background: white;
            color: #2563eb;
            font-weight: bold;
          }

          .back {
            margin-top: 30px;
            display: inline-block;
            padding: 12px 18px;
            border-radius: 12px;
            background: #2563eb;
            color: white;
            text-decoration: none;
            font-weight: bold;
          }

          @keyframes floatBox {
            0% { transform: translateY(0); }
            50% { transform: translateY(-12px); }
            100% { transform: translateY(0); }
          }

          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.12); }
            100% { transform: scale(1); }
          }
        `}
      </style>

      <div className="box">
        <div className="icon">🚀</div>

        <h1 className="title">Coming Soon</h1>

        <p className="subtitle">
          Paid Courses section is under development.  
          Very soon students will get premium courses, study plans and special classes here.
        </p>

        <div className="badge">Successful Academy Official</div>

        <br />

        <Link href="/" className="back">
          ← Back to Home
        </Link>
      </div>
    </main>
  );
}