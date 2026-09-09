# CLINICALRX PRO V3 - HƯỚNG DẪN CÀI ĐẶT & VẬN HÀNH
### Hệ thống Thông tin Thuốc & Dược Lâm Sàng (Clinical Pharmacy Portal)

---

## 1. Khởi Động Website Nhanh (Windows)

Bạn có thể chạy website ngay lập tức bằng 1 trong các cách sau:

### Cách 1: Nhấp đúp vào file batch (Khuyến nghị)
* Mở thư mục `d:\Dự án website`
* Nhấp đúp chuột vào file: **`CHAY_WEBSITE.bat`**
* Trình duyệt sẽ tự động mở địa chỉ: `http://localhost:3000`

### Cách 2: Chạy qua dòng lệnh PowerShell / Terminal
```powershell
cd "d:\Dự án website"
python -m http.server 3000
```
Sau đó mở trình duyệt (Chrome / Edge / Firefox) và truy cập `http://localhost:3000`.

---

## 2. Các Phân Hệ Chuyên Môn Đã Hiện Thực Hóa

| Phân hệ | Tính năng cốt lõi | Dữ liệu & Tiêu chuẩn |
| :--- | :--- | :--- |
| **1. Tra cứu Dược thư Lâm sàng** | Tra cứu đa tiêu chí theo tên hoạt chất, biệt dược, phân loại ATC. Xem chỉ định, chống chỉ định, liều chuẩn người lớn/trẻ em/người cao tuổi, bảng hiệu chỉnh liều theo mức lọc cầu thận ($CrCl$), cảnh báo hộp đen, tác dụng phụ và dữ liệu an toàn thai kỳ/cho con bú. | Dược thư Quốc gia Việt Nam 2022, Sanford Guide, FDA, Brigg's. |
| **2. Kiểm tra Tương tác Đa thuốc** | Nhập đồng thời 2 hoặc nhiều thuốc vào giỏ đơn thuốc. Tự động rà soát ma trận chéo phát hiện tương tác: Chống chỉ định (🔴), Nguy cơ cao (🟠), Thận trọng (🟡). Phân tích cơ chế enzym CYP450, kéo dài khoảng QT, độc thận cộng hưởng và khuyến cáo xử trí lâm sàng. | Stockley's Drug Interactions, Lexicomp, Micromedex. |
| **3. Bộ Máy tính Dược lâm sàng** | • **Chức năng thận**: Tính $CrCl$ (Cockcroft-Gault), $eGFR$ (CKD-EPI 2021 race-free), phân loại giai đoạn bệnh thận G1-G5, tự động tính Cân nặng lý tưởng (IBW Devine) và Cân nặng hiệu chỉnh (AdjBW) khi bệnh nhân thừa cân/béo phì.<br>• **Hình thể**: Tính BMI (chuẩn Châu Á IDI/WPRO), Diện tích da BSA (Mosteller & DuBois).<br>• **Quy đổi Corticoid**: Chuyển đổi tương đương giữa 8 loại Corticosteroid.<br>• **Dược động học Vancomycin**: Ước tính liều nạp (Loading dose) và liều duy trì ban đầu theo cân nặng và chức năng thận. | KDIGO 2024, IDSA/ASHP Vancomycin Guideline. |
| **4. Cẩm nang Tương dung Tiêm truyền (IV Y-site)** | Tra cứu tính tương hợp / tương kỵ vật lý và hóa học tại chẽ ba Y-site giữa các thuốc tiêm truyền thường dùng tại Hồi sức tích cực (Vancomycin, Meropenem, Furosemide, Pantoprazole, Amiodarone...) và các dung dịch cơ bản (NaCl 0.9%, Glucose 5%, Ringer Lactat). | Trissel's Handbook on Injectable Drugs. |
| **5. Cổng Hội chẩn & Tư vấn Ca bệnh (DIC)** | Quy trình Bác sĩ gửi ca bệnh lâm sàng (tuổi, giới, chẩn đoán, chức năng thận, thuốc đang dùng - không lộ định danh PII). Dược sĩ lâm sàng tiếp nhận, tra cứu y văn và phản hồi theo cấu trúc chứng cứ y học (EBM). Tích hợp nút **AI Trợ lý Gợi ý Phác thảo** giúp soạn thảo nhanh ý kiến tư vấn. Đồng bộ hai chiều với Supabase PostgreSQL. | Thông tư 22/2011/TT-BYT, Nghị định 131/2020/NĐ-CP. |
| **6. Cảnh giác Dược & Báo cáo ADR** | Biểu mẫu báo cáo biến cố bất lợi của thuốc chuẩn hóa theo mẫu Trung tâm DI & ADR Quốc gia. Tích hợp **Thang đánh giá mối liên quan nhân quả Naranjo 10 câu hỏi** tự động tính điểm và phân loại (Chắc chắn, Có khả năng, Có thể, Nghi ngờ). Nút **In Biên bản ADR (A4)** xuất trình ký hoặc lưu hồ sơ bệnh án. | Mẫu báo cáo ADR Bộ Y tế. |

