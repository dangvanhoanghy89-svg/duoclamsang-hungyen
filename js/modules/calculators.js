/**
 * PHARMAVITA / CLINICALRX - BỘ MÁY TÍNH DƯỢC LÂM SÀNG
 * 1. Cockcroft-Gault & eGFR CKD-EPI
 * 2. Thể trọng IBW, AdjBW, BMI, Diện tích da BSA
 * 3. Quy đổi liều Corticosteroid tương đương
 * 4. Ước tính dược động học nạp Vancomycin
 */

export function initCalculators() {
  initCrClCalculator();
  initBmiBsaCalculator();
  initCorticoidCalculator();
  initVancomycinCalc();
  initChildPughCalculator();
  initOpioidConverter();
  initAminoglycosideCalc();
}

// 1. MÁY TÍNH CHỨC NĂNG THẬN (COCKCROFT-GAULT & CKD-EPI)
function initCrClCalculator() {
  const form = document.getElementById("crclForm");
  if (!form) return;

  const calculate = () => {
    const gender = form.elements["crclGender"].value; // "male" or "female"
    const age = parseFloat(form.elements["crclAge"].value);
    const weight = parseFloat(form.elements["crclWeight"].value);
    const height = parseFloat(form.elements["crclHeight"].value);
    const scrValue = parseFloat(form.elements["crclScr"].value);
    const scrUnit = form.elements["crclScrUnit"].value; // "mg/dL" or "umol/L"

    const resultBox = document.getElementById("crclResultBox");
    if (!resultBox) return;

    if (isNaN(age) || isNaN(weight) || isNaN(scrValue) || age <= 0 || weight <= 0 || scrValue <= 0) {
      resultBox.innerHTML = `
        <div class="text-slate-400 text-xs text-center py-6">
          Vui lòng nhập đầy đủ thông số Tuổi, Cân nặng và Creatinine máu.
        </div>
      `;
      return;
    }

    // Convert Creatinine to mg/dL if umol/L
    let scrMgDl = scrValue;
    if (scrUnit === "umol/L") {
      scrMgDl = scrValue / 88.4;
    }

    // Calculate IBW (Devine formula)
    let ibw = 0;
    if (!isNaN(height) && height > 100) {
      const heightInches = height / 2.54;
      if (gender === "male") {
        ibw = 50 + 2.3 * (heightInches - 60);
      } else {
        ibw = 45.5 + 2.3 * (heightInches - 60);
      }
    } else {
      ibw = weight;
    }

    // Check Obesity (> 120% IBW) and calculate Adjusted Body Weight (AdjBW)
    let weightToUse = weight;
    let weightNote = "Cân nặng thực tế";
    let adjBw = null;

    if (weight > 1.2 * ibw && ibw > 0) {
      adjBw = ibw + 0.4 * (weight - ibw);
      weightToUse = adjBw;
      weightNote = `Bệnh nhân thừa cân/béo phì (BMI cao): Khuyến cáo dùng Cân nặng hiệu chỉnh (AdjBW = ${adjBw.toFixed(1)} kg)`;
    } else if (weight < ibw) {
      weightToUse = weight;
      weightNote = "Cân nặng thực tế nhẹ hơn IBW: Dùng Cân nặng thực tế";
    }

    // Cockcroft-Gault formula: CrCl = [(140 - Age) * Weight] / (72 * SCr) * (0.85 if female)
    let crcl = ((140 - age) * weightToUse) / (72 * scrMgDl);
    if (gender === "female") {
      crcl *= 0.85;
    }

    // Cockcroft-Gault with Actual Weight for comparison
    let crclActual = ((140 - age) * weight) / (72 * scrMgDl);
    if (gender === "female") crclActual *= 0.85;

    // CKD-EPI 2021 (Race-free):
    // eGFR = 142 * min(Scr/kappa, 1)^alpha * max(Scr/kappa, 1)^-1.200 * 0.9938^Age * (1.012 if female)
    const kappa = gender === "female" ? 0.7 : 0.9;
    const alpha = gender === "female" ? -0.241 : -0.302;
    const genderMult = gender === "female" ? 1.012 : 1.0;
    const scrDivKappa = scrMgDl / kappa;
    const minVal = Math.min(scrDivKappa, 1);
    const maxVal = Math.max(scrDivKappa, 1);
    const egfr = 142 * Math.pow(minVal, alpha) * Math.pow(maxVal, -1.200) * Math.pow(0.9938, age) * genderMult;

    // CKD Stage classification
    let ckdStage = "";
    let ckdBadgeColor = "";
    if (egfr >= 90) {
      ckdStage = "G1 - Chức năng thận bình thường hoặc tăng";
      ckdBadgeColor = "bg-emerald-100 text-emerald-800 border-emerald-300";
    } else if (egfr >= 60) {
      ckdStage = "G2 - Giảm nhẹ chức năng thận";
      ckdBadgeColor = "bg-teal-100 text-teal-800 border-teal-300";
    } else if (egfr >= 45) {
      ckdStage = "G3a - Giảm mức độ nhẹ đến trung bình";
      ckdBadgeColor = "bg-amber-100 text-amber-800 border-amber-300";
    } else if (egfr >= 30) {
      ckdStage = "G3b - Giảm mức độ trung bình đến nặng";
      ckdBadgeColor = "bg-orange-100 text-orange-800 border-orange-300";
    } else if (egfr >= 15) {
      ckdStage = "G4 - Suy thận nặng";
      ckdBadgeColor = "bg-rose-100 text-rose-800 border-rose-300";
    } else {
      ckdStage = "G5 - Suy thận giai đoạn cuối / Cần lọc máu";
      ckdBadgeColor = "bg-purple-100 text-purple-800 border-purple-300";
    }

    resultBox.innerHTML = `
      <div class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="bg-teal-50 border border-teal-200 rounded-xl p-4 text-center">
            <span class="text-xs font-semibold text-teal-700 uppercase tracking-wide">CrCl (Cockcroft-Gault)</span>
            <div class="text-3xl font-extrabold text-teal-900 mt-1">
              ${crcl.toFixed(1)} <span class="text-sm font-medium text-teal-700">mL/phút</span>
            </div>
            <div class="text-[11px] text-teal-800/80 mt-1">
              Dùng để hiệu chỉnh liều thuốc theo FDA/Dược thư
            </div>
          </div>

          <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
            <span class="text-xs font-semibold text-blue-700 uppercase tracking-wide">eGFR (CKD-EPI 2021)</span>
            <div class="text-3xl font-extrabold text-blue-900 mt-1">
              ${egfr.toFixed(1)} <span class="text-sm font-medium text-blue-700">mL/phút/1.73m²</span>
            </div>
            <div class="text-[11px] text-blue-800/80 mt-1">
              Dùng phân giai đoạn bệnh thận mạn (CKD)
            </div>
          </div>
        </div>

        <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-slate-600 font-medium">Giai đoạn bệnh thận:</span>
            <span class="px-2.5 py-0.5 rounded-md font-semibold border ${ckdBadgeColor}">
              ${ckdStage}
            </span>
          </div>
          <div class="flex items-center justify-between pt-1 border-t border-slate-200/60">
            <span class="text-slate-600 font-medium">Thể trọng quy chiếu:</span>
            <span class="text-slate-800 font-semibold">${weightNote}</span>
          </div>
          ${adjBw ? `
            <div class="flex items-center justify-between text-[11px] text-slate-500">
              <span>Cân nặng lý tưởng (IBW): ${ibw.toFixed(1)} kg</span>
              <span>CrCl theo cân nặng thực: ${crclActual.toFixed(1)} mL/phút</span>
            </div>
          ` : ""}
        </div>

        <!-- Khuyến cáo lâm sàng nhanh -->
        <div class="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs">
          <div class="font-bold text-amber-900 flex items-center gap-1.5 mb-1">
            <i data-lucide="bell" class="w-4 h-4 text-amber-600"></i>
            Khuyến cáo Dược lâm sàng:
          </div>
          <p class="text-amber-950 leading-relaxed font-medium">
            ${crcl < 50 
              ? `Bệnh nhân có CrCl = <strong>${crcl.toFixed(1)} mL/phút</strong> (< 50 mL/phút). Bắt buộc phải rà soát và giảm liều hoặc giãn khoảng cách liều đối với các kháng sinh thải trừ qua thận: <em>Meropenem, Levofloxacin, Vancomycin, Colistin</em>. Chống chỉ định Metformin nếu eGFR < 30.` 
              : `Chức năng thận bảo tồn tốt (CrCl >= 50 mL/phút). Có thể sử dụng hầu hết các thuốc theo mức liều chuẩn của người lớn.`}
          </p>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  };

  form.addEventListener("input", calculate);
  calculate();
}

// 2. MÁY TÍNH HÌNH THỂ: BMI & DIỆN TÍCH DA (BSA)
function initBmiBsaCalculator() {
  const form = document.getElementById("bmiForm");
  if (!form) return;

  const calculate = () => {
    const height = parseFloat(form.elements["bmiHeight"].value);
    const weight = parseFloat(form.elements["bmiWeight"].value);
    const gender = form.elements["bmiGender"].value;

    const resultBox = document.getElementById("bmiResultBox");
    if (!resultBox) return;

    if (isNaN(height) || isNaN(weight) || height <= 0 || weight <= 0) {
      resultBox.innerHTML = `<div class="text-slate-400 text-xs text-center py-6">Vui lòng nhập chiều cao và cân nặng.</div>`;
      return;
    }

    const heightM = height / 100;
    const bmi = weight / (heightM * heightM);

    // BSA Mosteller: sqrt(H * W / 3600)
    const bsaMosteller = Math.sqrt((height * weight) / 3600);

    // BSA DuBois: 0.007184 * H^0.725 * W^0.425
    const bsaDuBois = 0.007184 * Math.pow(height, 0.725) * Math.pow(weight, 0.425);

    // IBW (Devine)
    const heightInches = height / 2.54;
    const ibw = gender === "male" ? 50 + 2.3 * (heightInches - 60) : 45.5 + 2.3 * (heightInches - 60);

    // BMI Classification (WHO vs WPRO Asian)
    let bmiClass = "";
    let bmiColor = "";
    if (bmi < 18.5) {
      bmiClass = "Nhẹ cân / Thiếu dinh dưỡng";
      bmiColor = "bg-blue-100 text-blue-800 border-blue-300";
    } else if (bmi < 23) {
      bmiClass = "Bình thường (Chuẩn Châu Á IDI & WPRO)";
      bmiColor = "bg-emerald-100 text-emerald-800 border-emerald-300";
    } else if (bmi < 25) {
      bmiClass = "Thừa cân (Tiền béo phì)";
      bmiColor = "bg-amber-100 text-amber-800 border-amber-300";
    } else if (bmi < 30) {
      bmiClass = "Béo phì độ I";
      bmiColor = "bg-orange-100 text-orange-800 border-orange-300";
    } else {
      bmiClass = "Béo phì độ II trở lên";
      bmiColor = "bg-rose-100 text-rose-800 border-rose-300";
    }

    resultBox.innerHTML = `
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-teal-50 border border-teal-200 rounded-xl p-3.5 text-center">
            <span class="text-xs font-semibold text-teal-700 uppercase">Chỉ số khối (BMI)</span>
            <div class="text-2xl font-bold text-teal-900 mt-1">${bmi.toFixed(1)} <span class="text-xs font-normal">kg/m²</span></div>
            <div class="text-[11px] mt-1 font-semibold px-2 py-0.5 rounded border inline-block ${bmiColor}">${bmiClass}</div>
          </div>

          <div class="bg-indigo-50 border border-indigo-200 rounded-xl p-3.5 text-center">
            <span class="text-xs font-semibold text-indigo-700 uppercase">Diện tích da (BSA)</span>
            <div class="text-2xl font-bold text-indigo-900 mt-1">${bsaMosteller.toFixed(2)} <span class="text-xs font-normal">m²</span></div>
            <div class="text-[11px] text-indigo-700 mt-1">Công thức Mosteller (DuBois: ${bsaDuBois.toFixed(2)} m²)</div>
          </div>
        </div>

        <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
          <div class="flex justify-between text-slate-600">
            <span>Cân nặng lý tưởng (IBW Devine):</span>
            <strong class="text-slate-900">${ibw.toFixed(1)} kg</strong>
          </div>
          <div class="flex justify-between text-slate-600">
            <span>Tỷ lệ cân nặng thực tế / IBW:</span>
            <strong class="text-slate-900">${((weight / ibw) * 100).toFixed(0)}%</strong>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  };

  form.addEventListener("input", calculate);
  calculate();
}

