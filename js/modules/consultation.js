/**
 * PHARMAVITA / CLINICALRX - MODULE HỎI ĐÁP & TƯ VẤN THÔNG TIN THUỐC (DIC)
 * Hỗ trợ kết nối Supabase và chế độ mô phỏng trực quan (Offline/Demo Mode)
 */

import { CONFIG, getSupabaseCredentials } from "../config.js";

let supabaseClient = null;
let currentAuthUser = null;
let activeFilterStatus = "all";

// Dữ liệu mẫu ban đầu để hiển thị khi chưa có kết nối Supabase
const INITIAL_SAMPLE_CONSULTATIONS = [
  {
    id: 101,
    title: "Chỉnh liều Meropenem trên bệnh nhân sốc nhiễm khuẩn có CrCl 28 mL/phút",
    category: "Chỉnh liều suy thận/gan",
    urgency: "Khẩn cấp (< 1 giờ)",
    patient_age: 68,
    patient_gender: "Nam",
    patient_weight: 62,
    patient_creatinine: 2.1,
    clinical_diagnosis: "Sốc nhiễm khuẩn từ viêm phổi bệnh viện nghi do trực khuẩn mủ xanh (Pseudomonas aeruginosa).",
    current_medications: "Norepinephrine 0.3 mcg/kg/min, Furosemide 20mg IV, Omeprazole 40mg IV.",
    inquiry_content: "Bệnh nhân cần dùng Meropenem liều bao nhiêu và cách truyền thế nào để tối ưu hiệu quả khi CrCl ước tính khoảng 28 mL/phút?",
    pharmacist_answer: "1. LIỀU KHUYẾN CÁO: 1g tiêm tĩnh mạch mỗi 12 giờ.\n2. CÁCH DÙNG TỐI ƯU: Khuyến cáo truyền tĩnh mạch kéo dài trong 3 giờ (Extended Infusion) pha trong 100 mL NaCl 0.9% để tối ưu hóa thời gian nồng độ thuốc tự do trên MIC (%fT > MIC >= 40-50%).\n3. THEO DÕI: Kiểm tra lại Creatinine máu và lượng nước tiểu sau 24-48 giờ để kịp thời điều chỉnh lại liều.",
    references_text: "Dược thư Quốc gia Việt Nam 2022; Sanford Guide to Antimicrobial Therapy; KDIGO 2024 Clinical Practice Guideline for AKI.",
    status: "answered",
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    doctor_name: "BS. Nguyễn Văn Hùng (Khoa Hồi sức tích cực)",
    pharmacist_name: "DSLS. Trần Thu Hà"
  },
  {
    id: 102,
    title: "Tương tác giữa Clarithromycin và Simvastatin đang dùng ở bệnh nhân viêm phổi",
    category: "Tương tác thuốc",
    urgency: "Bình thường (< 4 giờ)",
    patient_age: 55,
    patient_gender: "Nữ",
    patient_weight: 58,
    patient_creatinine: 0.9,
    clinical_diagnosis: "Viêm phổi mắc phải cộng đồng mức độ trung bình (CURB-65 = 1). Tiền sử rối loạn lipid máu đang duy trì Simvastatin 20mg/tối.",
    current_medications: "Simvastatin 20mg, Amlodipine 5mg.",
    inquiry_content: "Bác sĩ dự kiến kê Clarithromycin 500mg x 2 lần/ngày phối hợp Ceftriaxone. Có cần lưu ý gì về tương tác với thuốc statin bệnh nhân đang dùng không?",
    pharmacist_answer: "CHỐNG CHỈ ĐỊNH PHỐI HỢP: Clarithromycin là chất ức chế rất mạnh CYP3A4, làm nồng độ Simvastatin tăng gấp 10-12 lần, nguy cơ tiêu cơ vân cấp và suy thận rất cao.\nKHUYẾN NGHỊ DƯỢC LÂM SÀNG: Tạm thời ngưng Simvastatin trong suốt thời gian dùng Clarithromycin (uống lại sau khi hết kháng sinh 2 ngày); HOẶC đổi kháng sinh macrolide sang Azithromycin 500mg ngày đầu rồi 250mg x 4 ngày (Azithromycin không ức chế CYP3A4, an toàn hơn).",
    references_text: "FDA Drug Safety Communication; Stockley's Drug Interactions 12th Ed.",
    status: "answered",
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    doctor_name: "BS. Lê Thị Mai (Khoa Nội Hô hấp)",
    pharmacist_name: "DSLS. Trần Thu Hà"
  },
  {
    id: 103,
    title: "Kháng sinh an toàn cho phụ nữ mang thai tuần 14 bị viêm đài bể thận",
    category: "Phụ nữ mang thai/cho con bú",
    urgency: "Khẩn cấp (< 1 giờ)",
    patient_age: 29,
    patient_gender: "Nữ",
    patient_weight: 54,
    patient_creatinine: 0.7,
    clinical_diagnosis: "Nhiễm khuẩn đường tiết niệu trên / Viêm đài bể thận cấp ở thai phụ 14 tuần.",
    current_medications: "Viên sắt, Canxi, Axit Folic.",
    inquiry_content: "Xin dược sĩ tư vấn kháng sinh đường tiêm an toàn hiệu quả cho thai phụ 14 tuần, không gây dị tật hoặc ảnh hưởng sụn khớp thai nhi.",
    pharmacist_answer: null,
    references_text: null,
    status: "pending",
    created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
    doctor_name: "BS. Phạm Quang Tuyến (Khoa Sản)",
    pharmacist_name: null
  }
];