---

## 3. Cấu Hình Cơ Sở Dữ Liệu Supabase (Tùy Chọn)

Website đã được tích hợp sẵn cơ chế **Offline/Local Storage**, nghĩa là bạn có thể thử nghiệm đầy đủ mọi tính năng hỏi đáp và báo cáo ADR mà không bắt buộc phải có kết nối mạng.

Nếu muốn đồng bộ vào database đám mây Supabase của viện:
1. Mở trang quản trị Supabase tại `https://supabase.com/` và vào mục **SQL Editor**.
2. Mở file `d:\Dự án website\database\schema_v3.sql`, copy toàn bộ nội dung và nhấn **Run**.
3. Mở website `http://localhost:3000`, nhấp vào nút **Supabase** ở góc trên bên phải màn hình.
4. Nhập `Project URL` và `Anon/Publishable Key`, sau đó bấm **Lưu thông số kết nối**.

---

## 4. Triển Khai Lên Mạng Internet (Deploy Online Miễn Phí)

Website được xây dựng theo chuẩn Modern Single Page Application (không cần bước `npm build`), vì vậy có thể deploy cực nhanh:
* **Netlify**: Kéo toàn bộ thư mục `d:\Dự án website` thả vào tab Deploy của Netlify.
* **Vercel**: Import thư mục và deploy trực tiếp.
* **GitHub Pages**: Đẩy code lên repository và bật tính năng GitHub Pages (nhánh `main`).

---

## 5. Tài Khoản Đăng Nhập & Phân Quyền (RBAC)

Hệ thống cung cấp sẵn các tài khoản demo nội viện được tích hợp sẵn nút **Đăng nhập nhanh 1-Click** (không cần nhập tay):

| Vai trò | Email đăng nhập | Mật khẩu | Họ và tên | Chức danh / Đơn vị | Quyền hạn |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@bvdk-hungyen.vn` | `admin123` | DS.CKII. Nguyễn Văn Quản Trị | Trưởng Khoa Dược | Toàn quyền quản trị, mở Admin Panel, xem thống kê truy cập, quản lý danh mục thuốc & ca hội chẩn. |
| **Bác sĩ lâm sàng** | `bacsi@bvdk-hungyen.vn` | `user123` | BS.CKI. Trần Thị Bác Sĩ | Khoa Hồi sức tích cực - Chống độc | Gửi yêu cầu hội chẩn DIC, tra cứu tương tác, tính liều, báo cáo ADR, xem phản hồi từ Dược sĩ. |
| **Dược sĩ lâm sàng** | `duocsi@bvdk-hungyen.vn` | `duoc123` | ThS.DS. Lê Văn Dược Lâm Sàng | Tổ Dược lâm sàng - Thông tin thuốc | Tiếp nhận & phản hồi hội chẩn DIC, duyệt báo cáo ADR, biên tập khuyến cáo lâm sàng. |

**Cách đăng nhập:**
1. Nhấp nút **`[ 🚪 ĐĂNG NHẬP ]`** ở góc trên thanh Header hoặc nút **`[ 🔑 ĐĂNG NHẬP (ADMIN / BÁC SĨ) ]`** trên Hero Banner.
2. Tại hộp thoại hiện ra, bạn có thể:
   - Nhấp vào 1 trong 3 nút **Đăng nhập nhanh (1-Click)**: `[ 🛡️ Quản Trị Viên (Admin) ]`, `[ 👨‍⚕️ Bác Sĩ Lâm Sàng ]`, `[ 💊 Dược Sĩ Lâm Sàng ]`.
   - Hoặc nhập Email và Mật khẩu theo bảng trên rồi bấm **Đăng nhập**.
3. Để đăng xuất: Bấm vào tên người dùng ở góc trên Header và chọn **Đăng xuất**.

