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

export function isAppAdmin() {
  const user = getCurrentAppUser();
  return user && user.role === "admin";
}

export function getStoredAdrReports() {
  const data = localStorage.getItem(CONFIG.STORAGE_KEYS.OFFLINE_ADR) || localStorage.getItem("clinicalrx_offline_adr_reports");
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
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
      department: "Khoa Hồi sức tích cực - Chống độc (ICU)",
      suspectedDrug: "Vancomycin 1g (Vancocin CP)",
      dosage: "1g IV truyền ngắt quãng trong 30 phút",
      indication: "Viêm phổi bệnh viện nghi do MRSA",
      reaction: "Bệnh nhân xuất hiện ban đỏ dữ dội toàn bộ nửa thân trên, ngực, cổ và mặt; kèm cảm giác ngứa ngáy dữ dội, khó thở nhẹ, tụt huyết áp động mạch từ 130/80 mmHg xuống 85/50 mmHg ngay ở phút thứ 20 của chai truyền dịch Vancomycin (Biểu hiện điển hình của Hội chứng Red Man do tốc độ truyền quá nhanh).",
      onset: "Sau 20 phút bắt đầu truyền dịch",
      severity: "Nghiêm trọng (Nhập viện/Kéo dài nằm viện)",
      management: "Ngừng truyền dịch Vancomycin ngay lập tức. Tiêm bắp Dimedrol 10mg, bù dịch NaCl 0.9% 500ml chảy nhanh nâng huyết áp. Sau 45 phút, huyết áp bệnh nhân ổn định trở lại 115/70 mmHg, các mảng ban đỏ mờ dần và biến mất.",
      outcome: "Hồi phục hoàn toàn sau ngừng truyền và dùng Dimedrol",
      naranjoScore: "7",
      naranjoVerdict: "CÓ KHẢ NĂNG (Probable)",
      reportedAt: "02/09/2026, 10:15",
      doctorName: "BS.CKI. Trần Thị Bác Sĩ",
      doctorDept: "Khoa Hồi sức tích cực - Chống độc (ICU)",
      doctorTitle: "Bác sĩ điều trị",
      adminNotes: "Đã thẩm định Dược lâm sàng: Thống nhất chẩn đoán Phản ứng tương tự dị ứng (Hội chứng Red Man do truyền Vancomycin tốc độ quá nhanh). Đề xuất can thiệp: Pha loãng vào 250ml dung dịch NaCl 0.9% và kiểm soát tốc độ truyền chậm tối thiểu trong 60 - 90 phút cho các liều tiếp theo. Đã cảnh báo trong hồ sơ bệnh án.",
      verifiedBy: "DS.CKII. Nguyễn Văn Quản Trị (Trưởng Khoa Dược)",
      verifiedAt: "03/09/2026, 08:30"
    },
    {
      id: 2,
      patientCode: "BN-2026-7734",
      age: "45",
      gender: "Nữ",
      weight: "52",
      department: "Khoa Ngoại Tổng hợp",
      suspectedDrug: "Ciprofloxacin 400mg/200ml",
      dosage: "400mg IV truyền tĩnh mạch q12h",
      indication: "Nhiễm khuẩn đường tiết niệu có biến chứng",
      reaction: "Sau 48 giờ dùng thuốc, bệnh nhân xuất hiện đau buốt nhói dọc hai gân gót chân (gân Achilles), đi lại khập khiễng, sưng nề nhẹ tại vị trí bám tận xương gót chân. Nghi ngờ viêm gân gót thứ phát do thuốc nhóm Quinolone.",
      onset: "48 giờ sau liều ciprofloxacin đầu tiên",
      severity: "Nghiêm trọng (Nguy cơ tàn tật / Đứt gân gót)",
      management: "Ngừng ngay Ciprofloxacin đường tiêm truyền. Hội chẩn dược lâm sàng chuyển phác đồ sang Ceftriaxone 2g/ngày phối hợp. Cố định tạm thời cổ chân, chỉ định siêu âm Doppler gân Achilles theo dõi sát.",
      outcome: "Đang hồi phục, giảm sưng đau sau 3 ngày ngừng thuốc",
      naranjoScore: "6",
      naranjoVerdict: "CÓ KHẢ NĂNG (Probable)",
      reportedAt: "05/09/2026, 14:20",
      doctorName: "BS.CKI. Trần Thị Bác Sĩ",
      doctorDept: "Khoa Ngoại Tổng hợp",
      doctorTitle: "Bác sĩ điều trị",
      adminNotes: "Đã lưu trữ hồ sơ cảnh giác dược. Ghi rõ tiền sử ADR với Fluoroquinolone vào trang đầu bệnh án và thẻ cảnh báo dị ứng của người bệnh.",
      verifiedBy: "DS.CKII. Nguyễn Văn Quản Trị (Trưởng Khoa Dược)",
      verifiedAt: "06/09/2026, 09:15"
    }
  ];
}