export function initConsultationModule() {
  initSupabaseClient();
  setupEventListeners();
  renderConsultationsList();
}

function initSupabaseClient() {
  const { url, key } = getSupabaseCredentials();
  if (url && key && window.supabase) {
    try {
      supabaseClient = window.supabase.createClient(url, key);
      checkAuthState();
    } catch (e) {
      console.warn("Lỗi khởi tạo Supabase:", e);
    }
  }
}

async function checkAuthState() {
  if (!supabaseClient) return;
  try {
    const { data } = await supabaseClient.auth.getSession();
    currentAuthUser = data.session?.user || null;
    updateAuthUI();

    supabaseClient.auth.onAuthStateChange((_event, session) => {
      currentAuthUser = session?.user || null;
      updateAuthUI();
      renderConsultationsList();
    });
  } catch (err) {
    console.log("Supabase Auth check:", err);
  }
}

function updateAuthUI() {
  const userStatusBadge = document.getElementById("consultationUserStatus");
  const authToggleBtn = document.getElementById("consultationAuthBtn");

  if (userStatusBadge) {
    if (currentAuthUser) {
      const role = currentAuthUser.user_metadata?.role || "Bác sĩ";
      const name = currentAuthUser.user_metadata?.full_name || currentAuthUser.email;
      userStatusBadge.innerHTML = `
        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200">
          <i data-lucide="user-check" class="w-3.5 h-3.5 text-teal-600"></i>
          <span>${name} (${role})</span>
        </span>
      `;
    } else {
      userStatusBadge.innerHTML = `
        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
          <i data-lucide="shield" class="w-3.5 h-3.5"></i>
          <span>Chế độ: Demo / Phòng khám</span>
        </span>
      `;
    }
  }

  if (authToggleBtn) {
    authToggleBtn.textContent = currentAuthUser ? "Đăng xuất" : "Đăng nhập Supabase";
    authToggleBtn.onclick = currentAuthUser ? handleSignOut : openSupabaseAuthModal;
  }

  if (window.lucide) window.lucide.createIcons();
}

