/**
 * PHARMAVITA / CLINICALRX - MODULE KIỂM TRA TƯƠNG TÁC ĐA THUỐC
 */

import { getActiveDrugsDatabase } from "../data/drugs.js?v=full743";
import { DRUG_INTERACTIONS } from "../data/interactions.js?v=full743";

let selectedDrugs = [];

export function initInteractionChecker() {
  const selectElement = document.getElementById("interactionDrugSelect");
  const addBtn = document.getElementById("addDrugToBasketBtn");
  const clearBtn = document.getElementById("clearBasketBtn");
  const checkBtn = document.getElementById("runCheckInteractionsBtn");

  if (!selectElement) return;

  // Populate Select Dropdown sorted A-Z
  const currentDrugs = getActiveDrugsDatabase();
  const sortedForSelect = [...currentDrugs].sort((a, b) => a.name.localeCompare(b.name, "vi"));
  selectElement.innerHTML = `
    <option value="">-- Chọn thuốc đưa vào đơn phân tích (Dược thư A - Z) --</option>
    ${sortedForSelect.map(d => `<option value="${d.id}">${d.name} (${d.inn})</option>`).join("")}
  `;

  // Helper to add currently selected dropdown drug
  const addSelectedDrug = () => {
    const val = selectElement.value;
    if (val && !selectedDrugs.includes(val)) {
      selectedDrugs.push(val);
      selectElement.value = "";
      updateBasketUI();
      runInteractionAnalysis();
      return true;
    }
    return false;
  };

  if (addBtn) {
    addBtn.addEventListener("click", addSelectedDrug);
  }

  // Allow pressing Enter in select box to add
  selectElement.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSelectedDrug();
    }
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      selectedDrugs = [];
      updateBasketUI();
      runInteractionAnalysis();
    });
  }

  // Nút bấm tra cứu & kiểm tra tương tác thuốc
  if (checkBtn) {
    checkBtn.addEventListener("click", () => {
      // Nếu người dùng đang chọn 1 thuốc trong ô dropdown mà chưa bấm Thêm -> tự động thêm luôn
      if (selectElement.value) {
        addSelectedDrug();
      }

      if (selectedDrugs.length < 2) {
        selectElement.focus();
        selectElement.classList.add("ring-2", "ring-rose-500");
        setTimeout(() => selectElement.classList.remove("ring-2", "ring-rose-500"), 1800);
        runInteractionAnalysis();
        return;
      }

      // Hiệu ứng phân tích đối chiếu trực quan
      const originalHtml = checkBtn.innerHTML;
      checkBtn.innerHTML = `
        <i data-lucide="loader-2" class="w-4 h-4 animate-spin text-white"></i>
        <span>ĐANG QUÉT MA TRẬN ĐỐI CHIẾU...</span>
      `;
      if (window.lucide) window.lucide.createIcons();

      setTimeout(() => {
        runInteractionAnalysis();
        checkBtn.innerHTML = originalHtml;
        updateBasketUI();
        if (window.lucide) window.lucide.createIcons();

        // Cuộn mượt đến bảng kết quả
        const resEl = document.getElementById("interactionResultsContainer");
        if (resEl) {
          resEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }, 250);
    });
  }

  // Pre-load a sample case (Simvastatin + Clarithromycin) for initial presentation
  selectedDrugs = ["simvastatin", "clarithromycin"];
  updateBasketUI();
  runInteractionAnalysis();
}

export function addPresetInteractionCase(caseId) {
  if (caseId === "case1") {
    // Simvastatin + Clarithromycin
    selectedDrugs = ["simvastatin", "clarithromycin"];
  } else if (caseId === "case2") {
    // Amiodarone + Levofloxacin + Warfarin
    selectedDrugs = ["amiodarone", "levofloxacin", "warfarin"];
  } else if (caseId === "case3") {
    // Vancomycin + Colistin + Furosemide
    selectedDrugs = ["vancomycin", "colistin", "furosemide"];
  }
  updateBasketUI();
  runInteractionAnalysis();
}

