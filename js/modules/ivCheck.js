/**
 * PHARMAVITA / CLINICALRX - MODULE TƯƠNG DUNG & TƯƠNG KỴ ĐƯỜNG TIÊM TRUYỀN (IV Y-SITE)
 */

import { IV_DRUGS, IV_FLUIDS, IV_PAIRS_COMPATIBILITY } from "../data/iv_compatibility.js";

export function initIvCompatibilityModule() {
  const selectA = document.getElementById("ivDrugA");
  const selectB = document.getElementById("ivDrugB");
  const checkBtn = document.getElementById("checkIvBtn");

  if (!selectA || !selectB) return;

  const allOptions = [
    ...IV_DRUGS.map(d => ({ id: d.id, name: `${d.name} (pH ${d.ph})`, type: "Thuốc tiêm" })),
    ...IV_FLUIDS.map(f => ({ id: f.id, name: `${f.name}`, type: "Dung dịch truyền" }))
  ];

  const htmlOptions = `
    <option value="">-- Chọn thuốc hoặc dịch truyền --</option>
    <optgroup label="Thuốc tiêm truyền phổ biến">
      ${IV_DRUGS.map(d => `<option value="${d.id}">${d.name} (${d.ph})</option>`).join("")}
    </optgroup>
    <optgroup label="Dung dịch pha truyền cơ bản">
      ${IV_FLUIDS.map(f => `<option value="${f.id}">${f.name}</option>`).join("")}
    </optgroup>
  `;

  selectA.innerHTML = htmlOptions;
  selectB.innerHTML = htmlOptions;

  // Set default sample: Furosemide + Amiodarone
  selectA.value = "furosemide";
  selectB.value = "amiodarone";

  const runCheck = () => {
    const valA = selectA.value;
    const valB = selectB.value;
    checkCompatibility(valA, valB);
  };

  selectA.addEventListener("change", runCheck);
  selectB.addEventListener("change", runCheck);
  if (checkBtn) checkBtn.addEventListener("click", runCheck);

  renderCompatibilityMatrixTable();
  runCheck();
}

function checkCompatibility(idA, idB) {
  const resultBox = document.getElementById("ivResultBox");
  if (!resultBox) return;

  if (!idA || !idB) {
    resultBox.innerHTML = `
      <div class="p-6 text-center text-slate-400 text-xs bg-slate-50 border border-slate-200 rounded-2xl">
        Vui lòng chọn cả hai thuốc/dịch truyền để tra cứu độ tương dung Y-site.
      </div>
    `;
    return;
  }

  if (idA === idB) {
    resultBox.innerHTML = `
      <div class="p-6 text-center text-amber-800 text-xs bg-amber-50 border border-amber-200 rounded-2xl">
        Bạn đang chọn cùng một thuốc hoặc dung dịch. Vui lòng chọn 2 chất khác nhau.
      </div>
    `;
    return;
  }

  const match = IV_PAIRS_COMPATIBILITY.find(item => 
    (item.pair[0] === idA && item.pair[1] === idB) ||
    (item.pair[0] === idB && item.pair[1] === idA)
  );

  const drugA = [...IV_DRUGS, ...IV_FLUIDS].find(d => d.id === idA);
  const drugB = [...IV_DRUGS, ...IV_FLUIDS].find(d => d.id === idB);

  if (!match) {
    resultBox.innerHTML = `
      <div class="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
        <div class="flex items-center gap-2 text-slate-700 font-bold">
          <i data-lucide="help-circle" class="w-5 h-5 text-slate-400"></i>
          <span>Chưa có dữ liệu thử nghiệm tương dung trực tiếp giữa cặp này</span>
        </div>
        <p class="text-slate-500 leading-relaxed">
          Cặp đôi <strong>${drugA?.name}</strong> và <strong>${drugB?.name}</strong> chưa có dữ liệu tương hợp Y-site trong danh mục thường quy.
        </p>
        <div class="bg-amber-50 p-3 rounded-lg border border-amber-200 text-amber-900 font-medium">
          Khuyến cáo an toàn: Khi chưa có tài liệu khẳng định tính tương hợp, nguyên tắc là <strong>KHÔNG TRUYỀN CHUNG</strong>. Nên dùng đường truyền riêng hoặc tráng rửa đường truyền bằng NaCl 0.9% trước và sau khi tiêm.
        </div>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  const isIncompatible = match.status === "incompatible";
  const badge = isIncompatible
    ? `<span class="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1.5"><i data-lucide="alert-octagon" class="w-4 h-4 text-rose-600"></i> TƯƠNG KỴ - KHÔNG TRUYỀN CHUNG</span>`
    : `<span class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5"><i data-lucide="check-circle" class="w-4 h-4 text-emerald-600"></i> TƯƠNG HỢP (Y-SITE COMPATIBLE)</span>`;

  resultBox.innerHTML = `
    <div class="border rounded-2xl p-5 ${isIncompatible ? "bg-rose-50/50 border-rose-200" : "bg-emerald-50/50 border-emerald-200"} space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-2">
        ${badge}
        <span class="text-xs font-mono font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
          ${drugA?.name} ⟷ ${drugB?.name}
        </span>
      </div>

      <div class="space-y-1.5 text-xs">
        <div class="font-bold ${isIncompatible ? "text-rose-950" : "text-emerald-950"} text-sm">
          Đặc tính lý hóa & Hiện tượng:
        </div>
        <p class="leading-relaxed text-slate-700 font-medium">
          ${match.note}
        </p>
      </div>

      <div class="bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
        <div class="font-bold text-teal-900 flex items-center gap-1.5 mb-1">
          <i data-lucide="shield-alert" class="w-4 h-4 text-teal-600"></i>
          Hướng dẫn thực hành tiêm truyền cho Điều dưỡng & Bác sĩ:
        </div>
        <p class="text-slate-700 leading-relaxed font-medium">
          ${match.recommendation}
        </p>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();
}

function renderCompatibilityMatrixTable() {
  const container = document.getElementById("ivQuickMatrixTable");
  if (!container) return;

  container.innerHTML = IV_PAIRS_COMPATIBILITY.map(item => {
    const d1 = [...IV_DRUGS, ...IV_FLUIDS].find(d => d.id === item.pair[0]);
    const d2 = [...IV_DRUGS, ...IV_FLUIDS].find(d => d.id === item.pair[1]);
    const isIncompatible = item.status === "incompatible";

    return `
      <tr class="border-b border-slate-100 hover:bg-slate-50/80 text-xs">
        <td class="px-4 py-3 font-semibold text-slate-800">${d1?.name || item.pair[0]}</td>
        <td class="px-4 py-3 font-semibold text-slate-800">${d2?.name || item.pair[1]}</td>
        <td class="px-4 py-3">
          ${isIncompatible 
            ? '<span class="px-2.5 py-1 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">🔴 Tương kỵ</span>'
            : '<span class="px-2.5 py-1 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">🟢 Tương hợp</span>'
          }
        </td>
        <td class="px-4 py-3 text-slate-600 max-w-xs truncate" title="${item.note}">${item.note}</td>
      </tr>
    `;
  }).join("");
}