function setupEventListeners() {
  const form = document.getElementById("newConsultationForm");
  if (form) {
    form.addEventListener("submit", handleNewConsultationSubmit);
  }

  // Filter tabs
  const filterBtns = document.querySelectorAll(".consultation-filter-btn");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active", "bg-teal-700", "text-white"));
      btn.classList.add("active", "bg-teal-700", "text-white");
      activeFilterStatus = btn.dataset.status || "all";
      renderConsultationsList();
    });
  });
}

function getStoredConsultations() {
  const localData = localStorage.getItem(CONFIG.STORAGE_KEYS.OFFLINE_QUESTIONS);
  if (localData) {
    try {
      return JSON.parse(localData);
    } catch (e) {
      console.error(e);
    }
  }
  localStorage.setItem(CONFIG.STORAGE_KEYS.OFFLINE_QUESTIONS, JSON.stringify(INITIAL_SAMPLE_CONSULTATIONS));
  return INITIAL_SAMPLE_CONSULTATIONS;
}

function saveStoredConsultations(list) {
  localStorage.setItem(CONFIG.STORAGE_KEYS.OFFLINE_QUESTIONS, JSON.stringify(list));
}

export async function renderConsultationsList() {
  const container = document.getElementById("consultationListContainer");
  const countSpan = document.getElementById("consultationTotalCount");
  if (!container) return;

  let consultations = [];

  // Thử tải từ Supabase nếu có kết nối, nếu không lấy từ Local Storage
  if (supabaseClient && currentAuthUser) {
    try {
      const { data, error } = await supabaseClient
        .from("consultations")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        consultations = data;
      } else {
        consultations = getStoredConsultations();
      }
    } catch (e) {
      consultations = getStoredConsultations();
    }
  } else {
    consultations = getStoredConsultations();
  }

  // Filter
  const filtered = consultations.filter(item => {
    if (activeFilterStatus === "all") return true;
    return item.status === activeFilterStatus;
  });

  if (countSpan) {
    countSpan.textContent = consultations.length;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="py-12 text-center bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <i data-lucide="inbox" class="w-12 h-12 mx-auto text-slate-300 mb-3"></i>
        <h4 class="text-base font-semibold text-slate-700 mb-1">Không có ca yêu cầu tư vấn nào</h4>
        <p class="text-xs text-slate-500">Hãy gửi câu hỏi mới bằng biểu mẫu bên trái.</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  container.innerHTML = filtered.map(item => {
    const isAnswered = item.status === "answered";
    const statusBadge = isAnswered 
      ? `<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1"><i data-lucide="check" class="w-3 h-3"></i> Đã phản hồi</span>`
      : `<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1"><i data-lucide="clock" class="w-3 h-3"></i> Đang chờ tiếp nhận</span>`;

    const urgencyBadge = item.urgency?.includes("Khẩn") 
      ? `<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">🔴 ${item.urgency}</span>`
      : `<span class="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">${item.urgency || "Thường quy"}</span>`;

    return `
      <div class="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all p-5 space-y-4">
        <div class="flex flex-wrap items-start justify-between gap-2">
          <div>
            <div class="flex items-center gap-2 mb-1.5 flex-wrap">
              <span class="px-2.5 py-0.5 rounded-md text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                ${item.category}
              </span>
              ${urgencyBadge}
              ${statusBadge}
            </div>
            <h3 class="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              ${escapeHtml(item.title)}
            </h3>
            <div class="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
              <span>Người gửi: <strong class="text-slate-600">${item.doctor_name || "Bác sĩ lâm sàng"}</strong></span>
              <span>•</span>
              <span>Thời gian: ${new Date(item.created_at).toLocaleTimeString("vi-VN")} ${new Date(item.created_at).toLocaleDateString("vi-VN")}</span>
            </div>
          </div>
        </div>

        <!-- Thông tin ca bệnh tóm tắt -->
        <div class="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 space-y-2">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 border-b border-slate-200 pb-2">
            <div><span class="text-slate-400">Tuổi/Giới:</span> <strong>${item.patient_age || "--"} tuổi / ${item.patient_gender || "--"}</strong></div>
            <div><span class="text-slate-400">Cân nặng:</span> <strong>${item.patient_weight ? item.patient_weight + " kg" : "--"}</strong></div>
            <div><span class="text-slate-400">SCr:</span> <strong>${item.patient_creatinine ? item.patient_creatinine + " mg/dL" : "--"}</strong></div>
            <div><span class="text-slate-400">Chẩn đoán:</span> <span class="truncate block font-medium" title="${escapeHtml(item.clinical_diagnosis || '')}">${item.clinical_diagnosis || "--"}</span></div>
          </div>
          <div>
            <span class="font-semibold text-slate-900">Nội dung câu hỏi:</span>
            <p class="mt-1 leading-relaxed text-slate-800 whitespace-pre-line">${escapeHtml(item.inquiry_content)}</p>
          </div>
        </div>

        <!-- Phản hồi của Dược sĩ -->
        ${isAnswered && item.pharmacist_answer ? `
          <div class="bg-teal-50/60 border border-teal-200 rounded-xl p-4 text-xs text-slate-800 space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-teal-900 flex items-center gap-1.5 text-sm">
                <i data-lucide="check-circle-2" class="w-4 h-4 text-teal-600"></i>
                Ý kiến tư vấn Dược lâm sàng (EBM):
              </span>
              <span class="text-teal-700 font-semibold">${item.pharmacist_name || "DSLS. Phụ trách"}</span>
            </div>
            <div class="leading-relaxed whitespace-pre-line bg-white/80 p-3 rounded-lg border border-teal-100 font-medium">
              ${escapeHtml(item.pharmacist_answer)}
            </div>
            ${item.references_text ? `
              <div class="text-[11px] text-slate-500 italic pt-1 border-t border-teal-200/50">
                Tài liệu tham khảo: ${escapeHtml(item.references_text)}
              </div>
            ` : ""}
          </div>
        ` : `
          <div class="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span class="text-amber-700 italic flex items-center gap-1">
              <i data-lucide="hourglass" class="w-3.5 h-3.5"></i>
              Dược sĩ lâm sàng đang tra cứu tài liệu y văn...
            </span>
            <button onclick="window.openPharmacistReplyModal('${item.id}')" 
              class="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold flex items-center gap-1 transition-colors">
              <i data-lucide="message-square-plus" class="w-3.5 h-3.5"></i>
              <span>Dược sĩ phản hồi</span>
            </button>
          </div>
        `}
      </div>
    `;
  }).join("");

  if (window.lucide) window.lucide.createIcons();
}

