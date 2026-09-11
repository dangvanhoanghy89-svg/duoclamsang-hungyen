/**
 * PHARMAVITA / CLINICALRX - QUẢN LÝ TÀI LIỆU PDF ĐÍNH KÈM (INDEXEDDB & GITHUB REPO STORAGE)
 * Bệnh viện Đa khoa tỉnh Hưng Yên
 * Tích hợp lưu trữ vĩnh viễn trong kho GitHub (assets/pdfs/) và bộ nhớ IndexedDB
 */

import { STATIC_PDF_CATALOG } from "./staticPdfs.js?v=20260911_v28_autoheal_pdf";

const DB_NAME = "ClinicalRx_PDF_Store_v1";
const DB_VERSION = 1;
const STORE_NAME = "drug_pdfs";

let dbInstance = null;

export function openPDFDatabase() {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("drugId", "drugId", { unique: false });
      }
    };

    req.onsuccess = (e) => {
      dbInstance = e.target.result;
      resolve(dbInstance);
    };

    req.onerror = (e) => {
      console.error("Lỗi khởi tạo IndexedDB cho PDF:", e);
      reject(req.error);
    };
  });
}

export async function savePdfAttachment(attachment) {
  // attachment: { id, drugId, title, fileName, fileSize, fileType, dataUrl, uploadedAt }
  const db = await openPDFDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(attachment);

    req.onsuccess = () => resolve(attachment);
    req.onerror = () => reject(req.error);
  });
}

export async function getPdfAttachmentById(id) {
  // 1. Kiểm tra trong danh mục tài liệu lưu trữ cố định trên GitHub
  const staticAtt = STATIC_PDF_CATALOG.find(a => a.id === id || a.fileName === id);
  if (staticAtt) return staticAtt;

  // 2. Kiểm tra trong danh mục thuốc hiện hành (bao gồm thuốc đồng bộ từ Supabase Cloud)
  if (typeof window !== "undefined" && window.getActiveDrugsDatabase) {
    try {
      const drugs = window.getActiveDrugsDatabase();
      for (const d of drugs) {
        if (Array.isArray(d.attachments)) {
          const found = d.attachments.find(a => a.id === id || a.fileName === id);
          if (found) return found;
        }
      }
    } catch (e) {}
  }

  // 3. Kiểm tra trong cơ sở dữ liệu IndexedDB của trình duyệt
  try {
    const db = await openPDFDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);

      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.error("Lỗi đọc PDF từ IndexedDB:", err);
    return null;
  }
}

export async function getPdfAttachmentsByDrugId(drugId) {
  const staticList = STATIC_PDF_CATALOG.filter(a => a.drugId === drugId);
  try {
    const db = await openPDFDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const index = store.index("drugId");
      const req = index.getAll(drugId);

      req.onsuccess = () => {
        const localList = req.result || [];
        const combined = [...staticList];
        const existingFileNames = new Set(staticList.map(s => (s.fileName || "").toLowerCase()));
        localList.forEach(l => {
          if (!existingFileNames.has((l.fileName || "").toLowerCase())) {
            combined.push(l);
          }
        });
        resolve(combined);
      };
      req.onerror = () => resolve(staticList);
    });
  } catch (err) {
    return staticList;
  }
}

export async function deletePdfAttachmentById(id) {
  const db = await openPDFDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);

    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

export function dataUrlToBlob(dataUrl) {
  try {
    const parts = dataUrl.split(";base64,");
    const contentType = parts[0].split(":")[1] || "application/pdf";
    const raw = atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    return new Blob([uInt8Array], { type: contentType });
  } catch (err) {
    console.error("Lỗi chuyển đổi DataURL sang Blob:", err);
    return null;
  }
}

export async function getPdfBlobUrl(attachmentOrId) {
  let att = attachmentOrId;
  if (typeof attachmentOrId === "string") {
    att = await getPdfAttachmentById(attachmentOrId);
  }

  if (!att) return null;

  // File lưu trong GitHub (assets/pdfs/...) hoặc link URL online
  if (att.fileUrl) {
    return att.fileUrl;
  }

  // File lưu dạng Base64 trong IndexedDB
  if (att.dataUrl) {
    const blob = dataUrlToBlob(att.dataUrl);
    if (blob) {
      return URL.createObjectURL(blob);
    }
  }

  return null;
}

export async function downloadPdfAttachment(pdfId, fallbackName = "document.pdf") {
  const att = await getPdfAttachmentById(pdfId);
  if (!att) {
    alert("Không tìm thấy tài liệu PDF trong cơ sở dữ liệu!");
    return;
  }

  // Tải file trực tiếp từ GitHub repo
  if (att.fileUrl) {
    const a = document.createElement("a");
    a.href = att.fileUrl;
    a.download = att.fileName || fallbackName;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return;
  }

  let downloadUrl = null;
  let isBlob = false;

  if (att.dataUrl) {
    const blob = dataUrlToBlob(att.dataUrl);
    if (blob) {
      downloadUrl = URL.createObjectURL(blob);
      isBlob = true;
    }
  }

  if (!downloadUrl) {
    alert("Dữ liệu file PDF không hợp lệ!");
    return;
  }

  const a = document.createElement("a");
  a.href = downloadUrl;
  a.download = att.fileName || fallbackName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  if (isBlob) {
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);
  }
}

export async function openPdfInNewWindow(pdfId) {
  const att = await getPdfAttachmentById(pdfId);
  if (!att) {
    alert("Không tìm thấy tài liệu PDF trong cơ sở dữ liệu!");
    return;
  }

  // Mở file trực tiếp từ đường dẫn GitHub repo hoặc URL online
  if (att.fileUrl) {
    window.open(att.fileUrl, "_blank");
    return;
  }

  if (att.dataUrl) {
    const blob = dataUrlToBlob(att.dataUrl);
    if (blob) {
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
      return;
    }
  }

  alert("Không thể mở tài liệu PDF!");
}

export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

if (typeof window !== "undefined") {
  window.getPdfAttachmentById = getPdfAttachmentById;
  window.getPdfBlobUrl = getPdfBlobUrl;
  window.downloadPdfAttachment = downloadPdfAttachment;
  window.openPdfInNewWindow = openPdfInNewWindow;
}