function updateBasketUI() {
  const basketContainer = document.getElementById("selectedDrugsBasket");
  const countBadge = document.getElementById("selectedDrugsCount");
  const btnSelectedCount = document.getElementById("btnSelectedCount");
  if (!basketContainer) return;

  if (countBadge) {
    countBadge.textContent = selectedDrugs.length;
  }
  if (btnSelectedCount) {
    btnSelectedCount.textContent = `${selectedDrugs.length} thuốc`;
  }

  if (selectedDrugs.length === 0) {
    basketContainer.innerHTML = `
      <div class="text-xs text-slate-400 italic py-2">
        Chưa có thuốc nào trong đơn. Vui lòng chọn ít nhất 2 thuốc từ danh sách bên trên hoặc bấm chọn ca lâm sàng mẫu.
      </div>
    `;
    return;
  }

  basketContainer.innerHTML = selectedDrugs.map(drugId => {
    const drug = getActiveDrugsDatabase().find(d => d.id === drugId);
    const name = drug ? drug.name : drugId;
    return `
      <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200/80 shadow-xs">
        <i data-lucide="pill" class="w-3.5 h-3.5 text-teal-600"></i>
        <span>${name}</span>
        <button onclick="window.removeDrugFromBasket('${drugId}')" class="text-slate-400 hover:text-rose-600 ml-1">
          <i data-lucide="x" class="w-3.5 h-3.5"></i>
        </button>
      </span>
    `;
  }).join("");

  if (window.lucide) window.lucide.createIcons();
}

export function removeDrugFromBasket(drugId) {
  selectedDrugs = selectedDrugs.filter(id => id !== drugId);
  updateBasketUI();
  runInteractionAnalysis();
}