async function handleNewConsultationSubmit(e) {
  e.preventDefault();
  const form = e.target;

  const title = form.elements["qTitle"].value.trim();
  const category = form.elements["qCategory"].value;
  const urgency = form.elements["qUrgency"].value;
  const age = parseInt(form.elements["qAge"].value) || null;
  const gender = form.elements["qGender"].value || "Khác";
  const weight = parseFloat(form.elements["qWeight"].value) || null;
  const scr = parseFloat(form.elements["qScr"].value) || null;
  const diagnosis = form.elements["qDiagnosis"].value.trim();
  const meds = form.elements["qMeds"].value.trim();
  const content = form.elements["qContent"].value.trim();

  if (!title || !content) {
    alert("Vui lòng điền Tiêu đề và Nội dung câu hỏi.");
    return;
  }

  const newTicket = {
    id: Date.now(),
    title,
    category,
    urgency,
    patient_age: age,
    patient_gender: gender,
    patient_weight: weight,
    patient_creatinine: scr,
    clinical_diagnosis: diagnosis,
    current_medications: meds,
    inquiry_content: content,
    pharmacist_answer: null,
    references_text: null,
    status: "pending",
    created_at: new Date().toISOString(),
    doctor_name: currentAuthUser ? (currentAuthUser.user_metadata?.full_name || currentAuthUser.email) : "Bác sĩ lâm sàng"
  };

  // Lưu Supabase nếu có user đăng nhập
  if (supabaseClient && currentAuthUser) {
    try {
      const { error } = await supabaseClient.from("consultations").insert({
        doctor_id: currentAuthUser.id,
        title,
        category,
        urgency,
        patient_age: age,
        patient_gender: gender,
        patient_weight: weight,
        patient_creatinine: scr,
        clinical_diagnosis: diagnosis,
        current_medications: meds,
        inquiry_content: content,
        status: "pending"
      });
      if (error) {
        console.warn("Supabase insert error, saving locally:", error);
      }
    } catch (err) {
      console.warn("Supabase insert exception:", err);
    }
  }

  // Luôn cập nhật local
  const currentList = getStoredConsultations();
  currentList.unshift(newTicket);
  saveStoredConsultations(currentList);

  form.reset();
  alert("Gửi yêu cầu tư vấn thành công! Dược sĩ lâm sàng sẽ tiếp nhận và xử lý.");
  renderConsultationsList();
}

