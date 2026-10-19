# SkinCare AI - Frontend React Native App

Dự án Frontend xây dựng bằng **React Native** (hỗ trợ cả Mobile & Web thông qua React Native Web / Vite), tuân thủ 100% tài liệu phân tích nghiệp vụ tại sheet **Function** và chuẩn thiết kế UI hiện đại từ Google Stitch prototype.

---

## 🌟 Tổng Quan 8 Tính Năng Được Cung Cấp (Mục 11 -> 18)

### 11. UI Home (`src/components/screens/HomeScreen.jsx`)
- **Header**: Lời chào cá nhân hóa, huy hiệu hồ sơ da ("Da hỗn hợp thiên dầu"), chỉ số UV thực tế ("UV 6.2 - Nhớ bôi KCN"), chuỗi streak check-in liên tục.
- **Widget Check-in Da ("Nhật ký làn da")**:
  - Tiêu đề: *"Da bạn hôm nay thế nào?"*
  - 5 mood chips nhanh (Bình thường, Khô rát, Kích ứng, Nổi mụn, Bóng dầu).
  - Trạng thái phản hồi tự động nếu đã check-in.
- **Daily Routine Hôm Nay**: Tích hợp Kệ gỗ mỹ phẩm (Wooden Shelf) với các chai lọ mỹ phẩm thực tế xếp theo hàng ngang, nút "Xem Chi Tiết Chu Trình", và nút nhỏ "Chuỗi Routine đang dùng".
- **Community Posts**: Danh sách bài viết cộng đồng được lọc riêng cho hồ sơ da của người dùng, hiển thị lượt tim, bình luận và nút *"Sao chép chuỗi"*.

### 12. Thông báo checkin da hằng ngày (`src/components/screens/NotificationModal.jsx`)
- Mô phỏng thông báo đẩy (Push Notification Banner) trực tiếp trên giao diện thiết bị: *"⏰ Đã đến giờ check-in làn da hôm nay!"*.
- Bảng điều khiển cài đặt:
  - Bật/tắt thông báo hàng ngày.
  - Hẹn giờ thông báo Buổi Sáng (`08:00`) và Buổi Tối (`20:00`).
  - Cảnh báo sản phẩm sắp hết hạn (7 ngày trước và ngày hết hạn lúc 08:00 sáng).
  - Nút *"Vào Check-in Da Ngay"*.

### 13. Checkin tình trạng da hằng ngày (`src/components/screens/CheckinScreen.jsx`)
- Widget/Màn hình *"Nhật ký làn da"*:
  - Tiêu đề: *"Da bạn hôm nay thế nào?"*
  - 5 icon/trạng thái:
    1. **Bình thường** (😊)
    2. **Khô rát** (🌵)
    3. **Kích ứng** (🔴)
    4. **Nổi mụn** (🫧)
    5. **Bóng dầu** (✨)
- **Logic chọn**: Cho phép chọn nhiều icon; **Nếu chọn 'Bình thường' thì tự động hủy bỏ các lựa chọn khác**; nếu chọn các trạng thái xấu thì tự động bỏ 'Bình thường'.
- **Cơ chế Hoàn tác 10 giây**: Sau khi xác nhận, hiển thị **thông báo bé đếm ngược 10s** kèm thanh tiến độ cho phép người dùng click **[Hoàn tác / Undo]**.
- Sau khi xác nhận -> Lập tức kích hoạt Phân tích tình trạng da và cập nhật Daily Routine (Mục 14).