function runInteractionAnalysis() {
  const resultsContainer = document.getElementById("interactionResultsContainer");
  if (!resultsContainer) return;

  if (selectedDrugs.length < 2) {
    resultsContainer.innerHTML = `
      <div class="py-12 text-center bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-6">
        <i data-lucide="shield-question" class="w-12 h-12 mx-auto text-slate-400 mb-3"></i>
        <h4 class="text-base font-semibold text-slate-700 mb-1">Cần tối thiểu 2 thuốc để phân tích tương tác</h4>
        <p class="text-xs text-slate-500 max-w-md mx-auto mb-3">
          Hệ thống sẽ đối chiếu ma trận cặp đôi tất cả các thuốc trong đơn để phát hiện tương tác dược động học và dược lực học.
        </p>
        <a href="https://reference.medscape.com/drug-interactionchecker" 
           target="_blank" 
           rel="noopener noreferrer" 
           class="inline-flex items-center gap-1.5 text-xs text-teal-700 hover:text-teal-800 font-semibold hover:underline bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
          <span>Tra cứu mở rộng trên Medscape Drug Interaction Checker</span>
          <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
        </a>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  // Find all pairs
  const foundInteractions = [];
  for (let i = 0; i < selectedDrugs.length; i++) {
    for (let j = i + 1; j < selectedDrugs.length; j++) {
      const d1 = selectedDrugs[i];
      const d2 = selectedDrugs[j];

      const match = DRUG_INTERACTIONS.find(item => 
        (item.pair[0] === d1 && item.pair[1] === d2) ||
        (item.pair[0] === d2 && item.pair[1] === d1)
      );

      if (match) {
        const drugObj1 = getActiveDrugsDatabase().find(d => d.id === d1) || { name: d1 };
        const drugObj2 = getActiveDrugsDatabase().find(d => d.id === d2) || { name: d2 };
        foundInteractions.push({
          ...match,
          drugName1: drugObj1.name,
          drugName2: drugObj2.name
        });
      }
    }
  }

  if (foundInteractions.length === 0) {
    resultsContainer.innerHTML = `
      <div class="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-6 text-emerald-950 shadow-xs">
        <div class="flex items-start gap-4 mb-4">
          <div class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-700">
            <i data-lucide="shield-check" class="w-6 h-6"></i>
          </div>
          <div class="flex-1">
            <h4 class="text-base font-bold text-emerald-950 mb-1">Không có dữ liệu tương tác hoặc chưa ghi nhận tương tác nguy hiểm trong CSDL</h4>
            <p class="text-xs leading-relaxed text-emerald-800">
              Hệ thống chưa tìm thấy dữ liệu cảnh báo tương tác mức độ Nghiêm trọng hoặc Chống chỉ định giữa các cặp thuốc được chọn trong cơ sở dữ liệu nội viện.
              Người thực hành lâm sàng luôn cần đối chiếu tổng thể tình trạng chức năng gan, thận, điện giải và cá thể hóa điều trị trên từng bệnh nhân.
            </p>
          </div>
        </div>

        <!-- Khối liên kết mở rộng tra cứu trên Medscape -->
        <div class="mt-4 pt-4 border-t border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/70 p-4 rounded-xl border border-emerald-200/60">
          <div class="text-xs text-slate-700 space-y-0.5">
            <div class="font-bold text-slate-900 flex items-center gap-1.5">
              <i data-lucide="external-link" class="w-4 h-4 text-emerald-600"></i>
              <span>Tra cứu mở rộng trên cơ sở dữ liệu quốc tế:</span>
            </div>
            <p class="text-slate-500">
              Đối chiếu thêm ma trận tương tác đa thuốc trên Medscape Drug Interaction Checker (WebMD).
            </p>
          </div>
          <a href="https://reference.medscape.com/drug-interactionchecker" 
             target="_blank" 
             rel="noopener noreferrer" 
             class="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all shrink-0 hover:shadow-md hover:scale-[1.02]">
            <span>Mở Medscape Interaction Checker</span>
            <i data-lucide="arrow-up-right" class="w-4 h-4"></i>
          </a>
        </div>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  // Sort interactions: contraindicated first, then major, then moderate
  const severityOrder = { contraindicated: 1, major: 2, moderate: 3, minor: 4 };
  foundInteractions.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  resultsContainer.innerHTML = `
    <div class="space-y-4">
      <div class="flex items-center justify-between pb-2 border-b border-slate-200">
        <span class="text-sm font-bold text-slate-800 flex items-center gap-2">
          <i data-lucide="alert-octagon" class="w-4 h-4 text-rose-600"></i>
          Đã phát hiện <strong>${foundInteractions.length} tương tác</strong> trong đơn thuốc
        </span>
        <span class="text-xs text-slate-500">Phân loại theo mức độ nghiêm trọng</span>
      </div>

      ${foundInteractions.map(item => {
        let badgeClass = "bg-rose-100 text-rose-800 border-rose-300";
        let cardBorder = "border-rose-200 bg-rose-50/40";
        let label = "CHỐNG CHỈ ĐỊNH PHỐI HỢP";
        let icon = "alert-triangle";

        if (item.severity === "major") {
          badgeClass = "bg-amber-100 text-amber-900 border-amber-300";
          cardBorder = "border-amber-200 bg-amber-50/40";
          label = "NGUY CƠ NGHIÊM TRỌNG / CẦN ĐIỀU CHỈNH";
          icon = "alert-circle";
        } else if (item.severity === "moderate") {
          badgeClass = "bg-blue-100 text-blue-900 border-blue-300";
          cardBorder = "border-blue-200 bg-blue-50/40";
          label = "THẬN TRỌNG THEO DÕI";
          icon = "info";
        }

        return `
          <div class="border rounded-2xl p-5 ${cardBorder} shadow-sm transition-all">
            <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badgeClass}">
                <i data-lucide="${icon}" class="w-3.5 h-3.5"></i>
                ${label}
              </span>
              <div class="text-xs font-bold text-slate-700 bg-white/80 px-2.5 py-1 rounded-lg border border-slate-200">
                ${item.drugName1} ⟷ ${item.drugName2}
              </div>
            </div>

            <h4 class="text-base font-bold text-slate-900 mb-2 leading-snug">
              ${item.title}
            </h4>

            <div class="space-y-2.5 text-xs text-slate-700 mb-4 leading-relaxed">
              <p>
                <strong class="text-slate-900">Cơ chế tương tác:</strong> ${item.mechanism}
              </p>
              <p>
                <strong class="text-slate-900">Hậu quả lâm sàng:</strong> ${item.clinicalImpact}
              </p>
            </div>

            <div class="bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
              <div class="font-bold text-teal-900 mb-1 flex items-center gap-1.5">
                <i data-lucide="check-square" class="w-4 h-4 text-teal-600"></i>
                Khuyến cáo xử trí của Dược sĩ lâm sàng:
              </div>
              <p class="text-slate-700 leading-relaxed font-medium">
                ${item.recommendation}
              </p>
              ${item.evidenceLevel ? `
                <div class="mt-2 text-[11px] text-slate-400 italic">
                  Mức độ bằng chứng: ${item.evidenceLevel}
                </div>
              ` : ""}
            </div>
          </div>
        `;
      }).join("")}

      <!-- Footer hỗ trợ tra cứu mở rộng Medscape -->
      <div class="p-4 bg-slate-50/90 rounded-2xl border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div class="flex items-center gap-2">
          <i data-lucide="info" class="w-4 h-4 text-slate-500 shrink-0"></i>
          <span>Cần đối chiếu mở rộng thêm với dữ liệu quốc tế hoặc kiểm tra các hoạt chất ngoài danh mục?</span>
        </div>
        <a href="https://reference.medscape.com/drug-interactionchecker" 
           target="_blank" 
           rel="noopener noreferrer" 
           class="inline-flex items-center gap-1.5 font-bold text-teal-700 hover:text-teal-800 bg-white hover:bg-teal-50 border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs shrink-0 transition-all">
          <span>Medscape Interaction Checker</span>
          <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i>
        </a>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();
}

window.removeDrugFromBasket = removeDrugFromBasket;
window.addPresetInteractionCase = addPresetInteractionCase;
