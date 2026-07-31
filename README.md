# AntFinance - Website Quản Lý Chi Tiêu Cá Nhân Hiện Đại

AntFinance là ứng dụng web quản lý tài chính cá nhân được xây dựng trên ngôn ngữ **TypeScript** với giao diện hiện đại, tối giản và hiệu ứng mượt mà. Ứng dụng tích hợp hệ thống **Supabase** cho phần Backend và Cơ sở dữ liệu để bảo mật dòng tiền của người dùng.

---

## 🚀 Các Tính Năng Chính

1. **Hệ Thống Authentication**: Đăng ký, đăng nhập và lưu giữ phiên làm việc an toàn bằng Supabase Auth.
2. **Báo Cáo Tổng Quan (Dashboard)**: Biểu đồ thống kê số dư hiện tại, tổng thu nhập, tổng chi tiêu trong tháng hiện hành.
3. **Quản Lý Giao Dịch (CRUD Transactions)**: Thêm, sửa, xóa, tìm kiếm ghi chú và lọc giao dịch theo danh mục và loại giao dịch (khoản thu/chi).
4. **Quản Lý Danh Mục (CRUD Categories)**: Tự do tạo mới và chỉnh sửa biểu tượng (emoji) cùng bảng màu sắc trực quan.
5. **Thiết Lập Ngân Sách & Cảnh Báo (Budgets & Alerts)**: Đặt giới hạn chi tiêu tối đa mỗi tháng cho từng danh mục. Tự động hiển thị cảnh báo và gửi thông báo nếu chi tiêu vượt ngưỡng (vượt 80% hoặc 100%).
6. **Thống Kê Tài Chính Chi Tiết**:
   - Biểu đồ đường (Line Chart): Xu hướng thu nhập vs chi tiêu từng tháng.
   - Biểu đồ tròn (Pie Chart): Tỷ lệ chi tiêu phân bổ theo danh mục.
   - Biểu đồ cột (Bar Chart): Dòng tiền thu/chi hàng ngày trực quan.
7. **Dark Mode & Light Mode**: Chuyển đổi giao diện sáng/tối lưu trạng thái qua `localStorage`.
8. **Thiết Kế Tương Thích (Responsive Design)**: Trải nghiệm mượt mà trên cả Mobile, Tablet và Desktop.

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend**: ReactJS, Vite, TypeScript, React Router v6, Zustand (Quản lý State), Recharts (Vẽ biểu đồ), Lucide React (Icons), Date-fns (Xử lý thời gian).
- **Styling**: Tailwind CSS v4 (với hiệu ứng Glassmorphism và chuyển trang nhẹ nhàng).
- **Backend as a Service**: Supabase (Auth, PostgreSQL Database, Row Level Security).

---

## ⚙️ Hướng Dẫn Cài Đặt Cơ Sở Dữ Liệu Supabase

Để khởi tạo database cho ứng dụng, vui lòng thực hiện các bước sau trên Supabase:

1. Đăng nhập vào trang quản trị [Supabase Dashboard](https://supabase.com).
2. Tạo một project mới (hoặc sử dụng project hiện có).
3. Vào mục **SQL Editor** trong thanh công cụ bên trái.
4. Nhấn **New Query**, copy toàn bộ nội dung từ file [supabase/schema.sql](file:///Users/ken/Documents/my%20code/Quanlychitieuapp/supabase/schema.sql) và dán vào cửa sổ soạn thảo.
5. Nhấn nút **Run** để khởi tạo các bảng, khóa ngoại, các chỉ mục (indexes) hiệu suất và kích hoạt chính sách bảo mật **Row Level Security (RLS)**.

> [!IMPORTANT]
> Cơ chế RLS đã được cấu hình sẵn để đảm bảo người dùng chỉ có quyền đọc/ghi dữ liệu của chính tài khoản của họ.

---

## 💻 Chạy Ứng Dụng Ở Máy Cục Bộ (Localhost)

### Bước 1: Clone project và Cài đặt dependencies
Vào thư mục dự án và chạy lệnh sau để cài đặt các package:
```bash
npm install --legacy-peer-deps
```

### Bước 2: Cấu hình biến môi trường
Tạo file `.env` từ file `.env.example`:
```bash
cp .env.example .env
```
Mở file `.env` mới tạo và thay thế các giá trị API Url và Anon Key từ Supabase Project Settings của bạn:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### Bước 3: Khởi chạy môi trường Phát triển (Development)
Chạy dev server cục bộ:
```bash
npm run dev
```
Mở trình duyệt truy cập địa chỉ hiển thị trong terminal (mặc định là `http://localhost:5173`).

---

## 📦 Hướng Dẫn Deploy Lên Vercel

Để triển khai ứng dụng lên nền tảng đám mây Vercel:

### Cách 1: Deploy trực tiếp qua Github (Khuyên dùng)
1. Đẩy mã nguồn dự án lên một kho lưu trữ Github (Private hoặc Public).
2. Đăng nhập vào tài khoản [Vercel](https://vercel.com).
3. Nhấp chọn **Add New** &rarr; **Project**.
4. Import repository chứa mã nguồn dự án từ Github.
5. Tại mục **Configure Project**:
   - Mục **Framework Preset**: Chọn **Vite**.
   - Mục **Root Directory**: Chọn `./` (mặc định).
   - Mở rộng mục **Environment Variables** và nhập hai tham số biến môi trường sau:
     - `VITE_SUPABASE_URL` = [URL Dự án Supabase của bạn]
     - `VITE_SUPABASE_ANON_KEY` = [Anon Key Dự án Supabase của bạn]
6. Nhấn nút **Deploy** và chờ Vercel build dự án trong vòng khoảng 1 phút.

### Cách 2: Deploy qua Vercel CLI (Nhanh chóng)
Nếu bạn đã cài đặt Vercel CLI ở máy:
1. Chạy lệnh: `vercel`
2. Làm theo hướng dẫn trên terminal để liên kết tài khoản.
3. Thiết lập các biến môi trường trên Vercel Dashboard của project vừa tạo.
4. Chạy lệnh `vercel --prod` để đẩy bản build lên production.
# tietkiemde
