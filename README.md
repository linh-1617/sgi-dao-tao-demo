# SGI – Demo quản lý đào tạo K26 Bà Rịa

Bản MVP cho **Mục 1 + 2**:

1. Hệ thống trung tâm + danh mục dùng chung.
2. Quản lý học viên + phân lớp.

## Chạy thử

Không cần cài thư viện.

- Mở trực tiếp `index.html` bằng Chrome/Edge; hoặc
- Đưa toàn bộ repo lên GitHub Pages / Vercel.

Đăng nhập demo:

- Tài khoản: `admin`
- Mật khẩu: `sgi2026`

> Cơ chế đăng nhập này chỉ để minh họa giao diện, không dùng cho môi trường thật.

## Dữ liệu demo và quyền riêng tư

Repository này có thể được công khai, vì vậy `data.js` chỉ chứa **60 bản ghi giả lập**. Không commit họ tên, ngày sinh, CCCD, SĐT, địa chỉ hoặc dữ liệu thật của học sinh lên repo public.

Cơ cấu giả lập:

- 26UD11: 10 học viên
- 26UD12: 10 học viên
- 26UD13: 10 học viên
- 26UD14: 10 học viên
- 26SĐ01: 10 học viên
- 26SĐ02: 10 học viên

## Chức năng đã có

- Dashboard tổng quan.
- Danh sách học viên, tìm kiếm/lọc theo ngành, lớp nghề, lớp văn hóa, trạng thái.
- Chỉnh sửa ngành, lớp văn hóa, lớp nghề, trạng thái.
- Kiểm tra lớp nghề có đúng ngành.
- Gợi ý lớp nghề theo quy tắc phân lớp hiện có.
- Lịch sử chuyển lớp/chỉnh sửa trong trình duyệt.
- Danh sách lớp tự cập nhật.
- Tự sort theo lớp văn hóa → họ tên.
- Xuất CSV.
- In danh sách lớp / lưu PDF bằng chức năng Print của trình duyệt.
- Danh mục lớp, giáo viên, môn học, phòng học.
- Kiểm tra dữ liệu thiếu/trùng.

## Lưu dữ liệu demo

Thay đổi được lưu vào `localStorage` của trình duyệt. Nút **Khôi phục dữ liệu mẫu** sẽ đưa dữ liệu về bản ban đầu.

## Triển khai GitHub Pages

1. Vào **Settings → Pages**.
2. Chọn **Deploy from a branch → main / root**.
3. Lưu và chờ GitHub cấp URL demo.

## Triển khai Vercel

1. Import repo GitHub vào Vercel.
2. Framework preset: **Other**.
3. Không cần build command.
4. Output directory: `.`

## Bước kế tiếp sau khi duyệt demo

- Thay `localStorage` bằng Google Sheets API / backend.
- Đăng nhập thật + phân quyền ADMIN/GIÁO VIÊN/HỌC SINH.
- Import XLSX có màn hình preview trước khi ghi.
- Nhật ký chỉnh sửa phía server.
- Mục 3: TKB MASTER + chống trùng.
- Mục 4: Điểm danh liên kết TKB.

Xem thêm `docs/GOOGLE_SHEETS_SCHEMA.md` và `docs/ROADMAP.md`.
