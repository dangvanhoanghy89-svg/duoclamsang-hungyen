/**
 * PHARMAVITA / CLINICALRX - QUẢN LÝ TÀI LIỆU PDF ĐÍNH KÈM (INDEXEDDB STORAGE)
 * Bệnh viện Đa khoa tỉnh Hưng Yên
 * Lưu trữ file PDF an toàn trong IndexedDB của trình duyệt mà không làm quá tải localStorage
 */

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
  const db = await openPDFDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(id);

    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export async function getPdfAttachmentsByDrugId(drugId) {
  const db = await openPDFDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const index = store.index("drugId");
    const req = index.getAll(drugId);

    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
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

  if (att.fileUrl && att.fileUrl.startsWith("http")) {
    return att.fileUrl;
  }

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

  let downloadUrl = att.fileUrl;
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

  if (att.fileUrl && att.fileUrl.startsWith("http")) {
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