// 3. QUY ĐỔI LIỀU CORTICOSTEROID TƯƠNG ĐƯƠNG
function initCorticoidCalculator() {
  const form = document.getElementById("corticoidForm");
  if (!form) return;

  // Relative potency table (Dựa trên Hydrocortisone = 20mg)
  const corticoidEquivalents = [
    { id: "hydrocortisone", name: "Hydrocortisone", eqDose: 20, antiInflam: 1, mineralo: 1, duration: "Ngắn (8-12h)" },
    { id: "cortisone", name: "Cortisone acetate", eqDose: 25, antiInflam: 0.8, mineralo: 0.8, duration: "Ngắn (8-12h)" },
    { id: "prednisone", name: "Prednisone", eqDose: 5, antiInflam: 4, mineralo: 0.8, duration: "Trung bình (12-36h)" },
    { id: "prednisolone", name: "Prednisolone", eqDose: 5, antiInflam: 4, mineralo: 0.8, duration: "Trung bình (12-36h)" },
    { id: "methylprednisolone", name: "Methylprednisolone", eqDose: 4, antiInflam: 5, mineralo: 0.5, duration: "Trung bình (12-36h)" },
    { id: "triamcinolone", name: "Triamcinolone", eqDose: 4, antiInflam: 5, mineralo: 0, duration: "Trung bình (12-36h)" },
    { id: "dexamethasone", name: "Dexamethasone", eqDose: 0.75, antiInflam: 25, mineralo: 0, duration: "Dài (36-72h)" },
    { id: "betamethasone", name: "Betamethasone", eqDose: 0.6, antiInflam: 25, mineralo: 0, duration: "Dài (36-72h)" }
  ];

  const calculate = () => {
    const fromDrugId = form.elements["corticoidFromDrug"].value;
    const inputDose = parseFloat(form.elements["corticoidDose"].value);
    const resultContainer = document.getElementById("corticoidResultTable");

    if (!resultContainer) return;

    if (isNaN(inputDose) || inputDose <= 0) {
      resultContainer.innerHTML = `<tr><td colspan="4" class="px-4 py-6 text-center text-slate-400">Vui lòng nhập liều lượng hợp lệ (> 0 mg).</td></tr>`;
      return;
    }

    const baseItem = corticoidEquivalents.find(c => c.id === fromDrugId);
    if (!baseItem) return;

    // Standard hydrocortisone equivalent = inputDose * (20 / baseItem.eqDose)
    const hydrocortisoneUnits = (inputDose * 20) / baseItem.eqDose;

    resultContainer.innerHTML = corticoidEquivalents.map(c => {
      const convertedDose = (hydrocortisoneUnits * c.eqDose) / 20;
      const isSelected = c.id === fromDrugId;
      return `
        <tr class="${isSelected ? "bg-teal-50/80 font-bold text-teal-950" : "hover:bg-slate-50 text-slate-700"}">
          <td class="px-4 py-2.5">
            ${c.name}
            ${isSelected ? '<span class="ml-1 text-[10px] bg-teal-600 text-white px-1.5 py-0.5 rounded">Gốc</span>' : ''}
          </td>
          <td class="px-4 py-2.5 font-bold ${isSelected ? "text-teal-700 text-base" : "text-slate-900"}">
            ${convertedDose < 1 ? convertedDose.toFixed(2) : convertedDose.toFixed(1)} mg
          </td>
          <td class="px-4 py-2.5 text-slate-500">${c.antiInflam}x</td>
          <td class="px-4 py-2.5 text-slate-500">${c.duration}</td>
        </tr>
      `;
    }).join("");
  };

  form.addEventListener("input", calculate);
  calculate();
}