### 14. Phân tích tình trạng da và daily routine (`src/components/screens/AnalysisScreen.jsx`)
- Kiểm tra người dùng có đang chạy Chuỗi Routine nào không (Ví dụ: Đang ở Ngày thứ 3 của Chuỗi Trị Mụn 14 ngày).
- Hiển thị danh sách sản phẩm dự kiến ban đầu (Bản nháp).
- **Thuật toán Ghi Đè (OVERRIDE)**:
  - Lịch gốc Ngày 3 Buổi Tối yêu cầu bôi BHA (Paula's Choice 2%).
  - Khi check-in là **"Khô rát"** hoặc **"Kích ứng"**:
    - Thuật toán lập tức hủy BHA, ghi đè đẩy Serum B5 La Roche-Posay / Ceramide phục hồi thay thế.
    - **Lùi toàn bộ lịch trình hôm nay và sau này xuống 1 ngày** để da kịp phục hồi.
  - Quét Tủ đồ (My Collection) loại bỏ sản phẩm đã hết hạn.
  - Nếu tủ đồ thiếu hoạt chất -> Gọi gợi ý sản phẩm bên ngoài tủ đồ kèm nút *"Thêm vào tủ đồ"*.

### 15. View Daily Routine (`src/components/screens/DailyRoutineScreen.jsx`)
- Hỗ trợ cả 2 trạng thái:
  - **Chưa có gì**: Hiển thị card *"Gợi ý chu trình skincare phù hợp"* -> Click chuyển sang gợi ý chuỗi routine.
  - **Đã có sản phẩm**: **Kệ gỗ mỹ phẩm sang trọng** (Wooden Shelf) với các chai lọ mỹ phẩm (Cleanser, Toner, Treatment, Moisturizer, Sunscreen) xếp theo chiều ngang.
- Switch chuyển đổi Buổi Sáng ☀️ / Buổi Tối 🌙.
- Nút chính: *"Xem chi tiết chu trình"* -> Mở mục 16.
- Nút phụ cạnh bên: *"Chuỗi routine đang dùng (Ngày 3/14)"* -> Mở mục 17.

### 16. View Daily Routine Detail (`src/components/screens/DailyRoutineDetailScreen.jsx`)
- Chu trình 5 bước chuẩn y khoa:
  - **Bước 1**: Làm sạch (Tẩy trang / Sữa rửa mặt)
  - **Bước 2**: Cân bằng (Toner / Nước hoa hồng)
  - **Bước 3**: Đặc trị (Tẩy da chết / Serum / Chấm mụn) – Bước rẽ nhánh nhiều nhất theo 5 trạng thái Check-in.
  - **Bước 4**: Dưỡng / Phục hồi (Kem dưỡng / Gel)
  - **Bước 5**: Bảo vệ (Kem chống nắng – bắt buộc nếu là Buổi sáng)
- Render thành các **Card nằm ngang chứa 3 luồng thông tin xếp dọc**:
  1. *Tiêu đề bước*: BƯỚC X - [TÊN BƯỚC] + Icon đại diện + Checkbox hoàn thành.
  2. *Tên sản phẩm*: Thương hiệu, tên sản phẩm cụ thể, hướng dẫn sử dụng.
  3. *Lý do động (Dynamic AI Reason)*: Dòng chữ màu làm điểm nhấn sinh ra từ Check-in hôm nay. Ví dụ: *"Sữa rửa mặt Simple có hoạt chất Pro-Vitamin B5 sẽ giúp làm dịu nền da đang Khô Rát của bạn"*.

### 17. View chuỗi routine detail (`src/components/screens/RoutineChainDetailScreen.jsx`)
- Hiển thị toàn bộ chuỗi theo từng ngày (Ngày 1 -> Ngày 14).
- Mỗi ngày chia rõ 2 buổi: **Buổi Sáng** và **Buổi Tối**, liệt kê danh sách sản phẩm tương ứng.
- Đánh dấu nổi bật ngày hiện tại (Ngày 3 - Đang thực hiện).
- Nút: **"Add/Edit"** (Mở mục 18), "Xem chi tiết 5 bước", "Chia sẻ chuỗi".

### 18. Add/Edit sản phẩm vào chuỗi routine (`src/components/screens/AddEditRoutineProductScreen.jsx`)
- Thêm sản phẩm từ Tủ đồ (My Collection) vào chuỗi routine.
- Cho phép:
  - Thêm/sửa vào các ngày có sẵn (Ngày 1 -> 14).
  - **Thêm hẳn 1 ngày mới vào chuỗi** (mở rộng lên Ngày 15).
  - Chọn buổi (Sáng / Tối).
- **Hệ thống Kiểm Tra Xung Đột (Conflict Check Engine)**:
  - Dựa trên Ma trận Xung đột (`CONFLICT_MATRIX`): AHA kỵ Retinol, BHA, Vitamin C; BHA kỵ Retinol, AHA.
  - Dựa trên Trạng thái da hôm nay (`CONDITION_DICTIONARY`): Da kích ứng/khô rát cấm kỵ AHA/BHA/Retinol mạnh.
- **Popup Cảnh Báo Trước Khi Cho Lưu (`ConflictModal.jsx`)**:
  - Cảnh báo y khoa chi tiết: nguyên nhân xung đột, mức độ nguy hiểm, khuyến nghị.
  - 2 lựa chọn: *"Quay lại chọn sản phẩm khác"* hoặc *"Tôi hiểu rủi ro, vẫn muốn thêm"*.

---

## 🛠️ Cấu Trúc Mã Nguồn

```
SKIN/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── BottomNav.jsx         # Thanh điều hướng Bottom Tab
│   │   │   ├── ConflictModal.jsx     # Popup cảnh báo xung đột hoạt chất (Mục 18)
│   │   │   ├── FABGuide.jsx          # Nút FAB Cẩm nang Do's & Don'ts
│   │   │   ├── Header.jsx            # Header hồ sơ da, UV, streak
│   │   │   ├── Icon.jsx              # Wrapper Lucide icon an toàn
│   │   │   ├── ProductBottle.jsx     # Chai lọ mỹ phẩm 3D trực quan
│   │   │   ├── UndoSnackbar.jsx      # Thanh Undo đếm ngược 10s (Mục 13)
│   │   │   └── WoodenShelf.jsx       # Kệ gỗ mỹ phẩm sang trọng (Mục 15)
│   │   └── screens/
│   │       ├── HomeScreen.jsx                   # Mục 11: UI Home
│   │       ├── NotificationModal.jsx            # Mục 12: Thông báo checkin da
│   │       ├── CheckinScreen.jsx                # Mục 13: Checkin da hàng ngày
│   │       ├── AnalysisScreen.jsx               # Mục 14: Phân tích da & routine
│   │       ├── DailyRoutineScreen.jsx           # Mục 15: View Daily Routine
│   │       ├── DailyRoutineDetailScreen.jsx     # Mục 16: View Routine Detail 5 bước
│   │       ├── RoutineChainDetailScreen.jsx     # Mục 17: View chuỗi routine detail
│   │       └── AddEditRoutineProductScreen.jsx  # Mục 18: Add/Edit sản phẩm & Check xung đột
│   ├── context/
│   │   └── SkinAppContext.jsx        # Quản lý State toàn cục & Thuật toán Override
│   ├── data/
│   │   └── skinData.js               # Từ điển thành phần, xung đột, tủ đồ, chuỗi 14 ngày
│   ├── App.jsx                       # Giao diện chính + Khung điện thoại Stitch preview
│   └── main.jsx
├── index.html
├── vite.config.js
├── app.json                          # Cấu hình Expo
└── package.json
```

---

## 🚀 Cách Khởi Chạy Và Kiểm Thử

Máy chủ phát triển hiện đang chạy sẵn:
- **URL xem trực tiếp**: [http://localhost:3000](http://localhost:3000)

Hoặc tự khởi chạy lại bằng lệnh:
```bash
npm run dev
```

Trên thanh công cụ phía trên cùng, bạn có thể:
1. Nhấp trực tiếp vào bất kỳ tab nào từ **11 -> 18** để chuyển nhanh giữa các màn hình.
2. Bấm nút **"Khung Mobile (Stitch) / Toàn màn hình"** để xem dạng khung điện thoại iPhone như bản thiết kế Stitch hoặc xem toàn trang.