// Modal để Dược sĩ nhập ý kiến tư vấn
export function openPharmacistReplyModal(itemId) {
  const currentList = getStoredConsultations();
  const item = currentList.find(i => String(i.id) === String(itemId));
  if (!item) return;

  const modalContainer = document.getElementById("consultationReplyModal");
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div class="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col animate-in fade-in duration-200">
        
        <div class="px-6 py-4 bg-teal-800 text-white flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i data-lucide="stethoscope" class="w-5 h-5 text-teal-300"></i>
            <h3 class="text-lg font-bold">Soạn Thảo Phản Hồi Dược Lâm Sàng</h3>
          </div>
          <button onclick="window.closePharmacistReplyModal()" class="text-white/80 hover:text-white">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <div class="p-6 space-y-4 text-xs sm:text-sm text-slate-700">
          <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
            <div class="font-bold text-slate-900">${escapeHtml(item.title)}</div>
            <div class="text-slate-600 text-xs">${escapeHtml(item.inquiry_content)}</div>
          </div>

          <div class="flex items-center justify-between">
            <label class="font-bold text-slate-900">Nội dung tư vấn Dược lâm sàng (EBM):</label>
            <button onclick="window.generateAiClinicalSuggestion('${item.id}')" 
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-teal-600 to-indigo-600 text-white shadow-xs hover:opacity-90 transition-opacity">
              <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
              <span>AI Trợ lý Gợi ý Phác Thảo</span>
            </button>
          </div>

          <textarea id="replyTextarea" rows="6" class="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-xs sm:text-sm"
            placeholder="1. Kết luận trả lời câu hỏi trực tiếp&#10;2. Đề xuất phác đồ & liều dùng cụ thể&#10;3. Các thông số cần giám sát (Creatinine, Huyết áp, INR...)"></textarea>

          <div>
            <label class="font-bold text-slate-900 block mb-1">Nguồn tài liệu y văn tham khảo:</label>
            <input id="replyReferences" type="text" class="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 text-xs sm:text-sm"
              value="Dược thư Quốc gia Việt Nam 2022, Sanford Guide 2024, UpToDate">
          </div>
        </div>

        <div class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button onclick="window.closePharmacistReplyModal()" class="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800">
            Hủy bỏ
          </button>
          <button onclick="window.submitPharmacistReply('${item.id}')" class="px-5 py-2 text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white rounded-xl shadow-sm transition-colors">
            Xác nhận & Gửi phản hồi
          </button>
        </div>

      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();
}

