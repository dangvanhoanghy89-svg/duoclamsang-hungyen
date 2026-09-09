/**
 * PHARMAVITA / CLINICALRX - MODULE DƯỢC CẢNH GIÁC & BÁO CÁO ADR
 * Chuẩn hóa theo Biểu mẫu Báo cáo Biến cố bất lợi của Trung tâm DI & ADR Quốc gia (Bộ Y tế Việt Nam)
 * Tích hợp Thang đánh giá nhân quả Naranjo tự động
 */

import { CONFIG } from "../config.js";

const NARANJO_QUESTIONS = [
  { q: "1. Đã có báo cáo kết luận trước đây về phản ứng bất lợi này chưa?", scores: [1, 0, 0] },
  { q: "2. Biến cố xuất hiện sau khi dùng thuốc nghi ngờ?", scores: [2, -1, 0] },
  { q: "3. Phản ứng có cải thiện khi ngừng thuốc hoặc dùng chất đối kháng đặc hiệu?", scores: [1, 0, 0] },
  { q: "4. Phản ứng có tái xuất hiện khi tái sử dụng thuốc (Rechallenge)?", scores: [2, -1, 0] },
  { q: "5. Có nguyên nhân thay thế nào khác (ngoài thuốc) có thể gây ra phản ứng này không?", scores: [-1, 2, 0] },
  { q: "6. Phản ứng có xuất hiện trở lại khi dùng giả dược (Placebo) không?", scores: [-1, 1, 0] },
  { q: "7. Thuốc có được phát hiện trong máu (hoặc dịch sinh học khác) ở nồng độ độc hại không?", scores: [1, 0, 0] },
  { q: "8. Phản ứng có nặng hơn khi tăng liều, hoặc nhẹ hơn khi giảm liều không?", scores: [1, 0, 0] },
  { q: "9. Bệnh nhân đã từng có phản ứng tương tự với cùng thuốc hoặc thuốc tương tự trước đây?", scores: [1, 0, 0] },
  { q: "10. Biến cố bất lợi có được xác nhận bởi bất kỳ bằng chứng khách quan nào không?", scores: [1, 0, 0] }
];

export function initAdrModule() {
  renderNaranjoQuestions();
  setupAdrForm();
  renderAdrReportHistory();
}

function renderNaranjoQuestions() {
  const container = document.getElementById("naranjoQuestionsList");
  if (!container) return;

  container.innerHTML = NARANJO_QUESTIONS.map((item, index) => `
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 border-b border-slate-100 text-xs">
      <span class="text-slate-700 font-medium">${item.q}</span>
      <div class="flex items-center gap-3 shrink-0">
        <label class="inline-flex items-center gap-1 cursor-pointer">
          <input type="radio" name="naranjo_${index}" value="${item.scores[0]}" onchange="window.calculateNaranjoScore()" class="text-teal-600 focus:ring-teal-500">
          <span class="text-slate-600">Có</span>
        </label>
        <label class="inline-flex items-center gap-1 cursor-pointer">
          <input type="radio" name="naranjo_${index}" value="${item.scores[1]}" onchange="window.calculateNaranjoScore()" class="text-teal-600 focus:ring-teal-500">
          <span class="text-slate-600">Không</span>
        </label>
        <label class="inline-flex items-center gap-1 cursor-pointer">
          <input type="radio" name="naranjo_${index}" value="${item.scores[2]}" checked onchange="window.calculateNaranjoScore()" class="text-teal-600 focus:ring-teal-500">
          <span class="text-slate-600">Không rõ</span>
        </label>
      </div>
    </div>
  `).join("");

  calculateNaranjoScore();
}

export function calculateNaranjoScore() {
  let totalScore = 0;
  for (let i = 0; i < NARANJO_QUESTIONS.length; i++) {
    const radios = document.getElementsByName(`naranjo_${i}`);
    for (const r of radios) {
      if (r.checked) {
        totalScore += parseInt(r.value, 10);
        break;
      }
    }
  }

  const scoreBadge = document.getElementById("naranjoTotalScore");
  const verdictText = document.getElementById("naranjoVerdict");
  if (!scoreBadge || !verdictText) return;

  scoreBadge.textContent = totalScore;

  let verdict = "";
  let badgeColor = "";
  if (totalScore >= 9) {
    verdict = "CHẮC CHẮN (Definite) - Mối liên quan nhân quả rất rõ rệt";
    badgeColor = "text-rose-700 font-bold";
  } else if (totalScore >= 5) {
    verdict = "CÓ KHẢ NĂNG (Probable) - Rất có thể do thuốc gây ra";
    badgeColor = "text-amber-700 font-bold";
  } else if (totalScore >= 1) {
    verdict = "CÓ THỂ (Possible) - Có thể liên quan đến thuốc";
    badgeColor = "text-blue-700 font-bold";
  } else {
    verdict = "NGHI NGỜ / KHÔNG CHẮC CHẮN (Doubtful)";
    badgeColor = "text-slate-500 font-medium";
  }

  verdictText.innerHTML = `<span class="${badgeColor}">${verdict}</span>`;
}

