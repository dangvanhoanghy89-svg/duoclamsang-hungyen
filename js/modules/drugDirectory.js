/**
 * PHARMAVITA / CLINICALRX - MODULE TRA CỨU DƯỢC THƯ QUỐC GIA VIỆT NAM 2022
 * Hỗ trợ lọc 14 nhóm ATC, lọc chữ cái A-Z, tìm kiếm không dấu và phân trang mượt mà
 */

import { getActiveDrugsDatabase, ATC_CATEGORIES } from "../data/drugs.js?v=20260911_v26_tranexamic_pdf";
import {
  getPdfAttachmentById,
  getPdfAttachmentsByDrugId,
  getPdfBlobUrl,
  downloadPdfAttachment,
  openPdfInNewWindow,
  formatFileSize
} from "../data/pdfStorage.js?v=20260911_v26_tranexamic_pdf";

let currentAtcGroup = "all";
let currentLetterFilter = "all";
let currentSearchQuery = "";
let currentPage = 1;
const ITEMS_PER_PAGE = 9;

export function initDrugDirectory() {
  renderAtcFilterOptions();
  renderAlphabetFilterBar();
  setupSearchEvents();
  renderDrugList();
}

function renderAtcFilterOptions() {
  const categorySelect = document.getElementById("drugCategorySelect");
  if (!categorySelect) return;

  categorySelect.innerHTML = ATC_CATEGORIES.map(c => `
    <option value="${c.code}">${c.name}</option>
  `).join("");

  categorySelect.addEventListener("change", (e) => {
    currentAtcGroup = e.target.value;
    currentPage = 1;
    renderDrugList();
  });
}

