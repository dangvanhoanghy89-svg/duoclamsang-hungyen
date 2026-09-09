/**
 * PHARMAVITA / CLINICALRX - CƠ SỞ DỮ LIỆU TƯƠNG TÁC THUỐC LÂM SÀNG
 * Bệnh viện Đa khoa tỉnh Hưng Yên
 * Phân cấp theo chuẩn Dược thư Quốc gia Việt Nam 2022, Stockley's, Lexicomp
 * 
 * Tổng cộng: 52 cặp tương tác lâm sàng mức độ Nguy cơ cao & Chống chỉ định
 */

export const DRUG_INTERACTIONS = [
  {
    "pair": [
      "simvastatin",
      "clarithromycin"
    ],
    "severity": "contraindicated",
    "title": "Chống chỉ định tuyệt đối: Ức chế chuyển hóa Simvastatin & Nguy cơ tiêu cơ vân cấp tử vong",
    "mechanism": "Clarithromycin là chất ức chế cực mạnh cytochrom P450 3A4 (CYP3A4) và protein vận chuyển OATP1B1, làm giảm mạnh độ thanh thải tại gan và làm tăng nồng độ đỉnh cũng như AUC của Simvastatin trong huyết tương lên từ 10 đến 12 lần.",
    "clinicalImpact": "Nguy cơ rất cao xảy ra viêm cơ hoại tử, đau cơ dữ dội, tăng vọt men cơ Creatine Kinase (CK > 10 - 40 lần giới hạn trên bình thường) và Hội chứng Tiêu cơ vân cấp tính (Rhabdomyolysis) dẫn đến Myoglobin niệu, tắc ống thận cấp và suy thận cấp đe dọa tính mạng.",
    "recommendation": "CHỐNG CHỈ ĐỊNH PHỐI HỢP ĐỒNG THỜI (Theo Dược thư Quốc gia Việt Nam 2022 và Cảnh báo an toàn FDA). Bắt buộc TẠM NGỪNG SIMVASTATIN trong toàn bộ thời gian điều trị bằng Clarithromycin; hoặc thay thế bằng kháng sinh nhóm khác (như Amoxicillin/Acid Clavulanic, Cefuroxime) hoặc chuyển sang Statin không chuyển hóa qua CYP3A4 như Rosuvastatin liều thấp hoặc Pravastatin.",
    "evidenceLevel": "Mức độ 1 (Chống chỉ định tuyệt đối - Cảnh báo Dược thư Quốc gia & FDA Black Box)"
  },
  {
    "pair": [
      "amiodarone",
      "levofloxacin"
    ],
    "severity": "contraindicated",
    "title": "Chống chỉ định phối hợp: Kéo dài khoảng QTc & Loạn nhịp xoắn đỉnh (TdP)",
    "mechanism": "Cả hai thuốc đều có tác dụng ức chế kênh kali nội tâm mạc IKr (hERG), dẫn đến kéo dài thời gian tái cực thất và kéo dài khoảng QTc trên điện tâm đồ.",
    "clinicalImpact": "Kéo dài khoảng QTc hiệp đồng (> 500 ms) làm tăng vọt nguy cơ khởi phát loạn nhịp thất đa hình xoắn đỉnh (Torsades de Pointes), rung thất và ngừng tim đột ngột.",
    "recommendation": "TRÁNH PHỐI HỢP ĐỒNG THỜI. Lựa chọn kháng sinh khác không kéo dài khoảng QT (như Beta-lactam, Aminoglycoside). Nếu bắt buộc phải dùng: Phải mắc Monitor theo dõi điện tim liên tục, xét nghiệm bù đủ Kali máu (mục tiêu > 4.0 mEq/L) và Magnesi máu (mục tiêu > 2.0 mg/dL).",
    "evidenceLevel": "Mức độ 1 (Y văn & Cảnh báo FDA Black Box)"
  },
  {
    "pair": [
      "meropenem",
      "valproic_acid"
    ],
    "severity": "contraindicated",
    "title": "Chống chỉ định phối hợp: Giảm nồng độ Valproic Acid & Cơn co giật bùng phát",
    "mechanism": "Meropenem và các Carbapenem ức chế enzym acylpeptide hydrolase thủy phân glucuronide valproic, đồng thời thúc đẩy vận chuyển Valproic acid vào hồng cầu và tăng thanh thải, làm nồng độ valproic tụt dốc 60 - 80% chỉ trong 24 giờ.",
    "clinicalImpact": "Mất hoàn toàn khả năng kiểm soát động kinh, dẫn đến trạng thái động kinh liên tục (Status Epilepticus), tổn thương não không hồi phục.",
    "recommendation": "CHỐNG CHỈ ĐỊNH PHỐI HỢP. Không thể bù liều Valproate để vượt qua tương tác này. Bắt buộc đổi kháng sinh (sang Ceftriaxone, Levofloxacin...) hoặc tạm thời chuyển thuốc chống động kinh khác (Levetiracetam, Phenytoin).",
    "evidenceLevel": "Mức độ 1 (Khuyến cáo FDA & Dược thư Quốc gia)"
  },
  {
    "pair": [
      "vancomycin",
      "colistin"
    ],
    "severity": "major",
    "title": "Nguy cơ cao: Độc tính cộng hưởng trên thận (Suy thận cấp hoại tử ống thận)",
    "mechanism": "Cả Vancomycin và Colistin đều tích tụ và gây tổn thương tế bào biểu mô ống lượn gần theo cơ chế stress oxy hóa và phá vỡ tính toàn vẹn màng tế bào.",
    "clinicalImpact": "Tỷ lệ suy thận cấp (AKI) tăng lên tới 40% - 60% khi phối hợp đồng thời 2 thuốc này, đặc biệt ở bệnh nhân sốc nhiễm khuẩn hoặc nằm ICU.",
    "recommendation": "Nếu bắt buộc phối hợp vì vi khuẩn đa kháng: Bắt buộc bù đủ dịch duy trì thể tích tuần hoàn; Giám sát Creatinine máu và nước tiểu hàng ngày; Định lượng TDM nồng độ đáy Vancomycin và nồng độ Colistin; Cân nhắc đổi sang thuốc ít độc thận hơn nếu có kháng sinh đồ.",
    "evidenceLevel": "Rất cao"
  },
  {
    "pair": [
      "furosemide",
      "vancomycin"
    ],
    "severity": "major",
    "title": "Nguy cơ cao: Hiệp đồng độc tính trên tai (Gây điếc) & Độc tính thận",
    "mechanism": "Furosemide liều cao làm biến đổi nồng độ điện giải ở nội dịch tai trong, hiệp đồng với Vancomycin phá hủy tế bào lông của cơ quan Corti. Ngoài ra, Furosemide làm cô đặc máu giảm tưới máu thận làm tăng tích lũy Vancomycin.",
    "clinicalImpact": "Ù tai, giảm thính lực tiến triển hoặc điếc vĩnh viễn; Tăng tỷ lệ suy giảm chức năng lọc cầu thận.",
    "recommendation": "Tránh dùng liều cao Furosemide tiêm tĩnh mạch nhanh (tiêm không quá 4mg/phút). Theo dõi nồng độ đáy Vancomycin chặt chẽ; hỏi bệnh nhân về triệu chứng ù tai hoặc cảm giác đầy tai.",
    "evidenceLevel": "Cao"
  },
  {
    "pair": [
      "clarithromycin",
      "amiodarone"
    ],
    "severity": "contraindicated",
    "title": "Chống chỉ định phối hợp: Kéo dài khoảng QTc & Ức chế chuyển hóa Amiodarone",
    "mechanism": "Clarithromycin vừa kéo dài khoảng QT, vừa là chất ức chế CYP3A4 làm tăng nồng độ Amiodarone trong máu.",
    "clinicalImpact": "Kéo dài khoảng QTc nghiêm trọng, nguy cơ xoắn đỉnh và ngừng tim rất cao.",
    "recommendation": "CHỐNG CHỈ ĐỊNH PHỐI HỢP. Chọn kháng sinh nhóm khác an toàn về mặt tim mạch.",
    "evidenceLevel": "Mức độ 1"
  },
  {
    "pair": [
      "metformin",
      "furosemide"
    ],
    "severity": "moderate",
    "title": "Thận trọng theo dõi: Tăng nồng độ Metformin & Nguy cơ toan Lactic",
    "mechanism": "Furosemide có thể làm tăng nồng độ đỉnh của Metformin trong huyết tương lên khoảng 22%, đồng thời giảm bài tiết qua thận. Tình trạng mất nước do lợi tiểu cũng làm giảm tưới máu thận.",
    "clinicalImpact": "Tăng nguy cơ tích lũy Metformin gây nhiễm toan Lactic ở bệnh nhân có tổn thương thận tiềm ẩn.",
    "recommendation": "Theo dõi chức năng thận (Creatinine, eGFR) và điện giải. Điều chỉnh liều nếu bệnh nhân có dấu hiệu mất nước hoặc suy giảm eGFR.",
    "evidenceLevel": "Trung bình"
  },
  {
    "pair": [
      "levofloxacin",
      "methylprednisolone"
    ],
    "severity": "major",
    "title": "Nguy cơ nghiêm trọng: Đứt gân gót chân (Achilles tendon rupture)",
    "mechanism": "Fluoroquinolone gây độc trực tiếp trên tế bào gân và ức chế tổng hợp collagen type 1. Corticosteroid ức chế phân bào nguyên bào sợi và làm yếu cấu trúc mô liên kết.",
    "clinicalImpact": "Tỷ lệ viêm gân và đứt gân (đặc biệt là gân gót Achilles) tăng gấp 3 đến 6 lần so với dùng đơn độc từng thuốc, có thể xảy ra ở cả người trẻ lẫn người cao tuổi.",
    "recommendation": "CÂN NHẮC KỸ LỢI ÍCH - NGUY CƠ. Tránh phối hợp nếu có kháng sinh thay thế. Dặn dò bệnh nhân ngừng tập thể thao cường độ cao, báo ngay cho nhân viên y tế nếu xuất hiện đau, sưng vùng gót chân.",
    "evidenceLevel": "Cảnh báo FDA Black Box"
  },
  {
    "pair": [
      "warfarin",
      "celecoxib"
    ],
    "severity": "major",
    "title": "Nguy cơ cao: Xuất huyết tiêu hóa ồ ạt & Tăng chỉ số INR",
    "mechanism": "Celecoxib ức chế enzym CYP2C9 (enzym chuyển hóa chính của S-warfarin), đồng thời ức chế COX-2 làm mất prostaglandin bảo vệ niêm mạc dạ dày.",
    "clinicalImpact": "Làm tăng nồng độ Warfarin tự do và đẩy INR tăng vọt, kết hợp tổn thương niêm mạc dạ dày gây loét và xuất huyết tiêu hóa dữ dội.",
    "recommendation": "Tránh dùng chung nếu có thể. Nếu đau cơ xương khớp, ưu tiên dùng Paracetamol hoặc giảm đau tại chỗ. Nếu bắt buộc phối hợp: Giảm liều Warfarin, theo dõi INR sau 3 - 5 ngày và bắt buộc kèm thuốc PPI bảo vệ dạ dày.",
    "evidenceLevel": "Rất cao"
  },
  {
    "pair": [
      "digoxin",
      "amiodarone"
    ],
    "severity": "major",
    "title": "Nguy cơ cao: Tăng gấp đôi nồng độ Digoxin & Ngộ độc Glycosid tim",
    "mechanism": "Amiodarone ức chế mạnh bơm tống thuốc P-glycoprotein (P-gp) ở thận và ruột, làm giảm đào thải Digoxin qua nước tiểu từ 30% đến 50%.",
    "clinicalImpact": "Nồng độ Digoxin trong máu tăng vọt từ 70% đến 100% trong vòng vài ngày, gây ngộ độc Digoxin cấp tính: Block nhĩ thất hoàn toàn, loạn nhịp thất chết người, nhìn mờ quầng vàng.",
    "recommendation": "KHI BẮT ĐẦU DÙNG AMIODARONE: Bắt buộc GIẢM NGAY 50% LIỀU DIGOXIN. Định lượng lại nồng độ đáy Digoxin máu sau 1 tuần và theo dõi sát điện tâm đồ.",
    "evidenceLevel": "Chắc chắn (Tương tác kinh điển Dược thư Quốc gia)"
  },
  {
    "pair": [
      "digoxin",
      "furosemide"
    ],
    "severity": "major",
    "title": "Nguy cơ cao: Hạ Kali/Magnesi máu kích hoạt ngộ độc Digoxin gây loạn nhịp tim",
    "mechanism": "Furosemide là lợi tiểu quai làm tăng bài tiết Kali và Magnesi qua ống thận. Tình trạng hạ Kali máu làm tăng gắn kết Digoxin vào thụ thể Na+/K+ ATPase trên màng tế bào cơ tim.",
    "clinicalImpact": "Khởi phát các loạn nhịp tim nguy hiểm đe dọa tính mạng (nhịp nhanh thất, rung thất, ngoại tâm thu thất chùm) ngay cả khi nồng độ Digoxin trong máu nằm trong khoảng tham chiếu bình thường!",
    "recommendation": "Luôn kiểm tra điện giải đồ thường xuyên. Bù Kali duy trì nồng độ K+ máu > 4.0 mEq/L và Mg2+ > 2.0 mg/dL. Cân nhắc phối hợp Spironolactone liều thấp để giữ Kali nếu phù hợp.",
    "evidenceLevel": "Mức độ 1 (Y văn kinh điển)"
  },
  {
    "pair": [
      "spironolactone",
      "enalapril"
    ],
    "severity": "major",
    "title": "Nguy cơ cao: Tăng Kali máu ác tính (> 6.0 mmol/L) & Ngừng tim",
    "mechanism": "Enalapril (ức chế men chuyển ACEi) làm giảm tiết Aldosterone từ vỏ thượng thận, kết hợp với Spironolactone là chất đối kháng trực tiếp thụ thể Aldosterone tại ống lượn xa, làm triệt tiêu hoàn toàn khả năng bài tiết Kali qua thận.",
    "clinicalImpact": "Tăng vọt nồng độ Kali huyết thanh dẫn đến block nhĩ thất, giãn rộng phức bộ QRS, rung thất và ngừng tim đột ngột, đặc biệt ở bệnh nhân suy giảm chức năng thận.",
    "recommendation": "Mặc dù đây là phác đồ phối hợp chuẩn trong suy tim HFrEF (tứ trụ), BẮT BUỘC: (1) Không khởi đầu nếu K+ > 5.0 mmol/L hoặc eGFR < 30 mL/phút; (2) Xét nghiệm K+ máu và Creatinine tại thời điểm 1 tuần, 4 tuần và mỗi 3 tháng; (3) Cấm dùng kèm viên uống bổ sung Kali.",
    "evidenceLevel": "Rất cao (Khuyến cáo AHA/ESC/Hội Tim Mạch VN)"
  },
  {
    "pair": [
      "spironolactone",
      "losartan"
    ],
    "severity": "major",
    "title": "Nguy cơ cao: Tăng Kali máu nghiêm trọng do hiệp đồng ức chế hệ RAAS",
    "mechanism": "Losartan ức chế thụ thể AT1 của Angiotensin II làm giảm tổng hợp Aldosterone, cộng hưởng với tác dụng kháng thụ thể Aldosterone của Spironolactone gây giữ Kali tại thận.",
    "clinicalImpact": "Tăng Kali máu tiến triển âm thầm, gây mệt mỏi, yếu liệt cơ tứ chi và rối loạn dẫn truyền tim ác tính.",
    "recommendation": "Kiểm tra chức năng thận và Kali máu định kỳ. Khởi đầu Spironolactone ở liều thấp 12.5 - 25 mg/ngày. Dặn bệnh nhân tránh các loại thực phẩm hoặc muối ăn thay thế chứa nhiều Kali.",
    "evidenceLevel": "Rất cao"
  },
  {
    "pair": [
      "piperacillin_tazobactam",
      "vancomycin"
    ],
    "severity": "major",
    "title": "Nguy cơ cao: Tổn thương thận cấp hiệp đồng (Synergistic AKI)",
    "mechanism": "Cơ chế hiệp đồng gây tổn thương mô kẽ và hoại tử ống thận cấp. Phối hợp Piperacillin/Tazobactam làm chậm thanh thải Vancomycin và làm tăng tích tụ Vancomycin trong biểu mô ống thận.",
    "clinicalImpact": "Tỷ lệ suy thận cấp (AKI) tăng vọt từ 8-10% lên tới 25-35% ở bệnh nhân ICU so với khi phối hợp Vancomycin + Cefepime hoặc Vancomycin + Meropenem.",
    "recommendation": "Nếu có thể thay thế, ưu tiên phối hợp Vancomycin với Meropenem hoặc Cefepime ở bệnh nhân có sẵn bệnh thận hoặc đang dùng các thuốc độc thận khác. Nếu bắt buộc phối hợp: Giám sát Creatinine máu hàng ngày, duy trì nồng độ đáy Vancomycin <= 15-20 mcg/mL.",
    "evidenceLevel": "Nhiều phân tích gộp (Meta-analysis) & Khuyến cáo IDSA"
  },
  {
    "pair": [
      "gentamicin",
      "vancomycin"
    ],
    "severity": "major",
    "title": "Nguy cơ cao: Độc tính cộng hưởng trên Thính giác & Thận",
    "mechanism": "Cả hai kháng sinh đều tích tụ nồng độ cao tại tế bào biểu mô ống lượn gần và các tế bào lông ở ốc tai/tiền đình, gây stress oxy hóa và chết tế bào theo chương trình.",
    "clinicalImpact": "Tăng vọt nguy cơ hoại tử ống thận cấp gây thiểu niệu suy thận; Giảm thính lực vĩnh viễn không hồi phục hoặc chóng mặt mất thăng bằng tiền đình dữ dội.",
    "recommendation": "Hạn chế thời gian phối hợp tối đa <= 3 - 5 ngày. Bắt buộc thực hiện TDM đo nồng độ đỉnh và đáy của cả hai thuốc. Chuyển Gentamicin sang chế độ liều 1 lần/ngày (OEDA) để giảm tích lũy độc tính thận.",
    "evidenceLevel": "Mức độ 1 (Y văn chuẩn)"
  },
  {
    "pair": [
      "atorvastatin",
      "clarithromycin"
    ],
    "severity": "major",
    "title": "Nguy cơ cao: Tăng nồng độ Statin & Hội chứng tiêu cơ vân cấp",
    "mechanism": "Clarithromycin là chất ức chế mạnh CYP3A4, làm giảm chuyển hóa bước một tại gan của Atorvastatin, làm tăng nồng độ đỉnh và AUC của Atorvastatin lên từ 3 đến 5 lần.",
    "clinicalImpact": "Tổn thương cơ vân cấp tính, đau cơ dữ dội, tăng nồng độ men Creatine Kinase (CK > 10 lần ULN), Myoglobin niệu gây tắc ống thận cấp và suy thận cấp.",
    "recommendation": "Tạm ngừng Atorvastatin trong suốt đợt điều trị Clarithromycin; hoặc thay thế bằng Azithromycin (không chuyển hóa qua CYP3A4) hoặc Rosuvastatin liều thấp (<= 10mg/ngày) nếu bắt buộc.",
    "evidenceLevel": "Rất cao (Cảnh báo FDA)"
  },
  {
    "pair": [
      "morphine",
      "diazepam"
    ],
    "severity": "contraindicated",
    "title": "Chống chỉ định phối hợp không kiểm soát: Ức chế hô hấp sâu & Hôn mê tử vong",
    "mechanism": "Cộng hưởng tác dụng ức chế hệ thần kinh trung ương và trung tâm hô hấp ở hành não thông qua kích thích đồng thời thụ thể Opioid Mu và thụ thể GABA-A.",
    "clinicalImpact": "Suy hô hấp cấp tính, giảm tần số thở trầm trọng (< 8 lần/phút), ứ đọng CO2 gây toan hô hấp, tụt huyết áp, hôn mê sâu và tử vong nhanh chóng nếu không được cấp cứu kịp thời.",
    "recommendation": "TRÁNH PHỐI HỢP TRỪ KHI BỆNH NHÂN ĐÃ ĐƯỢC ĐẶT NỘI KHÍ QUẢN THỞ MÁY TẠI ICU. Luôn chuẩn bị sẵn Naloxone và Flumazenil cùng bóng Ambu hỗ trợ hô hấp.",
    "evidenceLevel": "FDA Black Box Warning (Cảnh báo hộp đen cao nhất)"
  },
  {
    "pair": [
      "fentanyl",
      "midazolam"
    ],
    "severity": "contraindicated",
    "title": "Nguy cơ cao / Chống chỉ định ngoài ICU: Ngừng thở & Tụt huyết áp kịch phát",
    "mechanism": "Tác dụng hiệp đồng ức chế thụ thể GABA và Mu-opioid làm triệt tiêu phản xạ hô hấp tự nhiên và làm giãn mạch ngoại vi.",
    "clinicalImpact": "Ngừng thở đột ngột trong vòng 1 - 2 phút sau tiêm, tụt huyết áp nặng.",
    "recommendation": "Chỉ sử dụng phối hợp khi có Bác sĩ Gây mê hồi sức hoặc Hồi sức tích cực trực tiếp theo dõi, bệnh nhân đã có đường thở nhân tạo và máy thở hoạt động.",
    "evidenceLevel": "Khuyến cáo Gây mê Hồi sức lâm sàng"
  },
  {
    "pair": [
      "ciprofloxacin",
      "amiodarone"
    ],
    "severity": "contraindicated",
    "title": "Chống chỉ định phối hợp: Kéo dài khoảng QTc & Loạn nhịp xoắn đỉnh (TdP)",
    "mechanism": "Cả Ciprofloxacin và Amiodarone đều kéo dài thời gian tái cực thất thông qua ức chế dòng kali IKr (hERG).",
    "clinicalImpact": "Kéo dài khoảng QTc hiệp đồng (> 500 ms) kích hoạt loạn nhịp thất đa hình dạng xoắn đỉnh (Torsades de Pointes) và đột tử do tim.",
    "recommendation": "CHỐNG CHỈ ĐỊNH DÙNG CHUNG. Thay thế Ciprofloxacin bằng nhóm Beta-lactam hoặc Aminoglycoside không gây độc trên điện tim.",
    "evidenceLevel": "Mức độ 1"
  },
  {
    "pair": [
      "insulin_regular",
      "enalapril"
    ],
    "severity": "moderate",
    "title": "Thận trọng: Tăng nguy cơ hạ đường huyết ở bệnh nhân đái tháo đường",
    "mechanism": "Thuốc ức chế men chuyển làm tăng nồng độ Bradykinin, từ đó làm tăng nhạy cảm của thụ thể Insulin tại mô cơ và mô mỡ, thúc đẩy tiêu thụ glucose.",
    "clinicalImpact": "Có thể gây hạ đường huyết đột ngột không dự đoán trước, đặc biệt trong những tuần đầu phối hợp.",
    "recommendation": "Hướng dẫn bệnh nhân nhận biết các dấu hiệu hạ đường huyết (run rẩy, đói cồn cào, vã mồ hôi). Theo dõi đường huyết mao mạch chặt chẽ hơn và sẵn sàng giảm nhẹ liều Insulin.",
    "evidenceLevel": "Trung bình"
  },
  {
    "pair": [
      "digoxin",
      "amiodarone"
    ],
    "severity": "major",
    "title": "Nguy cơ cao: Tăng gấp đôi nồng độ Digoxin & Ngộ độc Digitalis tử vong",
    "mechanism": "Amiodarone ức chế mạnh bơm P-glycoprotein tại thận và ruột, làm giảm đào thải Digoxin qua nước tiểu và giảm thể tích phân bố, đẩy nồng độ Digoxin trong huyết thanh tăng từ 70% đến 100%.",
    "clinicalImpact": "Gây ngộ độc Digoxin cấp tính: Loạn nhịp tim chậm nguy hiểm, block nhĩ thất hoàn toàn, nhịp nhanh thất, ngoại tâm thu thất dạng nhịp đôi (Bigeminy), buồn nôn, rối loạn thị giác nhìn màu vàng.",
    "recommendation": "BẮT BUỘC GIẢM 50% LIỀU DIGOXIN ngay khi bắt đầu dùng Amiodarone. Theo dõi nồng độ Digoxin huyết thanh sau 7 - 14 ngày và làm điện tâm đồ ECG định kỳ.",
    "evidenceLevel": "Mức độ 1 (Y văn kinh điển tim mạch)"
  },
  {
    "pair": [
      "spironolactone",
      "enalapril"
    ],
    "severity": "major",
    "title": "Nguy cơ cao: Tăng Kali máu ác tính đe dọa ngừng tim",
    "mechanism": "Cả hai thuốc đều ức chế trục Renin-Angiotensin-Aldosterone (Enalapril ức chế sản sinh Aldosterone; Spironolactone chẹn thụ thể Aldosterone tại ống lượn xa), làm giảm bài tiết Kali qua nước tiểu.",
    "clinicalImpact": "Nồng độ Kali máu có thể tăng vọt > 6.0 - 6.5 mmol/L gây loạn nhịp thất nguy hiểm, sóng T nhọn khổng lồ, phức bộ QRS giãn rộng và ngừng tim đột ngột.",
    "recommendation": "Nếu phối hợp trong điều trị suy tim theo khuyến cáo GDMT: Bắt đầu Spironolactone liều thấp (12.5 - 25 mg/ngày); Bắt buộc kiểm tra Kali máu và Creatinine sau 1 tuần, 1 tháng và mỗi 3 - 6 tháng; Chống chỉ định nếu Kali máu ban đầu > 5.0 mmol/L hoặc eGFR < 30 mL/phút.",
    "evidenceLevel": "Rất cao (Khuyến cáo AHA/ESC Heart Failure)"
  },
  {
    "pair": [
      "perindopril",
      "spironolactone"
    ],
    "severity": "major",
    "title": "Nguy cơ cao: Hiệp đồng giữ Kali gây tăng Kali máu trầm trọng",
    "mechanism": "Ức chế hiệp đồng trục RAAS làm mất hoàn toàn khả năng bài tiết ion Kali của ống lượn xa và ống góp thận.",
    "clinicalImpact": "Tăng Kali máu nặng dẫn đến yếu cơ liệt mềm cơ hô hấp và ngừng tim kỳ tâm trương.",
    "recommendation": "Giám sát điện giải đồ chặt chẽ. Dặn dò bệnh nhân TUYỆT ĐỐI KHÔNG TỰ Ý DÙNG THỰC PHẨM CHỨC NĂNG BỔ SUNG KALI hoặc muối ăn thay thế chứa KCl.",
    "evidenceLevel": "Rất cao"
  },
  {
    "pair": [
      "fluconazole",
      "warfarin"
    ],
    "severity": "major",
    "title": "Nguy cơ cao: Ức chế chuyển hóa Warfarin & Xuất huyết ồ ạt",
    "mechanism": "Fluconazole là chất ức chế mạnh CYP2C9 (enzym chủ đạo chuyển hóa S-warfarin có hoạt tính chống đông mạnh gấp 5 lần R-warfarin).",
    "clinicalImpact": "Làm chỉ số INR tăng vọt (thường > 5.0 - 10.0), gây nguy cơ xuất huyết não, xuất huyết tiêu hóa và đái ra máu đe dọa tính mạng.",
    "recommendation": "Khi bắt buộc phối hợp: GIẢM NGAY 25% - 50% LIỀU WARFARIN. Kiểm tra INR sau 2 - 3 ngày và điều chỉnh liều kịp thời.",
    "evidenceLevel": "Mức độ 1 (Y văn chuẩn)"
  },
  {
    "pair": [
      "flumazenil",
      "diazepam"
    ],
    "severity": "major",
    "title": "Cảnh báo cấp cứu: Hiện tượng tái hôn mê (Resedation) & Nguy cơ co giật bùng phát",
    "mechanism": "Flumazenil có thời gian bán thải rất ngắn (40 - 80 phút) trong khi Diazepam và các chất chuyển hóa có hoạt tính tồn tại trong cơ thể hàng chục giờ.",
    "clinicalImpact": "Bệnh nhân có thể tỉnh táo ngay lập tức sau tiêm nhưng sau 1 - 2 giờ lại rơi vào hôn mê suy hô hấp trở lại; Bệnh nhân dùng Diazepam dài ngày có thể xuất hiện hội chứng cai bùng phát cơn co giật kháng trị.",
    "recommendation": "THEO DÕI SÁT TRI GIÁC VÀ HÔ HẤP TRONG ÍT NHẤT 2 - 4 GIỜ TẠI PHÒNG HỒI TỈNH. Sẵn sàng tiêm nhắc lại Flumazenil hoặc truyền liên tục nếu tái hôn mê.",
    "evidenceLevel": "Khuyến cáo Cấp cứu Chống độc"
  },
  {
    "pair": [
      "calcium_gluconate",
      "ceftriaxone"
    ],
    "severity": "contraindicated",
    "title": "Chống chỉ định tuyệt đối: Kết tủa Canxi - Ceftriaxone tắc mạch tử vong",
    "mechanism": "Muối Ceftriaxone tạo phức chelat không tan với ion Canxi tạo thành các tinh thể vi kết tủa trong lòng mạch máu.",
    "clinicalImpact": "Gây lắng đọng kết tủa dạng sỏi canxi trong vi mạch phổi và thận, suy hô hấp cấp và tử vong ở trẻ sơ sinh và trẻ nhỏ.",
    "recommendation": "CHỐNG CHỈ ĐỊNH TUYỆT ĐỐI DÙNG CHUNG ĐƯỜNG TRUYỀN HOẶC TRUYỀN ĐỒNG THỜI Ở TRẺ SƠ SINH (KỂ CẢ TRUYỀN QUA CÁC ĐƯỜNG RIÊNG RẼ TRONG VÒNG 48 GIỜ). Ở người lớn: Bắt buộc tráng rửa đường truyền thật kỹ bằng NaCl 0.9% giữa 2 lần tiêm.",
    "evidenceLevel": "FDA Black Box Warning (Cảnh báo hộp đen)"
  },
  {
    "pair": [
      "amlodipine",
      "simvastatin"
    ],
    "severity": "major",
    "title": "Nguy cơ cao: Tăng nồng độ Simvastatin & Nguy cơ tiêu cơ vân",
    "mechanism": "Amlodipine ức chế nhẹ enzym CYP3A4 tại gan và ruột, làm tăng nồng độ Simvastatin trong máu lên khoảng 1.5 - 2 lần.",
    "clinicalImpact": "Tăng nguy cơ viêm cơ, đau cơ và tiêu cơ vân cấp tính (Rhabdomyolysis) dẫn đến suy thận cấp do myoglobin.",
    "recommendation": "GIỚI HẠN LIỀU SIMVASTATIN TỐI ĐA 20 mg/NGÀY khi phối hợp với Amlodipine (theo cảnh báo FDA). Hoặc chuyển sang Statin ít chuyển hóa qua CYP3A4 như Rosuvastatin hoặc Pravastatin.",
    "evidenceLevel": "Mức độ 1 (Cảnh báo FDA & Thông tư Dược lâm sàng)"
  },
  {
    "pair": [
      "clopidogrel",
      "omeprazole"
    ],
    "severity": "major",
    "title": "Tương tác nghiêm trọng: Giảm hoạt tính kháng kết tập tiểu cầu của Clopidogrel",
    "mechanism": "Omeprazole ức chế mạnh CYP2C19 (enzym chính chuyển Clopidogrel thành dạng chất chuyển hóa có hoạt tính chống đông), làm giảm 40-50% lượng chất chuyển hóa có hoạt tính.",
    "clinicalImpact": "Làm mất tác dụng bảo vệ tim mạch của Clopidogrel, tăng nguy cơ tái tắc mạch vành, huyết khối trong stent và nhồi máu cơ tim tái phát.",
    "recommendation": "TRÁNH PHỐI HỢP ĐỒNG THỜI. Chuyển sang dùng PPI ít hoặc không ức chế CYP2C19 như PANTOPRAZOLE hoặc RABEPRAZOLE để bảo vệ dạ dày.",
    "evidenceLevel": "Mức độ 1 (Cảnh báo FDA & Hội Tim mạch Châu Âu ESC)"
  },
  {
    "pair": [
      "aspirin",
      "clopidogrel"
    ],
    "severity": "moderate",
    "title": "Liệu pháp kháng tiểu cầu kép (DAPT): Tăng nguy cơ xuất huyết tiêu hóa",
    "mechanism": "Hiệp đồng tác dụng ức chế kết tập tiểu cầu qua 2 con đường độc lập: ức chế Thromboxane A2 (Aspirin) và ức chế thụ thể P2Y12 (Clopidogrel).",
    "clinicalImpact": "Tăng tỷ lệ chảy máu dạ dày, xuất huyết tiêu hóa và bầm máu dưới da. Tuy nhiên, đây là phác đồ chuẩn bắt buộc sau đặt stent mạch vành hoặc hội chứng vành cấp.",
    "recommendation": "Kê kèm thuốc ức chế bơm proton (Pantoprazole) để bảo vệ dạ dày ở bệnh nhân có yếu tố nguy cơ (tuổi > 65, tiền sử loét). Theo dõi sát công thức máu và phân.",
    "evidenceLevel": "Hướng dẫn thực hành chuẩn AHA/ESC"
  },
  {
    "pair": [
      "aspirin",
      "warfarin"
    ],
    "severity": "major",
    "title": "Nguy cơ cao: Phối hợp chống đông và kháng tiểu cầu gây xuất huyết nặng",
    "mechanism": "Aspirin làm tổn thương trực tiếp niêm mạc dạ dày và ức chế chức năng tiểu cầu, phối hợp với tác dụng chống đông giảm các yếu tố đông máu của Warfarin.",
    "clinicalImpact": "Nguy cơ xuất huyết tiêu hóa trên ồ ạt và xuất huyết não tăng gấp 3-5 lần so với dùng đơn trị liệu.",
    "recommendation": "Chỉ phối hợp khi có chỉ định tim mạch đặc biệt (van tim cơ học kèm hội chứng vành cấp). Bắt buộc dùng kèm PPI (Pantoprazole) và duy trì INR ở cận dưới của khoảng đích (2.0 - 2.5).",
    "evidenceLevel": "Rất cao"
  },
  {
    "pair": [
      "warfarin",
      "diclofenac"
    ],
    "severity": "major",
    "title": "Nguy cơ cao: NSAID hiệp đồng gây loét dạ dày & Xuất huyết ồ ạt",
    "mechanism": "Diclofenac ức chế COX-1 làm mất lớp màng bảo vệ dạ dày, đồng thời ức chế kết tập tiểu cầu và có thể làm tăng nhẹ nồng độ Warfarin tự do qua cạnh tranh gắn protein huyết tương.",
    "clinicalImpact": "Tăng vọt nguy cơ xuất huyết tiêu hóa nặng đe dọa tính mạng.",
    "recommendation": "TRÁNH PHỐI HỢP NSAID VỚI WARFARIN. Ưu tiên giảm đau bằng Paracetamol liều < 2g/ngày hoặc thuốc giảm đau bôi tại chỗ. Nếu bắt buộc dùng NSAID, phải dùng liều thấp nhất trong thời gian ngắn nhất kèm PPI.",
    "evidenceLevel": "Chắc chắn (Tương tác kinh điển)"
  },
  {
    "pair": [
      "warfarin",
      "ibuprofen"
    ],
    "severity": "major",
    "title": "Nguy cơ cao: Tăng nguy cơ xuất huyết tiêu hóa nghiêm trọng",
    "mechanism": "Ibuprofen gây tổn thương ăn mòn niêm mạc dạ dày và ức chế tiểu cầu, hiệp đồng với hiệu ứng chống đông máu của Warfarin.",
    "clinicalImpact": "Xuất huyết tiêu hóa, chảy máu kéo dài.",
    "recommendation": "Tránh dùng đồng thời. Khuyên bệnh nhân không tự ý mua các thuốc cảm sốt giảm đau chứa Ibuprofen khi đang điều trị Warfarin.",
    "evidenceLevel": "Chắc chắn"
  },
  {
    "pair": [
      "warfarin",
      "naproxen"
    ],
    "severity": "major",
    "title": "Nguy cơ cao: Xuất huyết tiêu hóa nặng khi dùng cùng Naproxen",
    "mechanism": "Naproxen ức chế COX-1 kéo dài, gây trợt loét niêm mạc đường tiêu hóa và ức chế tiểu cầu.",
    "clinicalImpact": "Nguy cơ chảy máu đường tiêu hóa tăng gấp 4-6 lần.",
    "recommendation": "Tránh dùng phối hợp. Ưu tiên Paracetamol hoặc Opioid yếu nếu cần giảm đau.",
    "evidenceLevel": "Cao"
  },
  {
    "pair": [
      "captopril",
      "spironolactone"
    ],
    "severity": "major",
    "title": "Nguy cơ cao: Tăng Kali máu ác tính đe dọa tính mạng",
    "mechanism": "Captopril ức chế sản sinh Aldosterone kết hợp Spironolactone chẹn thụ thể Aldosterone làm thận mất khả năng thải trừ Kali.",
    "clinicalImpact": "Tăng Kali máu nhanh chóng dẫn đến rối loạn nhịp tim nguy hiểm.",
    "recommendation": "Giám sát điện giải đồ chặt chẽ. Cấm dùng các thực phẩm chức năng bổ sung Kali hoặc muối ăn kiêng chứa KCl.",
    "evidenceLevel": "Rất cao"
  },
  {
    "pair": [
      "lisinopril",
      "spironolactone"
    ],
    "severity": "major",
    "title": "Nguy cơ cao: Hiệp đồng giữ Kali gây tăng Kali máu trầm trọng",
    "mechanism": "Ức chế kép hệ renin-angiotensin-aldosterone làm giảm tối đa sự bài tiết kali qua nước tiểu.",
    "clinicalImpact": "Tăng Kali máu nặng, sóng T nhọn, ngừng tim kỳ tâm trương.",
    "recommendation": "Kiểm tra điện giải đồ trước và sau khi bắt đầu dùng 1 tuần. Không dùng nếu Creatinine > 200 umol/L hoặc Kali > 5.0 mmol/L.",
    "evidenceLevel": "Rất cao"
  },
  {
    "pair": [
      "enalapril",
      "ibuprofen"
    ],
    "severity": "major",
    "title": "Hội chứng 'Triple Whammy': Nguy cơ suy thận cấp & Giảm tác dụng hạ áp",
    "mechanism": "Ibuprofen ức chế prostaglandin làm co tiểu động mạch đến của cầu thận; Enalapril làm giãn tiểu động mạch đi. Hậu quả là áp lực lọc cầu thận tụt dốc thê thảm.",
    "clinicalImpact": "Suy thận cấp (AKI), giữ nước gây phù và huyết áp tăng vọt mất kiểm soát.",
    "recommendation": "Tránh phối hợp kéo dài. Nếu cần giảm đau cho bệnh nhân đang dùng ACEi: Ưu tiên Paracetamol. Nếu bắt buộc dùng NSAID: Theo dõi Creatinine và huyết áp.",
    "evidenceLevel": "Rất cao"
  },
  {
    "pair": [
      "perindopril",
      "diclofenac"
    ],
    "severity": "major",
    "title": "Nguy cơ cao: Suy giảm chức năng thận cấp & Giảm hiệu quả hạ áp",
    "mechanism": "Diclofenac ức chế tổng hợp prostaglandin tại thận làm co mạch thận, đối kháng tác dụng giãn mạch hạ áp của Perindopril.",
    "clinicalImpact": "Tăng huyết áp trở lại, ứ trệ natri nước, suy thận cấp ở người cao tuổi.",
    "recommendation": "Hạn chế tối đa dùng NSAID ở bệnh nhân đang dùng thuốc ức chế men chuyển.",
    "evidenceLevel": "Cao"
  },
  {
    "pair": [
      "digoxin",
      "verapamil"
    ],
    "severity": "major",
    "title": "Nguy cơ cao: Tăng 60-90% nồng độ Digoxin & Block tim hoàn toàn",
    "mechanism": "Verapamil ức chế P-glycoprotein làm giảm độ thanh thải Digoxin qua thận và qua mật, đồng thời cả 2 thuốc đều làm chậm dẫn truyền nút nhĩ thất.",
    "clinicalImpact": "Ngộ độc Digoxin nặng kèm nhịp tim chậm nghiêm trọng, block nhĩ thất độ II, độ III.",
    "recommendation": "GIẢM 50% LIỀU DIGOXIN khi bắt đầu dùng Verapamil. Theo dõi nồng độ Digoxin trong máu và đo điện tâm đồ định kỳ.",
    "evidenceLevel": "Rất cao"
  },
  {
    "pair": [
      "metoprolol",
      "verapamil"
    ],
    "severity": "contraindicated",
    "title": "Chống chỉ định phối hợp tiêm truyền: Suy tim cấp & Block nhĩ thất hoàn toàn",
    "mechanism": "Hiệp đồng tác dụng ức chế co bóp cơ tim (Inotropic âm tính) và ức chế mạnh dẫn truyền qua nút nhĩ thất (Dromotropic âm tính).",
    "clinicalImpact": "Tụt huyết áp trụy mạch sâu, nhịp tim chậm kịch phát, block nhĩ thất hoàn toàn, vô tâm thu (ngừng tim).",
    "recommendation": "CHỐNG CHỈ ĐỊNH PHỐI HỢP ĐƯỜNG TIÊM TRUYỀN. Dạng uống chỉ dùng thận trọng dưới sự giám sát của bác sĩ chuyên khoa tim mạch.",
    "evidenceLevel": "Mức độ 1"
  },
  {
    "pair": [
      "bisoprolol",
      "diltiazem"
    ],
    "severity": "major",
    "title": "Nguy cơ cao: Nhịp tim chậm nghiêm trọng & Suy giảm chức năng co bóp",
    "mechanism": "Hiệp đồng ức chế dẫn truyền nhĩ thất và ức chế nút xoang.",
    "clinicalImpact": "Nhịp chậm xoang < 40-50 bpm, block AV, làm nặng thêm tình trạng suy tim sung huyết.",
    "recommendation": "Thận trọng theo dõi nhịp tim và điện tâm đồ. Tránh phối hợp ở bệnh nhân có suy tim phân suất tống máu giảm.",
    "evidenceLevel": "Cao"
  },
  {
    "pair": [
      "sildenafil",
      "nitroglycerin"
    ],
    "severity": "contraindicated",
    "title": "Chống chỉ định tuyệt đối: Tụt huyết áp kịch phát & Ngừng tim tử vong",
    "mechanism": "Nitroglycerin làm tăng cGMP qua giải phóng NO; Sildenafil ức chế PDE-5 ngăn phân hủy cGMP. Sự tích lũy ồ ạt cGMP gây giãn toàn bộ hệ mạch máu.",
    "clinicalImpact": "Tụt huyết áp tâm thu sâu không thể hồi phục (< 60 mmHg), thiếu máu cơ tim cấp và tử vong.",
    "recommendation": "CHỐNG CHỈ ĐỊNH TUYỆT ĐỐI. Không được dùng bất kỳ dẫn xuất Nitrat nào trong vòng ít nhất 24 giờ sau khi dùng Sildenafil (và ít nhất 48 giờ sau khi dùng Tadalafil).",
    "evidenceLevel": "Mức độ 1 (FDA Black Box)"
  },
  {
    "pair": [
      "tadalafil",
      "nitroglycerin"
    ],
    "severity": "contraindicated",
    "title": "Chống chỉ định tuyệt đối: Tụt huyết áp đe dọa tính mạng",
    "mechanism": "Hiệp đồng giãn cơ trơn mạch máu thông qua con đường NO-cGMP kéo dài.",
    "clinicalImpact": "Trụy tim mạch dữ dội, nhồi máu cơ tim, tử vong đột ngột.",
    "recommendation": "CHỐNG CHỈ ĐỊNH TUYỆT ĐỐI. Khoảng cách an toàn tối thiểu giữa Tadalafil và Nitrat là 48 GIỜ.",
    "evidenceLevel": "Mức độ 1"
  },
  {
    "pair": [
      "tadalafil",
      "isosorbide_dinitrate"
    ],
    "severity": "contraindicated",
    "title": "Chống chỉ định tuyệt đối: Nguy cơ trụy mạch khi dùng chung Nitrat",
    "mechanism": "Tích lũy cGMP gây giãn mạch toàn thể kịch phát.",
    "clinicalImpact": "Hạ huyết áp sâu đe dọa tử vong.",
    "recommendation": "CHỐNG CHỈ ĐỊNH TUYỆT ĐỐI.",
    "evidenceLevel": "Mức độ 1"
  },
  {
    "pair": [
      "ciprofloxacin",
      "theophylline"
    ],
    "severity": "major",
    "title": "Nguy cơ cao: Tăng vọt nồng độ Theophylline & Co giật tử vong",
    "mechanism": "Ciprofloxacin ức chế mạnh enzym gan CYP1A2 (con đường chuyển hóa chính của Theophylline), làm giảm 30-50% thanh thải Theophylline.",
    "clinicalImpact": "Ngộ độc Theophylline cấp tính: Loạn nhịp thất nguy hiểm, co giật liên tục kháng trị và tử vong.",
    "recommendation": "NẾU BẮT BUỘC PHỐI HỢP: GIẢM 50% LIỀU THEOPHYLLINE và định lượng TDM nồng độ Theophylline trong máu hàng ngày.",
    "evidenceLevel": "Chắc chắn (Tương tác kinh điển)"
  },
  {
    "pair": [
      "ciprofloxacin",
      "tizanidine"
    ],
    "severity": "contraindicated",
    "title": "Chống chỉ định tuyệt đối: Tụt huyết áp nghiêm trọng & An thần sâu",
    "mechanism": "Ciprofloxacin ức chế CYP1A2 làm nồng độ Tizanidine tăng vọt gấp 7 đến 10 lần.",
    "clinicalImpact": "Tụt huyết áp sâu ngất xỉu, nhịp tim chậm, an thần cực độ và suy giảm tâm thần vận động.",
    "recommendation": "CHỐNG CHỈ ĐỊNH TUYỆT ĐỐI ĐỒNG THỜI.",
    "evidenceLevel": "Mức độ 1 (FDA Black Box)"
  },
  {
    "pair": [
      "ciprofloxacin",
      "antacid_al_mg"
    ],
    "severity": "major",
    "title": "Mất hoạt tính kháng sinh: Tạo phức Chelat không tan với Nhôm/Magnesi",
    "mechanism": "Các cation kim loại đa hóa trị (Al3+, Mg2+) tạo phức chelat bền vững với Ciprofloxacin trong lòng ruột làm mất 80-90% khả năng hấp thu.",
    "clinicalImpact": "Nồng độ kháng sinh trong máu không đạt MIC diệt khuẩn, dẫn đến thất bại điều trị nhiễm trùng.",
    "recommendation": "UỐNG CIPROFLOXACIN TRƯỚC THUỐC KHÁNG ACID ÍT NHẤT 2 GIỜ HOẶC SAU ĐÓ ÍT NHẤT 4 GIỜ.",
    "evidenceLevel": "Mức độ 1"
  },
  {
    "pair": [
      "ciprofloxacin",
      "prednisolone"
    ],
    "severity": "major",
    "title": "Nguy cơ cao: Viêm gân & Đứt gân gót Achilles",
    "mechanism": "Cả Quinolon và Corticosteroid đều gây tổn thương và thoái hóa cấu trúc collagen của gân cơ.",
    "clinicalImpact": "Nguy cơ đứt gân gót Achilles tự phát tăng gấp nhiều lần, đặc biệt ở bệnh nhân trên 60 tuổi hoặc có suy thận.",
    "recommendation": "Thận trọng khi phối hợp. Dặn dò bệnh nhân ngừng thuốc ngay và bất động chi nếu thấy đau, sưng hoặc căng tức vùng gân gót.",
    "evidenceLevel": "FDA Black Box Warning"
  },
  {
    "pair": [
      "levofloxacin",
      "dexamethasone"
    ],
    "severity": "major",
    "title": "Nguy cơ cao: Tổn thương gân & Đứt gân khi phối hợp Quinolon với Corticoid",
    "mechanism": "Tác động cộng hưởng làm suy yếu chất nền ngoại bào của gân cơ.",
    "clinicalImpact": "Đứt gân gót Achilles, viêm bao gân.",
    "recommendation": "Theo dõi sát các triệu chứng đau gân; tránh vận động thể lực nặng trong thời gian dùng thuốc.",
    "evidenceLevel": "FDA Black Box"
  },
  {
    "pair": [
      "methotrexate",
      "naproxen"
    ],
    "severity": "major",
    "title": "Nguy cơ cao: Giảm bài tiết Methotrexate & Suy tủy xương tử vong",
    "mechanism": "NSAID ức chế prostaglandin tại thận làm giảm lưu lượng máu lọc cầu thận, đồng thời cạnh tranh bài tiết chủ động tại ống thận với Methotrexate.",
    "clinicalImpact": "Nồng độ Methotrexate trong máu tăng cao và kéo dài gây độc tính tủy xương nặng (giảm bạch cầu hạt, giảm tiểu cầu, suy tủy), loét hoại tử đường tiêu hóa.",
    "recommendation": "Tránh dùng NSAID liều cao cùng lúc với Methotrexate liều cao. Với Methotrexate liều thấp trong viêm khớp: Cần giám sát chặt chẽ công thức máu và chức năng thận.",
    "evidenceLevel": "Rất cao"
  },
  {
    "pair": [
      "methotrexate",
      "cotrimoxazole"
    ],
    "severity": "contraindicated",
    "title": "Chống chỉ định phối hợp: Hiệp đồng ức chế Folate & Suy tủy triệt để",
    "mechanism": "Cả hai thuốc đều ức chế tổng hợp acid folic (Methotrexate ức chế DHFR, Trimethoprim cũng ức chế DHFR), đồng thời Sulfamethoxazole cạnh tranh gắn protein huyết tương đẩy Methotrexate tự do tăng cao.",
    "clinicalImpact": "Thiếu máu bất sản suy tủy toàn bộ, nhiễm trùng cơ hội đe dọa tính mạng và tử vong.",
    "recommendation": "TRÁNH PHỐI HỢP ĐỒNG THỜI. Chọn kháng sinh khác khi bệnh nhân đang điều trị Methotrexate.",
    "evidenceLevel": "Mức độ 1"
  },
  {
    "pair": [
      "tramadol",
      "fluoxetine"
    ],
    "severity": "major",
    "title": "Nguy cơ cao: Hội chứng Serotonin & Giảm ngưỡng co giật",
    "mechanism": "Cả hai thuốc đều làm tăng nồng độ Serotonin trong khe synap thần kinh; ngoài ra Fluoxetine ức chế CYP2D6 cản trở chuyển hóa Tramadol.",
    "clinicalImpact": "Hội chứng Serotonin (kích động, run giật cơ, tăng thân nhiệt, vã mồ hôi) và tăng nguy cơ co giật cơn lớn.",
    "recommendation": "Thận trọng theo dõi. Giáo dục bệnh nhân nhận biết sớm các dấu hiệu của hội chứng Serotonin để đến viện kịp thời.",
    "evidenceLevel": "Cao"
  },
  {
    "pair": [
      "linezolid",
      "escitalopram"
    ],
    "severity": "contraindicated",
    "title": "Chống chỉ định tuyệt đối: Hội chứng Serotonin ác tính đe dọa tính mạng",
    "mechanism": "Linezolid là chất ức chế enzym Monoamine Oxidase (MAOI) có thể hồi phục; Escitalopram là chất ức chế tái thu hồi Serotonin chọn lọc (SSRI).",
    "clinicalImpact": "Khởi phát Hội chứng Serotonin kịch phát: Sốt cao ác tính, co cứng cơ toàn thân, huyết áp dao động dữ dội, hôn mê và tử vong.",
    "recommendation": "CHỐNG CHỈ ĐỊNH PHỐI HỢP. Bắt buộc ngừng SSRI ít nhất 2 tuần (hoặc 5 tuần với Fluoxetine) trước khi bắt đầu Linezolid, trừ trường hợp nhiễm khuẩn đe dọa tính mạng không còn kháng sinh thay thế.",
    "evidenceLevel": "Mức độ 1 (FDA Black Box)"
  },
  {
    "pair": [
      "metronidazole",
      "alcohol"
    ],
    "severity": "major",
    "title": "Phản ứng giống Disulfiram (Antabuse-like effect)",
    "mechanism": "Metronidazole ức chế enzym aldehyde dehydrogenase tại gan, làm tích lũy Acetaldehyde độc hại khi uống rượu bia.",
    "clinicalImpact": "Đỏ bừng mặt dữ dội, đau đầu buốt nhói, buồn nôn, nôn mửa liên tục, tụt huyết áp, nhịp tim nhanh và khó thở.",
    "recommendation": "TUYỆT ĐỐI CẤM UỐNG RƯỢU BIA hoặc dung dịch chứa cồn trong suốt thời gian dùng Metronidazole và ít nhất 48 giờ sau liều cuối cùng.",
    "evidenceLevel": "Chắc chắn (Tương tác kinh điển)"
  }
];