function setupAdrForm() {
  const form = document.getElementById("adrReportForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const patientCode = form.elements["adrPatientCode"].value.trim();
    const age = form.elements["adrPatientAge"].value;
    const gender = form.elements["adrPatientGender"].value;
    const suspectedDrug = form.elements["adrSuspectedDrug"].value.trim();
    const dosage = form.elements["adrDrugDosage"].value.trim();
    const reaction = form.elements["adrReactionDesc"].value.trim();
    const severity = form.elements["adrSeverity"].value;
    const outcome = form.elements["adrOutcome"].value;

    if (!patientCode || !suspectedDrug || !reaction) {
      alert("Vui lòng điền các trường bắt buộc: Mã người bệnh, Thuốc nghi ngờ và Mô tả biến cố.");
      return;
    }

    const totalScore = document.getElementById("naranjoTotalScore")?.textContent || "0";
    const verdict = document.getElementById("naranjoVerdict")?.innerText || "";

    const newReport = {
      id: Date.now(),
      patientCode,
      age,
      gender,
      suspectedDrug,
      dosage,
      reaction,
      severity,
      outcome,
      naranjoScore: totalScore,
      naranjoVerdict: verdict,
      reportedAt: new Date().toLocaleString("vi-VN")
    };

    const list = getStoredAdrReports();
    list.unshift(newReport);
    localStorage.setItem(CONFIG.STORAGE_KEYS.OFFLINE_ADR, JSON.stringify(list));

    alert("Đã lưu biên bản báo cáo ADR thành công!");
    form.reset();
    renderNaranjoQuestions();
    renderAdrReportHistory();
  });
}

function getStoredAdrReports() {
  const data = localStorage.getItem(CONFIG.STORAGE_KEYS.OFFLINE_ADR);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
  }
  return [
    {
      id: 1,
      patientCode: "BN-2026-9812",
      age: "62",
      gender: "Nam",
      suspectedDrug: "Vancomycin 1g",
      dosage: "1g IV truyền 30 phút",
      reaction: "Bệnh nhân đỏ bừng toàn bộ nửa thân trên, mặt cổ, ngứa dữ dội, tụt huyết áp 85/50 mmHg ngay trong lúc đang truyền chai kháng sinh (Hội chứng Red Man do truyền quá nhanh).",
      severity: "Nghiêm trọng (Nhập viện/Kéo dài nằm viện)",
      outcome: "Hồi phục hoàn toàn sau ngừng truyền và dùng Dimedrol",
      naranjoScore: "7",
      naranjoVerdict: "CÓ KHẢ NĂNG (Probable)",
      reportedAt: "02/09/2026, 10:15"
    }
  ];
}

function renderAdrReportHistory() {
  const container = document.getElementById("adrHistoryContainer");
  if (!container) return;

  const list = getStoredAdrReports();
  if (list.length === 0) {
    container.innerHTML = `<div class="text-xs text-slate-400 py-6 text-center">Chưa có báo cáo ADR nào được lưu.</div>`;
    return;
  }

  container.innerHTML = list.map(item => `
    <div class="p-4 bg-white border border-slate-200 rounded-xl space-y-2 text-xs shadow-xs">
      <div class="flex items-center justify-between">
        <span class="font-bold text-slate-900">${item.patientCode} (${item.age}t / ${item.gender})</span>
        <span class="text-slate-400">${item.reportedAt}</span>
      </div>
      <div class="text-slate-700">
        <strong>Thuốc nghi ngờ:</strong> <span class="text-rose-700 font-bold">${escapeHtml(item.suspectedDrug)}</span> (${escapeHtml(item.dosage || "")})
      </div>
      <p class="text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
        ${escapeHtml(item.reaction)}
      </p>
      <div class="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-[11px]">
        <span class="text-slate-500">Mức độ: <strong class="text-slate-800">${item.severity}</strong></span>
        <span class="px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 font-semibold">
          Naranjo: ${item.naranjoScore} điểm (${item.naranjoVerdict.split(" - ")[0]})
        </span>
      </div>
    </div>
  `).join("");
}

export function printAdrReport() {
  window.print();
}

function escapeHtml(s) {
  return String(s || "").replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m]));
}

window.calculateNaranjoScore = calculateNaranjoScore;
window.printAdrReport = printAdrReport;