function renderAlphabetFilterBar() {
  const container = document.getElementById("alphabetFilterContainer");
  if (!container) return;

  const alphabet = ["all", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")];

  container.innerHTML = alphabet.map(letter => {
    const isAll = letter === "all";
    const label = isAll ? "TẤT CẢ (A-Z)" : letter;
    return `
      <button onclick="window.filterByLetter('${letter}')" 
        data-letter="${letter}"
        class="alphabet-btn px-2.5 py-1 text-xs font-bold rounded-lg border transition-all shrink-0 ${isAll ? "bg-teal-700 text-white border-teal-700 shadow-xs" : "bg-white text-slate-700 border-slate-200 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300"}">
        ${label}
      </button>
    `;
  }).join("");
}

export function filterByLetter(letter) {
  currentLetterFilter = letter;
  currentPage = 1;

  // Update active style on alphabet buttons
  const buttons = document.querySelectorAll(".alphabet-btn");
  buttons.forEach(btn => {
    if (btn.dataset.letter === letter) {
      btn.classList.add("bg-teal-700", "text-white", "border-teal-700", "shadow-xs");
      btn.classList.remove("bg-white", "text-slate-700", "border-slate-200");
    } else {
      btn.classList.remove("bg-teal-700", "text-white", "border-teal-700", "shadow-xs");
      btn.classList.add("bg-white", "text-slate-700", "border-slate-200");
    }
  });

  renderDrugList();
}

function setupSearchEvents() {
  const searchInput = document.getElementById("drugSearchInput");
  if (!searchInput) return;

  searchInput.addEventListener("input", (e) => {
    currentSearchQuery = e.target.value.trim().toLowerCase();
    currentPage = 1;
    renderDrugList();
  });
}

// Bỏ dấu tiếng Việt phục vụ tìm kiếm thông minh
function removeVietnameseAccents(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

export function renderDrugList() {
  const container = document.getElementById("drugListContainer");
  const countBadge = document.getElementById("drugCountBadge");
  const paginationContainer = document.getElementById("drugPaginationContainer");
  if (!container) return;

  const normalizedQuery = removeVietnameseAccents(currentSearchQuery);

  const filtered = getActiveDrugsDatabase().filter(drug => {
    // 1. Lọc theo nhóm ATC
    const matchesAtc = currentAtcGroup === "all" || drug.atcGroup === currentAtcGroup || drug.atcCode.startsWith(currentAtcGroup);

    // 2. Lọc theo chữ cái A-Z (dựa trên tên INN hoặc tên thuốc)
    const firstLetter = (drug.inn || drug.name).trim().charAt(0).toUpperCase();
    const matchesLetter = currentLetterFilter === "all" || firstLetter === currentLetterFilter;

    // 3. Lọc theo từ khóa tìm kiếm
    let matchesSearch = true;
    if (normalizedQuery) {
      const targetText = `${drug.name} ${drug.inn} ${drug.brandNames.join(" ")} ${drug.atcCode} ${drug.category} ${drug.indications.join(" ")}`.toLowerCase();
      const normalizedTarget = removeVietnameseAccents(targetText);
      matchesSearch = targetText.includes(currentSearchQuery) || normalizedTarget.includes(normalizedQuery);
    }

    return matchesAtc && matchesLetter && matchesSearch;
  });

  // Luôn tự động sắp xếp danh sách hiển thị theo thứ tự bảng chữ cái ABC (A - Z)
  filtered.sort((a, b) => {
    const nameA = (a.name || a.inn || "").trim();
    const nameB = (b.name || b.inn || "").trim();
    return nameA.localeCompare(nameB, "vi", { sensitivity: "base" });
  });

  // Cập nhật số lượng
  if (countBadge) {
    countBadge.textContent = `${filtered.length} chuyên luận Dược thư 2022`;
  }

  // Cập nhật thanh công cụ Admin trên đầu Dược thư nếu là Admin
  const currentUser = window.getCurrentUser ? window.getCurrentUser() : null;
  const isAdmin = currentUser && currentUser.role === "admin";
  const adminHeaderActions = document.getElementById("drugAdminHeaderActions");
  if (adminHeaderActions) {
    if (isAdmin) {
      adminHeaderActions.innerHTML = `
        <button onclick="window.openAddDrugModal()" 
          title="Thêm một chuyên luận thuốc mới vào cơ sở dữ liệu"
          class="inline-flex items-center gap-1.5 bg-rose-700 hover:bg-rose-800 text-white font-black text-xs px-3 py-1.5 rounded-xl shadow-xs transition-all border border-rose-600 cursor-pointer">
          <i data-lucide="plus-circle" class="w-3.5 h-3.5"></i>
          <span>+ THÊM THUỐC MỚI</span>
        </button>
        <button onclick="window.openAdminPanelModal()" 
          title="Mở toàn bộ Trung tâm Quản trị CSDL Dược thư"
          class="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs transition-all border border-slate-700 cursor-pointer">
          <i data-lucide="database" class="w-3.5 h-3.5 text-rose-400"></i>
          <span>QUẢN TRỊ CSDL</span>
        </button>
      `;
    } else {
      adminHeaderActions.innerHTML = "";
    }
  }

  // Xử lý phân trang
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  if (currentPage > totalPages) currentPage = totalPages;

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (pageItems.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
          <i data-lucide="search-x" class="w-8 h-8"></i>
        </div>
        <h3 class="text-lg font-semibold text-slate-800 mb-1">Không tìm thấy chuyên luận thuốc phù hợp</h3>
        <p class="text-xs text-slate-500 max-w-md mx-auto">
          Không có kết quả cho từ khóa "<strong>${escapeHtml(currentSearchQuery)}</strong>" trong nhóm đã chọn. Hãy thử tìm theo tên hoạt chất gốc (INN) hoặc bấm "TẤT CẢ (A-Z)".
        </p>
      </div>
    `;
    if (paginationContainer) paginationContainer.innerHTML = "";
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  // Render danh sách thuốc trên trang hiện tại
  container.innerHTML = pageItems.map(drug => `
    <div class="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-teal-400 transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      <div class="p-5">
        <div class="flex items-start justify-between gap-2 mb-2 flex-wrap">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
            ${drug.category}
          </span>
          <div class="flex items-center gap-1.5">
            ${drug.attachments && drug.attachments.length > 0 ? `
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs" title="${drug.attachments.length} tài liệu PDF đính kèm">
                <i data-lucide="file-text" class="w-3 h-3 text-rose-600"></i>
                <span>${drug.attachments.length} PDF</span>
              </span>
            ` : ''}
            <span class="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              ATC: ${drug.atcCode}
            </span>
          </div>
        </div>
        
        <h3 class="text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors flex items-center justify-between">
          <span>${drug.name}</span>
          <span class="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
            Dược Thư 2022
          </span>
        </h3>

        <p class="text-xs font-medium text-slate-500 mb-3 italic">
          Tên chung quốc tế: <span class="text-slate-800 not-italic font-bold">${drug.inn}</span>
        </p>

        <div class="mb-3">
          <span class="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Biệt dược thông dụng:</span>
          <div class="flex flex-wrap gap-1 mt-1">
            ${drug.brandNames.map(b => `<span class="text-[11px] bg-slate-50 text-slate-700 border border-slate-200 px-2 py-0.5 rounded font-medium">${b}</span>`).join("")}
          </div>
        </div>

        <p class="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4 font-medium">
          ${drug.indications[0]}
        </p>

        <div class="space-y-1.5 pt-3 border-t border-slate-100 text-xs">
          <div class="flex items-center text-amber-800 font-semibold bg-amber-50/80 px-2.5 py-1.5 rounded-lg border border-amber-200/80">
            <i data-lucide="shield-alert" class="w-3.5 h-3.5 mr-1.5 shrink-0 text-amber-600"></i>
            <span class="truncate">Thai kỳ: Nhóm ${drug.pregnancyCategory}</span>
          </div>
          <div class="flex items-center text-blue-800 font-semibold bg-blue-50/80 px-2.5 py-1.5 rounded-lg border border-blue-200/80">
            <i data-lucide="activity" class="w-3.5 h-3.5 mr-1.5 shrink-0 text-blue-600"></i>
            <span class="truncate">Hiệu chỉnh suy thận: ${drug.renalAdjustment.length} mức</span>
          </div>
        </div>
      </div>

      <div class="bg-slate-50/90 px-5 py-3 border-t border-slate-100 flex items-center justify-between">
        <span class="text-xs text-slate-500 font-medium truncate max-w-[140px]" title="${drug.dosageForm}">
          ${drug.dosageForm}
        </span>
        <div class="flex items-center gap-1.5">
          ${isAdmin ? `
            <button onclick="window.openEditDrugModal('${drug.id}'); setTimeout(() => document.getElementById('formSection7')?.scrollIntoView({behavior:'smooth', block:'start'}), 300);" 
              title="Chỉnh sửa chuyên luận và Đính kèm file PDF (Admin)"
              class="inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2.5 py-1.5 rounded-xl transition-all shadow-2xs cursor-pointer">
              <i data-lucide="edit-3" class="w-3.5 h-3.5 text-amber-600"></i>
              <span>Sửa / Đính kèm PDF</span>
            </button>
          ` : ''}
          <button onclick="window.viewDrugDetails('${drug.id}')" 
            class="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800 bg-white hover:bg-teal-50 border border-teal-300 px-3 py-1.5 rounded-xl transition-all shadow-2xs cursor-pointer">
            <span>Xem chuyên luận</span>
            <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>
    </div>
  `).join("");

  // Render thanh điều khiển phân trang
  renderPaginationControls(filtered.length, totalPages);

  if (window.lucide) window.lucide.createIcons();
}

function renderPaginationControls(totalItems, totalPages) {
  const paginationContainer = document.getElementById("drugPaginationContainer");
  if (!paginationContainer) return;

  if (totalItems <= ITEMS_PER_PAGE) {
    paginationContainer.innerHTML = "";
    return;
  }

  const startRecord = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endRecord = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

  let pageButtonsHtml = "";
  for (let p = 1; p <= totalPages; p++) {
    const isActive = p === currentPage;
    pageButtonsHtml += `
      <button onclick="window.goToDrugPage(${p})" 
        class="w-8 h-8 rounded-lg text-xs font-bold transition-all ${isActive ? "bg-teal-700 text-white shadow-xs" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"}">
        ${p}
      </button>
    `;
  }

  paginationContainer.innerHTML = `
    <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 text-xs">
      <span class="text-slate-500 font-medium">
        Hiển thị <strong>${startRecord} - ${endRecord}</strong> trên tổng số <strong>${totalItems}</strong> thuốc
      </span>

      <div class="flex items-center gap-1.5">
        <button onclick="window.goToDrugPage(${currentPage - 1})" ${currentPage === 1 ? "disabled" : ""}
          class="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors flex items-center gap-1">
          <i data-lucide="chevron-left" class="w-3.5 h-3.5"></i>
          <span>Trước</span>
        </button>

        <div class="flex items-center gap-1">
          ${pageButtonsHtml}
        </div>

        <button onclick="window.goToDrugPage(${currentPage + 1})" ${currentPage === totalPages ? "disabled" : ""}
          class="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors flex items-center gap-1">
          <span>Sau</span>
          <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    </div>
  `;
}

export function goToDrugPage(pageNumber) {
  currentPage = pageNumber;
  renderDrugList();
  // Cuộn nhẹ lên đầu danh sách thuốc
  const drugSection = document.getElementById("drugs");
  if (drugSection) {
    drugSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// Modal xem chuyên sâu dược thư
export function openDrugModal(drugId) {
  const drug = getActiveDrugsDatabase().find(d => d.id === drugId);
  if (!drug) return;

  const currentUser = window.getCurrentUser ? window.getCurrentUser() : null;
  const isAdmin = currentUser && currentUser.role === "admin";

  const modalContainer = document.getElementById("drugDetailModal");
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div class="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in duration-200">
        
        <!-- Header Modal -->
        <div class="px-4 py-4 sm:px-6 sm:py-5 bg-gradient-to-r from-teal-800 via-teal-700 to-slate-900 text-white flex items-start justify-between gap-2">
          <div class="min-w-0">
            <div class="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
              <span class="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-white/20 text-white backdrop-blur-xs">
                ${drug.category}
              </span>
              <span class="px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-mono bg-black/20 text-teal-100">
                ATC: ${drug.atcCode}
              </span>
              <span class="hidden xs:inline-block px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-bold bg-amber-400 text-slate-950 shadow-xs">
                DƯỢC THƯ 2022
              </span>
              ${drug.attachments && drug.attachments.length > 0 ? `
                <span class="px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-bold bg-rose-500 text-white shadow-xs flex items-center gap-1">
                  <i data-lucide="file-text" class="w-3 h-3"></i>
                  ${drug.attachments.length} PDF
                </span>
              ` : ''}
            </div>
            <h2 class="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight truncate">${drug.name}</h2>
            <p class="text-xs sm:text-sm text-teal-100/90 font-medium mt-0.5 truncate">
              Hoạt chất (INN): <strong class="text-white">${drug.inn}</strong> | ${drug.dosageForm}
            </p>
          </div>
          <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
            ${isAdmin ? `
              <button onclick="window.closeDrugModal(); window.openEditDrugModal('${drug.id}'); setTimeout(() => document.getElementById('formSection7')?.scrollIntoView({behavior:'smooth', block:'start'}), 300);" 
                title="Mở Form đính kèm tài liệu PDF (Admin)"
                class="hidden sm:inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs shadow-md transition-all cursor-pointer">
                <i data-lucide="upload" class="w-4 h-4"></i>
                <span>Sửa</span>
              </button>
            ` : ''}
            <button onclick="window.closeDrugModal()" class="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors">
              <i data-lucide="x" class="w-5 h-5 sm:w-6 sm:h-6"></i>
            </button>
          </div>
        </div>

        <!-- Tab Controls (Đầy đủ chuẩn 7 Phần của Dược thư) -->
        <div class="relative border-b border-slate-200 bg-slate-50 flex items-center shrink-0">
          <button onclick="document.getElementById('drugModalTabBar')?.scrollBy({left: -180, behavior: 'smooth'})" 
            title="Cuộn sang trái" 
            class="flex items-center justify-center w-7 h-10 text-slate-400 hover:text-slate-700 bg-slate-100/80 hover:bg-slate-200 border-r border-slate-200 cursor-pointer transition-colors shrink-0">
            <i data-lucide="chevron-left" class="w-4 h-4"></i>
          </button>

          <div id="drugModalTabBar" class="flex items-center px-2 sm:px-4 overflow-x-auto text-xs sm:text-sm font-semibold text-slate-600 gap-1 sm:gap-1.5 flex-1 touch-scroll scroll-smooth hide-scrollbar">
            <button onclick="window.switchDrugTab('general')" id="tab-btn-general" class="drug-tab-btn active px-2.5 sm:px-3 py-2.5 sm:py-3 border-b-2 border-teal-600 text-teal-800 bg-teal-50/40 font-bold whitespace-nowrap cursor-pointer">
              1. Chỉ định & Liều
            </button>
            <button onclick="window.switchDrugTab('renal')" id="tab-btn-renal" class="drug-tab-btn px-2.5 sm:px-3 py-2.5 sm:py-3 border-b-2 border-transparent text-slate-600 hover:text-slate-900 whitespace-nowrap cursor-pointer">
              2. Chỉnh Thận/Gan
            </button>
            <button onclick="window.switchDrugTab('administration')" id="tab-btn-administration" class="drug-tab-btn px-2.5 sm:px-3 py-2.5 sm:py-3 border-b-2 border-transparent text-slate-600 hover:text-slate-900 whitespace-nowrap cursor-pointer">
              3. Cách dùng & Pha truyền
            </button>
            <button onclick="window.switchDrugTab('safety')" id="tab-btn-safety" class="drug-tab-btn px-2.5 sm:px-3 py-2.5 sm:py-3 border-b-2 border-transparent text-slate-600 hover:text-slate-900 whitespace-nowrap cursor-pointer">
              4. Cảnh báo & Thai kỳ
            </button>
            <button onclick="window.switchDrugTab('adr')" id="tab-btn-adr" class="drug-tab-btn px-2.5 sm:px-3 py-2.5 sm:py-3 border-b-2 border-transparent hover:text-rose-950 whitespace-nowrap cursor-pointer font-bold text-rose-700">
              5. Tác dụng phụ (ADR)
            </button>
            <button onclick="window.switchDrugTab('clinical')" id="tab-btn-clinical" class="drug-tab-btn px-2.5 sm:px-3 py-2.5 sm:py-3 border-b-2 border-transparent hover:text-amber-950 whitespace-nowrap cursor-pointer font-bold text-amber-800 flex items-center gap-1">
              <i data-lucide="stethoscope" class="w-3.5 h-3.5 text-amber-600"></i>
              <span>6. Dược lâm sàng & TDM</span>
            </button>
            <button onclick="window.switchDrugTab('pdf')" id="tab-btn-pdf" class="drug-tab-btn px-2.5 sm:px-3.5 py-1.5 sm:py-2 my-1 rounded-xl whitespace-nowrap flex items-center gap-1 font-black text-white bg-rose-600 hover:bg-rose-700 shadow-md transition-all cursor-pointer ring-2 ring-rose-400/50">
              <i data-lucide="file-text" class="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white"></i>
              <span>7. PDF</span>
              <span class="ml-1 px-1.5 py-0.2 bg-white text-rose-700 text-[10px] font-black rounded-full shadow-2xs">
                ${drug.attachments ? drug.attachments.length : 0}
              </span>
            </button>
          </div>

          <button onclick="document.getElementById('drugModalTabBar')?.scrollBy({left: 180, behavior: 'smooth'})" 
            title="Cuộn sang phải (Xem Mục 6 & 7)" 
            class="flex items-center justify-center w-7 h-10 text-slate-400 hover:text-slate-700 bg-slate-100/80 hover:bg-slate-200 border-l border-slate-200 cursor-pointer transition-colors shrink-0">
            <i data-lucide="chevron-right" class="w-4 h-4"></i>
          </button>
        </div>

        <!-- Body Content Tabs -->
        <div class="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 text-xs sm:text-sm touch-scroll">
          
          <!-- TAB 1: GENERAL -->
          <div id="tab-content-general" class="space-y-5">
            <div>
              <h4 class="text-base font-bold text-slate-900 flex items-center gap-2 mb-2">
                <i data-lucide="check-circle-2" class="w-5 h-5 text-teal-600"></i>
                Chỉ định lâm sàng chính (Theo Dược thư Quốc gia Việt Nam)
              </h4>
              <ul class="list-disc list-inside space-y-1.5 text-slate-700 pl-1 leading-relaxed">
                ${drug.indications.map(i => `<li>${i}</li>`).join("")}
              </ul>
            </div>

            <div>
              <h4 class="text-base font-bold text-slate-900 flex items-center gap-2 mb-2">
                <i data-lucide="x-circle" class="w-5 h-5 text-rose-600"></i>
                Chống chỉ định
              </h4>
              <ul class="list-disc list-inside space-y-1 text-rose-700/95 pl-1 leading-relaxed bg-rose-50/70 p-3.5 rounded-xl border border-rose-200 font-medium">
                ${drug.contraindications.map(c => `<li>${c}</li>`).join("")}
              </ul>
            </div>

            <div>
              <h4 class="text-base font-bold text-slate-900 flex items-center gap-2 mb-2">
                <i data-lucide="pill" class="w-5 h-5 text-blue-600"></i>
                Liều dùng chuẩn (Chức năng thận bình thường)
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div class="text-xs font-semibold text-slate-400 uppercase">Người lớn</div>
                  <div class="font-medium text-slate-900 mt-1">${drug.standardDosage.adult}</div>
                </div>
                <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div class="text-xs font-semibold text-slate-400 uppercase">Trẻ em</div>
                  <div class="font-medium text-slate-900 mt-1">${drug.standardDosage.pediatric}</div>
                </div>
                <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div class="text-xs font-semibold text-slate-400 uppercase">Người cao tuổi</div>
                  <div class="font-medium text-slate-900 mt-1">${drug.standardDosage.elderly}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 2: RENAL & HEPATIC -->
          <div id="tab-content-renal" class="hidden space-y-5">
            <div>
              <div class="flex items-center justify-between mb-3">
                <h4 class="text-base font-bold text-slate-900 flex items-center gap-2">
                  <i data-lucide="activity" class="w-5 h-5 text-amber-600"></i>
                  Hiệu chỉnh liều theo Mức lọc cầu thận (CrCl / eGFR)
                </h4>
                <span class="text-xs text-slate-500 font-medium">Cockcroft-Gault / KDIGO</span>
              </div>
              
              <div class="overflow-hidden border border-slate-200 rounded-xl">
                <table class="min-w-full divide-y divide-slate-200 text-left text-xs sm:text-sm">
                  <thead class="bg-slate-50 font-semibold text-slate-700">
                    <tr>
                      <th class="px-4 py-3">Mức thanh thải (CrCl / Giai đoạn)</th>
                      <th class="px-4 py-3">Khuyến cáo chế độ liều & khoảng cách</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 bg-white">
                    ${drug.renalAdjustment.map((r, idx) => `
                      <tr class="${idx % 2 === 1 ? "bg-slate-50/50" : ""}">
                        <td class="px-4 py-3 font-semibold text-teal-800 whitespace-nowrap">${r.crcl}</td>
                        <td class="px-4 py-3 text-slate-700 font-medium">${r.dose}</td>
                      </tr>
                    `).join("")}
                  </tbody>
                </table>
              </div>
            </div>

            <div class="bg-amber-50/70 border border-amber-200 rounded-xl p-4">
              <h5 class="text-sm font-bold text-amber-900 flex items-center gap-1.5 mb-1.5">
                <i data-lucide="alert-circle" class="w-4 h-4 text-amber-600"></i>
                Hiệu chỉnh ở bệnh nhân suy giảm chức năng gan
              </h5>
              <p class="text-slate-700 text-xs sm:text-sm leading-relaxed">${drug.hepaticAdjustment}</p>
            </div>
          </div>

          <!-- TAB 3: CÁCH DÙNG & PHA TRUYỀN -->
          <div id="tab-content-administration" class="hidden space-y-5">
            <div class="bg-teal-50/60 border border-teal-200 rounded-xl p-4">
              <h5 class="font-bold text-teal-950 text-sm flex items-center gap-2 mb-2">
                <i data-lucide="syringe" class="w-4 h-4 text-teal-700"></i>
                3.1 Hướng dẫn pha truyền & Đường dùng chi tiết
              </h5>
              <p class="text-slate-700 text-xs sm:text-sm leading-relaxed">${drug.administration}</p>
            </div>

            <div class="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <h5 class="font-bold text-slate-900 text-sm flex items-center gap-2 mb-2">
                <i data-lucide="pill" class="w-4 h-4 text-blue-600"></i>
                3.2 Dạng bào chế & Đường dùng chuẩn
              </h5>
              <p class="text-slate-700 text-xs sm:text-sm leading-relaxed">
                <strong>Dạng bào chế:</strong> ${drug.dosageForm || "Theo danh mục Dược thư Quốc gia"}<br>
                <strong>Nhóm dược lý (ATC):</strong> ${drug.atcCode || drug.atcGroup || "Chưa phân loại"}
              </p>
            </div>
          </div>

          <!-- TAB 4: CẢNH BÁO & THAI KỲ -->
          <div id="tab-content-safety" class="hidden space-y-5">
            ${drug.blackBoxWarning ? `
              <div class="bg-rose-50 border-2 border-rose-500 rounded-xl p-4">
                <div class="flex items-center gap-2 text-rose-800 font-bold mb-1 uppercase tracking-wider text-xs">
                  <i data-lucide="shield-alert" class="w-5 h-5 text-rose-600"></i>
                  4.1 Cảnh báo quan trọng / Hộp đen (Black Box Warning)
                </div>
                <p class="text-rose-950 font-medium text-xs sm:text-sm leading-relaxed">${drug.blackBoxWarning}</p>
              </div>
            ` : ""}

            <div class="bg-indigo-50/60 border border-indigo-200 rounded-xl p-4">
              <h5 class="font-bold text-indigo-950 text-sm mb-2 flex items-center gap-2">
                <i data-lucide="heart-pulse" class="w-4 h-4 text-indigo-600"></i>
                4.2 Phụ nữ mang thai và Thời kỳ cho con bú
              </h5>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                <div>
                  <span class="font-semibold text-indigo-900">Phân loại thai kỳ (FDA):</span>
                  <span class="font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200 ml-1.5">
                    Nhóm ${drug.pregnancyCategory}
                  </span>
                </div>
                <div>
                  <span class="font-semibold text-indigo-900">Thời kỳ cho con bú:</span>
                  <p class="text-slate-600 mt-1">${drug.lactation}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 5: MỤC 5. TÁC DỤNG KHÔNG MONG MUỐN (ADR) -->
          <div id="tab-content-adr" class="hidden space-y-5">
            <div class="p-4 bg-rose-50/90 rounded-2xl border border-rose-200 flex items-center justify-between flex-wrap gap-2">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                  <i data-lucide="alert-triangle" class="w-5 h-5"></i>
                </div>
                <div>
                  <h4 class="text-sm sm:text-base font-black text-rose-950">Mục 5: Tác Dụng Không Mong Muốn (ADR) & Cảnh Giác Dược</h4>
                  <p class="text-[11px] text-rose-800">Theo dõi, phát hiện sớm và xử trí các biến cố bất lợi của thuốc</p>
                </div>
              </div>
              <button onclick="window.closeDrugModal(); window.location.hash = '#adr';" 
                class="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 hover:text-rose-800 bg-white hover:bg-rose-50 border border-rose-300 px-3 py-1.5 rounded-xl transition-all shadow-2xs cursor-pointer shrink-0">
                <i data-lucide="send" class="w-3.5 h-3.5"></i>
                <span>Gửi báo cáo ADR</span>
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h5 class="font-bold text-slate-900 text-sm flex items-center gap-1.5 mb-2">
                  <i data-lucide="alert-circle" class="w-4 h-4 text-amber-600"></i>
                  5.1 Tác dụng không mong muốn thường gặp
                </h5>
                <div class="text-xs sm:text-sm text-slate-700 leading-relaxed bg-white p-3.5 rounded-lg border border-slate-100">${drug.adr.common || "Chưa ghi nhận biến cố bất lợi thường gặp đặc biệt."}</div>
              </div>

              <div class="bg-rose-50/60 p-4 rounded-xl border border-rose-200">
                <h5 class="font-bold text-rose-900 text-sm flex items-center gap-1.5 mb-2">
                  <i data-lucide="flame" class="w-4 h-4 text-rose-600"></i>
                  5.2 Tác dụng phụ nghiêm trọng (Cần cấp cứu & báo ngay)
                </h5>
                <div class="text-xs sm:text-sm text-rose-900 leading-relaxed bg-white p-3.5 rounded-lg border border-rose-100 font-medium">${drug.adr.serious || "Theo dõi các phản ứng quá mẫn, sốc phản vệ hoặc độc tính cơ quan."}</div>
              </div>
            </div>

            <div class="bg-amber-50/60 border border-amber-200 rounded-xl p-4 text-xs sm:text-sm text-amber-950">
              <h5 class="font-bold flex items-center gap-1.5 mb-1 text-amber-900">
                <i data-lucide="shield-alert" class="w-4 h-4 text-amber-600"></i>
                5.3 Hướng dẫn xử trí & Phản hồi Dược lâm sàng:
              </h5>
              <p class="leading-relaxed text-slate-700">Khi bệnh nhân xuất hiện các triệu chứng nghi ngờ ADR, bác sĩ/điều dưỡng xử trí triệu chứng khẩn cấp theo phác đồ, đánh giá thang Naranjo và báo cáo về Tổ Dược Lâm Sàng (Khoa Dược BVĐK tỉnh Hưng Yên - Máy lẻ 406) để tổng hợp báo cáo Trung tâm DI & ADR Quốc gia.</p>
            </div>
          </div>

          <!-- TAB 6: MỤC 6. DƯỢC LÂM SÀNG & TDM -->
          <div id="tab-content-clinical" class="hidden space-y-5">
            <div class="p-4 bg-teal-50/90 rounded-2xl border border-teal-200 flex items-center justify-between flex-wrap gap-2">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                  <i data-lucide="stethoscope" class="w-5 h-5"></i>
                </div>
                <div>
                  <h4 class="text-sm sm:text-base font-black text-teal-950">Mục 6: Lưu Ý Dược Lâm Sàng Chuyên Sâu & Giám Sát TDM</h4>
                  <p class="text-[11px] text-teal-800">Tổ Dược Lâm Sàng - Thông Tin Thuốc BVĐK Tỉnh Hưng Yên</p>
                </div>
              </div>
              <button onclick="window.startConsultationForDrug ? window.startConsultationForDrug('${escapeHtml(drug.name)}') : (window.closeDrugModal(), window.location.hash = '#consultation');" 
                class="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 bg-white hover:bg-teal-50 border border-teal-300 px-3 py-1.5 rounded-xl transition-all shadow-2xs cursor-pointer shrink-0">
                <i data-lucide="message-square" class="w-3.5 h-3.5"></i>
                <span>Gửi câu hỏi hội chẩn</span>
              </button>
            </div>

            <div class="bg-amber-50/70 border border-amber-300/80 rounded-xl p-4">
              <h5 class="font-bold text-amber-950 text-sm flex items-center gap-2 mb-2">
                <i data-lucide="sparkles" class="w-4 h-4 text-amber-700"></i>
                6.1 Lưu ý Dược lâm sàng chuyên sâu (Clinical Pearls)
              </h5>
              <div class="text-slate-800 text-xs sm:text-sm leading-relaxed font-medium bg-white p-3.5 rounded-xl border border-amber-200/70 shadow-2xs">${drug.clinicalPearls || "Tuân thủ đúng liều lượng, đường dùng và theo dõi đáp ứng lâm sàng của bệnh nhân."}</div>
            </div>

            ${drug.tdmTarget ? `
              <div class="bg-blue-50/70 border border-blue-200 rounded-xl p-4">
                <h5 class="font-bold text-blue-950 text-sm flex items-center gap-2 mb-2">
                  <i data-lucide="gauge" class="w-4 h-4 text-blue-700"></i>
                  6.2 Giám sát nồng độ thuốc trong máu (TDM Target & Khoảng điều trị)
                </h5>
                <div class="text-slate-800 text-xs sm:text-sm leading-relaxed font-medium bg-white p-3.5 rounded-xl border border-blue-200/70 shadow-2xs">${drug.tdmTarget}</div>
              </div>
            ` : `
              <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-500">
                <span class="font-bold text-slate-700">6.2 Giám sát nồng độ thuốc (TDM):</span> Thuốc không nằm trong danh mục bắt buộc định lượng nồng độ thường quy (TDM); theo dõi hiệu quả điều trị và độc tính qua các chỉ số cận lâm sàng định kỳ.
              </div>
            `}

            <div class="bg-indigo-50/60 border border-indigo-200 rounded-xl p-4 text-xs sm:text-sm shadow-2xs">
              <h5 class="font-bold text-indigo-950 flex items-center gap-2 mb-1.5">
                <i data-lucide="activity" class="w-4 h-4 text-indigo-700"></i>
                6.3 Tương tác thuốc và Tương dung tiêm truyền
              </h5>
              <p class="text-slate-700 leading-relaxed">
                Để kiểm tra khả năng tương tác của <strong>${drug.name}</strong> với các thuốc khác trong phác đồ điều trị của bệnh nhân, vui lòng sử dụng công cụ <strong>Tương tác thuốc</strong> và <strong>Tương dung tiêm truyền IV</strong> trên thanh menu.
              </p>
            </div>

            <div class="flex items-center justify-between pt-4 border-t border-slate-200 text-xs text-slate-600">
              <button onclick="window.switchDrugTab('adr')" class="inline-flex items-center gap-1 hover:text-rose-700 font-bold transition-colors cursor-pointer">
                <i data-lucide="chevron-left" class="w-4 h-4 text-slate-400"></i>
                <span>Xem Mục 5: Tác dụng phụ (ADR)</span>
              </button>
              <button onclick="window.switchDrugTab('pdf')" class="inline-flex items-center gap-1 hover:text-rose-700 font-bold text-rose-600 transition-colors cursor-pointer">
                <span>Xem Phần 7: Tài liệu PDF</span>
                <i data-lucide="chevron-right" class="w-4 h-4 text-rose-500"></i>
              </button>
            </div>
          </div>

          <!-- TAB 5: PDF ATTACHMENTS (PHẦN 7) -->
          <div id="tab-content-pdf" class="hidden space-y-5">
            ${(!drug.attachments || drug.attachments.length === 0) ? `
              <div class="py-12 text-center bg-rose-50/30 rounded-2xl border-2 border-dashed border-rose-200 p-8">
                <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shadow-xs">
                  <i data-lucide="file-text" class="w-8 h-8"></i>
                </div>
                <h3 class="text-lg font-black text-slate-900 mb-1">Phần 7: Tài liệu chuyên môn đính kèm</h3>
                <p class="text-xs text-slate-500 max-w-md mx-auto mb-4 leading-relaxed">
                  Chuyên luận thuốc <strong>${escapeHtml(drug.name)}</strong> hiện chưa có tệp PDF đính kèm (hướng dẫn sử dụng Bộ Y tế, phác đồ điều trị, tờ thông tin sản phẩm SPC).
                </p>
                ${isAdmin ? `
                  <button onclick="window.closeDrugModal(); window.openEditDrugModal('${drug.id}'); setTimeout(() => document.getElementById('formSection7')?.scrollIntoView({behavior:'smooth', block:'start'}), 300)" 
                    class="inline-flex items-center gap-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer">
                    <i data-lucide="upload" class="w-4 h-4"></i>
                    <span>Tải lên & Đính kèm file PDF cho thuốc này ngay (Admin)</span>
                  </button>
                ` : `
                  <div class="inline-flex items-center gap-2 text-slate-500 text-xs bg-white border border-slate-200 px-4 py-2 rounded-xl">
                    <i data-lucide="info" class="w-4 h-4 text-teal-600"></i>
                    <span>Tài liệu chuyên môn đang được Quản trị viên Khoa Dược cập nhật bổ sung.</span>
                  </div>
                `}
              </div>
            ` : `
              <div>
                <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div>
                    <h4 class="text-base font-black text-slate-900 flex items-center gap-2">
                      <i data-lucide="file-text" class="w-5 h-5 text-rose-600"></i>
                      Phần 7: Danh sách tài liệu chuyên môn đính kèm (${drug.attachments.length} tài liệu)
                    </h4>
                    <p class="text-xs text-slate-500 mt-0.5">
                      Bác sĩ và Dược sĩ có thể xem trực tiếp, mở tab mới toàn màn hình hoặc tải file về máy tính.
                    </p>
                  </div>
                  ${isAdmin ? `
                    <button onclick="window.closeDrugModal(); window.openEditDrugModal('${drug.id}'); setTimeout(() => document.getElementById('formSection7')?.scrollIntoView({behavior:'smooth', block:'start'}), 300)" 
                      class="inline-flex items-center gap-1.5 text-xs font-bold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer">
                      <i data-lucide="plus-circle" class="w-3.5 h-3.5"></i>
                      <span>Quản lý / Thêm file PDF khác (Admin)</span>
                    </button>
                  ` : ''}
                </div>

                <!-- Danh sách các thẻ PDF -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
                  ${drug.attachments.map((att, idx) => `
                    <div class="bg-white border border-slate-200 hover:border-teal-400 rounded-xl p-3.5 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all group">
                      <div class="flex items-start gap-3">
                        <div class="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100 font-bold">
                          <i data-lucide="file-text" class="w-5 h-5"></i>
                        </div>
                        <div class="min-w-0 flex-1">
                          <h5 class="text-xs font-bold text-slate-900 truncate group-hover:text-teal-700 transition-colors" title="${escapeHtml(att.title)}">
                            ${escapeHtml(att.title)}
                          </h5>
                          <p class="text-[11px] text-slate-500 truncate mt-0.5 font-mono">
                            ${escapeHtml(att.fileName || "Tài liệu đính kèm")}
                          </p>
                          <div class="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                            <span class="font-semibold text-slate-600">${formatFileSize(att.fileSize)}</span>
                            <span>•</span>
                            <span>${escapeHtml(att.uploadedAt || "Đã lưu")}</span>
                          </div>
                        </div>
                      </div>

                      <div class="flex items-center justify-end gap-2 mt-3 pt-2.5 border-t border-slate-100 text-xs">
                        <button onclick="window.viewDrugPdfInModal('${att.id}', '${escapeHtml(att.title)}')" 
                          class="inline-flex items-center gap-1 text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer"
                          title="Xem tài liệu trong khung xem bên dưới">
                          <i data-lucide="eye" class="w-3.5 h-3.5"></i>
                          <span>Xem</span>
                        </button>
                        <button onclick="window.openPdfInNewWindow('${att.id}')" 
                          class="inline-flex items-center gap-1 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer"
                          title="Mở toàn màn hình trong tab mới">
                          <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
                          <span>Tab mới</span>
                        </button>
                        <button onclick="window.downloadPdfAttachment('${att.id}', '${escapeHtml(att.fileName)}')" 
                          class="inline-flex items-center gap-1 text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer"
                          title="Tải tệp PDF về máy tính">
                          <i data-lucide="download" class="w-3.5 h-3.5"></i>
                          <span>Tải về</span>
                        </button>
                      </div>
                    </div>
                  `).join("")}
                </div>

                <!-- Khung xem trực tiếp PDF -->
                <div class="border border-slate-200 rounded-2xl overflow-hidden bg-slate-900 shadow-sm">
                  <div class="px-4 py-2.5 bg-slate-800 border-b border-slate-700 flex items-center justify-between text-xs text-white">
                    <div class="flex items-center gap-2 min-w-0">
                      <i data-lucide="book-open" class="w-4 h-4 text-teal-400 shrink-0"></i>
                      <span id="modalPdfViewerTitle" class="font-bold truncate text-slate-200">
                        Đang xem: ${escapeHtml(drug.attachments[0].title)}
                      </span>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                      <span id="pdfViewerLoading" class="hidden text-teal-400 animate-pulse text-[11px] font-semibold">Đang nạp file...</span>
                      <button onclick="window.openPdfInNewWindow('${drug.attachments[0].id}')" 
                        id="modalPdfHeaderExtBtn"
                        class="text-slate-300 hover:text-white px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors text-xs flex items-center gap-1 cursor-pointer">
                        <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
                        <span>Mở toàn trang</span>
                      </button>
                    </div>
                  </div>
                  <div class="relative w-full h-[580px] bg-slate-800 flex items-center justify-center">
                    <iframe id="modalPdfIframe" 
                      data-first-id="${drug.attachments[0].id}" 
                      class="w-full h-full border-0 bg-white" 
                      title="Trình đọc tài liệu PDF">
                    </iframe>
                  </div>
                </div>
              </div>
            `}
          </div>

        </div>

        <!-- Footer Modal -->
        <div class="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div class="flex items-center gap-2">
            <span>Tham chiếu: Dược thư Quốc gia Việt Nam 2022 (Bộ Y tế)</span>
            ${isAdmin ? `
              <span class="px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">
                Quyền Admin
              </span>
            ` : ''}
          </div>
          <div class="flex items-center gap-2">
            ${isAdmin ? `
              <button onclick="window.closeDrugModal(); window.openEditDrugModal('${drug.id}')" 
                class="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer">
                <i data-lucide="edit-3" class="w-4 h-4"></i>
                <span>Chỉnh sửa chuyên luận (Admin)</span>
              </button>
            ` : ''}
            <button onclick="window.closeDrugModal()" class="bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-1.5 rounded-xl font-bold transition-colors cursor-pointer">
              Đóng
            </button>
          </div>
        </div>

      </div>
    </div>
  `;

  const tabBar = document.getElementById("drugModalTabBar");
  if (tabBar) {
    tabBar.addEventListener("wheel", (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        tabBar.scrollLeft += e.deltaY;
      }
    }, { passive: false });
  }

  if (window.lucide) window.lucide.createIcons();
}

export function switchDrugTab(tabName) {
  const tabs = ["general", "renal", "administration", "safety", "adr", "clinical", "pdf"];
  tabs.forEach(t => {
    const btn = document.getElementById(`tab-btn-${t}`);
    const content = document.getElementById(`tab-content-${t}`);
    if (btn && content) {
      if (t === "pdf") {
        if (t === tabName) {
          btn.className = "drug-tab-btn px-3.5 py-2 my-1 rounded-xl whitespace-nowrap flex items-center gap-1.5 font-black text-white bg-rose-700 shadow-md ring-2 ring-rose-400 cursor-pointer";
          content.classList.remove("hidden");
        } else {
          btn.className = "drug-tab-btn px-3.5 py-2 my-1 rounded-xl whitespace-nowrap flex items-center gap-1.5 font-black text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-all cursor-pointer ring-2 ring-rose-400/50";
          content.classList.add("hidden");
        }
      } else if (t === "clinical") {
        if (t === tabName) {
          btn.className = "drug-tab-btn active px-2.5 sm:px-3 py-2.5 sm:py-3 border-b-2 border-amber-600 text-amber-950 bg-amber-50/70 font-black whitespace-nowrap cursor-pointer flex items-center gap-1";
          content.classList.remove("hidden");
        } else {
          btn.className = "drug-tab-btn px-2.5 sm:px-3 py-2.5 sm:py-3 border-b-2 border-transparent hover:text-amber-950 font-bold text-amber-800 whitespace-nowrap cursor-pointer flex items-center gap-1";
          content.classList.add("hidden");
        }
      } else if (t === "adr") {
        if (t === tabName) {
          btn.className = "drug-tab-btn active px-2.5 sm:px-3 py-2.5 sm:py-3 border-b-2 border-rose-600 text-rose-900 bg-rose-50/60 font-black whitespace-nowrap cursor-pointer";
          content.classList.remove("hidden");
        } else {
          btn.className = "drug-tab-btn px-2.5 sm:px-3 py-2.5 sm:py-3 border-b-2 border-transparent hover:text-rose-950 font-bold text-rose-700 whitespace-nowrap cursor-pointer";
          content.classList.add("hidden");
        }
      } else {
        if (t === tabName) {
          btn.className = "drug-tab-btn active px-2.5 sm:px-3 py-2.5 sm:py-3 border-b-2 border-teal-600 text-teal-800 bg-teal-50/40 font-bold whitespace-nowrap cursor-pointer";
          content.classList.remove("hidden");
        } else {
          btn.className = "drug-tab-btn px-2.5 sm:px-3 py-2.5 sm:py-3 border-b-2 border-transparent text-slate-600 hover:text-slate-900 font-semibold whitespace-nowrap cursor-pointer";
          content.classList.add("hidden");
        }
      }

      if (t === tabName) {
        btn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  });

  // Tự động load file PDF đầu tiên vào iframe nếu chuyển sang tab PDF và chưa nạp
  if (tabName === "pdf") {
    const iframe = document.getElementById("modalPdfIframe");
    if (iframe && !iframe.src && iframe.dataset.firstId) {
      viewDrugPdfInModal(iframe.dataset.firstId);
    }
  }

  if (window.lucide) window.lucide.createIcons();
}

export async function viewDrugPdfInModal(pdfId, title = "") {
  const iframe = document.getElementById("modalPdfIframe");
  const titleEl = document.getElementById("modalPdfViewerTitle");
  const extBtn = document.getElementById("modalPdfHeaderExtBtn");
  const loading = document.getElementById("pdfViewerLoading");

  if (title && titleEl) {
    titleEl.innerText = `Đang xem: ${title}`;
  }
  if (extBtn) {
    extBtn.onclick = () => openPdfInNewWindow(pdfId);
  }

  if (loading) loading.classList.remove("hidden");

  try {
    const url = await getPdfBlobUrl(pdfId);
    if (iframe && url) {
      iframe.src = url;
    }
  } catch (err) {
    console.error("Lỗi nạp PDF vào iframe:", err);
  } finally {
    if (loading) loading.classList.add("hidden");
  }
}

export function closeDrugModal() {
  const modalContainer = document.getElementById("drugDetailModal");
  if (modalContainer) modalContainer.innerHTML = "";
}

function escapeHtml(s) {
  return String(s || "").replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m]));
}

// Quick Search shortcut from Home Banner
export function searchDrugQuickly(query) {
  currentSearchQuery = (query || "").trim().toLowerCase();
  currentPage = 1;
  const searchInput = document.getElementById("drugSearchInput");
  if (searchInput) searchInput.value = query || "";
  renderDrugList();
  if (window.navigateToSection) {
    window.navigateToSection("drugs");
  }
}

// Global binds
window.viewDrugDetails = openDrugModal;
window.switchDrugTab = switchDrugTab;
window.closeDrugModal = closeDrugModal;
window.filterByLetter = filterByLetter;
window.goToDrugPage = goToDrugPage;
window.renderDrugList = renderDrugList;
window.viewDrugPdfInModal = viewDrugPdfInModal;
window.openPdfInNewWindow = openPdfInNewWindow;
window.downloadPdfAttachment = downloadPdfAttachment;
window.searchDrugQuickly = searchDrugQuickly;
