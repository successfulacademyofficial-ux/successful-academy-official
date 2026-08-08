"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAppLanguage } from "@/hooks/useAppLanguage";

const ADMIN_EMAIL = "successfulacademyofficial@gmail.com";
const SELECTED_EXAM_KEY = "selected_exam_v1";

const FOLDERS_KEY = "job_detail_folders_v5";
const JOB_DETAILS_KEY = "job_details_title_value_v2";

const OLD_FOLDER_KEYS = [
  "job_detail_folders_v5",
  "job_detail_folders_v4",
  "job_detail_folders",
  "job_detail_folders_v2",
  "job_detail_folders_v1",
];

const OLD_DETAILS_KEYS = [
  "job_details_title_value_v2",
  "job_details_title_value_v1",
  "job_dynamic_infos",
  "job_dynamic_infos_v2",
  "job_dynamic_infos_v1",
];

const PDF_DB_NAME = "successful_academy_jobs_db";
const PDF_STORE_NAME = "job_pdfs";

type InnerPage = "" | "pdf" | "details";

type FolderType = {
  id: string;
  name: string;
  exam: string;
  backgroundColor?: string;
  backgroundImage?: string;
  createdAt: number;
};

type JobPdfItem = {
  id: string;
  folderId: string;
  title: string;
  fileName: string;
  dataUrl: string;
  createdAt: number;
};

type JobDetailItem = {
  id: string;
  folderId: string;
  title: string;
  value: string;
  visible: boolean;
  createdAt: number;
};

type DraftDetailItem = {
  id: string;
  title: string;
  value: string;
};

const text = {
  en: {
    loading: "Loading Job Details...",
    back: "Back to Home",
    brand: "Successful Academy Official",
    title: "Job Details",
    subtitle: "Exam-wise job updates, PDFs and important details.",
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
    pdf: "PDF",
    jobDetails: "Job Details",
    addPdf: "Add PDF",
    pdfTitle: "PDF Title",
    choosePdf: "Choose PDF",
    uploadPdf: "Upload PDF",
    noPdf: "No PDF added yet.",
    viewPdf: "View PDF",
    download: "Download",
    addDetail: "Add Detail",
    detailTitle: "Title",
    detailValue: "Value",
    addTitleValue: "Add Title & Value",
    saveAllDetails: "Save All Details",
    addedDetails: "Added Details",
    noDetails: "No details added yet.",
    visible: "Visible to students",
    hidden: "Hidden from students",
    backToOptions: "Back to Options",
  },
  hi: {
    loading: "Job Details लोड हो रहा है...",
    back: "Home par wapas",
    brand: "Successful Academy Official",
    title: "Job Details",
    subtitle: "Exam-wise job updates, PDFs aur important details.",
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
    pdf: "PDF",
    jobDetails: "Job Details",
    addPdf: "Add PDF",
    pdfTitle: "PDF Title",
    choosePdf: "Choose PDF",
    uploadPdf: "Upload PDF",
    noPdf: "Abhi koi PDF nahi hai.",
    viewPdf: "View PDF",
    download: "Download",
    addDetail: "Add Detail",
    detailTitle: "Title",
    detailValue: "Value",
    addTitleValue: "Add Title & Value",
    saveAllDetails: "Save All Details",
    addedDetails: "Added Details",
    noDetails: "Abhi koi details nahi hai.",
    visible: "Students ko dikhega",
    hidden: "Students se hidden",
    backToOptions: "Back to Options",
  },
  bn: {
    loading: "Job Details লোড হচ্ছে...",
    back: "Home-এ ফিরে যান",
    brand: "Successful Academy Official",
    title: "Job Details",
    subtitle: "Exam-wise job updates, PDFs এবং important details.",
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
    pdf: "PDF",
    jobDetails: "Job Details",
    addPdf: "Add PDF",
    pdfTitle: "PDF Title",
    choosePdf: "Choose PDF",
    uploadPdf: "Upload PDF",
    noPdf: "এখনো কোনো PDF নেই।",
    viewPdf: "View PDF",
    download: "Download",
    addDetail: "Add Detail",
    detailTitle: "Title",
    detailValue: "Value",
    addTitleValue: "Add Title & Value",
    saveAllDetails: "Save All Details",
    addedDetails: "Added Details",
    noDetails: "এখনো কোনো details নেই।",
    visible: "Students দেখতে পাবে",
    hidden: "Students থেকে hidden",
    backToOptions: "Back to Options",
  },
};

function JobsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const language = useAppLanguage();
  const t = text[language];

  const [checkingUser, setCheckingUser] = useState(true);
  const [email, setEmail] = useState("");

  const [selectedExam, setSelectedExam] = useState("All Competitive Exams");
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [jobPdfs, setJobPdfs] = useState<JobPdfItem[]>([]);
  const [jobDetails, setJobDetails] = useState<JobDetailItem[]>([]);

  const [showAddFolder, setShowAddFolder] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [folderBgColor, setFolderBgColor] = useState("#2563eb");
  const [folderBgImage, setFolderBgImage] = useState("");

  const [openedFolderId, setOpenedFolderId] = useState("");
  const [innerPage, setInnerPage] = useState<InnerPage>("");

  const [menuOpenId, setMenuOpenId] = useState("");
  const [renameFolderId, setRenameFolderId] = useState("");
  const [renameValue, setRenameValue] = useState("");
  const [backgroundFolderId, setBackgroundFolderId] = useState("");
  const [editBgColor, setEditBgColor] = useState("#2563eb");
  const [editBgImage, setEditBgImage] = useState("");

  const [pdfTitle, setPdfTitle] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const [showAddDetail, setShowAddDetail] = useState(false);
  const [detailTitle, setDetailTitle] = useState("");
  const [detailValue, setDetailValue] = useState("");
  const [draftDetails, setDraftDetails] = useState<DraftDetailItem[]>([]);

  const cleanEmail = email.trim().toLowerCase();
  const isAdmin = cleanEmail === ADMIN_EMAIL;

  const filteredFolders = useMemo(() => {
    return folders.filter((folder) => {
      return (
        selectedExam === "All Competitive Exams" ||
        folder.exam === selectedExam ||
        folder.exam === "All Competitive Exams"
      );
    });
  }, [folders, selectedExam]);

  const openedFolder = folders.find((item) => item.id === openedFolderId);

  const currentPdfs = jobPdfs.filter((item) => item.folderId === openedFolderId);

  const currentDetails = jobDetails.filter((item) => {
    if (item.folderId !== openedFolderId) return false;
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

    const savedFolders = readFirstLocalStorageList<FolderType>(OLD_FOLDER_KEYS);
    const savedDetailsRaw = readFirstLocalStorageList<any>(OLD_DETAILS_KEYS);

    const normalizedDetails: JobDetailItem[] = savedDetailsRaw.map((item) => ({
      id: String(item.id || `${Date.now()}-${Math.random()}`),
      folderId: String(item.folderId || ""),
      title: String(item.title || ""),
      value: String(item.value || item.description || ""),
      visible: typeof item.visible === "boolean" ? item.visible : true,
      createdAt: Number(item.createdAt || Date.now()),
    }));

    setFolders(savedFolders);
    setJobDetails(normalizedDetails);

    localStorage.setItem(FOLDERS_KEY, JSON.stringify(savedFolders));
    localStorage.setItem(JOB_DETAILS_KEY, JSON.stringify(normalizedDetails));

    loadAllPdfsFromDb()
      .then((items) => setJobPdfs(items))
      .catch(() => setJobPdfs([]));

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

  const saveFolders = (items: FolderType[]) => {
    setFolders(items);
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(items));
  };

  const saveJobDetails = (items: JobDetailItem[]) => {
    setJobDetails(items);
    localStorage.setItem(JOB_DETAILS_KEY, JSON.stringify(items));
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
      alert("Folder name likho.");
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
    setInnerPage("");
    setShowAddFolder(false);
    setMenuOpenId("");
    setRenameFolderId("");
    setBackgroundFolderId("");
    setPdfTitle("");
    setPdfFile(null);
    setShowAddDetail(false);
    setDetailTitle("");
    setDetailValue("");
    setDraftDetails([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBackToFolders = () => {
    setOpenedFolderId("");
    setInnerPage("");
    setPdfTitle("");
    setPdfFile(null);
    setShowAddDetail(false);
    setDetailTitle("");
    setDetailValue("");
    setDraftDetails([]);
  };

  const goBackToOptions = () => {
    setInnerPage("");
    setPdfTitle("");
    setPdfFile(null);
    setShowAddDetail(false);
    setDetailTitle("");
    setDetailValue("");
    setDraftDetails([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
        ? {
            ...folder,
            backgroundColor: editBgColor,
            backgroundImage: editBgImage,
          }
        : folder
    );

    saveFolders(updated);
    setBackgroundFolderId("");
    setEditBgImage("");
  };

  const deleteFolder = async (folderId: string) => {
    if (!isAdmin) return;

    if (!confirm("Folder delete karna hai?")) return;

    saveFolders(folders.filter((item) => item.id !== folderId));
    saveJobDetails(jobDetails.filter((item) => item.folderId !== folderId));

    const deletingPdfs = jobPdfs.filter((item) => item.folderId === folderId);

    for (const item of deletingPdfs) {
      await deletePdfFromDb(item.id);
    }

    setJobPdfs(jobPdfs.filter((item) => item.folderId !== folderId));

    if (openedFolderId === folderId) {
      goBackToFolders();
    }

    setMenuOpenId("");
  };

  const uploadPdf = async () => {
    if (!isAdmin) return;

    if (!pdfTitle.trim() || !pdfFile || !openedFolderId) {
      alert("PDF title aur PDF file select karo.");
      return;
    }

    const dataUrl = await fileToDataUrl(pdfFile);

    const item: JobPdfItem = {
      id: makeId(),
      folderId: openedFolderId,
      title: pdfTitle.trim(),
      fileName: pdfFile.name,
      dataUrl,
      createdAt: Date.now(),
    };

    await savePdfToDb(item);
    setJobPdfs([item, ...jobPdfs]);
    setPdfTitle("");
    setPdfFile(null);
  };

  const deletePdf = async (id: string) => {
    if (!isAdmin) return;

    if (!confirm("PDF delete karna hai?")) return;

    await deletePdfFromDb(id);
    setJobPdfs(jobPdfs.filter((item) => item.id !== id));
  };

  const addDetailToDraft = () => {
    if (!isAdmin) return;

    if (!detailTitle.trim() || !detailValue.trim()) {
      alert("Title aur value dono likho.");
      return;
    }

    const item: DraftDetailItem = {
      id: makeId(),
      title: detailTitle.trim(),
      value: detailValue.trim(),
    };

    setDraftDetails([...draftDetails, item]);
    setDetailTitle("");
    setDetailValue("");
  };

  const removeDraftDetail = (id: string) => {
    if (!isAdmin) return;

    setDraftDetails(draftDetails.filter((item) => item.id !== id));
  };

  const saveAllDetails = () => {
    if (!isAdmin) return;

    if (!openedFolderId) {
      alert("Folder open karo.");
      return;
    }

    if (draftDetails.length === 0) {
      alert("Kam se kam 1 title aur value add karo.");
      return;
    }

    const newDetails: JobDetailItem[] = draftDetails.map((item) => ({
      id: makeId(),
      folderId: openedFolderId,
      title: item.title,
      value: item.value,
      visible: true,
      createdAt: Date.now(),
    }));

    saveJobDetails([...newDetails, ...jobDetails]);
    setDraftDetails([]);
    setDetailTitle("");
    setDetailValue("");
    setShowAddDetail(false);
  };

  const toggleDetailVisibility = (id: string) => {
    if (!isAdmin) return;

    const updated = jobDetails.map((item) =>
      item.id === id ? { ...item, visible: !item.visible } : item
    );

    saveJobDetails(updated);
  };

  const deleteDetail = (id: string) => {
    if (!isAdmin) return;

    if (!confirm("Details delete karna hai?")) return;

    saveJobDetails(jobDetails.filter((item) => item.id !== id));
  };

  if (checkingUser) {
    return <main style={loadingStyle}>{t.loading}</main>;
  }

  return (
    <main className="jobs-page" style={mainStyle}>
      <style>{jobsCss}</style>

      <div className="jobs-bg-grid" />
      <div className="jobs-orb-one" />
      <div className="jobs-orb-two" />

      <Link href="/" style={backLinkStyle}>
        {t.back}
      </Link>

      <section className="jobs-hero" style={heroStyle}>
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
                  className="jobs-action-btn"
                  style={mainButtonStyle}
                >
                  {t.addFolder}
                </button>
              )}

              {showAddFolder && (
                <section className="jobs-panel" style={panelStyle}>
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
                className="jobs-folder"
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
                          onClick={() => void deleteFolder(folder.id)}
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

      {openedFolderId && openedFolder && !innerPage && (
        <>
          <button onClick={goBackToFolders} style={backButtonStyle}>
            Back: {openedFolder.name}
          </button>

          <section style={optionGridStyle}>
            <button
              onClick={() => setInnerPage("pdf")}
              className="jobs-folder"
              style={optionCardStyle}
            >
              <span style={optionTitleStyle}>{t.pdf}</span>
              <span style={optionSubStyle}>{openedFolder.name}</span>
            </button>

            <button
              onClick={() => setInnerPage("details")}
              className="jobs-folder"
              style={optionCardStyle}
            >
              <span style={optionTitleStyle}>{t.jobDetails}</span>
              <span style={optionSubStyle}>{openedFolder.name}</span>
            </button>
          </section>
        </>
      )}

      {openedFolderId && openedFolder && innerPage === "pdf" && (
        <>
          <button onClick={goBackToOptions} style={backButtonStyle}>
            {t.backToOptions}
          </button>

          <section className="jobs-folder" style={optionHeroStyle}>
            <span style={optionTitleStyle}>{t.pdf}</span>
            <span style={optionSubStyle}>{openedFolder.name}</span>
          </section>

          {isAdmin && (
            <section className="jobs-panel" style={panelStyle}>
              <h2 style={sectionTitleStyle}>{t.addPdf}</h2>

              <label style={labelStyle}>{t.pdfTitle}</label>
              <input
                value={pdfTitle}
                onChange={(e) => setPdfTitle(e.target.value)}
                placeholder={t.pdfTitle}
                style={inputStyle}
              />

              <label style={labelStyle}>{t.choosePdf}</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                style={inputStyle}
              />

              <button
                onClick={() => void uploadPdf()}
                className="jobs-action-btn"
                style={mainButtonStyle}
              >
                {t.uploadPdf}
              </button>
            </section>
          )}

          {currentPdfs.length === 0 && (
            <section style={emptyBoxStyle}>{t.noPdf}</section>
          )}

          <section style={resourceGridStyle}>
            {currentPdfs.map((item) => (
              <article key={item.id} className="jobs-resource" style={resourceCardStyle}>
                <h3 style={resourceTitleStyle}>{item.title}</h3>
                <p style={resourceSubTextStyle}>{item.fileName}</p>

                <div style={buttonRowStyle}>
                  <button
                    type="button"
                    onClick={() => viewPdfFile(item)}
                    style={smallBlueButtonStyle}
                  >
                    {t.viewPdf}
                  </button>

                  <button
                    type="button"
                    onClick={() => downloadPdfFile(item)}
                    style={smallGreenButtonStyle}
                  >
                    {t.download}
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => void deletePdf(item.id)}
                      style={smallRedButtonStyle}
                    >
                      {t.delete}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </section>
        </>
      )}

      {openedFolderId && openedFolder && innerPage === "details" && (
        <>
          <button onClick={goBackToOptions} style={backButtonStyle}>
            {t.backToOptions}
          </button>

          <section className="jobs-folder" style={optionHeroStyle}>
            <span style={optionTitleStyle}>{t.jobDetails}</span>
            <span style={optionSubStyle}>{openedFolder.name}</span>
          </section>

          {isAdmin && !showAddDetail && (
            <button
              onClick={() => setShowAddDetail(true)}
              className="jobs-action-btn"
              style={mainButtonStyle}
            >
              {t.addDetail}
            </button>
          )}

          {isAdmin && showAddDetail && (
            <section className="jobs-panel" style={panelStyle}>
              <h2 style={sectionTitleStyle}>{t.addDetail}</h2>

              <label style={labelStyle}>{t.detailTitle}</label>
              <input
                value={detailTitle}
                onChange={(e) => setDetailTitle(e.target.value)}
                placeholder="Example: Application Start Date"
                style={inputStyle}
              />

              <label style={labelStyle}>{t.detailValue}</label>
              <textarea
                value={detailValue}
                onChange={(e) => setDetailValue(e.target.value)}
                placeholder="Example: 10/07/2026"
                style={textareaStyle}
              />

              <button onClick={addDetailToDraft} style={smallGreenFullButtonStyle}>
                {t.addTitleValue}
              </button>

              {draftDetails.length > 0 && (
                <section style={draftListStyle}>
                  <h3 style={sectionTitleStyle}>
                    {t.addedDetails}: {draftDetails.length}
                  </h3>

                  {draftDetails.map((item, index) => (
                    <article key={item.id} style={draftDetailStyle}>
                      <h3 style={resourceTitleStyle}>
                        {index + 1}. {item.title}
                      </h3>

                      <p style={resourceSubTextStyle}>{item.value}</p>

                      <button
                        onClick={() => removeDraftDetail(item.id)}
                        style={smallRedButtonStyle}
                      >
                        {t.delete}
                      </button>
                    </article>
                  ))}
                </section>
              )}

              <div style={buttonRowStyle}>
                <button onClick={saveAllDetails} style={smallBlueButtonStyle}>
                  {t.saveAllDetails}
                </button>

                <button
                  onClick={() => {
                    setShowAddDetail(false);
                    setDetailTitle("");
                    setDetailValue("");
                    setDraftDetails([]);
                  }}
                  style={smallGrayButtonStyle}
                >
                  {t.cancel}
                </button>
              </div>
            </section>
          )}

          {currentDetails.length === 0 && (
            <section style={emptyBoxStyle}>{t.noDetails}</section>
          )}

          <section style={resourceGridStyle}>
            {currentDetails.map((item) => (
              <article key={item.id} className="jobs-resource" style={resourceCardStyle}>
                <h3 style={resourceTitleStyle}>{item.title}</h3>
                <p style={resourceSubTextStyle}>{item.value}</p>

                {isAdmin && (
                  <>
                    <p style={resourceSubTextStyle}>
                      {item.visible ? t.visible : t.hidden}
                    </p>

                    <div style={buttonRowStyle}>
                      <button
                        onClick={() => toggleDetailVisibility(item.id)}
                        style={smallGreenButtonStyle}
                      >
                        {item.visible ? t.hidden : t.visible}
                      </button>

                      <button
                        onClick={() => deleteDetail(item.id)}
                        style={smallRedButtonStyle}
                      >
                        {t.delete}
                      </button>
                    </div>
                  </>
                )}
              </article>
            ))}
          </section>
        </>
      )}
    </main>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<main style={loadingStyle}>Loading Job Details...</main>}>
      <JobsContent />
    </Suspense>
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

function openPdfDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(PDF_DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(PDF_STORE_NAME)) {
        db.createObjectStore(PDF_STORE_NAME, {
          keyPath: "id",
        });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function savePdfToDb(item: JobPdfItem) {
  const db = await openPdfDb();

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(PDF_STORE_NAME, "readwrite");
    const store = tx.objectStore(PDF_STORE_NAME);

    store.put(item);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  db.close();
}

async function deletePdfFromDb(id: string) {
  const db = await openPdfDb();

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(PDF_STORE_NAME, "readwrite");
    const store = tx.objectStore(PDF_STORE_NAME);

    store.delete(id);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  db.close();
}

async function loadAllPdfsFromDb(): Promise<JobPdfItem[]> {
  const db = await openPdfDb();

  const items = await new Promise<JobPdfItem[]>((resolve, reject) => {
    const tx = db.transaction(PDF_STORE_NAME, "readonly");
    const store = tx.objectStore(PDF_STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result as JobPdfItem[]);
    request.onerror = () => reject(request.error);
  });

  db.close();

  return items.sort((a, b) => b.createdAt - a.createdAt);
}

function dataUrlToBlob(dataUrl: string) {
  const [header = "", base64Data = ""] = dataUrl.split(",");
  const mimeMatch = header.match(/:(.*?);/);
  const mime = mimeMatch?.[1] || "application/pdf";

  const byteString = atob(base64Data);
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const uint8Array = new Uint8Array(arrayBuffer);

  for (let i = 0; i < byteString.length; i += 1) {
    uint8Array[i] = byteString.charCodeAt(i);
  }

  return new Blob([arrayBuffer], { type: mime });
}

function viewPdfFile(item: JobPdfItem) {
  const blob = dataUrlToBlob(item.dataUrl);
  const blobUrl = URL.createObjectURL(blob);

  window.open(blobUrl, "_blank", "noopener,noreferrer");

  setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
  }, 60000);
}

function downloadPdfFile(item: JobPdfItem) {
  const blob = dataUrlToBlob(item.dataUrl);
  const blobUrl = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = item.fileName || `${item.title || "job-details"}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
  }, 60000);
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);

    reader.readAsDataURL(file);
  });
}

const jobsCss = `
  .jobs-page {
    position: relative;
    overflow-x: hidden;
    isolation: isolate;
  }

  .jobs-bg-grid {
    position: fixed;
    inset: 0;
    z-index: -5;
    background:
      linear-gradient(120deg, rgba(37,99,235,0.08) 0 2px, transparent 2px 76px),
      linear-gradient(60deg, rgba(124,58,237,0.07) 0 2px, transparent 2px 90px),
      linear-gradient(30deg, rgba(20,184,166,0.06) 0 2px, transparent 2px 104px);
    background-size: 112px 112px;
    animation: jobsGridMove 12s linear infinite;
    pointer-events: none;
  }

  .jobs-orb-one {
    position: fixed;
    width: 280px;
    height: 280px;
    right: -100px;
    top: 120px;
    border-radius: 50%;
    filter: blur(30px);
    background: rgba(37,99,235,0.16);
    z-index: -4;
    animation: jobsOrbOne 7s ease-in-out infinite;
  }

  .jobs-orb-two {
    position: fixed;
    width: 260px;
    height: 260px;
    left: -100px;
    bottom: 130px;
    border-radius: 50%;
    filter: blur(30px);
    background: rgba(124,58,237,0.14);
    z-index: -4;
    animation: jobsOrbTwo 8s ease-in-out infinite;
  }

  .jobs-hero,
  .jobs-folder,
  .jobs-resource,
  .jobs-panel {
    transform-style: preserve-3d;
  }

  .jobs-hero {
    position: relative;
    overflow: hidden;
    animation: jobsHeroFloat 5s ease-in-out infinite;
  }

  .jobs-hero::before,
  .jobs-folder::before,
  .jobs-resource::before,
  .jobs-panel::before {
    content: "";
    position: absolute;
    inset: -2px;
    background:
      radial-gradient(circle at 18% 20%, rgba(255,255,255,0.58), transparent 28%),
      linear-gradient(120deg, transparent, rgba(255,255,255,0.35), transparent);
    animation: jobsShine 5s ease-in-out infinite;
    pointer-events: none;
  }

  .jobs-hero::after,
  .jobs-folder::after,
  .jobs-resource::after {
    content: "";
    position: absolute;
    inset: 13px;
    border-radius: 24px;
    border: 1px solid rgba(255,255,255,0.45);
    pointer-events: none;
  }

  .jobs-action-btn {
    position: relative;
    overflow: hidden;
    animation: jobsButtonPulse 2.8s ease-in-out infinite;
  }

  .jobs-action-btn::before {
    content: "";
    position: absolute;
    inset: 0;
    left: -130%;
    background: linear-gradient(120deg, transparent, rgba(255,255,255,0.65), transparent);
    animation: jobsButtonShine 3.6s ease-in-out infinite;
  }

  .jobs-folder,
  .jobs-resource {
    position: relative;
    overflow: visible;
    animation: jobsCardEnter 0.55s ease both, jobsCardFloat 4.3s ease-in-out infinite;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }

  .jobs-panel {
    overflow: hidden;
  }

  .jobs-folder:hover,
  .jobs-resource:hover {
    transform: translateY(-8px) rotateX(5deg);
    box-shadow: 0 24px 44px rgba(37,99,235,0.16);
  }

  @keyframes jobsGridMove {
    from { background-position: 0 0; }
    to { background-position: 112px 112px; }
  }

  @keyframes jobsOrbOne {
    0%, 100% { transform: translate(0,0) scale(1); }
    50% { transform: translate(-28px,24px) scale(1.14); }
  }

  @keyframes jobsOrbTwo {
    0%, 100% { transform: translate(0,0) scale(1); }
    50% { transform: translate(26px,-24px) scale(1.14); }
  }

  @keyframes jobsHeroFloat {
    0%, 100% { transform: translateY(0) rotateX(0deg); }
    50% { transform: translateY(-7px) rotateX(2deg); }
  }

  @keyframes jobsShine {
    0% { transform: translateX(-65%); opacity: 0.7; }
    50% { opacity: 1; }
    100% { transform: translateX(65%); opacity: 0.7; }
  }

  @keyframes jobsCardEnter {
    from { opacity: 0; transform: translateY(24px) rotateX(14deg) scale(0.96); }
    to { opacity: 1; transform: translateY(0) rotateX(0deg) scale(1); }
  }

  @keyframes jobsCardFloat {
    0%, 100% { transform: translateY(0) rotateX(0deg); }
    50% { transform: translateY(-5px) rotateX(2deg); }
  }

  @keyframes jobsButtonPulse {
    0%, 100% { transform: translateY(0); box-shadow: 0 14px 28px rgba(37,99,235,0.18); }
    50% { transform: translateY(-4px); box-shadow: 0 22px 36px rgba(124,58,237,0.22); }
  }

  @keyframes jobsButtonShine {
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

const textareaStyle: CSSProperties = {
  ...inputStyle,
  minHeight: "110px",
  resize: "vertical",
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

const optionGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "16px",
  marginTop: "18px",
};

const optionCardStyle: CSSProperties = {
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

const optionHeroStyle: CSSProperties = {
  ...optionCardStyle,
  cursor: "default",
  marginTop: "18px",
};

const optionTitleStyle: CSSProperties = {
  position: "relative",
  zIndex: 4,
  fontSize: "24px",
  fontWeight: "900",
};

const optionSubStyle: CSSProperties = {
  position: "relative",
  zIndex: 4,
  fontSize: "14px",
  fontWeight: "bold",
  opacity: 0.95,
};

const sectionTitleStyle: CSSProperties = {
  color: "#2563eb",
  marginTop: 0,
};

const draftListStyle: CSSProperties = {
  display: "grid",
  gap: "12px",
  marginTop: "16px",
};

const draftDetailStyle: CSSProperties = {
  position: "relative",
  zIndex: 4,
  padding: "14px",
  borderRadius: "16px",
  background: "white",
  border: "1px solid rgba(37,99,235,0.12)",
};

const resourceGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "16px",
  marginTop: "18px",
};

const resourceCardStyle: CSSProperties = {
  position: "relative",
  zIndex: 3,
  padding: "18px",
  borderRadius: "22px",
  background: "rgba(255,255,255,0.94)",
  border: "1px solid rgba(37,99,235,0.12)",
  boxShadow: "0 18px 36px rgba(37,99,235,0.10)",
};

const resourceTitleStyle: CSSProperties = {
  position: "relative",
  zIndex: 4,
  color: "#1e3a8a",
  marginTop: 0,
};

const resourceSubTextStyle: CSSProperties = {
  position: "relative",
  zIndex: 4,
  color: "#64748b",
  fontWeight: "bold",
  lineHeight: 1.6,
};