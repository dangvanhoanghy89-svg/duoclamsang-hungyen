/**
 * PHARMAVITA / CLINICALRX - PHÂN HỆ XÁC THỰC & PHÂN QUYỀN (AUTH & RBAC)
 * Bệnh viện Đa khoa tỉnh Hưng Yên
 * Hỗ trợ phân quyền Quản trị viên (Admin) và Cán bộ y tế / Bác sĩ (User)
 * Kèm trung tâm Quản trị Danh mục Thuốc nội viện (Admin Drug CRUD)
 */

import { CONFIG } from "../config.js";
import { 
  getActiveDrugsDatabase, 
  saveOrUpdateDrug, 
  deleteDrugById, 
  resetCustomDrugsDatabase, 
  ATC_CATEGORIES 
} from "../data/drugs.js?v=pdf_section7_v4";
import {
  savePdfAttachment,
  getPdfAttachmentById,
  getPdfAttachmentsByDrugId,
  deletePdfAttachmentById,
  getPdfBlobUrl,
  formatFileSize
} from "../data/pdfStorage.js?v=pdf_section7_v4";

// Danh sách tài khoản nội viện mặc định
export const DEFAULT_ACCOUNTS = [
  {
    id: "admin-01",
    email: "admin@bvdk-hungyen.vn",
    password: "admin123",
    fullName: "DS.CKII. Nguyễn Văn Quản Trị",
    role: "admin",
    roleLabel: "Quản trị viên",
    roleBadgeClass: "bg-rose-100 text-rose-800 border-rose-200",
    title: "Trưởng Khoa Dược",
    department: "Khoa Dược · BVĐK Tỉnh Hưng Yên",
    avatar: "Q"
  },
  {
    id: "doctor-01",
    email: "bacsi@bvdk-hungyen.vn",
    password: "user123",
    fullName: "BS.CKI. Trần Thị Bác Sĩ",
    role: "doctor",
    roleLabel: "Bác sĩ lâm sàng",
    roleBadgeClass: "bg-teal-100 text-teal-800 border-teal-200",
    title: "Bác sĩ điều trị",
    department: "Khoa Hồi sức tích cực - Chống độc",
    avatar: "B"
  },
  {
    id: "pharm-01",
    email: "duocsi@bvdk-hungyen.vn",
    password: "duoc123",
    fullName: "ThS.DS. Lê Văn Dược Lâm Sàng",
    role: "pharmacist",
    roleLabel: "Dược sĩ lâm sàng",
    roleBadgeClass: "bg-indigo-100 text-indigo-800 border-indigo-200",
    title: "Dược sĩ thường trực",
    department: "Tổ Dược lâm sàng - Thông tin thuốc",
    avatar: "D"
  }
];

let currentUser = null;
let currentAdminTab = "drugs"; // "overview" | "drugs"
let currentAdminDrugSearch = "";

export function initAuthModule() {
  loadSavedUserSession();
  renderHeaderAuthUI();
  setupGlobalWindowBindings();
}

function loadSavedUserSession() {
  try {
    const raw = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_USER) || localStorage.getItem("clinicalrx_auth_user_v2");
    if (raw) {
      currentUser = JSON.parse(raw);
    }
  } catch (err) {
    console.error("Lỗi đọc thông tin đăng nhập:", err);
    currentUser = null;
  }
}

export function getCurrentUser() {
  return currentUser;
}

export function openLoginModal() {
  const modal = document.getElementById("authLoginModal");
  if (modal) {
    modal.classList.remove("hidden");
    modal.style.display = "flex";
  }
}

export function closeLoginModal() {
  const modal = document.getElementById("authLoginModal");
  if (modal) {
    modal.classList.add("hidden");
    modal.style.display = "none";
  }
}

export function fastLogin(roleType) {
  const target = DEFAULT_ACCOUNTS.find(acc => acc.role === roleType) || DEFAULT_ACCOUNTS[0];
  executeLogin(target);
}

export function handleManualLogin(e) {
  if (e) e.preventDefault();
  const emailInput = document.getElementById("loginEmailInput");
  const passInput = document.getElementById("loginPasswordInput");
  const errorBox = document.getElementById("loginErrorBox") || document.getElementById("loginErrorMessage");
  const errorText = document.getElementById("loginErrorText");

  const email = emailInput ? emailInput.value.trim().toLowerCase() : "";
  const password = passInput ? passInput.value.trim() : "";

  const matched = DEFAULT_ACCOUNTS.find(acc => acc.email.toLowerCase() === email && acc.password === password);
  if (matched) {
    if (errorBox) errorBox.classList.add("hidden");
    executeLogin(matched);
  } else {
    const msg = "Email hoặc mật khẩu không chính xác! (Gợi ý: admin@bvdk-hungyen.vn / admin123)";
    if (errorText) errorText.textContent = msg;
    if (errorBox) {
      errorBox.textContent = msg;
      errorBox.classList.remove("hidden");
    } else {
      alert(msg);
    }
  }
}

function executeLogin(userObj) {
  currentUser = { ...userObj, loggedInAt: new Date().toISOString() };
  localStorage.setItem(CONFIG.STORAGE_KEYS.AUTH_USER, JSON.stringify(currentUser));
  localStorage.setItem("clinicalrx_auth_user_v2", JSON.stringify(currentUser));
  closeLoginModal();
  renderHeaderAuthUI();
  showToast(`Đăng nhập thành công: ${currentUser.fullName} (${currentUser.roleLabel})`, "success");
  autofillUserContext();

  // Cập nhật lại giao diện Dược thư hiển thị nút admin
  if (window.renderDrugList) {
    try { window.renderDrugList(); } catch (err) { console.warn(err); }
  }

  // Nếu là Quản trị viên, tự động mở ngay Trung tâm Quản trị Admin Panel
  if (currentUser.role === "admin") {
    setTimeout(() => {
      openAdminPanelModal();
    }, 250);
  }
}

export function handleLogout() {
  currentUser = null;
  localStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_USER);
  localStorage.removeItem("clinicalrx_auth_user_v2");
  closeAdminPanelModal();
  renderHeaderAuthUI();
  if (window.renderDrugList) {
    try { window.renderDrugList(); } catch (err) { console.warn(err); }
  }
  showToast("Đã đăng xuất khỏi hệ thống.", "info");
}

