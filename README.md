# Clinic Booking Platform - Clients Frontend

Giao diện người dùng (Client Portal) cho nền tảng Đặt lịch hẹn khám bệnh trực tuyến, được phát triển bằng **Next.js (App Router)**, **Tailwind CSS v4** và **shadcn/ui**.

---

## 1. Yêu cầu môi trường & Cài đặt

### Yêu cầu tiên quyết:
- **Node.js**: Phiên bản 20 trở lên (khuyên dùng LTS).
- **Trình quản lý gói**: `npm` hoặc `pnpm`/`yarn`.

### Cài đặt dependencies:
```bash
npm install
```

---

## 2. Cấu hình biến môi trường (`.env`)

Để ứng dụng Frontend có thể kết nối với Backend API Server, bạn cần tạo file cấu hình môi trường:

1. Sao chép file mẫu `.env.example` hoặc tạo mới file `.env` (hoặc `.env.local`) ở thư mục gốc của dự án:
   ```bash
   cp .env.example .env.local
   ```

2. Cấu hình biến URL trỏ đến Backend:
   ```env
   # URL của Backend API Server
   NEXT_PUBLIC_API_URL=http://localhost:8080
   ```

---

## 3. Tài liệu Swagger API & Lưu ý Backend

* **Đường dẫn tài liệu API Swagger**:  
  👉 **[http://localhost:8080/api-docs/#/](http://localhost:8080/api-docs/#/)**

> [!IMPORTANT]
> **LƯU Ý BẮT BUỘC DÀNH CHO TEAM:**
> Bạn **PHẢI KHỞI ĐỘNG BACKEND SERVER TRƯỚC** khi:
> 1. Truy cập vào đường dẫn Swagger ở trên để xem tài liệu API.
> 2. Thao tác các tính năng liên quan đến xác thực dữ liệu như **Đăng nhập (`/login`)** hoặc **Đăng ký (`/register`)** từ Frontend.
> 
> Nếu Backend chưa được bật, Frontend sẽ không thể giao tiếp và trả về lỗi không kết nối được máy chủ.

---

## 4. Các lệnh phát triển dự án

| Lệnh | Mục đích |
| :--- | :--- |
| `npm run dev` | Khởi chạy môi trường phát triển (mặc định tại `http://localhost:3000`) |
| `npm run build` | Biên dịch tối ưu cho môi trường Production (sử dụng Next.js Turbopack) |
| `npm run start` | Chạy ứng dụng sau khi đã build production |
| `npm run lint` | Quét kiểm tra chuẩn mã nguồn và TypeScript (ESLint) |

---

## 5. Cấu trúc thư mục dự án

```text
├── app/
│   ├── (auth)/             # Nhóm route xác thực (Đăng nhập / Đăng ký)
│   │   ├── login/          # Trang Đăng nhập
│   │   ├── register/       # Trang Đăng ký
│   │   └── layout.tsx      # Layout chia cột & nhận diện thương hiệu Auth
│   ├── (main)/             # Nhóm route chính của khách hàng (Trang chủ, Đặt lịch, Hồ sơ)
│   ├── components/
│   │   ├── ui/             # Bộ component nền tảng shadcn/ui (Button, Input, Card, Label, Alert)
│   │   └── auth/           # Bộ icon và component hỗ trợ riêng cho phần Auth
│   ├── lib/
│   │   ├── api.clients.ts  # Cấu hình Axios Client & Interceptors gắn JWT
│   │   ├── auth.api.ts     # Các hàm gọi API xác thực (login, register)
│   │   └── utils.ts        # Hàm helper cn() kết hợp clsx & tailwind-merge
│   ├── store/              # Quản lý State toàn cục bằng Zustand (AuthStore)
│   ├── types/              # Định nghĩa TypeScript Types (LoginReq, RegisterReq, User)
│   ├── globals.css         # Cấu hình CSS toàn cục với Tailwind v4
│   └── layout.tsx          # Root Layout toàn trang
├── .env.example            # File mẫu chứa các biến môi trường
└── README.md               # Tài liệu hướng dẫn dự án
```
