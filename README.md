# Digital Portfolio - Nhập môn Công nghệ số (VNU1001)

Chào mừng bạn đến với kho lưu trữ mã nguồn **Digital Portfolio cá nhân** của tôi. Đây là đồ án thực hành phục vụ cho học phần **Nhập môn Công nghệ số (VNU1001)** tại **Trường Đại học Công nghệ - Đại học Quốc gia Hà Nội (VNU-UET)**.

Dự án này là một trang web tĩnh (Vanilla HTML/CSS/JS) được thiết kế hiện đại, tương tác mượt mà và tối ưu hóa cao, dùng để hệ thống hóa kết quả học tập và năng lực kỹ năng số qua 6 tuần học tập.

---

## 👤 Thông tin Sinh viên
* **Họ và tên:** Trần Quốc Khánh
* **Mã số sinh viên (MSSV):** 25020220
* **Lớp:** K70 CLC Khoa học Máy tính
* **Trường:** Đại học Công nghệ (VNU-UET)
* **Học phần:** Nhập môn Công nghệ số (VNU1001)

---

## 🎨 Các tính năng nổi bật của Website

1. **Giao diện Glassmorphism cao cấp:** Thiết kế hiện đại kết hợp hiệu ứng kính mờ, chuyển màu mượt mà (smooth transitions) và lưới nền phát sáng (radial mesh glows).
2. **Chế độ Sáng/Tối (Light/Dark Theme):** Đồng bộ hóa tức thì trên toàn bộ trang thông qua việc sử dụng CSS Variables và URL Query Parameters.
3. **Phân cấp Thư mục Khoa học:** Minh họa trực quan sơ đồ quản lý tệp tin khoa học bằng Folder Tree được xây dựng hoàn toàn từ CSS.
4. **Trình Duyệt Prompt Engineering (Tuần 3):** Tích hợp từ điển tương tác cho phép so sánh sự thay đổi chất lượng đầu ra giữa 3 cấp độ Prompt (Cơ bản, Cải tiến, Nâng cao) dựa trên thang nhận thức Bloom.
5. **Thẻ Công việc Trello Kanban (Tuần 4):** Trải nghiệm mở rộng chi tiết công việc khi click vào từng thẻ trên bảng Kanban mô phỏng quy trình chạy dự án nhóm.
6. **Bộ Chuyển đổi mã nguồn Java OOP (Tuần 5):** Cho phép so sánh trực quan side-by-side giữa code do AI đề xuất bị lỗi thiết kế (Kế thừa bừa bãi) và code tối ưu thực tế (sử dụng Composition).
7. **Tối ưu hóa Bản in (Print to PDF):** Định nghĩa riêng một `@media print` cực kỳ chi tiết, ẩn toàn bộ thanh điều hướng, nút tương tác, đổi bảng màu về trắng-đen tối giản để xuất file PDF nộp bài đạt chất lượng tốt nhất.

---

## 📁 Cấu trúc Thư mục Dự án

Mã nguồn được quy hoạch khoa học và sạch sẽ để dễ dàng đưa lên GitHub Pages:

```text
Portfolio/
├── index.html            # Trang Giới thiệu (Overview)
├── exercises.html        # Trang Báo cáo kết quả 6 tuần thực hành
├── summary.html          # Trang Tổng kết (Reflection & Competencies)
├── README.md             # Tài liệu hướng dẫn dự án
├── .gitignore            # Khai báo loại trừ tệp tin (bỏ qua file PDF nộp bài)
└── assets/               # Thư mục chứa tài nguyên tĩnh
    ├── css/
    │   └── styles.css    # Thiết kế hệ thống (Design System) & Print overrides
    ├── js/
    │   └── script.js     # Xử lý logic, Theme toggler, Trello & Code Switcher
    ├── images/
    │   ├── avatar.jpg    # Ảnh đại diện sinh viên
    │   └── blog_thumbnail.png # Ảnh banner hiển thị liên quan
    └── docs/
        ├── Tuan1.pdf     # Bản PDF báo cáo tuần 1
        ├── Tuan2.pdf     # Bản PDF báo cáo tuần 2
        ...
        └── Tuan6.pdf     # Bản PDF báo cáo tuần 6
```

---

## ⚙️ Hướng dẫn Khởi chạy Cục bộ

Vì dự án sử dụng các liên kết tương đối nội bộ và đồng bộ hóa tham số qua URL, cách tốt nhất để chạy thử là khởi tạo một máy chủ web tĩnh cục bộ (Local Static Server):

### Cách 1: Sử dụng Python (Đơn giản nhất)
Mở terminal tại thư mục dự án và chạy:
```bash
python3 -m http.server 8000
```
Sau đó truy cập địa chỉ: [http://localhost:8000](http://localhost:8000) trên trình duyệt.

### Cách 2: Sử dụng Live Server (VS Code Extension)
Nếu sử dụng VS Code, bạn chỉ cần click chuột phải vào file `index.html` và chọn **Open with Live Server**.

---

## 🖨️ Cách Xuất PDF nộp bài cho Giảng viên

1. Nhấp trực tiếp vào nút **"In trang"** trên thanh điều hướng đầu trang (hoặc bấm tổ hợp phím `Ctrl + P`).
2. Chọn máy in là **Save as PDF** hoặc **Foxit Reader PDF Printer**.
3. Đảm bảo cấu hình:
   - Khổ giấy: **A4**
   - Hướng giấy: **Dọc (Portrait)**
   - Màu sắc: **Trắng đen / Đơn sắc** (Được tự động áp dụng qua stylesheet).
4. Bạn có thể in rời 3 trang và ghép lại, hoặc sử dụng tệp PDF toàn văn đã được gộp sẵn bằng Chrome Headless tại gốc dự án: `TranQuocKhanh_25020220_Portfolio.pdf` (được ghi nhận trong `.gitignore`).

---

## ⚖️ Cam kết Liêm chính Công nghệ & Học thuật

Toàn bộ sản phẩm được xây dựng dưới sự trợ giúp của AI đều tuân thủ nghiêm ngặt **Nguyên tắc Sử dụng AI có trách nhiệm**:
* Không bao giờ copy mã nguồn AI mà không hiểu rõ bản chất giải thuật và cơ chế hoạt động.
* Mọi đoạn mã tối ưu hóa đều được kiểm chứng thông qua các kịch bản kiểm thử (Test Cases).
* Thể hiện tính minh bạch, ghi nhận trung thực sự tham gia đóng góp của công cụ AI trong quá trình nghiên cứu và lập trình.