export function renderHeaderAuthUI() {
  if (!currentUser) {
    loadSavedUserSession();
  }
  const container = document.getElementById("authHeaderContainer") || document.getElementById("headerAuthArea");
  if (!container) return;

  if (!currentUser) {
    container.innerHTML = `
      <button onclick="window.openLoginModal()" 
        class="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-md transition-all shrink-0 cursor-pointer">
        <i data-lucide="log-in" class="w-4 h-4"></i>
        <span>ĐĂNG NHẬP</span>
      </button>
    `;
  } else {
    const isAdmin = currentUser.role === "admin";
    container.innerHTML = `
      <div class="flex items-center gap-2 shrink-0">
        ${isAdmin ? `
          <!-- Nút truy cập nhanh trực tiếp Trung tâm Quản trị cho Admin -->
          <button onclick="window.openAdminPanelModal()" 
            class="inline-flex items-center gap-1.5 bg-rose-700 hover:bg-rose-800 text-white px-3 py-1.5 rounded-xl text-xs font-black shadow-md border border-rose-500 transition-all cursor-pointer">
            <i data-lucide="shield-check" class="w-4 h-4 text-rose-200"></i>
            <span class="hidden sm:inline">⚙️ TRANG QUẢN TRỊ</span>
            <span class="sm:hidden">⚙️ ADMIN</span>
          </button>
        ` : ''}

        <!-- Dropdown người dùng -->
        <div class="relative inline-block text-left">
          <button onclick="window.toggleUserDropdown()" 
            class="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs transition-all cursor-pointer">
            <div class="w-6 h-6 rounded-md ${isAdmin ? 'bg-rose-600' : 'bg-teal-600'} text-white text-xs font-bold flex items-center justify-center">
              ${currentUser.avatar}
            </div>
            <span class="max-w-[120px] truncate hidden md:inline">${currentUser.fullName}</span>
            <span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${currentUser.roleBadgeClass}">
              ${currentUser.roleLabel}
            </span>
            <i data-lucide="chevron-down" class="w-3.5 h-3.5 text-slate-400"></i>
          </button>

          <div id="userDropdownMenu" class="hidden absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
            <div class="px-3 py-2 border-b border-slate-100">
              <p class="font-bold text-slate-900">${currentUser.fullName}</p>
              <p class="text-[11px] text-slate-500 truncate">${currentUser.department}</p>
            </div>
            ${isAdmin ? `
              <button onclick="window.openAdminPanelModal()" class="w-full text-left px-3 py-2 text-rose-700 font-bold hover:bg-rose-50 flex items-center gap-2 cursor-pointer">
                <i data-lucide="shield-check" class="w-4 h-4 text-rose-600"></i>
                <span>Mở Trung tâm Quản trị (Admin)</span>
              </button>
            ` : ''}
            <button onclick="window.openUserProfileModal()" class="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer">
              <i data-lucide="user" class="w-4 h-4 text-slate-500"></i>
              <span>Thông tin cán bộ</span>
            </button>
            <div class="border-t border-slate-100 my-1"></div>
            <button onclick="window.handleLogout()" class="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-semibold cursor-pointer">
              <i data-lucide="log-out" class="w-4 h-4 text-rose-600"></i>
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Cập nhật nút Hero Banner
  const heroBtn = document.getElementById("heroAuthBtn");
  if (heroBtn) {
    if (currentUser) {
      if (currentUser.role === "admin") {
        heroBtn.innerHTML = `<i data-lucide="shield-check" class="w-4 h-4 text-rose-200"></i> ⚙️ MỞ TRUNG TÂM QUẢN TRỊ (ADMIN PANEL)`;
        heroBtn.className = "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-rose-700 hover:bg-rose-800 text-white border border-rose-500 shadow-xl transition-all cursor-pointer ring-2 ring-rose-400/50";
        heroBtn.onclick = function() { window.openAdminPanelModal(); };
      } else {
        heroBtn.innerHTML = `<i data-lucide="user-check" class="w-4 h-4 text-teal-300"></i> Đang hoạt động: ${currentUser.fullName} (${currentUser.roleLabel})`;
        heroBtn.className = "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-teal-800/80 text-teal-100 border border-teal-500/50 backdrop-blur-sm cursor-pointer";
        heroBtn.onclick = function() { window.openUserProfileModal(); };
      }
    } else {
      heroBtn.innerHTML = `<i data-lucide="key-round" class="w-4 h-4 text-slate-950"></i> ĐĂNG NHẬP (ADMIN / BÁC SĨ)`;
      heroBtn.className = "px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black transition-all shadow-lg flex items-center gap-2 ring-2 ring-emerald-300/80 cursor-pointer";
      heroBtn.onclick = window.openLoginModal;
    }
  }

  if (window.lucide) window.lucide.createIcons();
}

export function toggleUserDropdown() {
  const menu = document.getElementById("userDropdownMenu");
  if (menu) menu.classList.toggle("hidden");
}

// ============================================================================
// TRUNG TÂM QUẢN TRỊ ADMIN (ADMIN PANEL VÀ CRUD QUẢN LÝ THUỐC NỘI VIỆN)
// ============================================================================
export function openAdminPanelModal() {
  if (!currentUser || currentUser.role !== "admin") {
    alert("Quyền truy cập bị từ chối: Chức năng này chỉ dành cho Quản trị viên (Admin)!");
    return;
  }

  let container = document.getElementById("adminPanelModalContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "adminPanelModalContainer";
    document.body.appendChild(container);
  }

  const allDrugs = getActiveDrugsDatabase();

  container.innerHTML = `
    <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div class="bg-white rounded-2xl shadow-2xl max-w-5xl w-full border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <!-- Header -->
        <div class="px-6 py-4 bg-gradient-to-r from-rose-900 to-rose-800 text-white flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <i data-lucide="shield-check" class="w-5 h-5 text-rose-300"></i>
            </div>
            <div>
              <h3 class="font-black text-base sm:text-lg tracking-tight">TRUNG TÂM QUẢN TRỊ NỘI VIỆN (ADMIN PANEL)</h3>
              <p class="text-xs text-rose-200">Bệnh viện Đa khoa tỉnh Hưng Yên · Dược thư Quốc gia VN 2022</p>
            </div>
          </div>
          <button onclick="window.closeAdminPanelModal()" class="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center text-white transition-colors">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <!-- Navigation Tabs -->
        <div class="bg-slate-100 px-6 pt-2 border-b border-slate-200 flex gap-2">
          <button id="adminTabBtnDrugs" onclick="window.switchAdminTab('drugs')" 
            class="px-4 py-2.5 font-bold text-xs sm:text-sm rounded-t-xl border-t border-x border-slate-200 bg-white text-rose-800 flex items-center gap-1.5 transition-all">
            <i data-lucide="pill" class="w-4 h-4 text-rose-600"></i>
            <span>Quản Lý Danh Mục Thuốc</span>
            <span id="adminDrugCountBadge" class="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-800 font-black">
              ${allDrugs.length}
            </span>
          </button>
          <button id="adminTabBtnOverview" onclick="window.switchAdminTab('overview')" 
            class="px-4 py-2.5 font-bold text-xs sm:text-sm rounded-t-xl text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-all">
            <i data-lucide="users" class="w-4 h-4 text-slate-500"></i>
            <span>Tài Khoản & Thống Kê</span>
          </button>
        </div>

        <!-- Body Content -->
        <div class="p-6 overflow-y-auto flex-1 space-y-6">

          <!-- TAB 1: QUẢN LÝ DANH MỤC THUỐC -->
          <div id="adminTabContentDrugs" class="space-y-4">
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-rose-50/50 p-4 rounded-xl border border-rose-200/80">
              <div class="relative flex-1">
                <i data-lucide="search" class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input id="adminDrugSearchInput" type="text" placeholder="Tìm kiếm thuốc theo Tên, INN, Mã ATC..." 
                  oninput="window.filterAdminDrugs(this.value)"
                  class="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white">
              </div>
              <div class="flex items-center gap-2">
                <button onclick="window.openAddDrugModal()" 
                  class="inline-flex items-center gap-1.5 bg-rose-700 hover:bg-rose-800 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-colors shrink-0">
                  <i data-lucide="plus-circle" class="w-4 h-4"></i>
                  <span>Thêm Thuốc Mới</span>
                </button>
                <button onclick="window.handleResetDrugs()" 
                  title="Khôi phục danh mục về dữ liệu gốc ban đầu"
                  class="inline-flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-3 py-2 rounded-xl text-xs font-bold transition-colors shrink-0">
                  <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
                  <span>Khôi Phục Gốc</span>
                </button>
              </div>
            </div>

            <!-- Bảng danh mục thuốc -->
            <div class="overflow-x-auto border border-slate-200 rounded-xl max-h-[50vh]">
              <table class="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead class="bg-slate-50 font-bold text-slate-700 sticky top-0 z-10">
                  <tr>
                    <th class="px-4 py-3">Tên thuốc & Hoạt chất INN</th>
                    <th class="px-3 py-3">Nhóm / Mã ATC</th>
                    <th class="px-3 py-3">Dạng bào chế</th>
                    <th class="px-3 py-3">Tài liệu PDF (Phần 7)</th>
                    <th class="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody id="adminDrugTableBody" class="divide-y divide-slate-100 bg-white">
                  <!-- Rendered dynamically -->
                </tbody>
              </table>
            </div>
          </div>

          <!-- TAB 2: TỔNG QUAN & TÀI KHOẢN -->
          <div id="adminTabContentOverview" class="hidden space-y-6">
            <!-- Thống kê hệ thống -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span class="text-[11px] text-slate-400 font-bold uppercase">Tổng Chuyên Luận</span>
                <div class="text-xl font-black text-rose-700 mt-1">${allDrugs.length} Thuốc</div>
              </div>
              <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span class="text-[11px] text-slate-400 font-bold uppercase">Tài khoản Cán bộ</span>
                <div class="text-xl font-black text-teal-700 mt-1">${DEFAULT_ACCOUNTS.length} Tài khoản</div>
              </div>
              <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span class="text-[11px] text-slate-400 font-bold uppercase">Hội chẩn EBM</span>
                <div class="text-xl font-black text-blue-700 mt-1">Đang hoạt động</div>
              </div>
              <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span class="text-[11px] text-slate-400 font-bold uppercase">Dược cảnh giác ADR</span>
                <div class="text-xl font-black text-purple-700 mt-1">Thang Naranjo 10đ</div>
              </div>
            </div>

            <!-- Bảng tài khoản -->
            <div class="overflow-x-auto border border-slate-200 rounded-xl">
              <table class="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead class="bg-slate-50 font-bold text-slate-700">
                  <tr>
                    <th class="px-4 py-2.5">Họ và tên</th>
                    <th class="px-4 py-2.5">Email nội bộ</th>
                    <th class="px-4 py-2.5">Khoa / Phòng công tác</th>
                    <th class="px-4 py-2.5">Cấp bậc quyền</th>
                    <th class="px-4 py-2.5 text-right">Trạng thái</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 bg-white">
                  ${DEFAULT_ACCOUNTS.map(acc => `
                    <tr>
                      <td class="px-4 py-3 font-bold text-slate-900 flex items-center gap-2">
                        <div class="w-6 h-6 rounded-md ${acc.role === 'admin' ? 'bg-rose-600' : 'bg-teal-600'} text-white text-[10px] font-bold flex items-center justify-center">
                          ${acc.avatar}
                        </div>
                        <span>${acc.fullName}</span>
                      </td>
                      <td class="px-4 py-3 text-slate-600 font-mono">${acc.email}</td>
                      <td class="px-4 py-3 text-slate-600">${acc.department}</td>
                      <td class="px-4 py-3">
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold border ${acc.roleBadgeClass}">
                          ${acc.roleLabel}
                        </span>
                      </td>
                      <td class="px-4 py-3 text-right">
                        <span class="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Hoạt động
                        </span>
                      </td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        <!-- Footer Admin Panel -->
        <div class="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span class="text-slate-500">Đăng nhập với tư cách: <strong>${currentUser.fullName}</strong></span>
          <button onclick="window.closeAdminPanelModal()" class="bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-1.5 rounded-xl font-bold transition-colors">
            Đóng
          </button>
        </div>

      </div>
    </div>
  `;

  renderAdminDrugTable();
  if (window.lucide) window.lucide.createIcons();
}

export function closeAdminPanelModal() {
  const container = document.getElementById("adminPanelModalContainer");
  if (container) container.innerHTML = "";
}

export function switchAdminTab(tabName) {
  currentAdminTab = tabName;
  const btnDrugs = document.getElementById("adminTabBtnDrugs");
  const btnOverview = document.getElementById("adminTabBtnOverview");
  const contentDrugs = document.getElementById("adminTabContentDrugs");
  const contentOverview = document.getElementById("adminTabContentOverview");

  if (tabName === "drugs") {
    btnDrugs.className = "px-4 py-2.5 font-bold text-xs sm:text-sm rounded-t-xl border-t border-x border-slate-200 bg-white text-rose-800 flex items-center gap-1.5 transition-all";
    btnOverview.className = "px-4 py-2.5 font-bold text-xs sm:text-sm rounded-t-xl text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-all";
    contentDrugs.classList.remove("hidden");
    contentOverview.classList.add("hidden");
  } else {
    btnOverview.className = "px-4 py-2.5 font-bold text-xs sm:text-sm rounded-t-xl border-t border-x border-slate-200 bg-white text-rose-800 flex items-center gap-1.5 transition-all";
    btnDrugs.className = "px-4 py-2.5 font-bold text-xs sm:text-sm rounded-t-xl text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-all";
    contentOverview.classList.remove("hidden");
    contentDrugs.classList.add("hidden");
  }
  if (window.lucide) window.lucide.createIcons();
}

export function filterAdminDrugs(query) {
  currentAdminDrugSearch = (query || "").trim().toLowerCase();
  renderAdminDrugTable();
}

function renderAdminDrugTable() {
  const tbody = document.getElementById("adminDrugTableBody");
  if (!tbody) return;

  const allDrugs = getActiveDrugsDatabase();
  const filtered = allDrugs.filter(d => {
    if (!currentAdminDrugSearch) return true;
    const target = `${d.name} ${d.inn} ${d.atcCode} ${d.category} ${(d.brandNames || []).join(" ")}`.toLowerCase();
    return target.includes(currentAdminDrugSearch);
  });

  filtered.sort((a, b) => {
    const nameA = (a.name || a.inn || "").trim();
    const nameB = (b.name || b.inn || "").trim();
    return nameA.localeCompare(nameB, "vi", { sensitivity: "base" });
  });

  const countBadge = document.getElementById("adminDrugCountBadge");
  if (countBadge) countBadge.textContent = allDrugs.length;

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="py-8 text-center text-slate-400">
          Không tìm thấy thuốc nào khớp với từ khóa "${currentAdminDrugSearch}".
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(drug => `
    <tr class="hover:bg-slate-50 transition-colors">
      <td class="px-4 py-3">
        <div class="font-bold text-slate-900 text-xs">${drug.name}</div>
        <div class="text-[11px] text-slate-500 italic">${drug.inn || 'Chưa cập nhật INN'}</div>
        ${drug.brandNames && drug.brandNames.length ? `
          <div class="text-[10px] text-teal-700 mt-0.5">Biệt dược: ${drug.brandNames.slice(0, 3).join(", ")}</div>
        ` : ''}
      </td>
      <td class="px-3 py-3 whitespace-nowrap">
        <span class="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-mono font-bold text-[11px] border border-slate-200">
          ${drug.atcCode || drug.atcGroup || 'N/A'}
        </span>
        <div class="text-[10px] text-slate-400 mt-0.5">Nhóm ${drug.atcGroup || 'Chung'}</div>
      </td>
      <td class="px-3 py-3 text-slate-600 text-[11px] max-w-[150px] truncate" title="${drug.dosageForm || ''}">
        ${drug.dosageForm || 'N/A'}
      </td>
      <td class="px-3 py-3 text-slate-600 text-[11px] whitespace-nowrap">
        ${drug.attachments && drug.attachments.length > 0 ? `
          <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
            <i data-lucide="file-text" class="w-3 h-3 text-rose-600"></i>
            <span>${drug.attachments.length} PDF</span>
          </span>
        ` : `
          <span class="text-slate-400 text-[11px] italic">Chưa có PDF</span>
        `}
      </td>
      <td class="px-4 py-3 text-right whitespace-nowrap">
        <div class="inline-flex items-center gap-1.5">
          <button onclick="window.openQuickPdfModal('${drug.id}')" 
            title="Quản lý và đính kèm tài liệu PDF nhanh cho thuốc này"
            class="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[11px] transition-colors flex items-center gap-1 cursor-pointer shadow-xs">
            <i data-lucide="file-text" class="w-3 h-3"></i> Đính kèm PDF
          </button>
          <button onclick="window.openEditDrugModal('${drug.id}')" 
            class="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg font-bold text-[11px] transition-colors flex items-center gap-1 cursor-pointer">
            <i data-lucide="edit-3" class="w-3 h-3"></i> Sửa
          </button>
          <button onclick="window.handleDeleteDrug('${drug.id}')" 
            class="px-2.5 py-1 bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 rounded-lg font-bold text-[11px] transition-colors flex items-center gap-1 cursor-pointer">
            <i data-lucide="trash-2" class="w-3 h-3"></i> Xóa
          </button>
        </div>
      </td>
    </tr>
  `).join("");

  if (window.lucide) window.lucide.createIcons();
}

// ============================================================================
// MODAL THÊM / SỬA CHUYÊN LUẬN THUỐC (FORM POPUP)
// ============================================================================
let currentFormAttachments = [];

export function openAddDrugModal() {
  currentFormAttachments = [];
  renderDrugFormModal(null);
  renderFormAttachmentsList();
}

export function openEditDrugModal(drugId) {
  const allDrugs = getActiveDrugsDatabase();
  const drug = allDrugs.find(d => d.id === drugId);
  if (!drug) {
    alert("Không tìm thấy thuốc có ID: " + drugId);
    return;
  }
  currentFormAttachments = drug.attachments && Array.isArray(drug.attachments) ? JSON.parse(JSON.stringify(drug.attachments)) : [];
  renderDrugFormModal(drug);
  renderFormAttachmentsList();
}

function renderDrugFormModal(drug) {
  let modalContainer = document.getElementById("adminDrugFormModalContainer");
  if (!modalContainer) {
    modalContainer = document.createElement("div");
    modalContainer.id = "adminDrugFormModalContainer";
    document.body.appendChild(modalContainer);
  }

  const isEdit = !!drug;
  const titleText = isEdit ? `Chỉnh sửa chuyên luận: ${drug.name}` : "Thêm chuyên luận thuốc mới";

  const defaultIndications = drug && Array.isArray(drug.indications) ? drug.indications.join("\n") : "";
  const defaultContraindications = drug && Array.isArray(drug.contraindications) ? drug.contraindications.join("\n") : "";
  const defaultBrandNames = drug && Array.isArray(drug.brandNames) ? drug.brandNames.join(", ") : "";

  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-[60] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 flex flex-col max-h-[94vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <!-- Header -->
        <div class="px-6 py-4 bg-gradient-to-r from-rose-800 to-rose-700 text-white flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <i data-lucide="${isEdit ? 'edit-3' : 'plus-circle'}" class="w-4 h-4 text-rose-200"></i>
            </div>
            <div>
              <h4 class="font-bold text-sm sm:text-base">${titleText}</h4>
              <p class="text-[11px] text-rose-200">Cơ sở dữ liệu Dược thư Quốc gia Việt Nam 2022 · Khoa Dược BVĐK tỉnh Hưng Yên</p>
            </div>
          </div>
          <button onclick="window.closeDrugFormModal()" class="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center text-white transition-colors">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <form onsubmit="window.handleSaveDrugForm(event)" class="p-6 overflow-y-auto space-y-5 text-xs">
          <input type="hidden" id="formDrugId" value="${drug ? drug.id : ''}">
          
          <!-- THANH ĐIỀU HƯỚNG NHANH & NÚT TỚI PHẦN 7 -->
          <div class="sticky top-0 z-20 -mx-6 -mt-6 px-6 py-2.5 bg-gradient-to-r from-slate-900 via-slate-800 to-rose-950 text-white border-b border-slate-700 flex items-center justify-between gap-2 flex-wrap shadow-md">
            <div class="flex items-center gap-1.5 overflow-x-auto text-[11px] font-bold">
              <span class="text-rose-300 mr-1 flex items-center gap-1 shrink-0">
                <i data-lucide="layers" class="w-3.5 h-3.5"></i>
                Phần:
              </span>
              <button type="button" onclick="document.getElementById('formSection1').scrollIntoView({behavior:'smooth'})" class="px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-colors cursor-pointer shrink-0">1. Định danh</button>
              <button type="button" onclick="document.getElementById('formSection2').scrollIntoView({behavior:'smooth'})" class="px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-colors cursor-pointer shrink-0">2. Liều dùng</button>
              <button type="button" onclick="document.getElementById('formSection3').scrollIntoView({behavior:'smooth'})" class="px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-colors cursor-pointer shrink-0">3. Chỉ định</button>
              <button type="button" onclick="document.getElementById('formSection4').scrollIntoView({behavior:'smooth'})" class="px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-colors cursor-pointer shrink-0">4. Thận/Gan</button>
              <button type="button" onclick="document.getElementById('formSection5').scrollIntoView({behavior:'smooth'})" class="px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-colors cursor-pointer shrink-0">5. ADR</button>
              <button type="button" onclick="document.getElementById('formSection6').scrollIntoView({behavior:'smooth'})" class="px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-colors cursor-pointer shrink-0">6. Dược LS</button>
            </div>
            <button type="button" onclick="document.getElementById('formSection7').scrollIntoView({behavior:'smooth', block:'start'})" 
              class="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black text-xs flex items-center gap-1.5 shadow-lg transition-all cursor-pointer shrink-0">
              <i data-lucide="file-text" class="w-4 h-4"></i>
              <span>👉 ĐẾN PHẦN 7: TÀI LIỆU CHUYÊN MÔN (PDF)</span>
              <span id="navPdfCountBadge" class="ml-1 px-1.5 py-0.2 bg-white text-rose-700 text-[10px] font-black rounded-full">${currentFormAttachments.length}</span>
            </button>
          </div>

          <!-- PHẦN 1: THÔNG TIN CƠ BẢN -->
          <div id="formSection1" class="space-y-3">
            <!-- BANNER ĐÍNH KÈM FILE PDF PHẦN 7 NGAY ĐẦU FORM -->
            <div class="p-3.5 bg-gradient-to-r from-rose-50 to-amber-50 border-2 border-rose-300 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <i data-lucide="file-text" class="w-5 h-5"></i>
                </div>
                <div>
                  <div class="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <span>ĐÍNH KÈM TÀI LIỆU CHUYÊN MÔN (FILE PDF) - PHẦN 7</span>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white">${currentFormAttachments.length} file</span>
                  </div>
                  <div class="text-[11px] text-slate-600">Bạn có thể bấm nút bên phải để nhảy ngay xuống <strong>Phần 7</strong> tải lên file PDF hoặc dán link online.</div>
                </div>
              </div>
              <button type="button" onclick="document.getElementById('formSection7')?.scrollIntoView({behavior:'smooth', block:'start'})" class="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shrink-0 cursor-pointer shadow-md flex items-center gap-1.5 transition-all">
                <span>📎 Đến Phần 7 Tải PDF</span>
                <i data-lucide="arrow-down" class="w-3.5 h-3.5"></i>
              </button>
            </div>

            <div class="font-bold text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <i data-lucide="info" class="w-3.5 h-3.5 text-rose-600"></i>
              <span>1. Thông tin chung & Định danh</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="font-bold text-slate-700 block mb-1">Tên thuốc (Name) <span class="text-rose-600">*</span>:</label>
                <input id="formDrugName" type="text" required value="${drug ? drug.name : ''}" placeholder="VD: Meropenem" class="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500">
              </div>
              <div>
                <label class="font-bold text-slate-700 block mb-1">Tên hoạt chất (INN) <span class="text-rose-600">*</span>:</label>
                <input id="formDrugInn" type="text" required value="${drug ? drug.inn : ''}" placeholder="VD: Meropenem trihydrate" class="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500">
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="font-bold text-slate-700 block mb-1">Nhóm ATC <span class="text-rose-600">*</span>:</label>
                <select id="formDrugAtcGroup" class="w-full p-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-rose-500">
                  ${ATC_CATEGORIES.filter(c => c.code !== 'all').map(c => `
                    <option value="${c.code}" ${drug && drug.atcGroup === c.code ? 'selected' : ''}>${c.code} - ${c.name.split(' - ')[1] || c.name}</option>
                  `).join("")}
                </select>
              </div>
              <div>
                <label class="font-bold text-slate-700 block mb-1">Mã ATC cụ thể:</label>
                <input id="formDrugAtcCode" type="text" value="${drug ? drug.atcCode : ''}" placeholder="VD: J01DH02" class="w-full p-2.5 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-rose-500">
              </div>
              <div>
                <label class="font-bold text-slate-700 block mb-1">Phân loại dược lý:</label>
                <input id="formDrugCategory" type="text" value="${drug ? drug.category : ''}" placeholder="VD: Kháng sinh Carbapenem" class="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500">
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="font-bold text-slate-700 block mb-1">Biệt dược thường gặp (ngăn cách bởi dấu phẩy):</label>
                <input id="formDrugBrands" type="text" value="${defaultBrandNames}" placeholder="VD: Meronem, Mepem, Penro" class="w-full p-2.5 border border-slate-300 rounded-xl">
              </div>
              <div>
                <label class="font-bold text-slate-700 block mb-1">Dạng bào chế & hàm lượng:</label>
                <input id="formDrugDosageForm" type="text" value="${drug ? drug.dosageForm : ''}" placeholder="VD: Lọ bột pha tiêm 500mg, 1g" class="w-full p-2.5 border border-slate-300 rounded-xl">
              </div>
            </div>
          </div>

          <!-- PHẦN 2: CHẾ ĐỘ LIỀU DÙNG -->
          <div id="formSection2" class="space-y-3 pt-2">
            <div class="font-bold text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <i data-lucide="pill" class="w-3.5 h-3.5 text-blue-600"></i>
              <span>2. Chế độ liều dùng chuẩn</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="font-bold text-slate-700 block mb-1">Liều người lớn:</label>
                <textarea id="formDrugAdultDose" rows="2" placeholder="VD: 500mg - 1g mỗi 8 giờ tiêm truyền..." class="w-full p-2.5 border border-slate-300 rounded-xl">${drug && drug.standardDosage ? drug.standardDosage.adult : ''}</textarea>
              </div>
              <div>
                <label class="font-bold text-slate-700 block mb-1">Liều trẻ em:</label>
                <textarea id="formDrugPediatricDose" rows="2" placeholder="VD: 10 - 20mg/kg mỗi 8 giờ..." class="w-full p-2.5 border border-slate-300 rounded-xl">${drug && drug.standardDosage ? (drug.standardDosage.pediatric || '') : ''}</textarea>
              </div>
              <div>
                <label class="font-bold text-slate-700 block mb-1">Liều người cao tuổi:</label>
                <textarea id="formDrugElderlyDose" rows="2" placeholder="VD: Cân nhắc chỉnh theo CrCl..." class="w-full p-2.5 border border-slate-300 rounded-xl">${drug && drug.standardDosage ? (drug.standardDosage.elderly || '') : ''}</textarea>
              </div>
            </div>
          </div>

          <!-- PHẦN 3: CHỈ ĐỊNH & CHỐNG CHỈ ĐỊNH -->
          <div id="formSection3" class="space-y-3 pt-2">
            <div class="font-bold text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <i data-lucide="clipboard-check" class="w-3.5 h-3.5 text-teal-600"></i>
              <span>3. Chỉ định & Chống chỉ định lâm sàng</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="font-bold text-slate-700 block mb-1">Chỉ định (mỗi dòng một chỉ định):</label>
                <textarea id="formDrugIndications" rows="3" class="w-full p-2.5 border border-slate-300 rounded-xl" placeholder="Viêm phổi nặng...&#10;Nhiễm khuẩn ổ bụng...">${defaultIndications}</textarea>
              </div>
              <div>
                <label class="font-bold text-slate-700 block mb-1">Chống chỉ định (mỗi dòng một ý):</label>
                <textarea id="formDrugContraindications" rows="3" class="w-full p-2.5 border border-slate-300 rounded-xl" placeholder="Quá mẫn với thuốc...">${defaultContraindications}</textarea>
              </div>
            </div>
          </div>

          <!-- PHẦN 4: HIỆU CHỈNH LIỀU SUY THẬN & SUY GAN -->
          <div id="formSection4" class="space-y-3 pt-2">
            <div class="font-bold text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <i data-lucide="activity" class="w-3.5 h-3.5 text-amber-600"></i>
              <span>4. Hiệu chỉnh liều theo chức năng gan, thận</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="font-bold text-slate-700 block mb-1">Hiệu chỉnh liều suy thận (Định dạng: Mức CrCl: Khuyến cáo liều):</label>
                <textarea id="formDrugRenal" rows="3" class="w-full p-2.5 border border-slate-300 rounded-xl font-mono text-[11px]" placeholder="CrCl 26-50 ml/phút: 1g mỗi 12 giờ&#10;CrCl 10-25 ml/phút: 500mg mỗi 12 giờ&#10;CrCl < 10 ml/phút: 500mg mỗi 24 giờ">${drug && Array.isArray(drug.renalAdjustment) ? drug.renalAdjustment.map(r => `${r.crcl}: ${r.dose}`).join("\n") : (drug ? (drug.renalAdjustment || '') : '')}</textarea>
              </div>
              <div>
                <label class="font-bold text-slate-700 block mb-1">Hiệu chỉnh liều suy gan:</label>
                <textarea id="formDrugHepatic" rows="3" class="w-full p-2.5 border border-slate-300 rounded-xl" placeholder="Không cần hiệu chỉnh liều ở bệnh nhân suy giảm chức năng gan...">${drug ? (drug.hepaticAdjustment || '') : ''}</textarea>
              </div>
            </div>
          </div>

          <!-- PHẦN 5: AN TOÀN, THAI KỲ & ADR -->
          <div id="formSection5" class="space-y-3 pt-2">
            <div class="font-bold text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <i data-lucide="shield-alert" class="w-3.5 h-3.5 text-rose-600"></i>
              <span>5. An toàn sử dụng, Thai kỳ & Phản ứng có hại (ADR)</span>
            </div>

            <div>
              <label class="font-bold text-rose-800 block mb-1 flex items-center gap-1">
                <i data-lucide="alert-triangle" class="w-3.5 h-3.5 text-rose-600"></i>
                Cảnh báo Hộp đen (Black Box Warning) - nếu có:
              </label>
              <input id="formDrugBlackBox" type="text" value="${drug ? (drug.blackBoxWarning || '') : ''}" placeholder="VD: Nguy cơ sốc phản vệ, kéo dài khoảng QT..." class="w-full p-2.5 border border-rose-300 bg-rose-50/40 rounded-xl text-rose-900 font-medium">
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="font-bold text-slate-700 block mb-1">Phân loại thai kỳ (FDA):</label>
                <select id="formDrugPregnancy" class="w-full p-2.5 border border-slate-300 rounded-xl bg-white">
                  ${["A", "B", "C", "D", "X", "N/A"].map(cat => `
                    <option value="${cat}" ${drug && drug.pregnancyCategory === cat ? 'selected' : (cat === 'C' && !drug ? 'selected' : '')}>Nhóm ${cat}</option>
                  `).join("")}
                </select>
              </div>
              <div>
                <label class="font-bold text-slate-700 block mb-1">Thời kỳ cho con bú:</label>
                <input id="formDrugLactation" type="text" value="${drug ? (drug.lactation || '') : 'Thận trọng, theo dõi sát trẻ'}" placeholder="VD: Bài tiết vào sữa mẹ, cần thận trọng" class="w-full p-2.5 border border-slate-300 rounded-xl">
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="font-bold text-slate-700 block mb-1">Tác dụng phụ thường gặp (ADR Common):</label>
                <textarea id="formDrugAdrCommon" rows="2" class="w-full p-2.5 border border-slate-300 rounded-xl" placeholder="Rối loạn tiêu hóa nhẹ, buồn nôn, tiêu chảy...">${drug && drug.adr ? (drug.adr.common || '') : ''}</textarea>
              </div>
              <div>
                <label class="font-bold text-slate-700 block mb-1">Tác dụng phụ nghiêm trọng (ADR Serious):</label>
                <textarea id="formDrugAdrSerious" rows="2" class="w-full p-2.5 border border-slate-300 rounded-xl" placeholder="Sốc phản vệ, co giật, hội chứng Stevens-Johnson...">${drug && drug.adr ? (drug.adr.serious || '') : ''}</textarea>
              </div>
            </div>
          </div>

          <!-- PHẦN 6: CÁCH DÙNG & LƯU Ý LÂM SÀNG -->
          <div id="formSection6" class="space-y-3 pt-2">
            <div class="font-bold text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <i data-lucide="sparkles" class="w-3.5 h-3.5 text-indigo-600"></i>
              <span>6. Hướng dẫn pha truyền & Lưu ý Dược lâm sàng (Clinical Pearls)</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="font-bold text-slate-700 block mb-1">Hướng dẫn pha truyền & đường dùng:</label>
                <textarea id="formDrugAdministration" rows="3" class="w-full p-2.5 border border-slate-300 rounded-xl" placeholder="Pha với NaCl 0.9% hoặc Glucose 5%, truyền tĩnh mạch chậm trong 30-60 phút...">${drug ? (drug.administration || '') : ''}</textarea>
              </div>
              <div>
                <label class="font-bold text-slate-700 block mb-1">Lưu ý Dược lâm sàng chuyên sâu (Clinical Pearls):</label>
                <textarea id="formDrugClinicalPearls" rows="3" class="w-full p-2.5 border border-slate-300 rounded-xl" placeholder="Kéo dài thời gian truyền (truyền 3 giờ) giúp tối ưu hóa %T>MIC đối với vi khuẩn Gram âm đa kháng...">${drug ? (drug.clinicalPearls || '') : ''}</textarea>
              </div>
            </div>
          </div>

          <!-- PHẦN 7: TÀI LIỆU CHUYÊN MÔN ĐÍNH KÈM (PDF) -->
          <div id="formSection7" class="space-y-3 pt-3 p-4 bg-rose-50/40 border-2 border-rose-300 rounded-2xl">
            <div class="font-black text-slate-900 border-b border-rose-200 pb-2 flex items-center justify-between text-xs uppercase tracking-wider">
              <div class="flex items-center gap-2 text-rose-800">
                <i data-lucide="file-text" class="w-4 h-4 text-rose-600"></i>
                <span class="text-xs sm:text-sm font-black">7. TÀI LIỆU CHUYÊN MÔN ĐÍNH KÈM (FILE PDF)</span>
              </div>
              <span id="formPdfCountBadge" class="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-600 text-white shadow-xs">
                ${currentFormAttachments.length} tài liệu
              </span>
            </div>
            <p class="text-[11px] text-slate-600 font-medium leading-relaxed">
              Tải lên tài liệu PDF (Tờ hướng dẫn sử dụng Bộ Y tế, Phác đồ điều trị, Tờ thông tin sản phẩm SPC) để bác sĩ và dược sĩ đọc trực tiếp hoặc tải về.
            </p>

            <!-- Drag-and-drop & Upload box -->
            <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div class="md:col-span-7">
                <div onclick="document.getElementById('formDrugPdfFileInput').click()" 
                  class="border-2 border-dashed border-rose-200 hover:border-rose-400 bg-rose-50/30 hover:bg-rose-50/60 rounded-2xl p-4 text-center transition-all cursor-pointer group">
                  <input type="file" id="formDrugPdfFileInput" accept="application/pdf" class="hidden" onchange="window.handlePdfFileUpload(event)">
                  <div class="w-10 h-10 rounded-xl bg-rose-100 group-hover:scale-110 text-rose-700 flex items-center justify-center mx-auto mb-2 transition-transform shadow-2xs">
                    <i data-lucide="upload-cloud" class="w-5 h-5"></i>
                  </div>
                  <p class="font-bold text-slate-800 text-xs group-hover:text-rose-700 transition-colors">Tải lên file PDF từ máy tính</p>
                  <p class="text-[11px] text-slate-500 mt-0.5">Bấm để chọn file .pdf (Tờ rơi, Hướng dẫn sử dụng, Chuyên luận gốc...)</p>
                </div>
              </div>

              <!-- Gắn link PDF online -->
              <div class="md:col-span-5 flex flex-col justify-between space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <span class="font-bold text-slate-700 text-[11px] block">Hoặc gắn liên kết PDF trực tuyến:</span>
                <input type="url" id="formDrugPdfUrlInput" placeholder="https://example.com/tai-lieu.pdf" class="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white">
                <input type="text" id="formDrugPdfUrlTitleInput" placeholder="Tên hiển thị của tài liệu..." class="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white">
                <button type="button" onclick="window.handleAddPdfUrl()" class="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs">
                  <i data-lucide="plus-circle" class="w-3.5 h-3.5"></i>
                  <span>Thêm liên kết PDF</span>
                </button>
              </div>
            </div>

            <!-- Danh sách file PDF đã đính kèm -->
            <div id="formDrugAttachmentsListContainer" class="mt-2 space-y-2">
              <!-- Rendered by renderFormAttachmentsList() -->
            </div>
          </div>

          <!-- Submit Buttons -->
          <div class="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button type="button" onclick="window.closeDrugFormModal()" class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer">
              Hủy
            </button>
            <button type="submit" class="px-6 py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer">
              <i data-lucide="save" class="w-4 h-4"></i>
              <span>${isEdit ? 'Cập Nhật Chuyên Luận' : 'Lưu Chuyên Luận Mới'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  `;

  renderFormAttachmentsList();
  if (window.lucide) window.lucide.createIcons();
}

export function closeDrugFormModal() {
  const container = document.getElementById("adminDrugFormModalContainer");
  if (container) container.innerHTML = "";
}

export function handlePdfFileUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    alert("Vui lòng chỉ tải lên file định dạng PDF (.pdf)!");
    event.target.value = "";
    return;
  }

  // Giới hạn 30MB
  if (file.size > 30 * 1024 * 1024) {
    alert("Dung lượng file PDF vượt quá 30MB! Vui lòng nén file hoặc chọn tài liệu có dung lượng nhỏ hơn.");
    event.target.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    const attId = "pdf_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6);
    const newAtt = {
      id: attId,
      drugId: document.getElementById("formDrugId")?.value || "",
      title: file.name.replace(/\.pdf$/i, "").replace(/[-_]/g, " "),
      fileName: file.name,
      fileSize: file.size,
      fileType: "application/pdf",
      dataUrl: dataUrl,
      uploadedAt: new Date().toISOString()
    };

    currentFormAttachments.push(newAtt);
    renderFormAttachmentsList();
    showToast(`Đã đính kèm file: ${file.name} (${formatFileSize(file.size)})`, "success");
    event.target.value = "";
  };

  reader.onerror = function() {
    alert("Lỗi khi đọc file từ máy tính!");
    event.target.value = "";
  };

  reader.readAsDataURL(file);
}

export function handleAddPdfUrl() {
  const urlInput = document.getElementById("formDrugPdfUrlInput");
  const titleInput = document.getElementById("formDrugPdfUrlTitleInput");
  const url = urlInput ? urlInput.value.trim() : "";
  const title = titleInput ? titleInput.value.trim() : "";

  if (!url) {
    alert("Vui lòng nhập đường dẫn liên kết PDF!");
    return;
  }

  const attId = "pdf_url_" + Date.now();
  const fileName = url.split("/").pop().split("?")[0] || "document.pdf";
  const newAtt = {
    id: attId,
    drugId: document.getElementById("formDrugId")?.value || "",
    title: title || fileName.replace(/\.pdf$/i, ""),
    fileName: fileName.endsWith(".pdf") ? fileName : fileName + ".pdf",
    fileSize: 0,
    fileType: "application/pdf",
    fileUrl: url,
    uploadedAt: new Date().toISOString()
  };

  currentFormAttachments.push(newAtt);
  renderFormAttachmentsList();
  if (urlInput) urlInput.value = "";
  if (titleInput) titleInput.value = "";
  showToast("Đã thêm liên kết PDF!", "success");
}

export async function previewFormAttachment(index) {
  const att = currentFormAttachments[index];
  if (!att) return;

  const blobUrl = await getPdfBlobUrl(att);
  if (blobUrl) {
    window.open(blobUrl, "_blank");
  } else {
    alert("Không thể mở tài liệu xem trước!");
  }
}

export async function removeFormAttachment(index) {
  const att = currentFormAttachments[index];
  if (!att) return;
  if (confirm(`Bạn có chắc muốn gỡ bỏ file đính kèm "${att.title || att.fileName}"?`)) {
    if (att.id) {
      await deletePdfAttachmentById(att.id).catch(() => {});
    }
    currentFormAttachments.splice(index, 1);
    renderFormAttachmentsList();
    showToast("Đã gỡ bỏ file đính kèm.", "info");
  }
}

export function renderFormAttachmentsList() {
  const container = document.getElementById("formDrugAttachmentsListContainer");
  const countBadge = document.getElementById("formPdfCountBadge");
  const navBadge = document.getElementById("navPdfCountBadge");
  if (countBadge) countBadge.textContent = `${currentFormAttachments.length} tài liệu`;
  if (navBadge) navBadge.textContent = currentFormAttachments.length;
  if (!container) return;

  if (currentFormAttachments.length === 0) {
    container.innerHTML = `
      <div class="py-4 px-3 text-center bg-slate-50 rounded-xl border border-slate-200/80 text-slate-400">
        <i data-lucide="file-question" class="w-6 h-6 mx-auto mb-1 text-slate-300"></i>
        <p class="text-xs">Chưa có tài liệu PDF nào được đính kèm cho chuyên luận này</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  container.innerHTML = currentFormAttachments.map((att, idx) => `
    <div class="flex items-center justify-between p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors text-xs gap-3">
      <div class="flex items-center gap-2.5 min-w-0">
        <div class="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
          <i data-lucide="file-text" class="w-4 h-4"></i>
        </div>
        <div class="min-w-0">
          <p class="font-bold text-slate-800 truncate">${att.title || att.fileName}</p>
          <div class="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
            <span class="font-mono">${att.fileName}</span>
            <span>·</span>
            <span>${att.fileSize ? formatFileSize(att.fileSize) : 'Liên kết ngoài'}</span>
            <span>·</span>
            <span>${new Date(att.uploadedAt).toLocaleDateString('vi-VN')}</span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-1.5 shrink-0">
        <button type="button" onclick="window.previewFormAttachment(${idx})" class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors flex items-center gap-1 cursor-pointer" title="Xem thử tài liệu">
          <i data-lucide="eye" class="w-3.5 h-3.5"></i>
          <span>Xem thử</span>
        </button>
        <button type="button" onclick="window.removeFormAttachment(${idx})" class="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold transition-colors flex items-center gap-1 cursor-pointer" title="Xóa đính kèm này">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          <span>Gỡ bỏ</span>
        </button>
      </div>
    </div>
  `).join("");

  if (window.lucide) window.lucide.createIcons();
}

// ============================================================================
// MODAL QUẢN LÝ TÀI LIỆU PDF TRỰC TIẾP (QUICK PDF MANAGER)
// Cho phép thêm, xem và gỡ bỏ file PDF của bất kỳ thuốc nào ngay lập tức
// ============================================================================
export function openQuickPdfModal(drugId) {
  const allDrugs = getActiveDrugsDatabase();
  const drug = allDrugs.find(d => d.id === drugId);
  if (!drug) {
    alert("Không tìm thấy thông tin thuốc: " + drugId);
    return;
  }

  let quickModal = document.getElementById("adminQuickPdfModalContainer");
  if (!quickModal) {
    quickModal = document.createElement("div");
    quickModal.id = "adminQuickPdfModalContainer";
    document.body.appendChild(quickModal);
  }

  let quickAttachments = drug.attachments && Array.isArray(drug.attachments) 
    ? JSON.parse(JSON.stringify(drug.attachments)) 
    : [];

  const updateQuickModal = () => {
    quickModal.innerHTML = `
      <div class="fixed inset-0 z-[70] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
        <div class="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          <!-- Header -->
          <div class="px-6 py-4 bg-gradient-to-r from-rose-800 via-rose-700 to-rose-900 text-white flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-white shadow-inner">
                <i data-lucide="file-text" class="w-5 h-5"></i>
              </div>
              <div>
                <h3 class="font-bold text-base flex items-center gap-2">
                  <span>Quản Lý File PDF Chuyên Luận</span>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/20">${quickAttachments.length} tài liệu</span>
                </h3>
                <p class="text-xs text-rose-200 font-medium">${drug.name} · Hoạt chất: ${drug.inn || drug.name}</p>
              </div>
            </div>
            <button onclick="window.closeQuickPdfModal()" class="w-8 h-8 rounded-xl hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 overflow-y-auto space-y-4 text-xs">
            <div class="bg-rose-50/80 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
              <div class="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                <i data-lucide="sparkles" class="w-4 h-4"></i>
              </div>
              <p class="text-[11px] text-rose-900 leading-relaxed">
                Tài liệu PDF đính kèm tại đây sẽ xuất hiện trực tiếp trong chuyên luận của <strong>${drug.name}</strong> để Bác sĩ và Dược sĩ lâm sàng có thể tra cứu và đọc toàn văn ngay trên hệ thống.
              </p>
            </div>

            <!-- Khu vực tải file & link URL -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <!-- Upload từ máy -->
              <div onclick="document.getElementById('quickPdfFileInput').click()" 
                class="border-2 border-dashed border-rose-300 hover:border-rose-500 bg-rose-50/40 hover:bg-rose-50/80 rounded-2xl p-4 text-center cursor-pointer transition-all group">
                <input type="file" id="quickPdfFileInput" accept="application/pdf" class="hidden">
                <div class="w-11 h-11 rounded-2xl bg-rose-100 group-hover:scale-110 text-rose-700 flex items-center justify-center mx-auto mb-2 transition-transform shadow-xs">
                  <i data-lucide="upload-cloud" class="w-5 h-5"></i>
                </div>
                <p class="font-bold text-slate-800 text-xs group-hover:text-rose-700">Tải file PDF từ máy tính</p>
                <p class="text-[11px] text-slate-500 mt-0.5">Hỗ trợ file .pdf (Tờ hướng dẫn sử dụng, phác đồ điều trị...)</p>
              </div>

              <!-- Dán link URL online -->
              <div class="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex flex-col justify-between space-y-2">
                <span class="font-bold text-slate-700 text-[11px]">Hoặc dán liên kết URL file PDF trực tuyến:</span>
                <input type="url" id="quickPdfUrlInput" placeholder="https://dav.gov.vn/...pdf" class="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-rose-500">
                <input type="text" id="quickPdfTitleInput" placeholder="Tên hiển thị của tài liệu..." class="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-rose-500">
                <button type="button" id="quickAddUrlBtn" class="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-xs">
                  <i data-lucide="plus-circle" class="w-3.5 h-3.5"></i>
                  <span>Thêm liên kết PDF</span>
                </button>
              </div>
            </div>

            <!-- Danh sách tài liệu hiện có -->
            <div class="pt-2">
              <div class="flex items-center justify-between mb-2">
                <span class="font-bold text-slate-800 text-xs">Danh sách file PDF đính kèm (${quickAttachments.length}):</span>
              </div>
              
              ${quickAttachments.length === 0 ? `
                <div class="py-8 text-center bg-slate-50 border border-slate-200 rounded-2xl text-slate-400">
                  <i data-lucide="file-question" class="w-8 h-8 mx-auto mb-1 text-slate-300"></i>
                  <p class="text-xs">Chưa có tài liệu PDF nào được đính kèm cho chuyên luận này</p>
                </div>
              ` : `
                <div class="space-y-2">
                  ${quickAttachments.map((att, idx) => `
                    <div class="flex items-center justify-between p-3 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl shadow-2xs gap-3 transition-colors">
                      <div class="flex items-center gap-2.5 overflow-hidden">
                        <div class="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                          <i data-lucide="file-text" class="w-4 h-4"></i>
                        </div>
                        <div class="overflow-hidden">
                          <p class="font-bold text-slate-800 truncate text-xs" title="${att.title || att.fileName}">${att.title || att.fileName}</p>
                          <div class="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                            <span class="font-mono text-slate-500">${att.fileName || 'tai-lieu.pdf'}</span>
                            <span>·</span>
                            <span>${typeof att.fileSize === 'number' ? formatFileSize(att.fileSize) : (att.fileSize || 'Trực tuyến')}</span>
                          </div>
                        </div>
                      </div>
                      <div class="flex items-center gap-1.5 shrink-0">
                        <button type="button" data-view-idx="${idx}" class="quick-view-btn px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors" title="Xem trước tài liệu">
                          <i data-lucide="eye" class="w-3.5 h-3.5"></i>
                          <span>Xem</span>
                        </button>
                        <button type="button" data-del-idx="${idx}" class="quick-del-btn px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors" title="Xóa tài liệu này">
                          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                          <span>Xóa</span>
                        </button>
                      </div>
                    </div>
                  `).join("")}
                </div>
              `}
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <button type="button" onclick="window.closeQuickPdfModal()" class="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold cursor-pointer transition-colors">
              Đóng
            </button>
            <button type="button" id="quickSavePdfBtn" class="px-6 py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl font-bold shadow-md flex items-center gap-2 cursor-pointer transition-all">
              <i data-lucide="save" class="w-4 h-4"></i>
              <span>💾 Lưu Danh Sách PDF</span>
            </button>
          </div>

        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Bắt sự kiện chọn file từ máy
    const fileInput = document.getElementById("quickPdfFileInput");
    if (fileInput) {
      fileInput.onchange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
          alert("Vui lòng chỉ chọn file định dạng PDF (.pdf)!");
          return;
        }
        if (file.size > 30 * 1024 * 1024) {
          alert("File quá lớn (> 30MB)!");
          return;
        }
        const reader = new FileReader();
        reader.onload = (re) => {
          const newAtt = {
            id: "pdf_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6),
            drugId: drug.id,
            title: file.name.replace(/\.pdf$/i, "").replace(/[-_]/g, " "),
            fileName: file.name,
            fileSize: file.size,
            fileType: "application/pdf",
            dataUrl: re.target.result,
            uploadedAt: new Date().toISOString()
          };
          quickAttachments.push(newAtt);
          updateQuickModal();
          showToast(`Đã thêm file: ${file.name}`, "success");
        };
        reader.readAsDataURL(file);
      };
    }

    // Bắt sự kiện thêm URL
    const addUrlBtn = document.getElementById("quickAddUrlBtn");
    if (addUrlBtn) {
      addUrlBtn.onclick = () => {
        const urlInput = document.getElementById("quickPdfUrlInput");
        const titleInput = document.getElementById("quickPdfTitleInput");
        const url = urlInput ? urlInput.value.trim() : "";
        const title = titleInput ? titleInput.value.trim() : "";
        if (!url) {
          alert("Vui lòng nhập đường dẫn URL của file PDF!");
          return;
        }
        const fileName = url.split("/").pop().split("?")[0] || "document.pdf";
        quickAttachments.push({
          id: "pdf_url_" + Date.now(),
          drugId: drug.id,
          title: title || fileName.replace(/\.pdf$/i, ""),
          fileName: fileName.endsWith(".pdf") ? fileName : fileName + ".pdf",
          fileSize: 0,
          fileType: "application/pdf",
          fileUrl: url,
          uploadedAt: new Date().toISOString()
        });
        updateQuickModal();
        showToast("Đã thêm liên kết PDF thành công!", "success");
      };
    }

    // Bắt sự kiện xem thử
    quickModal.querySelectorAll(".quick-view-btn").forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.getAttribute("data-view-idx"), 10);
        const att = quickAttachments[idx];
        if (!att) return;
        if (att.dataUrl) {
          const w = window.open("");
          w.document.write(`<iframe src="${att.dataUrl}" style="width:100%;height:100%;border:none;"></iframe>`);
        } else if (att.fileUrl) {
          window.open(att.fileUrl, "_blank");
        }
      };
    });

    // Bắt sự kiện xóa
    quickModal.querySelectorAll(".quick-del-btn").forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.getAttribute("data-del-idx"), 10);
        quickAttachments.splice(idx, 1);
        updateQuickModal();
      };
    });

    // Bắt sự kiện Lưu
    const saveBtn = document.getElementById("quickSavePdfBtn");
    if (saveBtn) {
      saveBtn.onclick = async () => {
        const attachmentsMeta = [];
        for (const att of quickAttachments) {
          if (att.dataUrl) {
            await savePdfAttachment({ ...att, drugId: drug.id });
          }
          attachmentsMeta.push({
            id: att.id,
            title: att.title || att.fileName,
            fileName: att.fileName,
            fileSize: att.fileSize || 0,
            fileType: att.fileType || "application/pdf",
            fileUrl: att.fileUrl || "",
            uploadedAt: att.uploadedAt || new Date().toISOString()
          });
        }
        drug.attachments = attachmentsMeta;
        const res = saveOrUpdateDrug(drug);
        if (res.success) {
          showToast(`Đã cập nhật ${attachmentsMeta.length} tài liệu PDF cho ${drug.name}!`, "success");
          window.closeQuickPdfModal();
          renderAdminDrugTable();
          if (window.renderDrugList) window.renderDrugList();
        } else {
          alert("Lỗi khi lưu PDF: " + res.error);
        }
      };
    }
  };

  updateQuickModal();
}

export function closeQuickPdfModal() {
  const container = document.getElementById("adminQuickPdfModalContainer");
  if (container) container.innerHTML = "";
}

export async function handleSaveDrugForm(event) {
  if (event) event.preventDefault();

  const idInput = document.getElementById("formDrugId");
  const nameInput = document.getElementById("formDrugName");
  const innInput = document.getElementById("formDrugInn");
  const atcGroupInput = document.getElementById("formDrugAtcGroup");
  const atcCodeInput = document.getElementById("formDrugAtcCode");
  const categoryInput = document.getElementById("formDrugCategory");
  const brandsInput = document.getElementById("formDrugBrands");
  const dosageFormInput = document.getElementById("formDrugDosageForm");

  const adultDoseInput = document.getElementById("formDrugAdultDose");
  const pedDoseInput = document.getElementById("formDrugPediatricDose");
  const eldDoseInput = document.getElementById("formDrugElderlyDose");

  const indicationsInput = document.getElementById("formDrugIndications");
  const contraindicationsInput = document.getElementById("formDrugContraindications");
  const renalInput = document.getElementById("formDrugRenal");
  const hepaticInput = document.getElementById("formDrugHepatic");
  const blackBoxInput = document.getElementById("formDrugBlackBox");

  const pregnancyInput = document.getElementById("formDrugPregnancy");
  const lactationInput = document.getElementById("formDrugLactation");
  const adrCommonInput = document.getElementById("formDrugAdrCommon");
  const adrSeriousInput = document.getElementById("formDrugAdrSerious");
  const adminInput = document.getElementById("formDrugAdministration");
  const pearlsInput = document.getElementById("formDrugClinicalPearls");

  const name = nameInput.value.trim();
  const inn = innInput.value.trim();
  let id = idInput ? idInput.value.trim() : "";

  if (!id) {
    // Tạo slug ID từ tên thuốc
    id = name.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");
    if (!id) id = "drug_" + Date.now();
  }

  // Tìm thuốc cũ nếu đang sửa để bảo lưu các thuộc tính mở rộng
  const allDrugs = getActiveDrugsDatabase();
  const existingDrug = allDrugs.find(d => d.id === id);

  const brandNames = brandsInput.value ? brandsInput.value.split(",").map(s => s.trim()).filter(Boolean) : [];
  const indications = indicationsInput.value ? indicationsInput.value.split("\n").map(s => s.trim()).filter(Boolean) : [];
  const contraindications = contraindicationsInput.value ? contraindicationsInput.value.split("\n").map(s => s.trim()).filter(Boolean) : [];

  // Parse renal lines
  let renalAdjustment = [];
  if (renalInput.value) {
    const lines = renalInput.value.split("\n").map(s => s.trim()).filter(Boolean);
    renalAdjustment = lines.map(line => {
      const parts = line.split(":");
      if (parts.length >= 2) {
        return { crcl: parts[0].trim(), dose: parts.slice(1).join(":").trim() };
      }
      return { crcl: "Tiêu chuẩn", dose: line };
    });
  }

  // Lưu các file PDF có dataUrl vào IndexedDB
  const attachmentsMeta = [];
  for (const att of currentFormAttachments) {
    if (att.dataUrl) {
      await savePdfAttachment({ ...att, drugId: id });
    }
    attachmentsMeta.push({
      id: att.id,
      title: att.title || att.fileName,
      fileName: att.fileName,
      fileSize: att.fileSize || 0,
      fileType: att.fileType || "application/pdf",
      fileUrl: att.fileUrl || "",
      uploadedAt: att.uploadedAt || new Date().toISOString()
    });
  }

  const drugData = {
    ...(existingDrug || {}),
    id,
    name,
    inn,
    atcGroup: atcGroupInput.value,
    atcCode: atcCodeInput.value.trim() || atcGroupInput.value,
    category: categoryInput.value.trim() || "Chuyên luận nội viện",
    brandNames: brandNames.length ? brandNames : (existingDrug?.brandNames || []),
    dosageForm: dosageFormInput.value.trim() || "Chưa cập nhật",
    indications: indications.length ? indications : ["Theo chỉ định của Bác sĩ điều trị"],
    contraindications: contraindications.length ? contraindications : ["Quá mẫn với thành phần của thuốc"],
    standardDosage: {
      adult: adultDoseInput.value.trim() || "Theo y lệnh",
      pediatric: (pedDoseInput && pedDoseInput.value.trim()) || (existingDrug?.standardDosage?.pediatric || "Theo cân nặng và hướng dẫn bác sĩ"),
      elderly: (eldDoseInput && eldDoseInput.value.trim()) || (existingDrug?.standardDosage?.elderly || "Đánh giá chức năng thận trước khi dùng")
    },
    renalAdjustment: renalAdjustment.length ? renalAdjustment : [{ crcl: "Bình thường", dose: "Không cần chỉnh liều" }],
    hepaticAdjustment: hepaticInput.value.trim() || "Theo dõi men gan",
    administration: (adminInput && adminInput.value.trim()) || (existingDrug?.administration || "Dùng đường toàn thân theo quy trình điều dưỡng chuẩn"),
    blackBoxWarning: blackBoxInput.value.trim() || "",
    adr: {
      common: (adrCommonInput && adrCommonInput.value.trim()) || (existingDrug?.adr?.common || "Rối loạn tiêu hóa nhẹ, buồn nôn"),
      serious: (adrSeriousInput && adrSeriousInput.value.trim()) || (existingDrug?.adr?.serious || "Sốc phản vệ, dị ứng nặng")
    },
    pregnancyCategory: (pregnancyInput && pregnancyInput.value) || (existingDrug?.pregnancyCategory || "C"),
    lactation: (lactationInput && lactationInput.value.trim()) || (existingDrug?.lactation || "Thận trọng"),
    tdmTarget: existingDrug?.tdmTarget || "Theo dõi lâm sàng",
    clinicalPearls: (pearlsInput && pearlsInput.value.trim()) || (existingDrug?.clinicalPearls || "Thuốc được cập nhật bởi Quản trị viên Khoa Dược BVĐK tỉnh Hưng Yên."),
    attachments: attachmentsMeta
  };

  const res = saveOrUpdateDrug(drugData);
  if (res.success) {
    const pdfCountText = attachmentsMeta.length > 0 ? ` cùng ${attachmentsMeta.length} tài liệu PDF` : "";
    showToast(`Đã lưu thành công chuyên luận: ${name}${pdfCountText}`, "success");
    closeDrugFormModal();
    renderAdminDrugTable();
    if (window.renderDrugList) window.renderDrugList(); // Cập nhật ngay ngoài giao diện Dược thư!
  } else {
    alert("Lỗi khi lưu thuốc: " + res.error);
  }
}

export function handleDeleteDrug(drugId) {
  const allDrugs = getActiveDrugsDatabase();
  const target = allDrugs.find(d => d.id === drugId);
  const name = target ? target.name : drugId;

  if (confirm(`Bạn có chắc chắn muốn xóa thuốc "${name}" khỏi danh mục Dược thư nội viện?`)) {
    const res = deleteDrugById(drugId);
    if (res.success) {
      if (target && Array.isArray(target.attachments)) {
        target.attachments.forEach(att => {
          deletePdfAttachmentById(att.id).catch(() => {});
        });
      }
      showToast(`Đã xóa thuốc: ${name}`, "info");
      renderAdminDrugTable();
      if (window.renderDrugList) window.renderDrugList();
    } else {
      alert("Lỗi khi xóa thuốc: " + res.error);
    }
  }
}

export function handleResetDrugs() {
  if (confirm("CẢNH BÁO: Thao tác này sẽ xóa tất cả các thay đổi tùy biến và khôi phục lại toàn bộ danh mục thuốc gốc ban đầu của Dược thư 2022. Tiếp tục?")) {
    resetCustomDrugsDatabase();
    showToast("Đã khôi phục danh mục thuốc gốc ban đầu!", "success");
    renderAdminDrugTable();
    if (window.renderDrugList) window.renderDrugList();
  }
}

export function openUserProfileModal() {
  if (!currentUser) return;
  alert(`THÔNG TIN CÁN BỘ Y TẾ:\n- Họ và tên: ${currentUser.fullName}\n- Email: ${currentUser.email}\n- Chức danh: ${currentUser.title}\n- Đơn vị: ${currentUser.department}\n- Quyền hệ thống: ${currentUser.roleLabel}`);
}

export function showRegisterTab() {
  alert("Chức năng đăng ký tài khoản cán bộ mới: Vui lòng liên hệ Tổ Dược Lâm Sàng - Khoa Dược (Máy lẻ: 406) để được cấp tài khoản theo phân quyền khoa phòng.");
}

function autofillUserContext() {
  if (!currentUser) return;

  const doctorNameInput = document.getElementById("senderNameInput");
  const departmentInput = document.getElementById("senderDeptInput");
  if (doctorNameInput && !doctorNameInput.value) {
    doctorNameInput.value = currentUser.fullName;
  }
  if (departmentInput && !departmentInput.value) {
    departmentInput.value = currentUser.department.split("·")[0].trim();
  }

  const adrReporterName = document.getElementById("reporterName");
  if (adrReporterName && !adrReporterName.value) {
    adrReporterName.value = `${currentUser.fullName} (${currentUser.title})`;
  }
}

export function showToast(message, type = "info") {
  let toastContainer = document.getElementById("toastContainer");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toastContainer";
    toastContainer.className = "fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none";
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  const bgClass = type === "success" ? "bg-emerald-800 text-white" : type === "error" ? "bg-rose-800 text-white" : "bg-slate-800 text-white";

  toast.className = `${bgClass} px-4 py-3 rounded-2xl shadow-xl text-xs sm:text-sm font-semibold flex items-center gap-2 pointer-events-auto animate-in slide-in-from-bottom-5 duration-200`;
  toast.innerHTML = `
    <i data-lucide="${type === 'success' ? 'check-circle' : 'info'}" class="w-4 h-4 shrink-0"></i>
    <span>${message}</span>
  `;

  toastContainer.appendChild(toast);
  if (window.lucide) window.lucide.createIcons();

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function setupGlobalWindowBindings() {
  window.openLoginModal = openLoginModal;
  window.closeLoginModal = closeLoginModal;
  window.fastLogin = fastLogin;
  window._moduleFastLogin = fastLogin;
  window.handleManualLogin = handleManualLogin;
  window._moduleHandleManualLogin = handleManualLogin;
  window.handleLogout = handleLogout;
  window.toggleUserDropdown = toggleUserDropdown;
  window.openAdminPanelModal = openAdminPanelModal;
  window.closeAdminPanelModal = closeAdminPanelModal;
  window.openUserProfileModal = openUserProfileModal;
  window.showRegisterTab = showRegisterTab;
  window.renderHeaderAuthUI = renderHeaderAuthUI;

  window.getCurrentUser = getCurrentUser;
  window.openAdminDrugForm = openAddDrugModal;

  // Admin drug management bindings
  window.switchAdminTab = switchAdminTab;
  window.filterAdminDrugs = filterAdminDrugs;
  window.openAddDrugModal = openAddDrugModal;
  window.openEditDrugModal = openEditDrugModal;
  window.closeDrugFormModal = closeDrugFormModal;
  window.handleSaveDrugForm = handleSaveDrugForm;
  window.handleDeleteDrug = handleDeleteDrug;
  window.openQuickPdfModal = openQuickPdfModal;
  window.closeQuickPdfModal = closeQuickPdfModal;

  // PDF attachment bindings
  window.handlePdfFileUpload = handlePdfFileUpload;
  window.handleAddPdfUrl = handleAddPdfUrl;
  window.previewFormAttachment = previewFormAttachment;
  window.removeFormAttachment = removeFormAttachment;
  window.renderFormAttachmentsList = renderFormAttachmentsList;
  window.addFormAttachment = (att) => {
    currentFormAttachments.push(att);
    renderFormAttachmentsList();
  };
  window.getCurrentFormAttachments = () => currentFormAttachments;
}