// 4. MÁY TÍNH LIỀU NẠP & DƯỢC ĐỘNG HỌC VANCOMYCIN
function initVancomycinCalc() {
  const form = document.getElementById("vancoForm");
  if (!form) return;

  const calculate = () => {
    const weight = parseFloat(form.elements["vancoWeight"].value);
    const indication = form.elements["vancoIndication"].value; // "severe" or "standard"
    const resultBox = document.getElementById("vancoResultBox");

    if (!resultBox) return;

    if (isNaN(weight) || weight <= 0) {
      resultBox.innerHTML = `<div class="text-slate-400 text-xs text-center py-4">Nhập cân nặng bệnh nhân để tính liều.</div>`;
      return;
    }

    // Loading dose: 25 - 30 mg/kg (capped at 2g to 3g)
    const loadMin = Math.min(weight * 25, 3000);
    const loadMax = Math.min(weight * 30, 3000);

    // Maintenance dose: 15 - 20 mg/kg q8h - q12h
    const maintMin = Math.round((weight * 15) / 250) * 250; // round to nearest 250mg
    const maintMax = Math.round((weight * 20) / 250) * 250;

    resultBox.innerHTML = `
      <div class="space-y-3">
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-3.5">
          <div class="text-xs font-bold text-amber-900 uppercase">Liều nạp (Loading dose):</div>
          <div class="text-xl font-black text-amber-950 mt-0.5">
            ${Math.round(loadMin)} - ${Math.round(loadMax)} mg
          </div>
          <div class="text-[11px] text-amber-800 mt-1">
            Truyền tĩnh mạch trong ít nhất 120 - 180 phút (tốc độ không quá 10mg/phút).
          </div>
        </div>

        <div class="bg-teal-50 border border-teal-200 rounded-xl p-3.5">
          <div class="text-xs font-bold text-teal-900 uppercase">Liều duy trì ước tính ban đầu:</div>
          <div class="text-lg font-bold text-teal-950 mt-0.5">
            ${maintMin} - ${maintMax} mg mỗi 8 - 12 giờ
          </div>
          <div class="text-[11px] text-teal-800 mt-1">
            Hiệu chỉnh theo CrCl của bệnh nhân. Mục tiêu AUC24/MIC = 400 - 600.
          </div>
        </div>
      </div>
    `;
  };

  form.addEventListener("input", calculate);
  calculate();
}