export function saveStoredAdrReports(list) {
  localStorage.setItem(CONFIG.STORAGE_KEYS.OFFLINE_ADR, JSON.stringify(list));
  localStorage.setItem("clinicalrx_offline_adr_reports", JSON.stringify(list));
}

export function renderAdrReportHistory() {
  const container = document.getElementById("adrHistoryContainer");
  if (!container) return;

  const list = getStoredAdrReports();
  const isAdmin = isAppAdmin();

  if (list.length === 0) {
    container.innerHTML = `<div class="text-xs text-slate-400 py-6 text-center">Chưa có báo cáo ADR nào được lưu.</div>`;
    return;
  }

  container.innerHTML = list.map(item => `
    <div class="p-4 bg-white border border-slate-200 rounded-xl space-y-2.5 text-xs shadow-xs hover:border-purple-300 transition-colors">
      <div class="flex items-center justify-between">
        <span class="font-bold text-slate-900 flex items-center gap-1.5">
          <i data-lucide="file-text" class="w-3.5 h-3.5 text-purple-600"></i>
          <span>${escapeHtml(item.patientCode)} (${item.age ? `${escapeHtml(item.age)}t` : "—"} / ${escapeHtml(item.gender)})</span>
        </span>
        <span class="text-slate-400 text-[11px]">${escapeHtml(item.reportedAt)}</span>
      </div>
      <div class="text-slate-700">
        <strong>Thuốc nghi ngờ:</strong> <span class="text-rose-700 font-bold">${escapeHtml(item.suspectedDrug)}</span> ${item.dosage ? `(${escapeHtml(item.dosage)})` : ""}
      </div>
      <p class="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed line-clamp-3">
        ${escapeHtml(item.reaction)}
      </p>
      <div class="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-[11px]">
        <span class="text-slate-500">Mức độ: <strong class="text-slate-800">${escapeHtml(item.severity)}</strong></span>
        <span class="px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 font-semibold">
          Naranjo: ${escapeHtml(item.naranjoScore)} điểm (${escapeHtml(item.naranjoVerdict ? item.naranjoVerdict.split(" - ")[0] : "")})
        </span>
      </div>
      ${item.doctorName ? `
        <div class="text-[11px] text-purple-700 font-medium flex items-center gap-1.5 pt-1 border-t border-slate-100">
          <i data-lucide="stethoscope" class="w-3.5 h-3.5 text-purple-600 shrink-0"></i>
          <span>Bác sĩ báo cáo: <strong>${escapeHtml(item.doctorName)}</strong>${item.doctorDept ? ` · ${escapeHtml(item.doctorDept)}` : ""}</span>
        </div>
      ` : ""}

      <!-- Action buttons -->
      <div class="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
        <button onclick="window.openAdrDetailModal('${item.id}')" 
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold transition-all cursor-pointer border border-purple-200 shadow-2xs">
          <i data-lucide="eye" class="w-3.5 h-3.5 text-purple-600"></i>
          <span>Xem chi tiết biên bản</span>
        </button>
        ${isAdmin ? `
          <button onclick="window.deleteAdrReport('${item.id}')" 
            class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-all cursor-pointer border border-rose-200" title="Xóa báo cáo này">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            <span>Xóa</span>
          </button>
        ` : ""}
      </div>
    </div>
  `).join("");

  if (window.lucide) window.lucide.createIcons();
}