export function generateAiClinicalSuggestion(itemId) {
  const currentList = getStoredConsultations();
  const item = currentList.find(i => String(i.id) === String(itemId));
  if (!item) return;

  const textarea = document.getElementById("replyTextarea");
  if (!textarea) return;

  // Mô phỏng AI Clinical Assistant phân tích ca bệnh dựa trên y văn
  let aiDraft = "";
  if (item.title.toLowerCase().includes("thai") || item.category.includes("mang thai")) {
    aiDraft = `1. KHUYẾN CÁO KHÁNG SINH AN TOÀN CHO THAI KỲ:
- Lựa chọn đầu tay: Ceftriaxone 1g - 2g IV mỗi 24 giờ (FDA Nhóm B, an toàn trong cả 3 quý thai kỳ, không gây ảnh hưởng sụn khớp).
- Lựa chọn thay thế: Ampicillin/Sulbactam 1.5g IV mỗi 6 giờ HOẶC Cefotaxime 1g - 2g IV mỗi 8 giờ.
- CHỐNG CHỈ ĐỊNH: Tuyệt đối tránh nhóm Fluoroquinolone (Ciprofloxacin, Levofloxacin - nguy cơ thoái hóa sụn khớp) và Aminoglycoside (độc tính thính giác và thận thai nhi).

2. KẾ HOẠCH ĐIỀU TRỊ:
- Kháng sinh tiêm ít nhất 48-72 giờ cho đến khi hết sốt, sau đó có thể chuyển sang kháng sinh uống phù hợp theo kết quả cấy nước tiểu. Tổng đợt điều trị: 10 - 14 ngày.
- Bù dịch đầy đủ và siêu âm thai kiểm tra chỉ số ối định kỳ.`;
  } else {
    aiDraft = `1. Ý KIẾN TƯ VẤN DƯỢC LÂM SÀNG:
- Căn cứ trên thông số cận lâm sàng và chẩn đoán của người bệnh, khuyến cáo cá thể hóa chế độ liều như sau:
- Liều nạp ban đầu đảm bảo đạt nhanh nồng độ đích điều trị.
- Liều duy trì cần căn cứ vào độ thanh thải Creatinine thực tế (CrCl) để tránh tích lũy độc tính.

2. CÁC THÔNG SỐ CẦN THEO DÕI:
- Giám sát Creatinine huyết thanh, lượng nước tiểu 24 giờ mỗi ngày.
- Đánh giá đáp ứng lâm sàng (sốt, chỉ số viêm CRP/Procalcitonin) sau 48-72 giờ.`;
  }

  textarea.value = aiDraft;
}

export function submitPharmacistReply(itemId) {
  const textarea = document.getElementById("replyTextarea");
  const refInput = document.getElementById("replyReferences");
  if (!textarea) return;

  const answer = textarea.value.trim();
  const refs = refInput ? refInput.value.trim() : "";

  if (!answer) {
    alert("Vui lòng nhập nội dung tư vấn.");
    return;
  }

  const currentList = getStoredConsultations();
  const index = currentList.findIndex(i => String(i.id) === String(itemId));
  if (index !== -1) {
    currentList[index].pharmacist_answer = answer;
    currentList[index].references_text = refs;
    currentList[index].status = "answered";
    currentList[index].answered_at = new Date().toISOString();
    currentList[index].pharmacist_name = currentAuthUser 
      ? (currentAuthUser.user_metadata?.full_name || "Dược sĩ lâm sàng")
      : "DSLS. Phụ trách";

    saveStoredConsultations(currentList);
  }

  closePharmacistReplyModal();
  renderConsultationsList();
}

export function closePharmacistReplyModal() {
  const modalContainer = document.getElementById("consultationReplyModal");
  if (modalContainer) modalContainer.innerHTML = "";
}