// ============================================================================
// 5. MÁY TÍNH THANG ĐIỂM SUY GAN CHILD-PUGH & HIỆU CHỈNH LIỀU THUỐC
// ============================================================================
function initChildPughCalculator() {
  const form = document.getElementById("childPughForm");
  if (!form) return;

  const calculate = () => {
    const enceph = parseInt(form.elements["cpEnceph"].value, 10);
    const ascites = parseInt(form.elements["cpAscites"].value, 10);
    const bili = parseInt(form.elements["cpBili"].value, 10);
    const alb = parseInt(form.elements["cpAlb"].value, 10);
    const inr = parseInt(form.elements["cpInr"].value, 10);
    const resultBox = document.getElementById("childPughResultBox");

    if (!resultBox) return;

    const totalScore = enceph + ascites + bili + alb + inr;
    let cpClass = "A";
    let statusText = "Suy gan nhẹ / Xơ gan còn bù (Well-compensated)";
    let badgeClass = "bg-emerald-100 text-emerald-800 border-emerald-300";
    let survivalText = "Dự hậu sống 1 năm: 100% | 2 năm: 85%";
    let dosingAdvice = `
      <ul class="list-disc list-inside space-y-1 text-[11px] text-slate-700">
        <li><strong>Thuốc chuyển hóa mạnh qua gan (EH > 0.7):</strong> Thường không cần giảm liều ban đầu, có thể giảm 25% với thuốc có khoảng điều trị hẹp.</li>
        <li><strong>Thuốc chuyển hóa thấp qua gan (EH < 0.3):</strong> Giữ nguyên liều thông thường.</li>
        <li><strong>Theo dõi:</strong> Đánh giá chức năng gan định kỳ mỗi 3 - 6 tháng.</li>
      </ul>
    `;

    if (totalScore >= 7 && totalScore <= 9) {
      cpClass = "B";
      statusText = "Suy gan trung bình / Tổn thương đáng kể (Significant compromise)";
      badgeClass = "bg-amber-100 text-amber-900 border-amber-300";
      survivalText = "Dự hậu sống 1 năm: 80% | 2 năm: 60%";
      dosingAdvice = `
        <ul class="list-disc list-inside space-y-1 text-[11px] text-slate-700">
          <li><strong>Thuốc chuyển hóa mạnh qua gan (EH > 0.7):</strong> GIẢM 50% LIỀU ĐƯỜNG UỐNG (do giảm chuyển hóa bước một làm sinh khả dụng tăng gấp 2 - 4 lần).</li>
          <li><strong>Thuốc chuyển hóa thấp (EH < 0.3):</strong> Giảm 25% - 50% liều duy trì.</li>
          <li><strong>Cảnh báo:</strong> Tránh NSAID (nguy cơ xuất huyết tiêu hóa & suy thận gan HRS), thận trọng Opioid và An thần (dễ khởi phát hôn mê gan).</li>
        </ul>
      `;
    } else if (totalScore >= 10) {
      cpClass = "C";
      statusText = "Suy gan nặng / Xơ gan mất bù nghiêm trọng (Decompensated)";
      badgeClass = "bg-rose-100 text-rose-900 border-rose-300";
      survivalText = "Dự hậu sống 1 năm: 45% | 2 năm: 35%";
      dosingAdvice = `
        <ul class="list-disc list-inside space-y-1 text-[11px] text-slate-700">
          <li><strong>Thuốc chuyển hóa qua gan:</strong> CHỐNG CHỈ ĐỊNH hoặc GIẢM TỐI THIỂU 70% - 80% LIỀU; kéo dài khoảng cách đưa thuốc.</li>
          <li><strong>Thuốc gắn protein huyết tương cao:</strong> Nồng độ thuốc tự do tăng vọt do Albumin giảm nặng, nguy cơ ngộ độc rất cao.</li>
          <li><strong>Bắt buộc:</strong> Hội chẩn Dược lâm sàng cá thể hóa và theo dõi TDM nồng độ thuốc máu.</li>
        </ul>
      `;
    }

    resultBox.innerHTML = `
      <div class="space-y-3 pt-2">
        <div class="p-3.5 rounded-xl border ${badgeClass} flex items-center justify-between">
          <div>
            <div class="text-xs font-bold uppercase">Phân loại Child-Pugh:</div>
            <div class="text-2xl font-black mt-0.5">
              Class ${cpClass} <span class="text-sm font-semibold">(${totalScore} điểm)</span>
            </div>
            <div class="text-xs font-medium mt-0.5">${statusText}</div>
          </div>
          <div class="text-right text-[11px] font-semibold">
            ${survivalText}
          </div>
        </div>

        <div class="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
          <div class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <i data-lucide="info" class="w-4 h-4 text-teal-600"></i>
            Khuyến cáo Dược lâm sàng & Hiệu chỉnh liều:
          </div>
          ${dosingAdvice}
        </div>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
  };

  form.addEventListener("change", calculate);
  calculate();
}

// ============================================================================
// 6. MÁY TÍNH QUY ĐỔI LIỀU TƯƠNG ĐƯƠNG OPIOID LÂM SÀNG (EQUIANALGESIC)
// ============================================================================
function initOpioidConverter() {
  const form = document.getElementById("opioidForm");
  if (!form) return;

  const calculate = () => {
    const fromDrug = form.elements["opioidFromDrug"].value;
    const fromDose = parseFloat(form.elements["opioidFromDose"].value);
    const reductionRate = parseFloat(form.elements["opioidReduction"].value); // 0, 0.25, 0.5
    const resultBox = document.getElementById("opioidResultBox");

    if (!resultBox) return;

    if (isNaN(fromDose) || fromDose <= 0) {
      resultBox.innerHTML = `<div class="text-slate-400 text-xs text-center py-4">Nhập liều thuốc Opioid đang dùng để tính toán quy đổi.</div>`;
      return;
    }

    // Convert input dose to Oral Morphine Milligram Equivalent (OME / MME / ngày)
    let mme = 0;
    switch (fromDrug) {
      case "oral_morphine":
        mme = fromDose;
        break;
      case "iv_morphine":
        mme = fromDose * 3; // 10mg IV = 30mg Oral
        break;
      case "oral_oxycodone":
        mme = fromDose * 1.5; // 20mg Oxy = 30mg Oral Morphine
        break;
      case "oral_tramadol":
        mme = fromDose * 0.1; // 300mg Tramadol = 30mg Oral Morphine
        break;
      case "oral_codeine":
        mme = fromDose * 0.15; // 200mg Codeine = 30mg Oral Morphine
        break;
      case "iv_fentanyl":
        // 100mcg (0.1mg) IV Fentanyl = 10mg IV Morphine = 30mg Oral Morphine
        // So 1 mcg IV Fentanyl = 0.3 mg Oral Morphine
        mme = fromDose * 0.3;
        break;
      case "patch_fentanyl":
        // 25 mcg/h patch ~ 60 mg/day oral Morphine (factor 2.4)
        mme = fromDose * 2.4;
        break;
      default:
        mme = fromDose;
    }

    // Apply incomplete cross-tolerance reduction
    const finalMme = mme * (1 - reductionRate);

    // Calculate equivalent target doses for all other opioids
    const targets = [
      { name: "Morphine Uống (Oral)", dose: finalMme, unit: "mg/24h", route: "Đường uống (chia 2 - 4 lần)" },
      { name: "Morphine Tiêm TM/Dưới da (IV/SC)", dose: finalMme / 3, unit: "mg/24h", route: "Tiêm TM chậm hoặc PCA" },
      { name: "Oxycodone Uống", dose: finalMme / 1.5, unit: "mg/24h", route: "Đường uống (viên giải phóng kéo dài q12h)" },
      { name: "Fentanyl Miếng Dán Qua Da (TTS)", dose: finalMme / 2.4, unit: "mcg/giờ", route: "Dán ngoài da mỗi 72 giờ" },
      { name: "Fentanyl Tiêm Tĩnh Mạch (IV)", dose: finalMme / 0.3, unit: "mcg/24h", route: "Truyền TM liên tục hoặc PCA" },
      { name: "Tramadol Uống", dose: finalMme / 0.1, unit: "mg/24h", route: "Đường uống (tối đa 400mg/ngày)" },
      { name: "Codeine Uống", dose: finalMme / 0.15, unit: "mg/24h", route: "Đường uống (tối đa 360mg/ngày)" }
    ];

    resultBox.innerHTML = `
      <div class="space-y-3 pt-2">
        <div class="bg-indigo-50 border border-indigo-200 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <div class="text-[11px] font-bold text-indigo-900 uppercase">Tổng Tương Đương Morphine Uống (OME / MME):</div>
            <div class="text-xl font-black text-indigo-950 mt-0.5">
              ${Math.round(finalMme * 10) / 10} mg / 24 giờ
            </div>
            <div class="text-[11px] text-indigo-800 mt-0.5">
              ${reductionRate > 0 ? `Đã trừ ${reductionRate * 100}% dung nạp chéo an toàn (Incomplete cross-tolerance)` : 'Liều quy đổi danh định nguyên gốc (chưa trừ dung nạp chéo)'}
            </div>
          </div>
          <div class="text-right">
            <span class="px-2.5 py-1 rounded-lg text-xs font-bold ${finalMme >= 90 ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'}">
              ${finalMme >= 90 ? '⚠️ Nguy cơ cao (> 90 MME)' : '✓ Trong giới hạn (< 90 MME)'}
            </span>
          </div>
        </div>

        <div class="overflow-x-auto border border-slate-200 rounded-xl">
          <table class="min-w-full text-left text-xs divide-y divide-slate-200">
            <thead class="bg-slate-50 font-bold text-slate-700">
              <tr>
                <th class="px-3 py-2">Thuốc Opioid đích</th>
                <th class="px-3 py-2">Liều tương đương khuyến cáo</th>
                <th class="px-3 py-2">Đường dùng & Cách chia</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 bg-white">
              ${targets.map(t => `
                <tr class="hover:bg-slate-50">
                  <td class="px-3 py-2 font-bold text-slate-900">${t.name}</td>
                  <td class="px-3 py-2 font-mono font-black text-indigo-700">
                    ${Math.round(t.dose * 10) / 10} ${t.unit}
                  </td>
                  <td class="px-3 py-2 text-slate-600 text-[11px]">${t.route}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>

        <div class="text-[11px] text-slate-500 italic">
          * Khuyến cáo: Khi chuyển đổi sang Opioid khác, luôn giảm 25% - 50% liều tính toán để phòng ngừa quá liều suy hô hấp do hiện tượng dung nạp chéo không hoàn toàn!
        </div>
      </div>
    `;
  };

  form.addEventListener("input", calculate);
  calculate();
}

// ============================================================================
// 7. MÁY TÍNH KHÁNG SINH AMINOGLYCOSID CHẾ ĐỘ 1 LẦN/NGÀY (HARTFORD NOMOGRAM)
// ============================================================================
function initAminoglycosideCalc() {
  const form = document.getElementById("aminoForm");
  if (!form) return;

  const calculate = () => {
    const drug = form.elements["aminoDrug"].value; // "gentamicin" or "amikacin"
    const weight = parseFloat(form.elements["aminoWeight"].value);
    const height = parseFloat(form.elements["aminoHeight"].value);
    const gender = form.elements["aminoGender"].value;
    const crcl = parseFloat(form.elements["aminoCrcl"].value);
    const resultBox = document.getElementById("aminoResultBox");

    if (!resultBox) return;

    if (isNaN(weight) || isNaN(height) || isNaN(crcl) || weight <= 0 || height <= 0 || crcl <= 0) {
      resultBox.innerHTML = `<div class="text-slate-400 text-xs text-center py-4">Nhập cân nặng, chiều cao và CrCl để tính toán phác đồ Aminoglycosid.</div>`;
      return;
    }

    // 1. Calculate IBW
    const heightInches = height / 2.54;
    let ibw = gender === "male" ? 50 + 2.3 * (heightInches - 60) : 45.5 + 2.3 * (heightInches - 60);
    ibw = Math.max(ibw, 30);

    // 2. Determine Dosing Weight (Dose Weight)
    let dosingWeight = weight;
    let weightType = "Cân nặng thực tế (TBW)";
    if (weight > 1.2 * ibw) {
      // Obesity: Use Adjusted Body Weight (AdjBW)
      dosingWeight = ibw + 0.4 * (weight - ibw);
      weightType = `Cân nặng hiệu chỉnh béo phì AdjBW (${Math.round(dosingWeight * 10) / 10} kg)`;
    } else if (weight < ibw) {
      dosingWeight = weight;
      weightType = "Cân nặng thực tế (Gầy)";
    }

    // 3. Dose calculation
    let targetMgKg = drug === "gentamicin" ? 7 : 15; // 7mg/kg for Genta/Tobra, 15mg/kg for Amikacin
    let calculatedDose = dosingWeight * targetMgKg;
    // Round to convenient clinical increments
    let roundedDose = drug === "gentamicin" ? Math.round(calculatedDose / 20) * 20 : Math.round(calculatedDose / 50) * 50;

    // 4. Interval determination based on CrCl (Hartford Protocol)
    let interval = "Mỗi 24 giờ (Q24H)";
    let intervalBadge = "bg-emerald-100 text-emerald-900 border-emerald-300";
    let intervalAdvice = "Khoảng cách đưa liều chuẩn cho bệnh nhân chức năng thận tốt.";

    if (crcl >= 60) {
      interval = "Mỗi 24 giờ (Q24H)";
      intervalBadge = "bg-emerald-100 text-emerald-900 border-emerald-300";
      intervalAdvice = "Truyền TM trong 60 phút mỗi 24 giờ.";
    } else if (crcl >= 40 && crcl < 60) {
      interval = "Mỗi 36 giờ (Q36H)";
      intervalBadge = "bg-amber-100 text-amber-900 border-amber-300";
      intervalAdvice = "Giãn cách đưa liều lên mỗi 36 giờ để thận kịp đào thải thuốc về nồng độ đáy an toàn.";
    } else if (crcl >= 20 && crcl < 40) {
      interval = "Mỗi 48 giờ (Q48H)";
      intervalBadge = "bg-orange-100 text-orange-900 border-orange-300";
      intervalAdvice = "Giãn cách mỗi 48 giờ. Bắt buộc đo nồng độ đáy trước liều kế tiếp.";
    } else {
      interval = "KHÔNG KHUYẾN CÁO LIỀU CAO (CrCl < 20)";
      intervalBadge = "bg-rose-100 text-rose-900 border-rose-300";
      intervalAdvice = "Không áp dụng chế độ liều ngắt quãng mở rộng Hartford Nomogram. Chuyển sang phác đồ đa liều truyền thống hoặc TDM nồng độ đáy!";
    }

    resultBox.innerHTML = `
      <div class="space-y-3 pt-2">
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span class="text-slate-500 font-bold block">Thể trọng tính liều:</span>
            <span class="font-black text-slate-800">${weightType}</span>
          </div>
          <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span class="text-slate-500 font-bold block">Kháng sinh & Liều mục tiêu:</span>
            <span class="font-black text-teal-800">${drug === 'gentamicin' ? 'Gentamicin / Tobramycin (7 mg/kg)' : 'Amikacin (15 mg/kg)'}</span>
          </div>
        </div>

        <div class="bg-teal-50 border border-teal-200 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <div class="text-xs font-bold text-teal-900 uppercase">Liều khuyến cáo ban đầu:</div>
            <div class="text-2xl font-black text-teal-950 mt-0.5">
              ${roundedDose} mg <span class="text-xs font-normal text-teal-700">(${Math.round(calculatedDose)} mg)</span>
            </div>
            <div class="text-[11px] text-teal-800 mt-0.5">Pha trong 100ml NaCl 0.9% hoặc G5%, truyền TM trong 60 phút.</div>
          </div>
          <div class="text-right">
            <span class="px-3 py-1 rounded-xl text-xs font-black border ${intervalBadge}">
              ${interval}
            </span>
          </div>
        </div>

        <div class="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-950 space-y-1">
          <div class="font-bold flex items-center gap-1 text-amber-900">
            <i data-lucide="clock" class="w-3.5 h-3.5 text-amber-700"></i>
            Kế hoạch giám sát TDM theo Hartford Nomogram:
          </div>
          <p>• Lấy mẫu máu định lượng nồng độ thuốc ngẫu nhiên sau khi bắt đầu truyền <strong>6 - 14 giờ</strong> của liều đầu tiên.</p>
          <p>• Đối chiếu nồng độ với Nomogram Hartford: Nếu điểm rơi vào vùng 24h, 36h hoặc 48h thì điều chỉnh khoảng cách đưa liều tương ứng; Nếu rơi vào vùng "Too High" $\rightarrow$ Ngừng liều tiếp theo và chờ nồng độ đáy < 1 mcg/mL.</p>
        </div>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
  };

  form.addEventListener("input", calculate);
  calculate();
}
