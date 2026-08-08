"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAppLanguage } from "@/hooks/useAppLanguage";
import { sendNotificationToStudents } from "@/lib/sendNotification";

const ADMIN_EMAIL = "successfulacademyofficial@gmail.com";
const SELECTED_EXAM_KEY = "selected_exam_v1";

const FOLDERS_KEY = "mock_test_folders_colorful_v6";
const SETS_KEY = "mock_test_sets_colorful_v5";

const OLD_FOLDER_KEYS = [
  "mock_test_folders_colorful_v6",
  "mock_test_folders_colorful_v5",
  "mock_test_folders_colorful_v4",
  "mock_test_folders_colorful_v3",
  "mock_test_folders_colorful_v2",
  "mock_test_folders_colorful_v1",
];

const OLD_SET_KEYS = [
  "mock_test_sets_colorful_v5",
  "mock_test_sets_colorful_v4",
  "mock_test_sets_colorful_v3",
  "mock_test_sets_colorful_v2",
  "mock_test_sets_colorful_v1",
];

type SubjectType = "gk" | "math" | "reasoning" | "mixed";
type CorrectOption = "A" | "B" | "C" | "D";

type FolderType = {
  id: string;
  name: string;
  exam: string;
  backgroundColor?: string;
  backgroundImage?: string;
  createdAt: number;
};

type QuestionType = {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: CorrectOption;
  solution?: string;
};

type TestSetType = {
  id: string;
  folderId: string;
  subject: SubjectType;
  title: string;
  durationMinutes: number;
  questionTimeSeconds?: number;
  questions: QuestionType[];
  visible: boolean;
  createdAt: number;
};

const subjectOptions: { value: SubjectType; label: string }[] = [
  { value: "gk", label: "General Knowledge" },
  { value: "math", label: "Mathematics" },
  { value: "reasoning", label: "Reasoning" },
  { value: "mixed", label: "All Mixed" },
];

const text = {
  en: {
    loading: "Loading Mock Test...",
    back: "Back to Home",
    brand: "Successful Academy Official",
    title: "Mock Test",
    subtitle: "Exam-wise practice test system for students.",
    adminMode: "Admin Mode",
    studentMode: "Student Mode",
    selectedExam: "Selected Exam",
    addFolder: "Add Folder",
    folderName: "Folder Name",
    backgroundColor: "Background Color",
    backgroundImage: "Background Image",
    createFolder: "Create Folder",
    cancel: "Cancel",
    noFolder: "No folder added yet.",
    open: "Open",
    rename: "Rename",
    changeBackground: "Background",
    delete: "Delete",
    save: "Save",
    addTest: "Add Test",
    addSet: "Add Test Set",
    setTitle: "Test Set Title",
    duration: "Time per Question (seconds)",
    timeLeft: "Time Left",
    nextQuestion: "Next Question",
    finishTest: "Finish Test",
    correct: "Correct",
    wrong: "Wrong",
    timeUp: "Time Up",
    finalResult: "Final Result",
    correctAnswers: "Correct Answers",
    wrongAnswers: "Wrong Answers",
    unanswered: "Unanswered",
    percentage: "Percentage",
    addQuestion: "Add Question",
    question: "Question",
    optionA: "Option A",
    optionB: "Option B",
    optionC: "Option C",
    optionD: "Option D",
    correctAnswer: "Correct Answer",
    solution: "Solution",
    solutionPlaceholder: "Write solution for this question",
    viewSolution: "Solution",
    saveSet: "Save Test Set",
    noSet: "No test set added yet.",
    startTest: "Start Test",
    questions: "Questions",
    visible: "Visible to students",
    hidden: "Hidden from students",
    submitTest: "Submit Test",
    score: "Your Score",
    backToSets: "Back to Test Sets",
    backToSubjects: "Back to Subjects",
    addedQuestions: "Added Questions",
  },
  hi: {
    loading: "Mock Test लोड हो रहा है...",
    back: "Home par wapas",
    brand: "Successful Academy Official",
    title: "Mock Test",
    subtitle: "Students ke liye exam-wise practice test system.",
    adminMode: "Admin Mode",
    studentMode: "Student Mode",
    selectedExam: "Selected Exam",
    addFolder: "Add Folder",
    folderName: "Folder Name",
    backgroundColor: "Background Color",
    backgroundImage: "Background Image",
    createFolder: "Create Folder",
    cancel: "Cancel",
    noFolder: "Abhi koi folder nahi hai.",
    open: "Open",
    rename: "Rename",
    changeBackground: "Background",
    delete: "Delete",
    save: "Save",
    addTest: "Add Test",
    addSet: "Add Test Set",
    setTitle: "Test Set Title",
    duration: "Time per Question (seconds)",
    timeLeft: "Time Left",
    nextQuestion: "Next Question",
    finishTest: "Finish Test",
    correct: "Correct",
    wrong: "Wrong",
    timeUp: "Time Up",
    finalResult: "Final Result",
    correctAnswers: "Correct Answers",
    wrongAnswers: "Wrong Answers",
    unanswered: "Unanswered",
    percentage: "Percentage",
    addQuestion: "Add Question",
    question: "Question",
    optionA: "Option A",
    optionB: "Option B",
    optionC: "Option C",
    optionD: "Option D",
    correctAnswer: "Correct Answer",
    solution: "Solution",
    solutionPlaceholder: "Write solution for this question",
    viewSolution: "Solution",
    saveSet: "Save Test Set",
    noSet: "Abhi koi test set nahi hai.",
    startTest: "Start Test",
    questions: "Questions",
    visible: "Students ko dikhega",
    hidden: "Students se hidden",
    submitTest: "Submit Test",
    score: "Your Score",
    backToSets: "Back to Test Sets",
    backToSubjects: "Back to Subjects",
    addedQuestions: "Added Questions",
  },
  bn: {
    loading: "Mock Test লোড হচ্ছে...",
    back: "Home-এ ফিরে যান",
    brand: "Successful Academy Official",
    title: "Mock Test",
    subtitle: "Students-এর জন্য exam-wise practice test system.",
    adminMode: "Admin Mode",
    studentMode: "Student Mode",
    selectedExam: "Selected Exam",
    addFolder: "Add Folder",
    folderName: "Folder Name",
    backgroundColor: "Background Color",
    backgroundImage: "Background Image",
    createFolder: "Create Folder",
    cancel: "Cancel",
    noFolder: "এখনো কোনো folder নেই।",
    open: "Open",
    rename: "Rename",
    changeBackground: "Background",
    delete: "Delete",
    save: "Save",
    addTest: "Add Test",
    addSet: "Add Test Set",
    setTitle: "Test Set Title",
    duration: "Time per Question (seconds)",
    timeLeft: "Time Left",
    nextQuestion: "Next Question",
    finishTest: "Finish Test",
    correct: "Correct",
    wrong: "Wrong",
    timeUp: "Time Up",
    finalResult: "Final Result",
    correctAnswers: "Correct Answers",
    wrongAnswers: "Wrong Answers",
    unanswered: "Unanswered",
    percentage: "Percentage",
    addQuestion: "Add Question",
    question: "Question",
    optionA: "Option A",
    optionB: "Option B",
    optionC: "Option C",
    optionD: "Option D",
    correctAnswer: "Correct Answer",
    solution: "Solution",
    solutionPlaceholder: "Write solution for this question",
    viewSolution: "Solution",
    saveSet: "Save Test Set",
    noSet: "এখনো কোনো test set নেই।",
    startTest: "Start Test",
    questions: "Questions",
    visible: "Students দেখতে পাবে",
    hidden: "Students থেকে hidden",
    submitTest: "Submit Test",
    score: "Your Score",
    backToSets: "Back to Test Sets",
    backToSubjects: "Back to Subjects",
    addedQuestions: "Added Questions",
  },
};

function MockTestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const language = useAppLanguage();
  const t = text[language];

  const [checkingUser, setCheckingUser] = useState(true);
  const [email, setEmail] = useState("");

  const [selectedExam, setSelectedExam] = useState("All Competitive Exams");
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [testSets, setTestSets] = useState<TestSetType[]>([]);

  const [showAddFolder, setShowAddFolder] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [folderBgColor, setFolderBgColor] = useState("#2563eb");
  const [folderBgImage, setFolderBgImage] = useState("");

  const [openedFolderId, setOpenedFolderId] = useState("");
  const [activeSubject, setActiveSubject] = useState<SubjectType | "">("");

  const [menuOpenId, setMenuOpenId] = useState("");
  const [renameFolderId, setRenameFolderId] = useState("");
  const [renameValue, setRenameValue] = useState("");
  const [backgroundFolderId, setBackgroundFolderId] = useState("");
  const [editBgColor, setEditBgColor] = useState("#2563eb");
  const [editBgImage, setEditBgImage] = useState("");

  const [showAddSet, setShowAddSet] = useState(false);
  const [setTitle, setSetTitle] = useState("");
  const [questionTimeSeconds, setQuestionTimeSeconds] = useState("30");

  const [question, setQuestion] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctOption, setCorrectOption] = useState<CorrectOption>("A");
  const [solution, setSolution] = useState("");
  const [draftQuestions, setDraftQuestions] = useState<QuestionType[]>([]);

  const [runningSet, setRunningSet] = useState<TestSetType | null>(null);
  const [answers, setAnswers] = useState<Record<string, CorrectOption>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionSecondsLeft, setQuestionSecondsLeft] = useState(30);
  const [timedOutQuestions, setTimedOutQuestions] = useState<Record<string, boolean>>({});
  const [score, setScore] = useState<number | null>(null);

  const cleanEmail = email.trim().toLowerCase();
  const isAdmin = cleanEmail === ADMIN_EMAIL;

  const openedFolder = folders.find((item) => item.id === openedFolderId);

  const activeSubjectLabel =
    subjectOptions.find((item) => item.value === activeSubject)?.label || "";

  const filteredFolders = useMemo(() => {
    return folders.filter((folder) => {
      return (
        selectedExam === "All Competitive Exams" ||
        folder.exam === selectedExam ||
        folder.exam === "All Competitive Exams"
      );
    });
  }, [folders, selectedExam]);

  const currentSets = testSets.filter((item) => {
    if (!activeSubject) return false;
    if (item.folderId !== openedFolderId) return false;
    if (item.subject !== activeSubject) return false;
    if (isAdmin) return true;
    return item.visible;
  });

  const currentRunningQuestion = runningSet?.questions[currentQuestionIndex] || null;
  const currentSelectedAnswer = currentRunningQuestion
    ? answers[currentRunningQuestion.id]
    : undefined;
  const currentQuestionTimedOut = currentRunningQuestion
    ? Boolean(timedOutQuestions[currentRunningQuestion.id])
    : false;
  const currentQuestionLocked = Boolean(
    currentSelectedAnswer || currentQuestionTimedOut
  );
  const finalStats = runningSet ? calculateResultStats(runningSet, answers, timedOutQuestions) : null;
  const progressPercent = runningSet
    ? Math.round(((currentQuestionIndex + 1) / runningSet.questions.length) * 100)
    : 0;

  useEffect(() => {
    const examFromUrl = searchParams.get("exam");
    const examFromStorage = localStorage.getItem(SELECTED_EXAM_KEY);

    if (examFromUrl) {
      setSelectedExam(examFromUrl);
      localStorage.setItem(SELECTED_EXAM_KEY, examFromUrl);
    } else if (examFromStorage) {
      setSelectedExam(examFromStorage);
    }

    const savedFolders = readFirstLocalStorageList<FolderType>(OLD_FOLDER_KEYS);
    const savedSets = readFirstLocalStorageList<TestSetType>(OLD_SET_KEYS);

    setFolders(savedFolders);
    setTestSets(savedSets);

    localStorage.setItem(FOLDERS_KEY, JSON.stringify(savedFolders));
    localStorage.setItem(SETS_KEY, JSON.stringify(savedSets));

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      setEmail(user.email || "");
      setCheckingUser(false);
    });

    return () => unsubscribe();
  }, [router, searchParams]);

  useEffect(() => {
    if (!runningSet || score !== null || !currentRunningQuestion) return;

    if (currentSelectedAnswer || currentQuestionTimedOut) return;

    if (questionSecondsLeft <= 0) {
      setTimedOutQuestions((prev) => ({
        ...prev,
        [currentRunningQuestion.id]: true,
      }));
      return;
    }

    const timerId = window.setTimeout(() => {
      setQuestionSecondsLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => window.clearTimeout(timerId);
  }, [
    runningSet,
    score,
    currentRunningQuestion,
    currentSelectedAnswer,
    currentQuestionTimedOut,
    questionSecondsLeft,
  ]);

  const saveFolders = (items: FolderType[]) => {
    setFolders(items);
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(items));
  };

  const saveTestSets = (items: TestSetType[]) => {
    setTestSets(items);
    localStorage.setItem(SETS_KEY, JSON.stringify(items));
  };

  const makeId = () => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  };

  const createFolder = () => {
    if (!isAdmin) return;

    const cleanName = folderName.trim();

    if (!cleanName) {
      alert("Please enter a folder name.");
      return;
    }

    const newFolder: FolderType = {
      id: makeId(),
      name: cleanName,
      exam: selectedExam,
      backgroundColor: folderBgColor,
      backgroundImage: folderBgImage,
      createdAt: Date.now(),
    };

    saveFolders([newFolder, ...folders]);
    setFolderName("");
    setFolderBgColor("#2563eb");
    setFolderBgImage("");
    setShowAddFolder(false);
  };

  const openFolder = (folderId: string) => {
    setOpenedFolderId(folderId);
    setActiveSubject("");
    setShowAddFolder(false);
    setMenuOpenId("");
    setRenameFolderId("");
    setBackgroundFolderId("");
    setShowAddSet(false);
    setRunningSet(null);
    setScore(null);
    clearSetForm();
  };

  const openSubjectPage = (subject: SubjectType) => {
    setActiveSubject(subject);
    setShowAddSet(false);
    clearSetForm();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const backToSubjects = () => {
    setActiveSubject("");
    setShowAddSet(false);
    clearSetForm();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetToFolders = () => {
    setOpenedFolderId("");
    setActiveSubject("");
    setRunningSet(null);
    setScore(null);
    setShowAddSet(false);
    clearSetForm();
  };

  const openRenameBox = (folder: FolderType) => {
    if (!isAdmin) return;

    setRenameFolderId(folder.id);
    setRenameValue(folder.name);
    setBackgroundFolderId("");
    setMenuOpenId("");
  };

  const saveRenameFolder = () => {
    if (!isAdmin) return;

    const cleanName = renameValue.trim();

    if (!cleanName) {
      alert("Please enter a folder name.");
      return;
    }

    const updated = folders.map((folder) =>
      folder.id === renameFolderId ? { ...folder, name: cleanName } : folder
    );

    saveFolders(updated);
    setRenameFolderId("");
    setRenameValue("");
  };

  const openBackgroundBox = (folder: FolderType) => {
    if (!isAdmin) return;

    setBackgroundFolderId(folder.id);
    setEditBgColor(folder.backgroundColor || "#2563eb");
    setEditBgImage(folder.backgroundImage || "");
    setRenameFolderId("");
    setMenuOpenId("");
  };

  const saveBackgroundChange = () => {
    if (!isAdmin) return;

    const updated = folders.map((folder) =>
      folder.id === backgroundFolderId
        ? { ...folder, backgroundColor: editBgColor, backgroundImage: editBgImage }
        : folder
    );

    saveFolders(updated);
    setBackgroundFolderId("");
    setEditBgImage("");
  };

  const deleteFolder = (folderId: string) => {
    if (!isAdmin) return;

    if (!confirm("Do you want to delete this folder?")) return;

    saveFolders(folders.filter((item) => item.id !== folderId));
    saveTestSets(testSets.filter((item) => item.folderId !== folderId));

    if (openedFolderId === folderId) {
      resetToFolders();
    }

    setMenuOpenId("");
  };

  const addQuestionToDraft = () => {
    if (!isAdmin) return;

    if (
      !question.trim() ||
      !optionA.trim() ||
      !optionB.trim() ||
      !optionC.trim() ||
      !optionD.trim()
    ) {
      alert("Please fill the question and all 4 options.");
      return;
    }

    const newQuestion: QuestionType = {
      id: makeId(),
      question: question.trim(),
      optionA: optionA.trim(),
      optionB: optionB.trim(),
      optionC: optionC.trim(),
      optionD: optionD.trim(),
      correctOption,
      solution:
        activeSubject === "math" || activeSubject === "reasoning"
          ? solution.trim()
          : "",
    };

    setDraftQuestions([...draftQuestions, newQuestion]);
    setQuestion("");
    setOptionA("");
    setOptionB("");
    setOptionC("");
    setOptionD("");
    setCorrectOption("A");
    setSolution("");
  };

  const removeDraftQuestion = (id: string) => {
    if (!isAdmin) return;
    setDraftQuestions(draftQuestions.filter((item) => item.id !== id));
  };

  const saveSet = () => {
    if (!isAdmin) return;

    if (!activeSubject) {
      alert("Please select a subject.");
      return;
    }

    if (!openedFolderId || !setTitle.trim()) {
      alert("Please enter a test set title.");
      return;
    }

    if (draftQuestions.length === 0) {
      alert("Please add at least 1 question.");
      return;
    }

    const seconds = Number(questionTimeSeconds);
    const safeSeconds = Number.isFinite(seconds) && seconds > 0 ? Math.round(seconds) : 30;

    const newSet: TestSetType = {
      id: makeId(),
      folderId: openedFolderId,
      subject: activeSubject,
      title: setTitle.trim(),
      durationMinutes: Math.ceil((safeSeconds * draftQuestions.length) / 60),
      questionTimeSeconds: safeSeconds,
      questions: draftQuestions,
      visible: true,
      createdAt: Date.now(),
    };

    saveTestSets([newSet, ...testSets]);

void sendNotificationToStudents({
  title: "Successful Academy Official",
  body:
    activeSubject === "gk"
      ? "New General Knowledge Mock Test uploaded."
      : activeSubject === "math"
      ? "New Mathematics Mock Test uploaded."
      : activeSubject === "reasoning"
      ? "New Reasoning Mock Test uploaded."
      : "New All Mixed Mock Test uploaded.",
  url: `/mock-test?exam=${encodeURIComponent(selectedExam)}`,
});
    clearSetForm();
    setShowAddSet(false);
  };

  const clearSetForm = () => {
    setSetTitle("");
    setQuestionTimeSeconds("30");
    setQuestion("");
    setOptionA("");
    setOptionB("");
    setOptionC("");
    setOptionD("");
    setCorrectOption("A");
    setSolution("");
    setDraftQuestions([]);
  };

  const toggleSetVisibility = (id: string) => {
    if (!isAdmin) return;

    const updated = testSets.map((item) =>
      item.id === id ? { ...item, visible: !item.visible } : item
    );

    saveTestSets(updated);
  };

  const deleteSet = (id: string) => {
    if (!isAdmin) return;

    if (!confirm("Do you want to delete this test set?")) return;

    saveTestSets(testSets.filter((item) => item.id !== id));
  };

  const startTest = (item: TestSetType) => {
    setRunningSet(item);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setQuestionSecondsLeft(getQuestionTimeSeconds(item));
    setTimedOutQuestions({});
    setScore(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const chooseAnswer = (questionId: string, option: CorrectOption) => {
    if (answers[questionId] || timedOutQuestions[questionId]) return;

    setAnswers({ ...answers, [questionId]: option });
  };

  const goToNextQuestion = () => {
    if (!runningSet) return;

    if (currentQuestionIndex >= runningSet.questions.length - 1) {
      submitTest();
      return;
    }

    setCurrentQuestionIndex(currentQuestionIndex + 1);
    setQuestionSecondsLeft(getQuestionTimeSeconds(runningSet));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submitTest = () => {
    if (!runningSet) return;

    const finalScore = calculateResultStats(
      runningSet,
      answers,
      timedOutQuestions
    ).score;

    setScore(finalScore);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const backToSets = () => {
    setRunningSet(null);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setQuestionSecondsLeft(30);
    setTimedOutQuestions({});
    setScore(null);
  };

  if (checkingUser) {
    return <main style={loadingStyle}>{t.loading}</main>;
  }

  if (runningSet) {
    const totalQuestions = runningSet.questions.length;
    const questionTime = getQuestionTimeSeconds(runningSet);

    return (
      <main className="mock-page" style={mainStyle}>
        <style>{mockCss}</style>

        <div className="mock-bg-grid" />
        <div className="mock-orb-one" />
        <div className="mock-orb-two" />

        <button onClick={backToSets} style={backButtonStyle}>
          {t.backToSets}
        </button>

        <section className="mock-hero" style={heroStyle}>
          <div style={modeBadgeStyle}>{isAdmin ? t.adminMode : t.studentMode}</div>
          <p style={brandStyle}>{t.brand}</p>
          <h1 style={heroTitleStyle}>{runningSet.title}</h1>
          <p style={heroTextStyle}>
            {t.questions}: {totalQuestions} | {t.duration}: {questionTime} sec
          </p>
        </section>

        {score !== null && finalStats && (
          <section className="mock-result-pop" style={finalResultBoxStyle}>
            <div style={resultBadgeStyle}>🏆</div>
            <h2 style={scoreTitleStyle}>{t.finalResult}</h2>
            <p style={scoreTextStyle}>
              {score} / {totalQuestions}
            </p>

            <div style={resultStatsGridStyle}>
              <div style={resultStatCardStyle}>
                <strong>{t.correctAnswers}</strong>
                <span>{finalStats.score}</span>
              </div>

              <div style={resultStatCardStyle}>
                <strong>{t.wrongAnswers}</strong>
                <span>{finalStats.wrong}</span>
              </div>

              <div style={resultStatCardStyle}>
                <strong>{t.unanswered}</strong>
                <span>{finalStats.unanswered}</span>
              </div>

              <div style={resultStatCardStyle}>
                <strong>{t.percentage}</strong>
                <span>{finalStats.percentage}%</span>
              </div>
            </div>

            <button onClick={backToSets} className="mock-action-btn" style={mainButtonStyle}>
              {t.backToSets}
            </button>
          </section>
        )}

        {score === null && currentRunningQuestion && (
          <section className="mock-running-card" style={runningTestBoxStyle}>
            <div style={testProgressTopStyle}>
              <span>
                Question {currentQuestionIndex + 1} / {totalQuestions}
              </span>
              <span>
                {t.timeLeft}: {formatSeconds(questionSecondsLeft)}
              </span>
            </div>

            <div style={timerTrackStyle}>
              <div
                className="mock-timer-bar"
                style={{
                  ...timerFillStyle,
                  width: `${Math.max(
                    0,
                    Math.min(100, (questionSecondsLeft / questionTime) * 100)
                  )}%`,
                }}
              />
            </div>

            <div style={progressTrackStyle}>
              <div style={{ ...progressFillStyle, width: `${progressPercent}%` }} />
            </div>

            <article className="mock-question mock-current-question" style={currentQuestionCardStyle}>
              <h3 style={questionTitleStyle}>
                {currentQuestionIndex + 1}. {currentRunningQuestion.question}
              </h3>

              {renderTestOption(
                "A",
                currentRunningQuestion.optionA,
                currentRunningQuestion,
                currentSelectedAnswer,
                currentQuestionLocked,
                chooseAnswer
              )}

              {renderTestOption(
                "B",
                currentRunningQuestion.optionB,
                currentRunningQuestion,
                currentSelectedAnswer,
                currentQuestionLocked,
                chooseAnswer
              )}

              {renderTestOption(
                "C",
                currentRunningQuestion.optionC,
                currentRunningQuestion,
                currentSelectedAnswer,
                currentQuestionLocked,
                chooseAnswer
              )}

              {renderTestOption(
                "D",
                currentRunningQuestion.optionD,
                currentRunningQuestion,
                currentSelectedAnswer,
                currentQuestionLocked,
                chooseAnswer
              )}

              {currentQuestionLocked && (
                <>
                  <section
                    className="mock-answer-feedback"
                    style={
                      currentQuestionTimedOut
                        ? timeUpFeedbackStyle
                        : currentSelectedAnswer === currentRunningQuestion.correctOption
                        ? correctFeedbackStyle
                        : wrongFeedbackStyle
                    }
                  >
                    {currentQuestionTimedOut ? (
                      <>
                        ⏰ {t.timeUp}! Correct answer: {currentRunningQuestion.correctOption}
                      </>
                    ) : currentSelectedAnswer === currentRunningQuestion.correctOption ? (
                      <>✅ {t.correct}</>
                    ) : (
                      <>
                        ❌ {t.wrong}. Correct answer: {currentRunningQuestion.correctOption}
                      </>
                    )}
                  </section>

                  {(runningSet.subject === "math" || runningSet.subject === "reasoning") &&
                    currentRunningQuestion.solution && (
                      <section className="mock-solution-box" style={solutionBoxStyle}>
                        <h4 style={solutionTitleStyle}>📝 {t.viewSolution}</h4>
                        <p style={solutionTextStyle}>{currentRunningQuestion.solution}</p>
                      </section>
                    )}
                </>
              )}
            </article>

            <button
              onClick={goToNextQuestion}
              disabled={!currentQuestionLocked}
              className="mock-action-btn"
              style={{
                ...mainButtonStyle,
                opacity: currentQuestionLocked ? 1 : 0.55,
                cursor: currentQuestionLocked ? "pointer" : "not-allowed",
              }}
            >
              {currentQuestionIndex >= totalQuestions - 1 ? t.finishTest : t.nextQuestion}
            </button>
          </section>
        )}
      </main>
    );
  }

  return (
    <main className="mock-page" style={mainStyle}>
      <style>{mockCss}</style>

      <div className="mock-bg-grid" />
      <div className="mock-orb-one" />
      <div className="mock-orb-two" />

      <Link href="/" style={backLinkStyle}>
        {t.back}
      </Link>

      <section className="mock-hero" style={heroStyle}>
        <div style={modeBadgeStyle}>{isAdmin ? t.adminMode : t.studentMode}</div>
        <p style={brandStyle}>{t.brand}</p>
        <h1 style={heroTitleStyle}>{t.title}</h1>
        <p style={heroTextStyle}>{t.subtitle}</p>

        <div style={examBadgeStyle}>
          {t.selectedExam}: {selectedExam}
        </div>
      </section>

      {!openedFolderId && (
        <>
          {isAdmin && (
            <>
              {!showAddFolder && (
                <button
                  onClick={() => setShowAddFolder(true)}
                  className="mock-action-btn"
                  style={mainButtonStyle}
                >
                  {t.addFolder}
                </button>
              )}

              {showAddFolder && (
                <section className="mock-panel" style={panelStyle}>
                  <label style={labelStyle}>{t.folderName}</label>

                  <input
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    placeholder={t.folderName}
                    style={inputStyle}
                  />

                  <label style={labelStyle}>{t.backgroundColor}</label>
                  <input
                    type="color"
                    value={folderBgColor}
                    onChange={(e) => setFolderBgColor(e.target.value)}
                    style={colorInputStyle}
                  />

                  <label style={labelStyle}>{t.backgroundImage}</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const dataUrl = await fileToDataUrl(file);
                      setFolderBgImage(dataUrl);
                    }}
                    style={inputStyle}
                  />

                  <div style={buttonRowStyle}>
                    <button onClick={createFolder} style={smallBlueButtonStyle}>
                      {t.createFolder}
                    </button>

                    <button
                      onClick={() => {
                        setShowAddFolder(false);
                        setFolderName("");
                        setFolderBgImage("");
                      }}
                      style={smallGrayButtonStyle}
                    >
                      {t.cancel}
                    </button>
                  </div>
                </section>
              )}
            </>
          )}

          {filteredFolders.length === 0 && (
            <section style={emptyBoxStyle}>{t.noFolder}</section>
          )}

          <section style={folderGridStyle}>
            {filteredFolders.map((folder) => (
              <article
                key={folder.id}
                className="mock-folder"
                style={{
                  ...folderCardStyle,
                  background: getFolderBackground(folder),
                }}
              >
                {isAdmin && (
                  <div style={threeDotWrapStyle}>
                    <button
                      onClick={() =>
                        setMenuOpenId(menuOpenId === folder.id ? "" : folder.id)
                      }
                      style={threeDotButtonStyle}
                    >
                      ⋮
                    </button>

                    {menuOpenId === folder.id && (
                      <div style={folderMenuStyle}>
                        <button onClick={() => openRenameBox(folder)} style={menuItemStyle}>
                          {t.rename}
                        </button>

                        <button
                          onClick={() => openBackgroundBox(folder)}
                          style={menuItemStyle}
                        >
                          {t.changeBackground}
                        </button>

                        <button
                          onClick={() => deleteFolder(folder.id)}
                          style={deleteMenuItemStyle}
                        >
                          {t.delete}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <h2 style={folderTitleStyle}>{folder.name}</h2>
                <p style={folderSubTextStyle}>{folder.exam || selectedExam}</p>

                <button onClick={() => openFolder(folder.id)} style={openButtonStyle}>
                  {t.open}
                </button>

                {renameFolderId === folder.id && (
                  <section style={inlineEditBoxStyle}>
                    <input
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      style={inputStyle}
                    />

                    <div style={buttonRowStyle}>
                      <button onClick={saveRenameFolder} style={smallBlueButtonStyle}>
                        {t.save}
                      </button>

                      <button
                        onClick={() => {
                          setRenameFolderId("");
                          setRenameValue("");
                        }}
                        style={smallGrayButtonStyle}
                      >
                        {t.cancel}
                      </button>
                    </div>
                  </section>
                )}

                {backgroundFolderId === folder.id && (
                  <section style={inlineEditBoxStyle}>
                    <label style={labelStyle}>{t.backgroundColor}</label>
                    <input
                      type="color"
                      value={editBgColor}
                      onChange={(e) => setEditBgColor(e.target.value)}
                      style={colorInputStyle}
                    />

                    <label style={labelStyle}>{t.backgroundImage}</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const dataUrl = await fileToDataUrl(file);
                        setEditBgImage(dataUrl);
                      }}
                      style={inputStyle}
                    />

                    <div style={buttonRowStyle}>
                      <button onClick={saveBackgroundChange} style={smallBlueButtonStyle}>
                        {t.save}
                      </button>

                      <button
                        onClick={() => {
                          setBackgroundFolderId("");
                          setEditBgImage("");
                        }}
                        style={smallGrayButtonStyle}
                      >
                        {t.cancel}
                      </button>
                    </div>
                  </section>
                )}
              </article>
            ))}
          </section>
        </>
      )}

      {openedFolderId && openedFolder && !activeSubject && (
        <>
          <button onClick={resetToFolders} style={backButtonStyle}>
            Back: {openedFolder.name}
          </button>

          <section style={subjectGridStyle}>
            {subjectOptions.map((item) => (
              <button
                key={item.value}
                onClick={() => openSubjectPage(item.value)}
                className="mock-subject-card"
                style={subjectButtonStyle}
              >
                <span style={subjectTitleStyle}>{item.label}</span>
                <span style={subjectSubTextStyle}>
                  {selectedExam} | {t.open}
                </span>
              </button>
            ))}
          </section>
        </>
      )}

      {openedFolderId && openedFolder && activeSubject && (
        <>
          <button onClick={backToSubjects} style={backButtonStyle}>
            {t.backToSubjects}
          </button>

          <section className="mock-subject-card" style={subjectPageHeroStyle}>
            <span style={subjectTitleStyle}>{activeSubjectLabel}</span>
            <span style={subjectSubTextStyle}>
              {openedFolder.name} | {selectedExam}
            </span>
          </section>

          {isAdmin && !showAddSet && (
            <button
              onClick={() => setShowAddSet(true)}
              className="mock-action-btn"
              style={mainButtonStyle}
            >
              {t.addTest}
            </button>
          )}

          {isAdmin && showAddSet && (
            <section className="mock-panel" style={panelStyle}>
              <h2 style={sectionTitleStyle}>
                {t.addSet} - {activeSubjectLabel}
              </h2>

              <label style={labelStyle}>{t.setTitle}</label>
              <input
                value={setTitle}
                onChange={(e) => setSetTitle(e.target.value)}
                placeholder={t.setTitle}
                style={inputStyle}
              />

              <label style={labelStyle}>{t.duration}</label>
              <input
                value={questionTimeSeconds}
                onChange={(e) => setQuestionTimeSeconds(e.target.value)}
                placeholder="Example: 30"
                type="number"
                min="1"
                step="1"
                style={inputStyle}
              />

              <section style={questionBuilderStyle}>
                <h3 style={sectionTitleStyle}>{t.addQuestion}</h3>

                <label style={labelStyle}>{t.question}</label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={t.question}
                  style={textareaStyle}
                />

                <label style={labelStyle}>{t.optionA}</label>
                <input
                  value={optionA}
                  onChange={(e) => setOptionA(e.target.value)}
                  placeholder={t.optionA}
                  style={inputStyle}
                />

                <label style={labelStyle}>{t.optionB}</label>
                <input
                  value={optionB}
                  onChange={(e) => setOptionB(e.target.value)}
                  placeholder={t.optionB}
                  style={inputStyle}
                />

                <label style={labelStyle}>{t.optionC}</label>
                <input
                  value={optionC}
                  onChange={(e) => setOptionC(e.target.value)}
                  placeholder={t.optionC}
                  style={inputStyle}
                />

                <label style={labelStyle}>{t.optionD}</label>
                <input
                  value={optionD}
                  onChange={(e) => setOptionD(e.target.value)}
                  placeholder={t.optionD}
                  style={inputStyle}
                />

                <label style={labelStyle}>{t.correctAnswer}</label>
                <select
                  value={correctOption}
                  onChange={(e) => setCorrectOption(e.target.value as CorrectOption)}
                  style={inputStyle}
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>

                {(activeSubject === "math" || activeSubject === "reasoning") && (
                  <>
                    <label style={labelStyle}>{t.solution}</label>
                    <textarea
                      value={solution}
                      onChange={(e) => setSolution(e.target.value)}
                      placeholder={t.solutionPlaceholder}
                      style={solutionTextareaStyle}
                    />
                  </>
                )}

                <button onClick={addQuestionToDraft} style={smallGreenFullButtonStyle}>
                  {t.addQuestion}
                </button>
              </section>

              {draftQuestions.length > 0 && (
                <section style={draftListStyle}>
                  <h3 style={sectionTitleStyle}>
                    {t.addedQuestions}: {draftQuestions.length}
                  </h3>

                  {draftQuestions.map((item, index) => (
                    <article key={item.id} style={draftQuestionStyle}>
                      <strong>
                        {index + 1}. {item.question}
                      </strong>

                      <p>Correct: {item.correctOption}</p>

                      {(activeSubject === "math" || activeSubject === "reasoning") &&
                        item.solution && (
                          <div style={draftSolutionStyle}>
                            <strong>{t.solution}:</strong>
                            <p>{item.solution}</p>
                          </div>
                        )}

                      <button
                        onClick={() => removeDraftQuestion(item.id)}
                        style={smallRedButtonStyle}
                      >
                        {t.delete}
                      </button>
                    </article>
                  ))}
                </section>
              )}

              <div style={buttonRowStyle}>
                <button onClick={saveSet} style={smallBlueButtonStyle}>
                  {t.saveSet}
                </button>

                <button
                  onClick={() => {
                    setShowAddSet(false);
                    clearSetForm();
                  }}
                  style={smallGrayButtonStyle}
                >
                  {t.cancel}
                </button>
              </div>
            </section>
          )}

          {currentSets.length === 0 && (
            <section style={emptyBoxStyle}>{t.noSet}</section>
          )}

          <section style={setGridStyle}>
            {currentSets.map((item) => (
              <article key={item.id} className="mock-set-card" style={setCardStyle}>
                <h3 style={setTitleStyle}>{item.title}</h3>

                <p style={setSubTextStyle}>
                  {t.questions}: {item.questions.length} | {t.duration}: {getQuestionTimeSeconds(item)} sec
                </p>

                <p style={setSubTextStyle}>{item.visible ? t.visible : t.hidden}</p>

                <div style={buttonRowStyle}>
                  <button onClick={() => startTest(item)} style={smallBlueButtonStyle}>
                    {t.startTest}
                  </button>

                  {isAdmin && (
                    <>
                      <button
                        onClick={() => toggleSetVisibility(item.id)}
                        style={smallGreenButtonStyle}
                      >
                        {item.visible ? t.hidden : t.visible}
                      </button>

                      <button onClick={() => deleteSet(item.id)} style={smallRedButtonStyle}>
                        {t.delete}
                      </button>
                    </>
                  )}
                </div>
              </article>
            ))}
          </section>
        </>
      )}
    </main>
  );
}
export default function MockTestPage() {
  return (
    <Suspense fallback={<main style={loadingStyle}>Loading Mock Test...</main>}>
      <MockTestContent />
    </Suspense>
  );
}


function getQuestionTimeSeconds(item: TestSetType) {
  if (typeof item.questionTimeSeconds === "number" && item.questionTimeSeconds > 0) {
    return Math.round(item.questionTimeSeconds);
  }

  if (item.questions.length > 0 && item.durationMinutes > 0) {
    return Math.max(5, Math.round((item.durationMinutes * 60) / item.questions.length));
  }

  return 30;
}

function calculateResultStats(
  runningSet: TestSetType,
  answers: Record<string, CorrectOption>,
  timedOutQuestions: Record<string, boolean>
) {
  let finalScore = 0;
  let wrong = 0;
  let unanswered = 0;

  for (const item of runningSet.questions) {
    const selected = answers[item.id];

    if (!selected || timedOutQuestions[item.id]) {
      unanswered += 1;
    } else if (selected === item.correctOption) {
      finalScore += 1;
    } else {
      wrong += 1;
    }
  }

  return {
    score: finalScore,
    wrong,
    unanswered,
    percentage: runningSet.questions.length
      ? Math.round((finalScore / runningSet.questions.length) * 100)
      : 0,
  };
}

function formatSeconds(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;

  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function getOptionStyle(
  option: CorrectOption,
  correctOption: CorrectOption,
  selectedOption: CorrectOption | undefined,
  locked: boolean
) {
  if (!locked) return optionChoiceStyle;
  if (option === correctOption) return correctOptionStyle;
  if (selectedOption === option && selectedOption !== correctOption) {
    return wrongOptionStyle;
  }
  return mutedOptionStyle;
}

function renderTestOption(
  option: CorrectOption,
  optionText: string,
  question: QuestionType,
  selectedOption: CorrectOption | undefined,
  locked: boolean,
  chooseAnswer: (questionId: string, option: CorrectOption) => void
) {
  return (
    <button
      type="button"
      onClick={() => chooseAnswer(question.id, option)}
      disabled={locked}
      className="mock-option-btn"
      style={getOptionStyle(option, question.correctOption, selectedOption, locked)}
    >
      <span style={optionLetterStyle}>{option}</span>
      <span>{optionText}</span>
    </button>
  );
}

function getFolderBackground(folder: FolderType) {
  if (folder.backgroundImage) {
    return `linear-gradient(135deg, rgba(15,23,42,0.30), rgba(37,99,235,0.45)), url(${folder.backgroundImage}) center/cover no-repeat`;
  }

  return `linear-gradient(135deg, ${
    folder.backgroundColor || "#2563eb"
  }, #7c3aed, #14b8a6)`;
}

function readFirstLocalStorageList<T>(keys: string[]): T[] {
  for (const key of keys) {
    try {
      const value = localStorage.getItem(key);
      if (!value) continue;

      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed as T[];
      }
    } catch {
      continue;
    }
  }

  return [];
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);

    reader.readAsDataURL(file);
  });
}

const mockCss = `
  .mock-page {
    position: relative;
    overflow-x: hidden;
    isolation: isolate;
  }

  .mock-bg-grid {
    position: fixed;
    inset: 0;
    z-index: -5;
    background:
      linear-gradient(120deg, rgba(37,99,235,0.08) 0 2px, transparent 2px 76px),
      linear-gradient(60deg, rgba(124,58,237,0.07) 0 2px, transparent 2px 90px),
      linear-gradient(30deg, rgba(20,184,166,0.06) 0 2px, transparent 2px 104px);
    background-size: 112px 112px;
    animation: mockGridMove 12s linear infinite;
    pointer-events: none;
  }

  .mock-orb-one {
    position: fixed;
    width: 280px;
    height: 280px;
    right: -100px;
    top: 120px;
    border-radius: 50%;
    filter: blur(30px);
    background: rgba(37,99,235,0.16);
    z-index: -4;
    animation: mockOrbOne 7s ease-in-out infinite;
  }

  .mock-orb-two {
    position: fixed;
    width: 260px;
    height: 260px;
    left: -100px;
    bottom: 130px;
    border-radius: 50%;
    filter: blur(30px);
    background: rgba(124,58,237,0.14);
    z-index: -4;
    animation: mockOrbTwo 8s ease-in-out infinite;
  }

  .mock-hero,
  .mock-folder,
  .mock-set-card,
  .mock-question,
  .mock-panel,
  .mock-subject-card {
    transform-style: preserve-3d;
  }

  .mock-hero {
    position: relative;
    overflow: hidden;
    animation: mockHeroFloat 5s ease-in-out infinite;
  }

  .mock-hero::before,
  .mock-folder::before,
  .mock-set-card::before,
  .mock-question::before,
  .mock-panel::before,
  .mock-subject-card::before {
    content: "";
    position: absolute;
    inset: -2px;
    background:
      radial-gradient(circle at 18% 20%, rgba(255,255,255,0.58), transparent 28%),
      linear-gradient(120deg, transparent, rgba(255,255,255,0.35), transparent);
    animation: mockShine 5s ease-in-out infinite;
    pointer-events: none;
  }

  .mock-hero::after,
  .mock-folder::after,
  .mock-set-card::after,
  .mock-question::after,
  .mock-subject-card::after {
    content: "";
    position: absolute;
    inset: 13px;
    border-radius: 24px;
    border: 1px solid rgba(255,255,255,0.45);
    pointer-events: none;
  }

  .mock-action-btn {
    position: relative;
    overflow: hidden;
    animation: mockButtonPulse 2.8s ease-in-out infinite;
  }

  .mock-action-btn::before {
    content: "";
    position: absolute;
    inset: 0;
    left: -130%;
    background: linear-gradient(120deg, transparent, rgba(255,255,255,0.65), transparent);
    animation: mockButtonShine 3.6s ease-in-out infinite;
  }

  .mock-folder,
  .mock-set-card,
  .mock-question,
  .mock-subject-card {
    position: relative;
    overflow: visible;
    animation: mockCardEnter 0.55s ease both, mockCardFloat 4.3s ease-in-out infinite;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }

  .mock-panel {
    overflow: hidden;
  }

  .mock-folder:hover,
  .mock-set-card:hover,
  .mock-subject-card:hover {
    transform: translateY(-8px) rotateX(5deg);
    box-shadow: 0 24px 44px rgba(37,99,235,0.16);
  }

  @keyframes mockGridMove {
    from { background-position: 0 0; }
    to { background-position: 112px 112px; }
  }

  @keyframes mockOrbOne {
    0%, 100% { transform: translate(0,0) scale(1); }
    50% { transform: translate(-28px,24px) scale(1.14); }
  }

  @keyframes mockOrbTwo {
    0%, 100% { transform: translate(0,0) scale(1); }
    50% { transform: translate(26px,-24px) scale(1.14); }
  }

  @keyframes mockHeroFloat {
    0%, 100% { transform: translateY(0) rotateX(0deg); }
    50% { transform: translateY(-7px) rotateX(2deg); }
  }

  @keyframes mockShine {
    0% { transform: translateX(-65%); opacity: 0.7; }
    50% { opacity: 1; }
    100% { transform: translateX(65%); opacity: 0.7; }
  }

  @keyframes mockCardEnter {
    from { opacity: 0; transform: translateY(24px) rotateX(14deg) scale(0.96); }
    to { opacity: 1; transform: translateY(0) rotateX(0deg) scale(1); }
  }

  @keyframes mockCardFloat {
    0%, 100% { transform: translateY(0) rotateX(0deg); }
    50% { transform: translateY(-5px) rotateX(2deg); }
  }

  @keyframes mockButtonPulse {
    0%, 100% { transform: translateY(0); box-shadow: 0 14px 28px rgba(37,99,235,0.18); }
    50% { transform: translateY(-4px); box-shadow: 0 22px 36px rgba(124,58,237,0.22); }
  }

  @keyframes mockButtonShine {
    0% { left: -130%; }
    50% { left: 130%; }
    100% { left: 130%; }
  }

  .mock-running-card {
    animation: mockTestPop 0.65s ease both, mockCardFloat 4.3s ease-in-out infinite;
  }

  .mock-current-question {
    animation: mockQuestionPop 0.5s ease both;
  }

  .mock-option-btn {
    transform-style: preserve-3d;
    transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
  }

  .mock-option-btn:not(:disabled):hover {
    transform: translateY(-4px) rotateX(5deg) scale(1.01);
    box-shadow: 0 18px 34px rgba(37,99,235,0.18);
  }

  .mock-answer-feedback,
  .mock-result-pop {
    animation: mockResultPop 0.55s ease both;
  }

  .mock-timer-bar {
    transition: width 0.35s ease;
  }

  @keyframes mockTestPop {
    from { opacity: 0; transform: translateY(28px) rotateX(16deg) scale(0.94); }
    to { opacity: 1; transform: translateY(0) rotateX(0deg) scale(1); }
  }

  @keyframes mockQuestionPop {
    from { opacity: 0; transform: translateX(28px) rotateY(10deg) scale(0.96); }
    to { opacity: 1; transform: translateX(0) rotateY(0deg) scale(1); }
  }

  @keyframes mockResultPop {
    0% { opacity: 0; transform: translateY(30px) rotateX(18deg) scale(0.88); }
    70% { opacity: 1; transform: translateY(-6px) rotateX(-2deg) scale(1.03); }
    100% { opacity: 1; transform: translateY(0) rotateX(0deg) scale(1); }
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
  padding: "20px",
  paddingBottom: "105px",
};

const backLinkStyle: CSSProperties = {
  position: "relative",
  zIndex: 3,
  display: "inline-block",
  color: "#2563eb",
  fontWeight: "bold",
  textDecoration: "none",
  marginBottom: "18px",
};

const heroStyle: CSSProperties = {
  position: "relative",
  zIndex: 3,
  padding: "28px",
  borderRadius: "30px",
  background:
    "linear-gradient(135deg, rgba(37,99,235,0.92), rgba(124,58,237,0.82), rgba(20,184,166,0.72))",
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
  padding: "9px 13px",
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
  fontWeight: "bold",
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

const examBadgeStyle: CSSProperties = {
  position: "relative",
  zIndex: 5,
  display: "inline-block",
  marginTop: "14px",
  padding: "8px 12px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.20)",
  border: "1px solid rgba(255,255,255,0.35)",
  fontWeight: "bold",
};

const mainButtonStyle: CSSProperties = {
  position: "relative",
  zIndex: 3,
  width: "100%",
  marginTop: "18px",
  padding: "14px",
  border: "none",
  borderRadius: "16px",
  background: "linear-gradient(135deg,#2563eb,#7c3aed,#14b8a6)",
  color: "white",
  fontWeight: "bold",
  fontSize: "16px",
  cursor: "pointer",
};

const panelStyle: CSSProperties = {
  position: "relative",
  zIndex: 3,
  marginTop: "18px",
  padding: "18px",
  borderRadius: "24px",
  background: "rgba(255,255,255,0.94)",
  border: "1px solid rgba(37,99,235,0.12)",
  boxShadow: "0 18px 36px rgba(37,99,235,0.10)",
  overflow: "hidden",
};

const labelStyle: CSSProperties = {
  display: "block",
  color: "#2563eb",
  fontWeight: "bold",
  marginTop: "12px",
};

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "12px",
  marginTop: "8px",
  borderRadius: "13px",
  border: "1px solid rgba(37,99,235,0.20)",
  background: "white",
  color: "#1e3a8a",
  fontSize: "15px",
};

const colorInputStyle: CSSProperties = {
  width: "90px",
  height: "46px",
  marginTop: "8px",
  borderRadius: "12px",
  border: "1px solid rgba(37,99,235,0.20)",
  background: "white",
  cursor: "pointer",
};

const textareaStyle: CSSProperties = {
  ...inputStyle,
  minHeight: "90px",
  resize: "vertical",
};

const solutionTextareaStyle: CSSProperties = {
  ...inputStyle,
  minHeight: "120px",
  resize: "vertical",
  background: "linear-gradient(135deg,#ffffff,#eff6ff)",
  border: "2px solid rgba(20,184,166,0.28)",
};

const buttonRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
  marginTop: "12px",
};

const smallBlueButtonStyle: CSSProperties = {
  padding: "9px 12px",
  border: "none",
  borderRadius: "10px",
  background: "#2563eb",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
};

const smallGreenButtonStyle: CSSProperties = {
  ...smallBlueButtonStyle,
  background: "#14b8a6",
};

const smallGreenFullButtonStyle: CSSProperties = {
  ...smallGreenButtonStyle,
  width: "100%",
  marginTop: "12px",
};

const smallRedButtonStyle: CSSProperties = {
  ...smallBlueButtonStyle,
  background: "#ef4444",
};

const smallGrayButtonStyle: CSSProperties = {
  ...smallBlueButtonStyle,
  background: "#64748b",
};

const emptyBoxStyle: CSSProperties = {
  position: "relative",
  zIndex: 3,
  marginTop: "18px",
  padding: "16px",
  borderRadius: "18px",
  background: "rgba(255,255,255,0.92)",
  color: "#64748b",
  border: "1px solid rgba(37,99,235,0.12)",
};

const folderGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "26px",
  marginTop: "18px",
};

const folderCardStyle: CSSProperties = {
  position: "relative",
  zIndex: 3,
  padding: "20px",
  borderRadius: "26px",
  color: "white",
  minHeight: "150px",
  boxShadow: "0 22px 44px rgba(37,99,235,0.14)",
};

const folderTitleStyle: CSSProperties = {
  position: "relative",
  zIndex: 4,
  margin: 0,
  fontSize: "22px",
  paddingRight: "55px",
};

const folderSubTextStyle: CSSProperties = {
  position: "relative",
  zIndex: 4,
  opacity: 0.92,
  fontWeight: "bold",
};

const openButtonStyle: CSSProperties = {
  position: "relative",
  zIndex: 4,
  marginTop: "12px",
  padding: "10px 14px",
  border: "none",
  borderRadius: "12px",
  background: "rgba(255,255,255,0.25)",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
};

const threeDotWrapStyle: CSSProperties = {
  position: "absolute",
  right: "18px",
  top: "18px",
  zIndex: 9998,
};

const threeDotButtonStyle: CSSProperties = {
  width: "38px",
  height: "38px",
  border: "none",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.25)",
  color: "white",
  fontSize: "25px",
  fontWeight: "bold",
  cursor: "pointer",
};

const folderMenuStyle: CSSProperties = {
  position: "absolute",
  right: 0,
  top: "45px",
  width: "205px",
  padding: "8px",
  borderRadius: "14px",
  background: "white",
  boxShadow: "0 18px 34px rgba(15,23,42,0.20)",
  zIndex: 9999,
};

const menuItemStyle: CSSProperties = {
  display: "block",
  width: "100%",
  padding: "11px 10px",
  border: "none",
  borderRadius: "10px",
  background: "white",
  color: "#1e3a8a",
  textAlign: "left",
  fontWeight: "bold",
  cursor: "pointer",
  fontSize: "15px",
};

const deleteMenuItemStyle: CSSProperties = {
  ...menuItemStyle,
  color: "#ef4444",
};

const inlineEditBoxStyle: CSSProperties = {
  position: "relative",
  zIndex: 5,
  marginTop: "14px",
  padding: "14px",
  borderRadius: "18px",
  background: "rgba(255,255,255,0.92)",
};

const backButtonStyle: CSSProperties = {
  position: "relative",
  zIndex: 3,
  marginTop: "18px",
  padding: "11px 14px",
  border: "none",
  borderRadius: "14px",
  background: "#2563eb",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
};

const sectionTitleStyle: CSSProperties = {
  color: "#2563eb",
  marginTop: 0,
};

const subjectGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "16px",
  marginTop: "18px",
};

const subjectButtonStyle: CSSProperties = {
  position: "relative",
  zIndex: 3,
  display: "grid",
  gap: "8px",
  minHeight: "135px",
  padding: "20px",
  border: "1px solid rgba(255,255,255,0.45)",
  borderRadius: "26px",
  background: "linear-gradient(135deg,#2563eb,#7c3aed,#14b8a6)",
  color: "white",
  cursor: "pointer",
  textAlign: "left",
  boxShadow: "0 22px 44px rgba(37,99,235,0.14)",
};

const subjectPageHeroStyle: CSSProperties = {
  ...subjectButtonStyle,
  marginTop: "18px",
  cursor: "default",
};

const subjectTitleStyle: CSSProperties = {
  position: "relative",
  zIndex: 4,
  fontSize: "22px",
  fontWeight: "900",
};

const subjectSubTextStyle: CSSProperties = {
  position: "relative",
  zIndex: 4,
  fontSize: "14px",
  fontWeight: "bold",
  opacity: 0.95,
};

const questionBuilderStyle: CSSProperties = {
  marginTop: "18px",
  padding: "14px",
  borderRadius: "18px",
  background: "rgba(239,246,255,0.90)",
  border: "1px solid rgba(37,99,235,0.12)",
};

const draftListStyle: CSSProperties = {
  display: "grid",
  gap: "10px",
  marginTop: "14px",
};

const draftQuestionStyle: CSSProperties = {
  position: "relative",
  zIndex: 4,
  padding: "12px",
  borderRadius: "14px",
  background: "white",
  color: "#1e3a8a",
  border: "1px solid rgba(37,99,235,0.12)",
};

const draftSolutionStyle: CSSProperties = {
  marginTop: "10px",
  padding: "10px",
  borderRadius: "12px",
  background: "linear-gradient(135deg,#ecfeff,#f0fdfa)",
  color: "#0f766e",
  border: "1px solid rgba(20,184,166,0.22)",
  whiteSpace: "pre-wrap",
};

const setGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "16px",
  marginTop: "18px",
};

const setCardStyle: CSSProperties = {
  position: "relative",
  zIndex: 3,
  padding: "18px",
  borderRadius: "22px",
  background: "rgba(255,255,255,0.94)",
  border: "1px solid rgba(37,99,235,0.12)",
  boxShadow: "0 18px 36px rgba(37,99,235,0.10)",
};

const setTitleStyle: CSSProperties = {
  position: "relative",
  zIndex: 4,
  color: "#1e3a8a",
  marginTop: 0,
};

const setSubTextStyle: CSSProperties = {
  position: "relative",
  zIndex: 4,
  color: "#64748b",
  fontWeight: "bold",
};

const questionListStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "16px",
  marginTop: "18px",
};

const questionCardStyle: CSSProperties = {
  position: "relative",
  zIndex: 3,
  padding: "18px",
  borderRadius: "22px",
  background: "rgba(255,255,255,0.94)",
  border: "1px solid rgba(37,99,235,0.12)",
  boxShadow: "0 18px 36px rgba(37,99,235,0.10)",
};

const questionTitleStyle: CSSProperties = {
  position: "relative",
  zIndex: 4,
  color: "#1e3a8a",
  marginTop: 0,
};

const optionLabelStyle: CSSProperties = {
  position: "relative",
  zIndex: 4,
  display: "block",
  marginTop: "10px",
  padding: "10px",
  borderRadius: "12px",
  background: "#eff6ff",
  color: "#1e3a8a",
  fontWeight: "bold",
  cursor: "pointer",
};

const scoreBoxStyle: CSSProperties = {
  position: "relative",
  zIndex: 3,
  marginTop: "18px",
  padding: "24px",
  borderRadius: "24px",
  background: "rgba(255,255,255,0.94)",
  border: "1px solid rgba(37,99,235,0.12)",
  boxShadow: "0 18px 36px rgba(37,99,235,0.10)",
  textAlign: "center",
};

const scoreTitleStyle: CSSProperties = {
  color: "#2563eb",
  marginTop: 0,
};

const scoreTextStyle: CSSProperties = {
  color: "#1e3a8a",
  fontSize: "36px",
  fontWeight: "900",
};

const runningTestBoxStyle: CSSProperties = {
  position: "relative",
  zIndex: 3,
  marginTop: "18px",
  padding: "18px",
  borderRadius: "28px",
  background:
    "linear-gradient(135deg,rgba(255,255,255,0.96),rgba(239,246,255,0.94))",
  border: "1px solid rgba(37,99,235,0.14)",
  boxShadow:
    "0 28px 60px rgba(37,99,235,0.16), inset 0 0 30px rgba(255,255,255,0.65)",
};

const testProgressTopStyle: CSSProperties = {
  position: "relative",
  zIndex: 4,
  display: "flex",
  justifyContent: "space-between",
  gap: "10px",
  flexWrap: "wrap",
  color: "#1e3a8a",
  fontWeight: "900",
  marginBottom: "12px",
};

const timerTrackStyle: CSSProperties = {
  position: "relative",
  zIndex: 4,
  height: "12px",
  borderRadius: "999px",
  background: "rgba(148,163,184,0.25)",
  overflow: "hidden",
  marginBottom: "10px",
};

const timerFillStyle: CSSProperties = {
  height: "100%",
  borderRadius: "999px",
  background: "linear-gradient(135deg,#22c55e,#eab308,#ef4444)",
};

const progressTrackStyle: CSSProperties = {
  position: "relative",
  zIndex: 4,
  height: "8px",
  borderRadius: "999px",
  background: "rgba(37,99,235,0.14)",
  overflow: "hidden",
  marginBottom: "16px",
};

const progressFillStyle: CSSProperties = {
  height: "100%",
  borderRadius: "999px",
  background: "linear-gradient(135deg,#2563eb,#7c3aed,#14b8a6)",
  transition: "width 0.35s ease",
};

const currentQuestionCardStyle: CSSProperties = {
  ...questionCardStyle,
  background:
    "linear-gradient(135deg,rgba(255,255,255,0.98),rgba(239,246,255,0.96))",
  transform: "perspective(900px) rotateX(0deg)",
};

const optionChoiceStyle: CSSProperties = {
  position: "relative",
  zIndex: 4,
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginTop: "12px",
  padding: "14px",
  borderRadius: "16px",
  border: "2px solid rgba(37,99,235,0.16)",
  background: "linear-gradient(135deg,#eff6ff,#ffffff)",
  color: "#1e3a8a",
  fontWeight: "900",
  cursor: "pointer",
  textAlign: "left",
};

const correctOptionStyle: CSSProperties = {
  ...optionChoiceStyle,
  border: "2px solid rgba(34,197,94,0.78)",
  background: "linear-gradient(135deg,#dcfce7,#bbf7d0)",
  color: "#14532d",
  cursor: "default",
};

const wrongOptionStyle: CSSProperties = {
  ...optionChoiceStyle,
  border: "2px solid rgba(239,68,68,0.78)",
  background: "linear-gradient(135deg,#fee2e2,#fecaca)",
  color: "#7f1d1d",
  cursor: "default",
};

const mutedOptionStyle: CSSProperties = {
  ...optionChoiceStyle,
  opacity: 0.62,
  cursor: "default",
};

const optionLetterStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "34px",
  height: "34px",
  borderRadius: "999px",
  background: "rgba(37,99,235,0.14)",
  flex: "0 0 auto",
};

const correctFeedbackStyle: CSSProperties = {
  position: "relative",
  zIndex: 4,
  marginTop: "16px",
  padding: "14px",
  borderRadius: "18px",
  background: "linear-gradient(135deg,#dcfce7,#bbf7d0)",
  color: "#14532d",
  fontWeight: "900",
  border: "1px solid rgba(34,197,94,0.55)",
};

const wrongFeedbackStyle: CSSProperties = {
  ...correctFeedbackStyle,
  background: "linear-gradient(135deg,#fee2e2,#fecaca)",
  color: "#7f1d1d",
  border: "1px solid rgba(239,68,68,0.55)",
};

const timeUpFeedbackStyle: CSSProperties = {
  ...correctFeedbackStyle,
  background: "linear-gradient(135deg,#fef3c7,#fde68a)",
  color: "#78350f",
  border: "1px solid rgba(245,158,11,0.55)",
};

const solutionBoxStyle: CSSProperties = {
  position: "relative",
  zIndex: 4,
  marginTop: "16px",
  padding: "16px",
  borderRadius: "20px",
  background: "linear-gradient(135deg,#ecfeff,#f0fdfa,#ffffff)",
  color: "#0f766e",
  border: "2px solid rgba(20,184,166,0.30)",
  boxShadow: "0 16px 34px rgba(20,184,166,0.14)",
  whiteSpace: "pre-wrap",
};

const solutionTitleStyle: CSSProperties = {
  margin: 0,
  marginBottom: "8px",
  color: "#0f766e",
  fontSize: "18px",
  fontWeight: "900",
};

const solutionTextStyle: CSSProperties = {
  margin: 0,
  color: "#134e4a",
  lineHeight: 1.7,
  fontWeight: "700",
};

const finalResultBoxStyle: CSSProperties = {
  ...scoreBoxStyle,
  background:
    "linear-gradient(135deg,rgba(255,255,255,0.96),rgba(219,234,254,0.96),rgba(237,233,254,0.96))",
  boxShadow:
    "0 30px 70px rgba(37,99,235,0.18), inset 0 0 32px rgba(255,255,255,0.72)",
};

const resultBadgeStyle: CSSProperties = {
  fontSize: "54px",
  marginBottom: "8px",
};

const resultStatsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
  gap: "12px",
  marginTop: "16px",
};

const resultStatCardStyle: CSSProperties = {
  display: "grid",
  gap: "8px",
  padding: "14px",
  borderRadius: "18px",
  background: "rgba(255,255,255,0.86)",
  color: "#1e3a8a",
  border: "1px solid rgba(37,99,235,0.12)",
  fontWeight: "900",
};