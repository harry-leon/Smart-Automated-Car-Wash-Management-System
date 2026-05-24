# 🚗 AutoWash Pro — AURA CAR CARE
> **Smart Automated Car Wash Management System**
>
> Một giải pháp toàn diện quản lý chuỗi rửa xe tự động thông minh, bao gồm ứng dụng đặt lịch cho khách hàng (Customer Portal), bảng điều khiển vận hành cho nhân viên (Staff Operations), và hệ thống quản trị chuyên sâu (Admin Dashboard).

<p align="left">
  <img src="https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-20232a?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white" alt="SpringBoot" />
  <img src="https://img.shields.io/badge/Java_21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
</p>


---

## 🛡️ Trạng thái Hệ thống & CI/CD

[![Continuous Integration (CI)](https://github.com/harry-leon/Smart-Automated-Car-Wash-Management-System/actions/workflows/ci.yml/badge.svg)](file:///d:/CarWash/.github/workflows/ci.yml)
[![Dependabot](https://img.shields.io/badge/dependabot-enabled-blue.svg?logo=dependabot)](file:///d:/CarWash/.github/dependabot.yml)
[![PR Template](https://img.shields.io/badge/PR_Template-configured-brightgreen.svg)](file:///d:/CarWash/.github/pull_request_template.md)
[![Protected Branches](https://img.shields.io/badge/branches-protected-red.svg)](#-quy-trình-phát-triển--cộng-tác-nhóm)

---

## 🧭 Kiến trúc Workspaces (Phân hệ Hệ thống)

Hệ thống được chia tách rõ rệt thành **3 phân hệ độc lập (Workspaces)**, đảm bảo bảo mật và ranh giới nghiệp vụ rõ ràng:

| Workspace | Người dùng | URL Route Prefix | Nhiệm vụ chính |
|---|---|---|---|
| **📱 [Customer Portal](file:///d:/CarWash/autowash-frontend/src/app/customer)** | Khách hàng | `/customer/*` | Quản lý xe, Đặt lịch rửa xe (Checkout 7 bước), Tích điểm & Đổi thưởng, Theo dõi tiến độ rửa xe realtime. |
| **🔧 [Staff Operations](file:///d:/CarWash/autowash-frontend/src/app/staff)** | Nhân viên vận hành | `/staff/*` | Check-in xe, Quản lý hàng đợi rửa xe (Kanban board), Điều khiển bộ đếm thời gian rửa xe, Xác nhận hoàn thành. |
| **📊 [Admin Dashboard](file:///d:/CarWash/autowash-frontend/src/app/admin)** | Quản trị viên | `/admin/*` | Theo dõi KPI doanh thu/đơn đặt, CRUD gói dịch vụ/khuyến mãi/vouchers, Phân công nhân sự, Báo cáo & Phân tích chuyên sâu. |

---

## ⚡ Stack Công Nghệ (Technology Stack)

### **Frontend**
* **Core:** Next.js 14 (App Router) & TypeScript
* **Styling:** Tailwind CSS & Lucide Icons
* **State Management:** Zustand (Client state) & TanStack Query v5 (Server state)
* **Realtime Communication:** Native WebSocket API
* **Charts:** Recharts

### **Backend**
* **Core:** Spring Boot 3.3.5 (Java 21) & Spring Security
* **Database:** PostgreSQL (Production) / H2 Database (Testing)
* **Authentication:** JWT (Access Token 1h & Refresh Token 30 ngày)
* **API Documentation:** OpenAPI v3 / Swagger UI

---

## 📂 Cấu Trúc Dự Án (Folder Directory)

```text
CarWash/
├── .github/                          # Cấu hình GitHub Actions, Dependabot & PR Template
├── autowash-frontend/                # 💻 Next.js Frontend App
│   ├── public/                       # Assets tĩnh (logo, ảnh...)
│   └── src/
│       ├── app/                      # Các trang theo cấu trúc App Router (3 Workspaces)
│       ├── components/               # UI Primitives & Components theo từng phân hệ
│       ├── hooks/                    # Custom Hooks (useAuth, useWebSocket, useBookings...)
│       ├── lib/                      # Axios Instance, Validators & Constants
│       ├── store/                    # Zustand Stores (auth, booking, user...)
│       └── types/                    # TypeScript Type Definitions
├── autowash-backend/                 # ☕ Spring Boot Backend Application
│   ├── src/
│   │   ├── main/java/com/autowash/   # Modular Monolith packages (auth, booking, loyalty...)
│   │   └── main/resources/           # Cấu hình hệ thống (application.yml, db migrations...)
│   └── pom.xml                       # Quản lý thư viện Maven Backend
└── docs/                             # 📚 Tài liệu thiết kế & Đặc tả hệ thống
    ├── master/                       # PROJECT.md (Tài liệu chuẩn của dự án)
    ├── context/                      # Context chi tiết cho Frontend & Backend
    └── specs/                        # Đặc tả API contracts & Prototype Behaviors
```

---

## 🛠️ Hướng Dẫn Chạy Local (Local Development Setup)

### **1. Yêu cầu hệ thống (Prerequisites)**
* **Node.js** v18+ & **npm** v9+
* **Java JDK** 21
* **Maven** v3.9+
* **PostgreSQL** v15+ (hoặc sử dụng H2 mặc định khi test)

### **2. Chạy Frontend**
```bash
# Di chuyển vào thư mục Frontend
cd autowash-frontend

# Cài đặt thư viện
npm install

# Khởi chạy môi trường Development
npm run dev
```
👉 Truy cập giao diện tại: [http://localhost:3000](http://localhost:3000)

### **3. Chạy Backend**
```bash
# Di chuyển vào thư mục Backend
cd autowash-backend

# Biên dịch và build dự án
mvn clean install

# Chạy ứng dụng Spring Boot
mvn spring-boot:run
```
👉 Xem tài liệu API Swagger tại: `http://localhost:8080/swagger-ui/index.html` (khi server chạy)

---

## 🤝 Quy Trình Phát Triển & Cộng Tác Nhóm

Để đảm bảo chất lượng mã nguồn khi phát triển đông thành viên, dự án áp dụng nghiêm ngặt quy trình phát triển sau:

### **1. Bảo vệ nhánh chính (Branch Protection)**
* Cả hai nhánh **`main`** và **`dev`** đều được bảo vệ bằng **GitHub Rulesets**.
* Lập trình viên **không thể push trực tiếp** lên hai nhánh này. Mọi thay đổi bắt buộc phải thông qua **Pull Request (PR)**.
* Tài khoản quản trị viên (Admin) được cấu hình trong danh sách *Bypass* để hỗ trợ merge khẩn cấp.

### **2. Quy trình gửi code (Pull Request Workflow)**
1. Lập trình viên tạo nhánh phụ từ máy cá nhân (Ví dụ: `git checkout -b feature/auth`).
2. Thực hiện lập trình, chạy thử và kiểm tra định dạng code cục bộ.
3. Push nhánh phụ lên GitHub: `git push origin feature/auth`.
4. Tạo Pull Request trên GitHub. Biểu mẫu mô tả chuẩn [PR Template](file:///d:/CarWash/.github/pull_request_template.md) sẽ tự động được hiển thị. Lập trình viên điền thông tin mô tả chi tiết và hoàn thành checklist kiểm tra chất lượng.
5. Người quản trị (Admin) review code, phê duyệt và thực hiện Merge PR vào nhánh chính.

### **3. Tích hợp liên tục & Bảo mật tự động (CI & Dependabot)**
* **GitHub Actions (CI):** Mỗi khi có PR gửi vào `dev` hoặc `main`, hệ thống tự động kiểm thử build Frontend Next.js và chạy Maven Build kèm unit test của Spring Boot để đảm bảo code không gây lỗi biên dịch.
* **Dependabot:** Tự động quét và cảnh báo các thư viện Frontend/Backend lỗi thời hoặc chứa lỗ hổng bảo mật hàng tuần, tự động tạo PR nâng cấp thư viện lên phiên bản an toàn.

---

## 📚 Tài Liệu Hướng Dẫn & Đặc Tả
* 📖 **Tài liệu master:** [PROJECT.md](file:///d:/CarWash/docs/master/PROJECT.md)
* 💻 **Context Frontend:** [FRONTEND_CONTEXT.md](file:///d:/CarWash/docs/context/FRONTEND_CONTEXT.md)
* ☕ **Context Backend:** [BACKEND_CONTEXT.md](file:///d:/CarWash/docs/context/BACKEND_CONTEXT.md)
* ⚡ **Đặc tả API Contracts:** [autowash_api_contracts.md](file:///d:/CarWash/docs/specs/autowash_api_contracts.md)

---
*Phát triển bởi đội ngũ kỹ sư của dự án AutoWash Pro. Cập nhật tháng 05/2026.*