export function openAdrDetailModal(reportId) {
  let container = document.getElementById("adrDetailModalContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "adrDetailModalContainer";
    document.body.appendChild(container);
  }

  const list = getStoredAdrReports();
  const report = list.find(r => String(r.id) === String(reportId));

  if (!report) {
    alert("Không tìm thấy dữ liệu biên bản báo cáo ADR với mã: " + reportId);
    return;
  }

  const user = getCurrentAppUser();
  const isAdmin = user && user.role === "admin";
  const isDoc = user && user.role === "doctor";

  container.innerHTML = `
    <div class="fixed inset-0 z-[60] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <!-- Header Modal -->
        <div class="px-6 py-4 bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 text-white flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <i data-lucide="file-check-2" class="w-5 h-5 text-purple-300"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-black text-sm sm:text-base tracking-tight uppercase">CHI TIẾT BÁO CÁO PHẢN ỨNG CÓ HẠI CỦA THUỐC (ADR)</h3>
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/20 text-purple-100 border border-white/20">
                  MẪU 01/ADR-BYT
                </span>
              </div>
              <p class="text-xs text-purple-200">Bệnh viện Đa khoa tỉnh Hưng Yên · Hệ thống Quản trị Cảnh giác Dược</p>
            </div>
          </div>
          <button onclick="window.closeAdrDetailModal()" class="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <!-- Body Modal -->
        <div class="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          
          <!-- Trạng thái & Tiêu đề chính -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span class="text-slate-500 font-medium">Mã báo cáo nội viện:</span>
              <strong class="font-mono text-sm text-purple-900 ml-1">#ADR-${report.id}</strong>
              <span class="text-slate-400 mx-2">|</span>
              <span class="text-slate-500">Thời gian gửi:</span>
              <strong class="text-slate-700 ml-1">${escapeHtml(report.reportedAt)}</strong>
            </div>
            <div>
              ${report.verifiedBy ? `
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <i data-lucide="check-circle" class="w-3.5 h-3.5 text-emerald-600"></i>
                  <span>Đã thẩm định Dược lâm sàng</span>
                </span>
              ` : `
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  <i data-lucide="clock" class="w-3.5 h-3.5 text-amber-600"></i>
                  <span>Chờ Admin / Dược lâm sàng thẩm định</span>
                </span>
              `}
            </div>
          </div>

          <!-- Section A: Người bệnh -->
          <div class="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
            <h4 class="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5 pb-2 border-b border-slate-100 text-purple-900">
              <span class="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-black">A</span>
              THÔNG TIN VỀ NGƯỜI BỆNH
            </h4>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div>
                <div class="text-[11px] text-slate-400">Mã BN / Số Bệnh Án:</div>
                <div class="font-bold text-slate-900 text-sm">${escapeHtml(report.patientCode)}</div>
              </div>
              <div>
                <div class="text-[11px] text-slate-400">Tuổi:</div>
                <div class="font-bold text-slate-800">${report.age ? `${escapeHtml(report.age)} tuổi` : "—"}</div>
              </div>
              <div>
                <div class="text-[11px] text-slate-400">Giới tính:</div>
                <div class="font-bold text-slate-800">${escapeHtml(report.gender || "—")}</div>
              </div>
              <div>
                <div class="text-[11px] text-slate-400">Cân nặng:</div>
                <div class="font-bold text-slate-800">${report.weight ? `${escapeHtml(report.weight)} kg` : "—"}</div>
              </div>
            </div>
            <div class="pt-1">
              <div class="text-[11px] text-slate-400">Khoa / Phòng điều trị:</div>
              <div class="font-semibold text-slate-800">${escapeHtml(report.department || report.doctorDept || "Khoa lâm sàng")}</div>
            </div>
          </div>

          <!-- Section B: Thuốc nghi ngờ -->
          <div class="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
            <h4 class="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5 pb-2 border-b border-slate-100 text-purple-900">
              <span class="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-black">B</span>
              THUỐC NGHI NGỜ GÂY BIẾN CỐ BẤT LỢI (ADR)
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <div class="text-[11px] text-slate-400">Tên thuốc (Biệt dược / Hoạt chất):</div>
                <div class="font-black text-rose-700 text-sm sm:text-base">${escapeHtml(report.suspectedDrug)}</div>
              </div>
              <div>
                <div class="text-[11px] text-slate-400">Liều dùng & Đường dùng:</div>
                <div class="font-semibold text-slate-800">${escapeHtml(report.dosage || "Theo y lệnh")}</div>
              </div>
            </div>
            ${report.indication ? `
              <div class="pt-1">
                <div class="text-[11px] text-slate-400">Lý do chỉ định dùng thuốc:</div>
                <div class="text-slate-700">${escapeHtml(report.indication)}</div>
              </div>
            ` : ""}
          </div>

          <!-- Section C: Mô tả phản ứng & Xử trí -->
          <div class="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
            <h4 class="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5 pb-2 border-b border-slate-100 text-purple-900">
              <span class="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-black">C</span>
              BIỂU HIỆN PHẢN ỨNG CÓ HẠI & XỬ TRÍ
            </h4>
            <div>
              <div class="text-[11px] text-slate-400 font-semibold mb-1">Mô tả triệu chứng lâm sàng và cận lâm sàng:</div>
              <div class="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-800 leading-relaxed font-medium">
                ${escapeHtml(report.reaction)}
              </div>
            </div>

            ${report.management ? `
              <div>
                <div class="text-[11px] text-slate-400 font-semibold mb-1">Xử trí phản ứng tại chỗ:</div>
                <div class="bg-teal-50/60 p-3 rounded-lg border border-teal-200 text-teal-900 leading-relaxed">
                  ${escapeHtml(report.management)}
                </div>
              </div>
            ` : ""}

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <div class="text-[11px] text-slate-400">Mức độ nghiêm trọng:</div>
                <span class="inline-block mt-0.5 px-2.5 py-1 rounded-md bg-rose-50 text-rose-800 border border-rose-200 font-bold">
                  ${escapeHtml(report.severity || "—")}
                </span>
              </div>
              <div>
                <div class="text-[11px] text-slate-400">Kết quả sau xử trí:</div>
                <span class="inline-block mt-0.5 px-2.5 py-1 rounded-md bg-teal-50 text-teal-800 border border-teal-200 font-bold">
                  ${escapeHtml(report.outcome || "—")}
                </span>
              </div>
            </div>
          </div>

          <!-- Section D: Thang Naranjo -->
          <div class="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
            <h4 class="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5 pb-2 border-b border-slate-100 text-purple-900">
              <span class="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-black">D</span>
              ĐÁNH GIÁ MỐI LIÊN QUAN NHÂN QUẢ (THANG NARANJO)
            </h4>
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-purple-50/50 rounded-xl border border-purple-200/80">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-purple-600 text-white font-black text-xl flex items-center justify-center shadow-xs">
                  ${escapeHtml(report.naranjoScore)}
                </div>
                <div>
                  <div class="text-[11px] text-slate-500 font-semibold">Tổng điểm thang Naranjo:</div>
                  <div class="text-sm font-extrabold text-purple-900">${escapeHtml(report.naranjoScore)} / 10 điểm</div>
                </div>
              </div>
              <div>
                <div class="text-[11px] text-slate-500 font-semibold sm:text-right">Kết luận phân loại nhân quả:</div>
                <div class="font-black text-xs sm:text-sm text-teal-800 bg-white px-3 py-1 rounded-lg border border-teal-300 shadow-2xs inline-block">
                  ${escapeHtml(report.naranjoVerdict || "—")}
                </div>
              </div>
            </div>
          </div>

          <!-- Section E: Bác sĩ báo cáo -->
          <div class="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
            <h4 class="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5 pb-2 border-b border-slate-100 text-purple-900">
              <span class="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-black">E</span>
              CÁN BỘ Y TẾ LẬP BÁO CÁO
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <div class="text-[11px] text-slate-400">Bác sĩ điều trị:</div>
                <div class="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <i data-lucide="stethoscope" class="w-3.5 h-3.5 text-purple-600"></i>
                  <span>${escapeHtml(report.doctorName || "—")}</span>
                </div>
              </div>
              <div>
                <div class="text-[11px] text-slate-400">Chức danh / Học vị:</div>
                <div class="font-semibold text-slate-700">${escapeHtml(report.doctorTitle || "Bác sĩ lâm sàng")}</div>
              </div>
              <div>
                <div class="text-[11px] text-slate-400">Khoa phòng công tác:</div>
                <div class="font-semibold text-slate-700">${escapeHtml(report.doctorDept || "—")}</div>
              </div>
            </div>
          </div>

          <!-- Section F: Ý kiến thẩm định Dược lâm sàng (Dành riêng cho Admin) -->
          <div class="bg-gradient-to-br from-slate-50 to-rose-50/40 border border-rose-200/80 rounded-xl p-4 space-y-3">
            <div class="flex items-center justify-between pb-2 border-b border-rose-200">
              <h4 class="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5 text-rose-900">
                <span class="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-[10px] font-black">F</span>
                KẾT LUẬN THẨM ĐỊNH CỦA DƯỢC LÂM SÀNG & ADMIN
              </h4>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                Hội đồng Thuốc & Điều trị
              </span>
            </div>

            ${isAdmin ? `
              <div class="space-y-2">
                <label class="font-semibold text-slate-700 block">
                  Ý kiến đánh giá, khuyến cáo điều chỉnh phác đồ & lưu ý lâm sàng của Quản trị viên / Dược lâm sàng:
                </label>
                <textarea id="adrAdminNotesInput" rows="3" 
                  placeholder="Nhập nhận định chuyên môn của Dược lâm sàng, khuyến cáo thay thế thuốc, biện pháp dự phòng cho khoa lâm sàng..."
                  class="w-full p-2.5 border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium text-slate-800 text-xs">${escapeHtml(report.adminNotes || "")}</textarea>
                <div class="flex items-center justify-between pt-1">
                  <div class="text-[11px] text-slate-500 italic">
                    ${report.verifiedBy ? `Đã xác thực bởi: <strong>${escapeHtml(report.verifiedBy)}</strong> lúc ${escapeHtml(report.verifiedAt)}` : "Chưa lưu ý kiến thẩm định"}
                  </div>
                  <button onclick="window.saveAdrAdminNotes('${report.id}')" 
                    class="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer">
                    <i data-lucide="save" class="w-3.5 h-3.5"></i>
                    <span>Lưu Ý Kiến Thẩm Định</span>
                  </button>
                </div>
              </div>
            ` : `
              <div>
                ${report.adminNotes ? `
                  <div class="bg-white p-3 rounded-lg border border-slate-200 text-slate-800 leading-relaxed font-medium">
                    ${escapeHtml(report.adminNotes)}
                  </div>
                  <div class="text-[11px] text-slate-500 italic mt-1.5 text-right">
                    Thẩm định bởi: <strong>${escapeHtml(report.verifiedBy || "Tổ Dược lâm sàng")}</strong> · ${escapeHtml(report.verifiedAt || "")}
                  </div>
                ` : `
                  <div class="text-xs text-slate-400 italic py-2">
                    Báo cáo đang chờ Tổ Dược Lâm Sàng & Quản trị viên Bệnh viện thẩm định chuyên môn.
                  </div>
                `}
              </div>
            `}
          </div>

        </div>

        <!-- Footer Modal -->
        <div class="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-2">
            <button onclick="window.printSingleAdrReport('${report.id}')" 
              class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer">
              <i data-lucide="printer" class="w-4 h-4"></i>
              <span>In Biên Bản A4 (Mẫu 01/ADR-BYT)</span>
            </button>
          </div>

          <div class="flex items-center gap-2">
            ${isAdmin ? `
              <button onclick="window.deleteAdrReport('${report.id}')" 
                class="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold transition-colors flex items-center gap-1.5 cursor-pointer">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                <span>Xóa Báo Cáo</span>
              </button>
            ` : ""}
            <button onclick="window.closeAdrDetailModal()" 
              class="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-colors cursor-pointer">
              Đóng
            </button>
          </div>
        </div>

      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();
}

export function closeAdrDetailModal() {
  const container = document.getElementById("adrDetailModalContainer");
  if (container) container.innerHTML = "";
}

export function saveAdrAdminNotes(reportId) {
  const user = getCurrentAppUser();
  if (!user || user.role !== "admin") {
    alert("Quyền truy cập bị từ chối: Chỉ Quản trị viên (Admin / Trưởng Khoa Dược) mới có quyền thẩm định báo cáo ADR!");
    return;
  }

  const inputEl = document.getElementById("adrAdminNotesInput");
  if (!inputEl) return;

  const notes = inputEl.value.trim();
  const list = getStoredAdrReports();
  const index = list.findIndex(r => String(r.id) === String(reportId));

  if (index === -1) {
    alert("Không tìm thấy dữ liệu biên bản báo cáo ADR!");
    return;
  }

  list[index].adminNotes = notes;
  list[index].verifiedBy = `${user.fullName} (${user.title || user.roleLabel})`;
  list[index].verifiedAt = new Date().toLocaleString("vi-VN");
  saveStoredAdrReports(list);

  alert("Đã lưu kết luận thẩm định lâm sàng của Quản trị viên thành công!");
  openAdrDetailModal(reportId);
  renderAdrReportHistory();
  if (window.renderAdminAdrTable) window.renderAdminAdrTable();
}

export function deleteAdrReport(reportId) {
  const user = getCurrentAppUser();
  if (!user || user.role !== "admin") {
    alert("Quyền truy cập bị từ chối: Chỉ Quản trị viên (Admin) mới có quyền xóa báo cáo ADR khỏi hệ thống nội viện!");
    return;
  }

  if (!confirm("CẢNH BÁO QUẢN TRỊ VIÊN:\n\nBạn có chắc chắn muốn xóa vĩnh viễn báo cáo ADR này khỏi hệ thống nội viện không?\nThao tác này không thể hoàn tác!")) {
    return;
  }

  let list = getStoredAdrReports();
  list = list.filter(r => String(r.id) !== String(reportId));
  saveStoredAdrReports(list);

  closeAdrDetailModal();
  renderAdrReportHistory();
  if (window.renderAdminAdrTable) window.renderAdminAdrTable();
  alert("Đã xóa báo cáo ADR thành công!");
}

export function printSingleAdrReport(reportId) {
  const list = getStoredAdrReports();
  const report = list.find(r => String(r.id) === String(reportId));
  if (!report) return;

  const printWindow = window.open("", "_blank", "width=850,height=900");
  if (!printWindow) {
    alert("Vui lòng cho phép mở cửa sổ pop-up trong trình duyệt để in báo cáo!");
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <title>Báo cáo ADR - ${report.patientCode}</title>
      <style>
        @page { size: A4; margin: 15mm; }
        body { font-family: 'Times New Roman', Times, serif; font-size: 13pt; line-height: 1.35; color: #000; margin: 0; padding: 15px; }
        .header-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
        .header-table td { vertical-align: top; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .bold { font-weight: bold; }
        .uppercase { text-transform: uppercase; }
        .italic { font-style: italic; }
        .title { font-size: 15pt; font-weight: bold; margin: 10px 0 3px 0; }
        .section-title { font-size: 12pt; font-weight: bold; background-color: #f0f0f0; padding: 4px 8px; margin: 10px 0 6px 0; border: 1px solid #999; }
        table.data { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
        table.data td, table.data th { border: 1px solid #444; padding: 6px 8px; font-size: 11pt; }
        .signature-table { width: 100%; margin-top: 25px; border-collapse: collapse; }
        .signature-table td { width: 50%; text-align: center; vertical-align: top; }
      </style>
    </head>
    <body>
      <table class="header-table">
        <tr>
          <td style="width: 55%; text-align: center;">
            <div class="bold uppercase" style="font-size: 11pt;">SỞ Y TẾ TỈNH HƯNG YÊN</div>
            <div class="bold uppercase" style="font-size: 12pt;">BỆNH VIỆN ĐA KHOA TỈNH HƯNG YÊN</div>
            <div class="italic" style="font-size: 11pt;">Khoa Dược · Tổ Dược Lâm Sàng</div>
          </td>
          <td style="width: 45%; text-align: right;">
            <div class="bold" style="font-size: 11pt;">Mẫu số: 01/ADR-BYT</div>
            <div class="italic" style="font-size: 10pt;">(Ban hành kèm TT 22/2011/TT-BYT)</div>
            <div style="font-size: 10pt; margin-top: 4px;">Mã số: <strong>${report.patientCode}</strong></div>
          </td>
        </tr>
      </table>

      <div class="text-center">
        <div class="title uppercase">BÁO CÁO PHẢN ỨNG CÓ HẠI CỦA THUỐC (ADR)</div>
        <div class="italic" style="font-size: 11pt; margin-bottom: 12px;">(Báo cáo nội viện & Chuyển giao Trung tâm DI & ADR Quốc gia)</div>
      </div>

      <div class="section-title">A. THÔNG TIN VỀ NGƯỜI BỆNH</div>
      <table class="data">
        <tr>
          <td style="width: 35%;"><strong>Mã bệnh nhân / Số BA:</strong> ${escapeHtml(report.patientCode)}</td>
          <td style="width: 25%;"><strong>Tuổi:</strong> ${report.age ? escapeHtml(report.age) : "—"}</td>
          <td style="width: 20%;"><strong>Giới tính:</strong> ${escapeHtml(report.gender || "—")}</td>
          <td style="width: 20%;"><strong>Cân nặng:</strong> ${report.weight ? escapeHtml(report.weight) + " kg" : "—"}</td>
        </tr>
        <tr>
          <td colspan="4"><strong>Khoa / Phòng điều trị:</strong> ${escapeHtml(report.department || report.doctorDept || "Khoa lâm sàng")}</td>
        </tr>
      </table>

      <div class="section-title">B. THUỐC NGHI NGỜ GÂY RA PHẢN ỨNG CÓ HẠI (ADR)</div>
      <table class="data">
        <tr>
          <td style="width: 50%;"><strong>Tên thuốc (Biệt dược / Hoạt chất):</strong><br><span style="color: #900; font-weight: bold; font-size: 12pt;">${escapeHtml(report.suspectedDrug)}</span></td>
          <td style="width: 50%;"><strong>Liều dùng & Đường dùng:</strong><br>${escapeHtml(report.dosage || "Theo chỉ định lâm sàng")}</td>
        </tr>
        ${report.indication ? `<tr><td colspan="2"><strong>Lý do chỉ định dùng thuốc:</strong> ${escapeHtml(report.indication)}</td></tr>` : ""}
      </table>

      <div class="section-title">C. MÔ TẢ CHI TIẾT BIẾN CỐ BẤT LỢI (ADR)</div>
      <table class="data">
        <tr>
          <td colspan="2">
            <strong>1. Mô tả chi tiết triệu chứng lâm sàng và cận lâm sàng:</strong><br>
            <p style="margin: 4px 0 8px 0; text-align: justify; line-height: 1.4;">${escapeHtml(report.reaction)}</p>
          </td>
        </tr>
        ${report.management ? `
        <tr>
          <td colspan="2">
            <strong>2. Cách xử trí phản ứng tại chỗ:</strong><br>
            <p style="margin: 4px 0 8px 0; text-align: justify;">${escapeHtml(report.management)}</p>
          </td>
        </tr>` : ""}
        <tr>
          <td style="width: 50%;"><strong>Mức độ nghiêm trọng:</strong> ${escapeHtml(report.severity || "—")}</td>
          <td style="width: 50%;"><strong>Kết quả sau khi xử trí:</strong> ${escapeHtml(report.outcome || "—")}</td>
        </tr>
      </table>

      <div class="section-title">D. ĐÁNH GIÁ MỐI LIÊN QUAN NHÂN QUẢ (THANG NARANJO)</div>
      <table class="data">
        <tr>
          <td style="width: 35%;"><strong>Tổng điểm Naranjo:</strong> <span style="font-size: 13pt; font-weight: bold;">${escapeHtml(report.naranjoScore)} điểm</span></td>
          <td style="width: 65%;"><strong>Kết luận mức độ nhân quả:</strong> <span style="font-weight: bold;">${escapeHtml(report.naranjoVerdict || "—")}</span></td>
        </tr>
      </table>

      <div class="section-title">E. Ý KIẾN THẨM ĐỊNH CỦA DƯỢC LÂM SÀNG / ADMIN</div>
      <table class="data">
        <tr>
          <td>
            <p style="margin: 4px 0; text-align: justify;">${escapeHtml(report.adminNotes || "Chưa có kết luận thẩm định chính thức.")}</p>
            ${report.verifiedBy ? `<p class="italic text-right" style="margin-top: 6px; font-size: 10.5pt;">(Thẩm định bởi: <strong>${escapeHtml(report.verifiedBy)}</strong> - Ngày ${escapeHtml(report.verifiedAt || "")})</p>` : ""}
          </td>
        </tr>
      </table>

      <table class="signature-table">
        <tr>
          <td>
            <div class="italic">Ngày báo cáo: ${escapeHtml(report.reportedAt || "")}</div>
            <div class="bold" style="margin-top: 5px;">BÁC SĨ ĐIỀU TRỊ BÁO CÁO</div>
            <div class="italic" style="font-size: 10pt;">(Ký và ghi rõ họ tên)</div>
            <div style="margin-top: 55px; font-weight: bold; font-size: 12pt;">${escapeHtml(report.doctorName || "")}</div>
            <div class="italic" style="font-size: 10.5pt;">${escapeHtml(report.doctorDept || "")}</div>
          </td>
          <td>
            <div class="italic">Hưng Yên, ngày ..... tháng ..... năm 20...</div>
            <div class="bold" style="margin-top: 5px;">TRƯỞNG KHOA DƯỢC / CHỦ TỊCH HĐT&ĐT</div>
            <div class="italic" style="font-size: 10pt;">(Ký, ghi rõ họ tên và đóng dấu)</div>
            <div style="margin-top: 55px; font-weight: bold; font-size: 12pt;">${report.verifiedBy ? escapeHtml(report.verifiedBy.split(" (")[0]) : "DS.CKII. Nguyễn Văn Quản Trị"}</div>
            <div class="italic" style="font-size: 10.5pt;">Khoa Dược - BVĐK Tỉnh Hưng Yên</div>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 400);
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
window.openAdrDetailModal = openAdrDetailModal;
window.closeAdrDetailModal = closeAdrDetailModal;
window.saveAdrAdminNotes = saveAdrAdminNotes;
window.deleteAdrReport = deleteAdrReport;
window.printSingleAdrReport = printSingleAdrReport;
window.getStoredAdrReports = getStoredAdrReports;
window.renderAdrReportHistory = renderAdrReportHistory;

