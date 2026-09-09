/**
 * PHARMAVITA / CLINICALRX - CƠ SỞ DỮ LIỆU TƯƠNG DUNG & TƯƠNG KỴ ĐƯỜNG TIÊM TRUYỀN (IV COMPATIBILITY)
 * Tham chiếu Trissel's Handbook on Injectable Drugs & King Guide to Parenteral Admixtures
 */

export const IV_DRUGS = [
  { id: "vancomycin", name: "Vancomycin HCl", ph: "2.5 - 4.5 (Acid)" },
  { id: "meropenem", name: "Meropenem", ph: "7.3 - 8.3 (Trung tính - Kiềm nhẹ)" },
  { id: "furosemide", name: "Furosemide", ph: "8.0 - 9.3 (Kiềm)" },
  { id: "pantoprazole", name: "Pantoprazole", ph: "9.0 - 10.5 (Kiềm mạnh)" },
  { id: "amiodarone", name: "Amiodarone HCl", ph: "3.5 - 4.5 (Acid)" },
  { id: "norepinephrine", name: "Norepinephrine", ph: "3.0 - 4.5 (Acid)" },
  { id: "midazolam", name: "Midazolam", ph: "3.0 - 3.6 (Acid)" },
  { id: "potassium_chloride", name: "Potassium Chloride (KCl)", ph: "4.0 - 8.0" },
  { id: "heparin", name: "Heparin Sodium", ph: "5.0 - 8.0" },
  { id: "ceftriaxone", name: "Ceftriaxone", ph: "6.0 - 8.0" }
];

export const IV_FLUIDS = [
  { id: "ns", name: "Natri Clorid 0.9% (NS)", desc: "Dung dịch đẳng trương thông dụng nhất" },
  { id: "d5w", name: "Glucose 5% (D5W)", desc: "Dung dịch đường đẳng trương" },
  { id: "lr", name: "Ringer Lactat (LR)", desc: "Chứa Canxi ion hóa - Chống chỉ định pha Ceftriaxone" }
];

// Ma trận tương hợp Y-site giữa 2 thuốc tiêm
export const IV_PAIRS_COMPATIBILITY = [
  {
    pair: ["furosemide", "amiodarone"],
    status: "incompatible", // 🔴 TƯƠNG KỴ
    note: "TẠO TỦA TRẮNG ĐỤC TỨC THÌ: Furosemide có pH kiềm (8.0-9.3) làm Amiodarone (pH acid 3.5-4.5) mất tính tan và kết tủa tinh thể, gây tắc catheter và nguy cơ thuyên tắc mạch.",
    recommendation: "Tuyệt đối không truyền chung qua cùng chẽ ba (Y-site). Phải dùng đường truyền riêng biệt hoặc tráng rửa đường truyền bằng dung dịch trơ (Glucose 5%) trước và sau khi tiêm từng thuốc."
  },
  {
    pair: ["furosemide", "midazolam"],
    status: "incompatible",
    note: "KẾT TỦA NGAY: Midazolam kết tủa nhanh chóng khi tiếp xúc với môi trường kiềm của Furosemide.",
    recommendation: "Không truyền đồng thời qua chẽ ba Y-site."
  },
  {
    pair: ["vancomycin", "meropenem"],
    status: "incompatible",
    note: "Không tương thích vật lý tại nồng độ thông thường: Xuất hiện vẩn đục hoặc kết tủa phụ thuộc nồng độ.",
    recommendation: "Khuyến cáo truyền ngắt quãng ở các thời điểm khác nhau hoặc sử dụng 2 đường truyền tĩnh mạch riêng biệt."
  },
  {
    pair: ["ceftriaxone", "lr"],
    status: "incompatible",
    note: "TỬ VONG DO KẾT TỦA CANXI-CEFTRIAXONE: Canxi trong dịch truyền Ringer Lactat tạo muối Ceftriaxone-Canxi không tan kết tủa trong phổi và thận (đặc biệt nguy kịch ở trẻ sơ sinh).",
    recommendation: "CHỐNG CHỈ ĐỊNH TUYỆT ĐỐI pha Ceftriaxone vào dung dịch chứa Canxi (Ringer Lactat, Hartmann). Ở trẻ sơ sinh <= 28 ngày tuổi: Chống chỉ định dùng Ceftriaxone nếu có dùng bất kỳ dịch truyền chứa Canxi nào trong vòng 48 giờ."
  },
  {
    pair: ["amiodarone", "ns"],
    status: "incompatible",
    note: "KHÔNG PHA TRUYỀN AMIODARONE TRONG NATRI CLORID 0.9%: Dung dịch muối làm Amiodarone mất tính ổn định và tạo hạt tủa vi thể sau vài giờ.",
    recommendation: "BẮT BUỘC CHỈ PHA TRONG GLUCOSE 5% (D5W) và bảo quản trong chai thủy tinh hoặc túi dịch không chứa PVC (Polyolefin/EVA) nếu truyền kéo dài trên 2 giờ."
  },
  {
    pair: ["norepinephrine", "furosemide"],
    status: "incompatible",
    note: "Norepinephrine bị bất hoạt và biến màu (oxy hóa nhanh) trong môi trường kiềm của Furosemide.",
    recommendation: "Không dùng chung đường truyền Y-site."
  },
  {
    pair: ["norepinephrine", "midazolam"],
    status: "compatible", // 🟢 TƯƠNG HỢP
    note: "Tương thích vật lý và hóa học tại chẽ ba Y-site trong vòng 4 giờ.",
    recommendation: "Có thể truyền đồng thời qua cùng nhánh Y-site ở bệnh nhân hồi sức ICU có hạn chế đường truyền tĩnh mạch."
  },
  {
    pair: ["potassium_chloride", "furosemide"],
    status: "compatible",
    note: "Tương hợp tốt trong dung dịch truyền chuẩn.",
    recommendation: "Có thể pha chung hoặc truyền đồng thời (với điều kiện KCl đã được pha loãng đúng tỷ lệ an toàn, không tiêm bolus trực tiếp KCl)."
  },
  {
    pair: ["vancomycin", "heparin"],
    status: "incompatible",
    note: "Heparin tích điện âm tạo phức hợp kết tủa không tan với Vancomycin tích điện dương.",
    recommendation: "Phải tráng rửa catheter bằng NaCl 0.9% trước và sau khi tiêm Vancomycin nếu catheter có khóa Heparin."
  },
  {
    pair: ["pantoprazole", "midazolam"],
    status: "incompatible",
    note: "Pantoprazole pH kiềm rất cao (9.0-10.5) làm kết tủa Midazolam ngay lập tức.",
    recommendation: "Không truyền chung."
  }
];
