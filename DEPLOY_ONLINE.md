# HƯỚNG DẪN TRIỂN KHAI WEBSITE LÊN INTERNET (DEPLOY ONLINE MIỄN PHÍ)
### Cổng Thông tin Thuốc & Dược Lâm Sàng - Bệnh viện Đa khoa tỉnh Hưng Yên

Website được thiết kế theo chuẩn **Modern Single Page Application (Pure ES Modules)**, không cần máy chủ Node.js phức tạp, không cần build npm. Do đó, bạn có thể đưa website lên mạng Internet hoàn toàn miễn phí, có chứng chỉ bảo mật HTTPS trong vòng **1 phút** để các Bác sĩ và Dược sĩ trong viện có thể tra cứu trên điện thoại tại giường bệnh.

---

## CÁCH 1: Netlify Drop (Đơn Giản Nhất - 30 Giây Không Cần Đăng Ký Phức Tạp)

1. Truy cập trang web: **[https://app.netlify.com/drop](https://app.netlify.com/drop)**
2. Mở thư mục `d:\Dự án website` trên máy tính của bạn.
3. **Kéo toàn bộ thư mục `d:\Dự án website`** và **thả** vào khung tròn trên màn hình Netlify.
4. Đợi 10 - 20 giây: Hệ thống sẽ cấp cho bạn một đường link trực tuyến miễn phí dạng:  
   `https://clinicalrx-hungyen.netlify.app`
5. Bạn có thể đổi tên miền con tùy thích trong mục **Site configuration $\rightarrow$ Change site name**.

---

## CÁCH 2: Triển Khai Qua Vercel (Tốc Độ Cao & Khuyến Nghị)

File cấu hình **`vercel.json`** đã được tạo sẵn trong thư mục dự án.

### Cách thực hiện qua Web Vercel:
1. Đăng ký tài khoản miễn phí tại **[https://vercel.com/](https://vercel.com/)** (bằng tài khoản GitHub hoặc Google).
2. Tải mã nguồn lên GitHub (hoặc cài đặt tiện ích Vercel CLI).
3. Nhấn **Add New... $\rightarrow$ Project**, chọn kho lưu trữ chứa thư mục website và nhấn **Deploy**.
4. Website sẽ online ngay lập tức với tên miền dạng:  
   `https://clinicalrx-bvdk-hungyen.vercel.app`

---

## CÁCH 3: Triển Khai Qua GitHub Pages (Lưu Trữ Vĩnh Viễn)

File workflow tự động **`.github/workflows/deploy.yml`** đã được cấu hình sẵn.

1. Tạo một Repository mới trên GitHub (ví dụ: `duoclamsang-hungyen`).
2. Tải toàn bộ mã nguồn trong thư mục `d:\Dự án website` lên nhánh `main`.
3. Vào mục **Settings $\rightarrow$ Pages**:
   - Tại mục **Build and deployment $\rightarrow$ Source**: Chọn **GitHub Actions**.
4. GitHub sẽ tự động triển khai và cung cấp link dạng:  
   `https://<ten-tai-khoan>.github.io/duoclamsang-hungyen/`

---

## CÁCH 4: Sử Dụng Trong Mạng Nội Bộ Bệnh Viện (Mạng LAN / Wi-Fi Viện)

Nếu Bệnh viện chỉ muốn phục vụ nội bộ mà không cần đưa lên Internet công cộng:
1. Máy tính chủ (chạy file `CHAY_WEBSITE.bat`) cần kết nối vào mạng Wi-Fi/LAN của bệnh viện.
2. Mở Command Prompt trên máy chủ gõ: `ipconfig` để lấy địa chỉ IPv4 (Ví dụ: `192.168.1.150`).
3. Mọi điện thoại thông minh, máy tính bảng hoặc máy tính phòng khám của Bác sĩ trong cùng mạng Wi-Fi chỉ cần mở trình duyệt và truy cập:  
   **`http://192.168.1.150:3000`** là có thể tra cứu và gửi ca hội chẩn ngay lập tức!

---

## Gắn Tên Miền Riêng Của Bệnh Viện (Custom Domain)

Nếu Bệnh viện muốn dùng tên miền chính thức (Ví dụ: `duoclamsang.bvdk-hungyen.vn`):
1. Trong bảng quản trị Netlify hoặc Vercel, vào mục **Domain Management $\rightarrow$ Add Custom Domain**.
2. Nhập tên miền phụ (subdomain) mong muốn: `duoclamsang.bvdk-hungyen.vn`.
3. Bộ phận CNTT của Viện chỉ cần trỏ một bản ghi **CNAME** từ `duoclamsang` về địa chỉ của Netlify/Vercel.
4. Hệ thống sẽ tự động cấp chứng chỉ bảo mật SSL/HTTPS Let's Encrypt hoàn toàn miễn phí.
