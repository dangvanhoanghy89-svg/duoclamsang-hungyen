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

export function getCurrentAppUser() {
  if (window.getCurrentUser) {
    const u = window.getCurrentUser();
    if (u) return u;
  }
  try {
    const raw = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_USER) || localStorage.getItem("clinicalrx_auth_user_v2");
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

export function isClinicalDoctor() {
  const user = getCurrentAppUser();
  return user && user.role === "doctor";
}

export function initAdrModule() {
  renderNaranjoQuestions();
  setupAdrForm();
  renderAdrReportHistory();
  updateAdrAuthUI();
}

export function updateAdrAuthUI() {
  const user = getCurrentAppUser();
  const isDoc = isClinicalDoctor();

  const userStatusBadge = document.getElementById("adrUserStatus");
  const authToggleBtn = document.getElementById("adrAuthBtn");
  const noticeContainer = document.getElementById("adrDoctorNotice");
  const form = document.getElementById("adrReportForm");
  const submitBtn = document.getElementById("adrSubmitBtn");
  const reporterNameInput = document.getElementById("adrReporterName");
  const reporterDeptInput = document.getElementById("adrReporterDept");

  // 1. Top status badge
  if (userStatusBadge) {
    if (user) {
      if (user.role === "doctor") {
        userStatusBadge.innerHTML = `
          <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300 shadow-2xs">
            <i data-lucide="stethoscope" class="w-3.5 h-3.5 text-purple-600"></i>
            <span>${user.fullName} (${user.roleLabel})</span>
            <span class="ml-1 px-1.5 py-0.5 rounded bg-purple-600 text-white text-[10px] font-bold">Đủ quyền báo cáo</span>
          </span>
        `;
      } else if (user.role === "admin") {
        userStatusBadge.innerHTML = `
          <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs">
            <i data-lucide="shield-check" class="w-3.5 h-3.5 text-rose-600"></i>
            <span>${user.fullName} (${user.roleLabel})</span>
            <span class="ml-1 px-1.5 py-0.5 rounded bg-slate-600 text-white text-[10px] font-bold">Thẩm định & Giám sát</span>
          </span>
        `;
      } else {
        userStatusBadge.innerHTML = `
          <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-300 shadow-2xs">
            <i data-lucide="clipboard-list" class="w-3.5 h-3.5 text-indigo-600"></i>
            <span>${user.fullName} (${user.roleLabel})</span>
            <span class="ml-1 px-1.5 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-bold">Dược cảnh giác / Thẩm định</span>
          </span>
        `;
      }
    } else {
      userStatusBadge.innerHTML = `
        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
          <i data-lucide="lock" class="w-3.5 h-3.5 text-amber-500"></i>
          <span>Chưa đăng nhập (Khách vãng lai)</span>
        </span>
      `;
    }
  }

  // 2. Action button in top banner
  if (authToggleBtn) {
    if (user) {
      if (user.role === "doctor") {
        authToggleBtn.innerHTML = `<i data-lucide="user-check" class="w-3.5 h-3.5 inline mr-1"></i> Bác sĩ đang trực`;
        authToggleBtn.className = "px-3.5 py-1.5 rounded-xl border border-purple-300 bg-purple-50 text-purple-800 text-xs font-bold transition-colors cursor-default";
        authToggleBtn.onclick = null;
      } else {
        authToggleBtn.innerHTML = `<i data-lucide="arrow-left-right" class="w-3.5 h-3.5 inline mr-1"></i> Đổi sang Bác sĩ`;
        authToggleBtn.className = "px-3.5 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-colors cursor-pointer";
        authToggleBtn.onclick = () => {
          if (window.openLoginModal) window.openLoginModal();
        };
      }
    } else {
      authToggleBtn.innerHTML = `<i data-lucide="log-in" class="w-3.5 h-3.5 inline mr-1"></i> Đăng nhập Bác sĩ`;
      authToggleBtn.className = "px-3.5 py-1.5 rounded-xl border border-purple-600 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer";
      authToggleBtn.onclick = () => {
        if (window.openLoginModal) window.openLoginModal();
      };
    }
  }

  // 3. Notice Container
  if (noticeContainer) {
    if (isDoc) {
      noticeContainer.innerHTML = `
        <div class="p-3.5 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between shadow-2xs">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-purple-600 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
              ${user.avatar || "B"}
            </div>
            <div>
              <div class="font-bold text-purple-950 text-xs">${user.fullName}</div>
              <div class="text-[10px] text-purple-700 font-medium">${user.title || "Bác sĩ điều trị"} · ${user.department}</div>
            </div>
          </div>
          <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300 shrink-0">
            Đủ quyền báo cáo ADR
          </span>
        </div>
      `;
    } else if (!user) {
      noticeContainer.innerHTML = `
        <div class="p-4 bg-amber-50 border border-amber-300/80 rounded-xl space-y-2.5 text-center shadow-xs">
          <div class="w-9 h-9 mx-auto rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
            <i data-lucide="lock" class="w-4 h-4"></i>
          </div>
          <div>
            <h4 class="font-black text-amber-950 text-xs sm:text-sm">Chỉ Bác Sĩ Lâm Sàng Mới Được Gửi Báo Cáo ADR</h4>
            <p class="text-[11px] text-amber-800 mt-1 leading-relaxed">
              Theo quy định phân quyền chuyên môn và Dược cảnh giác bệnh viện, tính năng lập và gửi biên bản báo cáo phản ứng có hại của thuốc (ADR) chỉ dành riêng cho <strong>Bác sĩ lâm sàng điều trị</strong>.
            </p>
          </div>
          <button type="button" onclick="window.openLoginModal()" 
            class="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer">
            <i data-lucide="log-in" class="w-3.5 h-3.5"></i>
            <span>Đăng nhập tài khoản Bác sĩ</span>
          </button>
        </div>
      `;
    } else {
      noticeContainer.innerHTML = `
        <div class="p-3.5 bg-rose-50 border border-rose-300/80 rounded-xl space-y-2 shadow-xs">
          <div class="flex items-start gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold shrink-0">
              <i data-lucide="shield-alert" class="w-4 h-4"></i>
            </div>
            <div class="text-xs">
              <div class="font-bold text-rose-950">Không đủ thẩm quyền gửi báo cáo ADR</div>
              <p class="text-[11px] text-rose-800 mt-0.5 leading-relaxed">
                Tài khoản hiện tại: <strong>${user.fullName}</strong> (${user.roleLabel}).<br>
                Theo quy trình chuyên môn, chỉ tài khoản <strong>Bác sĩ lâm sàng</strong> mới có quyền gửi biên bản báo cáo ADR ca bệnh. Dược sĩ lâm sàng / Quản trị viên phụ trách tiếp nhận, đánh giá thang Naranjo và tổng hợp báo cáo gửi Trung tâm DI & ADR Quốc gia.
              </p>
            </div>
          </div>
          <div class="pt-2 border-t border-rose-200 flex items-center justify-between text-[11px]">
            <span class="text-slate-500">Cần lập báo cáo biến cố bất lợi cho người bệnh?</span>
            <button type="button" onclick="window.handleLogout(); setTimeout(() => window.openLoginModal(), 150);" class="text-rose-700 font-bold hover:underline cursor-pointer">
              Đổi sang tài khoản Bác sĩ
            </button>
          </div>
        </div>
      `;
    }
  }

  // 4. Populate Reporter Inputs
  if (reporterNameInput) {
    reporterNameInput.value = isDoc ? `${user.fullName} (${user.title || "Bác sĩ điều trị"})` : (user ? `${user.fullName} (${user.roleLabel})` : "Chưa đăng nhập Bác sĩ");
  }
  if (reporterDeptInput) {
    reporterDeptInput.value = isDoc ? user.department : (user ? user.department : "BVĐK Tỉnh Hưng Yên");
  }

  // 5. Enable/disable form inputs
  if (form) {
    const inputs = form.querySelectorAll("input, select, textarea");
    inputs.forEach(el => {
      if (el.id === "adrReporterName" || el.id === "adrReporterDept") {
        el.readOnly = true;
        return;
      }
      el.disabled = !isDoc;
      if (!isDoc) {
        el.classList.add("bg-slate-100", "cursor-not-allowed", "opacity-60");
      } else {
        el.classList.remove("bg-slate-100", "cursor-not-allowed", "opacity-60");
      }
    });
  }

  // 6. Update submit button
  if (submitBtn) {
    submitBtn.disabled = !isDoc;
    if (isDoc) {
      submitBtn.className = "w-full py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer";
      submitBtn.innerHTML = `
        <i data-lucide="check-circle" class="w-4 h-4"></i>
        <span>Lưu & Gửi Báo Cáo ADR Vào Hệ Thống</span>
      `;
      submitBtn.onclick = null;
    } else if (!user) {
      submitBtn.className = "w-full py-2.5 rounded-xl bg-slate-200 text-slate-500 hover:bg-amber-100 hover:text-amber-900 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer";
      submitBtn.innerHTML = `
        <i data-lucide="lock" class="w-4 h-4 text-amber-600"></i>
        <span>Đăng nhập Bác sĩ để gửi báo cáo ADR</span>
      `;
      submitBtn.onclick = (e) => {
        e.preventDefault();
        if (window.openLoginModal) window.openLoginModal();
      };
    } else {
      submitBtn.className = "w-full py-2.5 rounded-xl bg-slate-200 text-slate-400 font-bold text-xs flex items-center justify-center gap-1.5 cursor-not-allowed";
      submitBtn.innerHTML = `
        <i data-lucide="slash" class="w-4 h-4"></i>
        <span>Chỉ Bác sĩ lâm sàng mới có quyền gửi</span>
      `;
      submitBtn.onclick = (e) => {
        e.preventDefault();
        alert(`Tài khoản hiện tại (${user.roleLabel}) không có quyền gửi báo cáo ADR. Chức năng chỉ dành riêng cho Bác sĩ lâm sàng.`);
      };
    }
  }

  if (window.lucide) window.lucide.createIcons();
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

    if (!isClinicalDoctor()) {
      alert("Từ chối thao tác: Chỉ tài khoản của Bác sĩ lâm sàng mới có quyền gửi báo cáo phản ứng có hại của thuốc (ADR)!\n\nVui lòng đăng nhập với tài khoản Bác sĩ (bacsi@bvdk-hungyen.vn).");
      if (window.openLoginModal) window.openLoginModal();
      return;
    }

    const patientCode = form.elements["adrPatientCode"].value.trim();
    const age = form.elements["adrPatientAge"].value;
    const gender = form.elements["adrPatientGender"].value;
    const weight = form.elements["adrPatientWeight"] ? form.elements["adrPatientWeight"].value : "";
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
    const user = getCurrentAppUser();

    const newReport = {
      id: Date.now(),
      patientCode,
      age,
      gender,
      weight,
      suspectedDrug,
      dosage,
      reaction,
      severity,
      outcome,
      naranjoScore: totalScore,
      naranjoVerdict: verdict,
      reportedAt: new Date().toLocaleString("vi-VN"),
      doctorName: user?.fullName || "BS.CKI. Trần Thị Bác Sĩ",
      doctorDept: user?.department || "Khoa Hồi sức tích cực - Chống độc (ICU)",
      doctorTitle: user?.title || "Bác sĩ điều trị"
    };

    const list = getStoredAdrReports();
    list.unshift(newReport);
    localStorage.setItem(CONFIG.STORAGE_KEYS.OFFLINE_ADR, JSON.stringify(list));

    alert("Đã lưu và gửi biên bản báo cáo ADR thành công!");
    form.reset();
    updateAdrAuthUI();
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
      weight: "65",
      suspectedDrug: "Vancomycin 1g",
      dosage: "1g IV truyền 30 phút",
      reaction: "Bệnh nhân đỏ bừng toàn bộ nửa thân trên, mặt cổ, ngứa dữ dội, tụt huyết áp 85/50 mmHg ngay trong lúc đang truyền chai kháng sinh (Hội chứng Red Man do truyền quá nhanh).",
      severity: "Nghiêm trọng (Nhập viện/Kéo dài nằm viện)",
      outcome: "Hồi phục hoàn toàn sau ngừng truyền và dùng Dimedrol",
      naranjoScore: "7",
      naranjoVerdict: "CÓ KHẢ NĂNG (Probable)",
      reportedAt: "02/09/2026, 10:15",
      doctorName: "BS.CKI. Trần Thị Bác Sĩ",
      doctorDept: "Khoa Hồi sức tích cực - Chống độc (ICU)",
      doctorTitle: "Bác sĩ điều trị"
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
        <span class="font-bold text-slate-900">${escapeHtml(item.patientCode)} (${item.age ? `${escapeHtml(item.age)}t` : "—"} / ${escapeHtml(item.gender)})</span>
        <span class="text-slate-400 text-[11px]">${escapeHtml(item.reportedAt)}</span>
      </div>
      <div class="text-slate-700">
        <strong>Thuốc nghi ngờ:</strong> <span class="text-rose-700 font-bold">${escapeHtml(item.suspectedDrug)}</span> ${item.dosage ? `(${escapeHtml(item.dosage)})` : ""}
      </div>
      <p class="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
        ${escapeHtml(item.reaction)}
      </p>
      <div class="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-[11px]">
        <span class="text-slate-500">Mức độ: <strong class="text-slate-800">${escapeHtml(item.severity)}</strong></span>
        <span class="px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 font-semibold">
          Naranjo: ${escapeHtml(item.naranjoScore)} điểm (${escapeHtml(item.naranjoVerdict ? item.naranjoVerdict.split(" - ")[0] : "")})
        </span>
      </div>
      ${item.doctorName ? `
        <div class="text-[11px] text-purple-700 font-medium flex items-center gap-1.5 pt-1.5 border-t border-slate-100">
          <i data-lucide="stethoscope" class="w-3.5 h-3.5 text-purple-600 shrink-0"></i>
          <span>Bác sĩ báo cáo: <strong>${escapeHtml(item.doctorName)}</strong>${item.doctorDept ? ` · ${escapeHtml(item.doctorDept)}` : ""}</span>
        </div>
      ` : ""}
    </div>
  `).join("");

  if (window.lucide) window.lucide.createIcons();
}

export function printAdrReport() {
  window.print();
}

function escapeHtml(s) {
  return String(s || "").replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m]));
}

window.calculateNaranjoScore = calculateNaranjoScore;
window.printAdrReport = printAdrReport;
window.updateAdrAuthUI = updateAdrAuthUI;
