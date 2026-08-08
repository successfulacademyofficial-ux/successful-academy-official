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

const LIVE_FOLDERS_KEY = "live_classes_live_folders_v7";
const RECORDED_FOLDERS_KEY = "live_classes_recorded_folders_v7";
const CLASS_ITEMS_KEY = "live_classes_items_v7";

const OLD_LIVE_FOLDER_KEYS = [
  "live_classes_live_folders_v7",
  "live_classes_live_folders_v6",
  "live_classes_live_folders_v5",
  "live_classes_live_folders_v4",
  "live_classes_live_folders_v3",
];

const OLD_RECORDED_FOLDER_KEYS = [
  "live_classes_recorded_folders_v7",
  "live_classes_recorded_folders_v6",
  "live_classes_recorded_folders_v5",
  "live_classes_recorded_folders_v4",
  "live_classes_recorded_folders_v3",
];

const OLD_CLASS_ITEM_KEYS = [
  "live_classes_items_v7",
  "live_classes_items_v6",
  "live_classes_items_v5",
  "live_classes_items_v4",
  "live_classes_items_v3",
];

type ClassTab = "live" | "recorded";

type FolderType = {
  id: string;
  name: string;
  exam: string;
  backgroundColor?: string;
  backgroundImage?: string;
  createdAt: number;
};

type ClassItem = {
  id: string;
  folderId: string;
  type: ClassTab;
  title: string;
  link: string;
  visible: boolean;
  createdAt: number;
};

const text = {
  en: {
    loading: "Loading Live Classes...",
    back: "Back to Home",
    brand: "Successful Academy Official",
    title: "Live Classes",
    subtitle: "Exam-wise live and recorded classes for students.",
    adminMode: "Admin Mode",
    studentMode: "Student Mode",
    selectedExam: "Selected Exam",
    live: "Live Classes",
    recorded: "Recorded Classes",
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
    addClass: "Add Class",
    classTitle: "Class Title",
    classLink: "YouTube / Class Link",
    saveClass: "Save Class",
    noClass: "No class added yet.",
    watch: "Watch Class",
    visible: "Visible to students",
    hidden: "Hidden from students",
  },
  hi: {
    loading: "Live Classes लोड हो रहा है...",
    back: "Home par wapas",
    brand: "Successful Academy Official",
    title: "Live Classes",
    subtitle: "Students ke liye exam-wise live aur recorded classes.",
    adminMode: "Admin Mode",
    studentMode: "Student Mode",
    selectedExam: "Selected Exam",
    live: "Live Classes",
    recorded: "Recorded Classes",
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
    addClass: "Add Class",
    classTitle: "Class Title",
    classLink: "YouTube / Class Link",
    saveClass: "Save Class",
    noClass: "Abhi koi class nahi hai.",
    watch: "Watch Class",
    visible: "Students ko dikhega",
    hidden: "Students se hidden",
  },
  bn: {
    loading: "Live Classes লোড হচ্ছে...",
    back: "Home-এ ফিরে যান",
    brand: "Successful Academy Official",
    title: "Live Classes",
    subtitle: "Students-এর জন্য exam-wise live এবং recorded classes.",
    adminMode: "Admin Mode",
    studentMode: "Student Mode",
    selectedExam: "Selected Exam",
    live: "Live Classes",
    recorded: "Recorded Classes",
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
    addClass: "Add Class",
    classTitle: "Class Title",
    classLink: "YouTube / Class Link",
    saveClass: "Save Class",
    noClass: "এখনো কোনো class নেই।",
    watch: "Watch Class",
    visible: "Students দেখতে পাবে",
    hidden: "Students থেকে hidden",
  },
};

function LiveClassesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const language = useAppLanguage();
  const t = text[language];

  const [checkingUser, setCheckingUser] = useState(true);
  const [email, setEmail] = useState("");

  const [selectedExam, setSelectedExam] = useState("All Competitive Exams");
  const [activeTab, setActiveTab] = useState<ClassTab>("live");

  const [liveFolders, setLiveFolders] = useState<FolderType[]>([]);
  const [recordedFolders, setRecordedFolders] = useState<FolderType[]>([]);
  const [classItems, setClassItems] = useState<ClassItem[]>([]);

  const [showAddFolder, setShowAddFolder] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [folderBgColor, setFolderBgColor] = useState("#ef4444");
  const [folderBgImage, setFolderBgImage] = useState("");

  const [openedFolderId, setOpenedFolderId] = useState("");
  const [menuOpenId, setMenuOpenId] = useState("");
  const [renameFolderId, setRenameFolderId] = useState("");
  const [renameValue, setRenameValue] = useState("");
  const [backgroundFolderId, setBackgroundFolderId] = useState("");
  const [editBgColor, setEditBgColor] = useState("#ef4444");
  const [editBgImage, setEditBgImage] = useState("");

  const [classTitle, setClassTitle] = useState("");
  const [classLink, setClassLink] = useState("");

  const cleanEmail = email.trim().toLowerCase();
  const isAdmin = cleanEmail === ADMIN_EMAIL;

  const currentFolders = activeTab === "live" ? liveFolders : recordedFolders;

  const filteredFolders = useMemo(() => {
    return currentFolders.filter((folder) => {
      return (
        selectedExam === "All Competitive Exams" ||
        folder.exam === selectedExam ||
        folder.exam === "All Competitive Exams"
      );
    });
  }, [currentFolders, selectedExam]);

  const openedFolder = currentFolders.find((item) => item.id === openedFolderId);

  const currentClasses = classItems.filter((item) => {
    if (item.folderId !== openedFolderId) return false;
    if (item.type !== activeTab) return false;
    if (isAdmin) return true;
    return item.visible;
  });

  useEffect(() => {
    const examFromUrl = searchParams.get("exam");
    const examFromStorage = localStorage.getItem(SELECTED_EXAM_KEY);

    if (examFromUrl) {
      setSelectedExam(examFromUrl);
      localStorage.setItem(SELECTED_EXAM_KEY, examFromUrl);
    } else if (examFromStorage) {
      setSelectedExam(examFromStorage);
    }

    const savedLiveFolders =
      readFirstLocalStorageList<FolderType>(OLD_LIVE_FOLDER_KEYS);
    const savedRecordedFolders =
      readFirstLocalStorageList<FolderType>(OLD_RECORDED_FOLDER_KEYS);
    const savedClassItems =
      readFirstLocalStorageList<ClassItem>(OLD_CLASS_ITEM_KEYS);

    setLiveFolders(savedLiveFolders);
    setRecordedFolders(savedRecordedFolders);
    setClassItems(savedClassItems);

    localStorage.setItem(LIVE_FOLDERS_KEY, JSON.stringify(savedLiveFolders));
    localStorage.setItem(
      RECORDED_FOLDERS_KEY,
      JSON.stringify(savedRecordedFolders)
    );
    localStorage.setItem(CLASS_ITEMS_KEY, JSON.stringify(savedClassItems));

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

  const saveLiveFolders = (items: FolderType[]) => {
    setLiveFolders(items);
    localStorage.setItem(LIVE_FOLDERS_KEY, JSON.stringify(items));
  };

  const saveRecordedFolders = (items: FolderType[]) => {
    setRecordedFolders(items);
    localStorage.setItem(RECORDED_FOLDERS_KEY, JSON.stringify(items));
  };

  const saveCurrentFolders = (items: FolderType[]) => {
    if (activeTab === "live") {
      saveLiveFolders(items);
    } else {
      saveRecordedFolders(items);
    }
  };

  const saveClassItems = (items: ClassItem[]) => {
    setClassItems(items);
    localStorage.setItem(CLASS_ITEMS_KEY, JSON.stringify(items));
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

    if (activeTab === "live") {
      saveLiveFolders([newFolder, ...liveFolders]);
    } else {
      saveRecordedFolders([newFolder, ...recordedFolders]);
    }

    setFolderName("");
    setFolderBgColor("#ef4444");
    setFolderBgImage("");
    setShowAddFolder(false);
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
      alert("Folder name likho.");
      return;
    }

    const updated = currentFolders.map((folder) =>
      folder.id === renameFolderId ? { ...folder, name: cleanName } : folder
    );

    saveCurrentFolders(updated);
    setRenameFolderId("");
    setRenameValue("");
  };

  const openBackgroundBox = (folder: FolderType) => {
    if (!isAdmin) return;

    setBackgroundFolderId(folder.id);
    setEditBgColor(folder.backgroundColor || "#ef4444");
    setEditBgImage(folder.backgroundImage || "");
    setRenameFolderId("");
    setMenuOpenId("");
  };

  const saveBackgroundChange = () => {
    if (!isAdmin) return;

    const updated = currentFolders.map((folder) =>
      folder.id === backgroundFolderId
        ? {
            ...folder,
            backgroundColor: editBgColor,
            backgroundImage: editBgImage,
          }
        : folder
    );

    saveCurrentFolders(updated);
    setBackgroundFolderId("");
    setEditBgImage("");
  };

  const deleteFolder = (folderId: string) => {
    if (!isAdmin) return;

    if (!confirm("Do you want to delete this folder?")) return;

    if (activeTab === "live") {
      saveLiveFolders(liveFolders.filter((item) => item.id !== folderId));
    } else {
      saveRecordedFolders(recordedFolders.filter((item) => item.id !== folderId));
    }

    saveClassItems(classItems.filter((item) => item.folderId !== folderId));

    if (openedFolderId === folderId) {
      setOpenedFolderId("");
    }

    setMenuOpenId("");
  };

  const openFolder = (folderId: string) => {
    setOpenedFolderId(folderId);
    setShowAddFolder(false);
    setMenuOpenId("");
    setRenameFolderId("");
    setBackgroundFolderId("");
  };

  const goBackToFolders = () => {
    setOpenedFolderId("");
    setClassTitle("");
    setClassLink("");
  };

  const addClass = () => {
    if (!isAdmin) return;

    if (!classTitle.trim() || !classLink.trim() || !openedFolderId) {
      alert("Please enter a class title and link.");
      return;
    }

    const item: ClassItem = {
      id: makeId(),
      folderId: openedFolderId,
      type: activeTab,
      title: classTitle.trim(),
      link: classLink.trim(),
      visible: true,
      createdAt: Date.now(),
    };

    saveClassItems([item, ...classItems]);
    setClassTitle("");
    setClassLink("");
  };
  void sendNotificationToStudents({
  title: "Successful Academy Official",
  body:
    activeTab === "live"
      ? "New Live Class uploaded."
      : "New Recorded Class uploaded.",
  url: `/live-classes?exam=${encodeURIComponent(selectedExam)}`,
});

  const toggleClassVisibility = (id: string) => {
    if (!isAdmin) return;

    const updated = classItems.map((item) =>
      item.id === id ? { ...item, visible: !item.visible } : item
    );

    saveClassItems(updated);
  };

  const deleteClass = (id: string) => {
    if (!isAdmin) return;

    if (!confirm("Do you want to delete this class?")) return;

    saveClassItems(classItems.filter((item) => item.id !== id));
  };

  const changeTab = (tab: ClassTab) => {
    setActiveTab(tab);
    setOpenedFolderId("");
    setShowAddFolder(false);
    setMenuOpenId("");
    setRenameFolderId("");
    setBackgroundFolderId("");
  };

  if (checkingUser) {
    return <main style={loadingStyle}>{t.loading}</main>;
  }

  return (
    <main className="live-page" style={mainStyle}>
      <style>{liveCss}</style>

      <div className="live-bg-grid" />
      <div className="live-orb-one" />
      <div className="live-orb-two" />

      <Link href="/" style={backLinkStyle}>
        {t.back}
      </Link>

      <section className="live-hero" style={heroStyle}>
        <div style={modeBadgeStyle}>{isAdmin ? t.adminMode : t.studentMode}</div>

        <p style={brandStyle}>{t.brand}</p>
        <h1 style={heroTitleStyle}>{t.title}</h1>
        <p style={heroTextStyle}>{t.subtitle}</p>

        <div style={examBadgeStyle}>
          {t.selectedExam}: {selectedExam}
        </div>
      </section>

      <section style={tabBoxStyle}>
        <button
          onClick={() => changeTab("live")}
          style={activeTab === "live" ? activeTabStyle : tabButtonStyle}
        >
          {t.live}
        </button>

        <button
          onClick={() => changeTab("recorded")}
          style={activeTab === "recorded" ? activeTabStyle : tabButtonStyle}
        >
          {t.recorded}
        </button>
      </section>

      {!openedFolderId && (
        <>
          {isAdmin && (
            <>
              {!showAddFolder && (
                <button
                  onClick={() => setShowAddFolder(true)}
                  className="live-action-btn"
                  style={mainButtonStyle}
                >
                  {t.addFolder}
                </button>
              )}

              {showAddFolder && (
                <section className="live-panel" style={panelStyle}>
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
                className="live-folder"
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
                        <button
                          onClick={() => openRenameBox(folder)}
                          style={menuItemStyle}
                        >
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
                      <button
                        onClick={saveBackgroundChange}
                        style={smallBlueButtonStyle}
                      >
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

      {openedFolderId && openedFolder && (
        <>
          <button onClick={goBackToFolders} style={backButtonStyle}>
            Back: {openedFolder.name}
          </button>

          {isAdmin && (
            <section className="live-panel" style={panelStyle}>
              <h2 style={sectionTitleStyle}>{t.addClass}</h2>

              <label style={labelStyle}>{t.classTitle}</label>
              <input
                value={classTitle}
                onChange={(e) => setClassTitle(e.target.value)}
                placeholder={t.classTitle}
                style={inputStyle}
              />

              <label style={labelStyle}>{t.classLink}</label>
              <input
                value={classLink}
                onChange={(e) => setClassLink(e.target.value)}
                placeholder={t.classLink}
                style={inputStyle}
              />

              <button onClick={addClass} className="live-action-btn" style={mainButtonStyle}>
                {t.saveClass}
              </button>
            </section>
          )}

          {currentClasses.length === 0 && (
            <section style={emptyBoxStyle}>{t.noClass}</section>
          )}

          <section style={classGridStyle}>
            {currentClasses.map((item) => (
              <article key={item.id} className="live-class-card" style={classCardStyle}>
                <h3 style={classTitleStyle}>{item.title}</h3>

                <p style={classSubTextStyle}>
                  {item.visible ? t.visible : t.hidden}
                </p>

                <div style={buttonRowStyle}>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    style={smallLinkButtonStyle}
                  >
                    {t.watch}
                  </a>

                  {isAdmin && (
                    <>
                      <button
                        onClick={() => toggleClassVisibility(item.id)}
                        style={smallGreenButtonStyle}
                      >
                        {item.visible ? t.hidden : t.visible}
                      </button>

                      <button
                        onClick={() => deleteClass(item.id)}
                        style={smallRedButtonStyle}
                      >
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
export default function LiveClassesPage() {
  return (
    <Suspense fallback={<main style={loadingStyle}>Loading Live Classes...</main>}>
      <LiveClassesContent />
    </Suspense>
  );
}

function getFolderBackground(folder: FolderType) {
  if (folder.backgroundImage) {
    return `linear-gradient(135deg, rgba(15,23,42,0.30), rgba(239,68,68,0.45)), url(${folder.backgroundImage}) center/cover no-repeat`;
  }

  return `linear-gradient(135deg, ${
    folder.backgroundColor || "#ef4444"
  }, #f97316, #2563eb)`;
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

const liveCss = `
  .live-page {
    position: relative;
    overflow-x: hidden;
    isolation: isolate;
  }

  .live-bg-grid {
    position: fixed;
    inset: 0;
    z-index: -5;
    background:
      linear-gradient(120deg, rgba(239,68,68,0.08) 0 2px, transparent 2px 76px),
      linear-gradient(60deg, rgba(249,115,22,0.07) 0 2px, transparent 2px 90px),
      linear-gradient(30deg, rgba(37,99,235,0.06) 0 2px, transparent 2px 104px);
    background-size: 112px 112px;
    animation: liveGridMove 12s linear infinite;
    pointer-events: none;
  }

  .live-orb-one {
    position: fixed;
    width: 280px;
    height: 280px;
    right: -100px;
    top: 120px;
    border-radius: 50%;
    filter: blur(30px);
    background: rgba(239,68,68,0.16);
    z-index: -4;
    animation: liveOrbOne 7s ease-in-out infinite;
  }

  .live-orb-two {
    position: fixed;
    width: 260px;
    height: 260px;
    left: -100px;
    bottom: 130px;
    border-radius: 50%;
    filter: blur(30px);
    background: rgba(249,115,22,0.14);
    z-index: -4;
    animation: liveOrbTwo 8s ease-in-out infinite;
  }

  .live-hero,
  .live-folder,
  .live-class-card,
  .live-panel {
    transform-style: preserve-3d;
  }

  .live-hero {
    position: relative;
    overflow: hidden;
    animation: liveHeroFloat 5s ease-in-out infinite;
  }

  .live-hero::before,
  .live-folder::before,
  .live-class-card::before,
  .live-panel::before {
    content: "";
    position: absolute;
    inset: -2px;
    background:
      radial-gradient(circle at 18% 20%, rgba(255,255,255,0.58), transparent 28%),
      linear-gradient(120deg, transparent, rgba(255,255,255,0.35), transparent);
    animation: liveShine 5s ease-in-out infinite;
    pointer-events: none;
  }

  .live-hero::after,
  .live-folder::after,
  .live-class-card::after {
    content: "";
    position: absolute;
    inset: 13px;
    border-radius: 24px;
    border: 1px solid rgba(255,255,255,0.45);
    pointer-events: none;
  }

  .live-action-btn {
    position: relative;
    overflow: hidden;
    animation: liveButtonPulse 2.8s ease-in-out infinite;
  }

  .live-action-btn::before {
    content: "";
    position: absolute;
    inset: 0;
    left: -130%;
    background: linear-gradient(120deg, transparent, rgba(255,255,255,0.65), transparent);
    animation: liveButtonShine 3.6s ease-in-out infinite;
  }

  .live-folder,
  .live-class-card {
    position: relative;
    overflow: visible;
    animation: liveCardEnter 0.55s ease both, liveCardFloat 4.3s ease-in-out infinite;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }

  .live-panel {
    overflow: hidden;
  }

  .live-folder:hover,
  .live-class-card:hover {
    transform: translateY(-8px) rotateX(5deg);
    box-shadow: 0 24px 44px rgba(239,68,68,0.16);
  }

  @keyframes liveGridMove {
    from { background-position: 0 0; }
    to { background-position: 112px 112px; }
  }

  @keyframes liveOrbOne {
    0%, 100% { transform: translate(0,0) scale(1); }
    50% { transform: translate(-28px,24px) scale(1.14); }
  }

  @keyframes liveOrbTwo {
    0%, 100% { transform: translate(0,0) scale(1); }
    50% { transform: translate(26px,-24px) scale(1.14); }
  }

  @keyframes liveHeroFloat {
    0%, 100% { transform: translateY(0) rotateX(0deg); }
    50% { transform: translateY(-7px) rotateX(2deg); }
  }

  @keyframes liveShine {
    0% { transform: translateX(-65%); opacity: 0.7; }
    50% { opacity: 1; }
    100% { transform: translateX(65%); opacity: 0.7; }
  }

  @keyframes liveCardEnter {
    from { opacity: 0; transform: translateY(24px) rotateX(14deg) scale(0.96); }
    to { opacity: 1; transform: translateY(0) rotateX(0deg) scale(1); }
  }

  @keyframes liveCardFloat {
    0%, 100% { transform: translateY(0) rotateX(0deg); }
    50% { transform: translateY(-5px) rotateX(2deg); }
  }

  @keyframes liveButtonPulse {
    0%, 100% { transform: translateY(0); box-shadow: 0 14px 28px rgba(239,68,68,0.18); }
    50% { transform: translateY(-4px); box-shadow: 0 22px 36px rgba(249,115,22,0.22); }
  }

  @keyframes liveButtonShine {
    0% { left: -130%; }
    50% { left: 130%; }
    100% { left: 130%; }
  }
`;

const loadingStyle: CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#fff7ed",
  color: "#ef4444",
  fontSize: "22px",
  fontWeight: "bold",
};

const mainStyle: CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(180deg,#ffffff 0%,#fff7ed 45%,#eff6ff 100%)",
  padding: "20px",
  paddingBottom: "105px",
};

const backLinkStyle: CSSProperties = {
  position: "relative",
  zIndex: 3,
  display: "inline-block",
  color: "#ef4444",
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
    "linear-gradient(135deg, rgba(239,68,68,0.92), rgba(249,115,22,0.82), rgba(37,99,235,0.72))",
  color: "white",
  boxShadow:
    "0 24px 55px rgba(239,68,68,0.18), inset 0 0 30px rgba(255,255,255,0.18)",
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

const tabBoxStyle: CSSProperties = {
  position: "relative",
  zIndex: 3,
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "12px",
  marginTop: "18px",
};

const tabButtonStyle: CSSProperties = {
  padding: "14px",
  border: "none",
  borderRadius: "18px",
  background: "rgba(255,255,255,0.92)",
  color: "#ef4444",
  fontWeight: "bold",
  cursor: "pointer",
  boxShadow: "0 12px 24px rgba(239,68,68,0.08)",
};

const activeTabStyle: CSSProperties = {
  ...tabButtonStyle,
  background: "linear-gradient(135deg,#ef4444,#f97316,#2563eb)",
  color: "white",
};

const mainButtonStyle: CSSProperties = {
  position: "relative",
  zIndex: 3,
  width: "100%",
  marginTop: "18px",
  padding: "14px",
  border: "none",
  borderRadius: "16px",
  background: "linear-gradient(135deg,#ef4444,#f97316,#2563eb)",
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
  border: "1px solid rgba(239,68,68,0.12)",
  boxShadow: "0 18px 36px rgba(239,68,68,0.10)",
  overflow: "hidden",
};

const labelStyle: CSSProperties = {
  display: "block",
  color: "#c2410c",
  fontWeight: "bold",
  marginTop: "12px",
};

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "12px",
  marginTop: "8px",
  borderRadius: "13px",
  border: "1px solid rgba(239,68,68,0.20)",
  background: "white",
  color: "#1e3a8a",
  fontSize: "15px",
};

const colorInputStyle: CSSProperties = {
  width: "90px",
  height: "46px",
  marginTop: "8px",
  borderRadius: "12px",
  border: "1px solid rgba(239,68,68,0.20)",
  background: "white",
  cursor: "pointer",
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

const smallRedButtonStyle: CSSProperties = {
  ...smallBlueButtonStyle,
  background: "#ef4444",
};

const smallGrayButtonStyle: CSSProperties = {
  ...smallBlueButtonStyle,
  background: "#64748b",
};

const smallLinkButtonStyle: CSSProperties = {
  ...smallBlueButtonStyle,
  display: "inline-block",
  textDecoration: "none",
};

const emptyBoxStyle: CSSProperties = {
  position: "relative",
  zIndex: 3,
  marginTop: "18px",
  padding: "16px",
  borderRadius: "18px",
  background: "rgba(255,255,255,0.92)",
  color: "#64748b",
  border: "1px solid rgba(239,68,68,0.12)",
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
  boxShadow: "0 22px 44px rgba(239,68,68,0.14)",
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
  background: "#ef4444",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
};

const sectionTitleStyle: CSSProperties = {
  color: "#ef4444",
  marginTop: 0,
};

const classGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "16px",
  marginTop: "18px",
};

const classCardStyle: CSSProperties = {
  position: "relative",
  zIndex: 3,
  padding: "18px",
  borderRadius: "22px",
  background: "rgba(255,255,255,0.94)",
  border: "1px solid rgba(239,68,68,0.12)",
  boxShadow: "0 18px 36px rgba(239,68,68,0.10)",
};

const classTitleStyle: CSSProperties = {
  position: "relative",
  zIndex: 4,
  color: "#1e3a8a",
  marginTop: 0,
};

const classSubTextStyle: CSSProperties = {
  position: "relative",
  zIndex: 4,
  color: "#64748b",
  fontWeight: "bold",
};