// Modal Supabase Auth
export function openSupabaseAuthModal() {
  const modalContainer = document.getElementById("supabaseAuthModal");
  if (!modalContainer) return;

  const { url, key } = getSupabaseCredentials();

  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col animate-in fade-in duration-200">
        
        <div class="px-6 py-4 bg-teal-800 text-white flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i data-lucide="database" class="w-5 h-5 text-teal-300"></i>
            <h3 class="text-base font-bold">Cấu Hình Kết Nối Supabase</h3>
          </div>
          <button onclick="window.closeSupabaseAuthModal()" class="text-white/80 hover:text-white">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <div class="p-6 space-y-4 text-xs text-slate-700">
          <div>
            <label class="font-bold text-slate-800 block mb-1">Supabase Project URL:</label>
            <input id="cfgSupabaseUrl" type="text" value="${url}" class="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 font-mono text-xs">
          </div>

          <div>
            <label class="font-bold text-slate-800 block mb-1">Supabase Anon/Publishable Key:</label>
            <input id="cfgSupabaseKey" type="text" value="${key}" class="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 font-mono text-xs">
          </div>

          <div class="border-t border-slate-200 pt-3">
            <h4 class="font-bold text-slate-800 mb-2">Đăng nhập tài khoản Bác sĩ / Dược sĩ:</h4>
            <div class="space-y-2">
              <input id="authEmail" type="email" placeholder="email@benhvien.vn" class="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 text-xs">
              <input id="authPassword" type="password" placeholder="Mật khẩu" class="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 text-xs">
            </div>
          </div>
        </div>

        <div class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button onclick="window.saveSupabaseConfig()" class="text-xs text-teal-700 font-bold hover:underline">
            Lưu thông số kết nối
          </button>
          <div class="flex gap-2">
            <button onclick="window.handleSupabaseSignIn()" class="px-4 py-2 text-xs font-bold bg-teal-700 text-white rounded-xl hover:bg-teal-800 transition-colors">
              Đăng nhập
            </button>
          </div>
        </div>

      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();
}

export function closeSupabaseAuthModal() {
  const modalContainer = document.getElementById("supabaseAuthModal");
  if (modalContainer) modalContainer.innerHTML = "";
}

export function saveSupabaseConfig() {
  const urlInput = document.getElementById("cfgSupabaseUrl");
  const keyInput = document.getElementById("cfgSupabaseKey");
  if (!urlInput || !keyInput) return;

  const url = urlInput.value.trim();
  const key = keyInput.value.trim();

  localStorage.setItem(CONFIG.STORAGE_KEYS.SUPABASE_URL, url);
  localStorage.setItem(CONFIG.STORAGE_KEYS.SUPABASE_KEY, key);
  alert("Đã lưu cấu hình kết nối Supabase!");
  location.reload();
}

export async function handleSupabaseSignIn() {
  const email = document.getElementById("authEmail")?.value.trim();
  const password = document.getElementById("authPassword")?.value.trim();

  if (!email || !password) {
    alert("Vui lòng nhập email và mật khẩu.");
    return;
  }

  if (!supabaseClient) {
    alert("Vui lòng kiểm tra lại cấu hình URL và Anon Key của Supabase.");
    return;
  }

  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
      alert("Lỗi đăng nhập: " + error.message);
      return;
    }
    currentAuthUser = data.user;
    alert("Đăng nhập thành công!");
    closeSupabaseAuthModal();
    updateAuthUI();
    renderConsultationsList();
  } catch (err) {
    alert("Lỗi kết nối Supabase: " + err.message);
  }
}

async function handleSignOut() {
  if (supabaseClient) {
    await supabaseClient.auth.signOut();
  }
  currentAuthUser = null;
  updateAuthUI();
  renderConsultationsList();
}

function escapeHtml(s) {
  return String(s || "").replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m]));
}

// Global binds
window.openPharmacistReplyModal = openPharmacistReplyModal;
window.closePharmacistReplyModal = closePharmacistReplyModal;
window.generateAiClinicalSuggestion = generateAiClinicalSuggestion;
window.submitPharmacistReply = submitPharmacistReply;
window.openSupabaseAuthModal = openSupabaseAuthModal;
window.closeSupabaseAuthModal = closeSupabaseAuthModal;
window.saveSupabaseConfig = saveSupabaseConfig;
window.handleSupabaseSignIn = handleSupabaseSignIn;
