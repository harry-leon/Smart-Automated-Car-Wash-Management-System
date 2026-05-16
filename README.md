<div align="center">
  <img src="https://img.shields.io/badge/Car_Wash-System-0052CC?style=for-the-badge&logo=appveyor" alt="Logo" />
  <h1>🚗 Smart Automated Car Wash Management System 🚿</h1>
  <p><em>Hệ thống quản lý rửa xe tự động thông minh với đặt lịch trước và chương trình khách hàng thân thiết.</em></p>
  
  <img src="https://img.shields.io/badge/Spring_Boot-F2F4F9?style=for-the-badge&logo=spring-boot" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens" alt="JWT" />
</div>

<br />

## 📖 1. Thông Tin Dự Án

* **📛 Tên dự án:** Smart Automated Car Wash Management System with Advance Booking & Loyalty Program
* **🎓 Môn học:** SWR303 (AI-Augmented Software Requirements)
* **📅 Học kỳ:** Summer 2026
* **👥 Nhóm:** Group 1

### 🎯 Mô tả tổng quan
Dự án số hóa toàn bộ quy trình chăm sóc và quản lý khách hàng cho dịch vụ rửa xe. Hệ thống bao gồm chức năng **đặt lịch trước (Advance Booking)**, tự động hóa **chương trình khách hàng thân thiết (Loyalty Automation)**, theo dõi **lịch sử dịch vụ (Wash-session Tracking)**, **khuyến mãi có mục tiêu (Targeted Promotions)**, và báo cáo thống kê qua một nền tảng web tập trung.

### 💡 Mục tiêu chính
Khắc phục các nhược điểm của việc quản lý thủ công (giấy tờ, Google Sheets), giảm tỷ lệ khách hàng *"no-show"*, đồng thời cá nhân hóa trải nghiệm khách hàng và tăng tỷ lệ giữ chân (*retention rate*).

### ✨ Tính năng nổi bật (USPs)
* 🚀 **Ưu tiên đặt lịch theo hạng thành viên** (*Tier-based booking priority*).
* 🔄 **Tự động xét duyệt và cập nhật hạng thành viên** hàng tháng (*Automatic tier review*).
* 🎁 **Tích điểm và đổi thưởng tự động** tại quầy thu ngân.
* 🎯 **Gửi khuyến mãi chính xác** theo từng tệp phân khúc khách hàng.

---

## 👨‍💻 2. Thành Viên & Vai Trò

Danh sách các thành viên trong nhóm và vai trò dự kiến:

| STT | 🧑‍💼 Họ và Tên | 🆔 MSSV | 🛠️ Vai trò trong nhóm |
| :---: | :--- | :--- | :--- |
| **1** | 👑 **Hà Thúc Quốc Hùng** | `SE191116` | Nhóm trưởng / Fullstack Developer |
| **2** | 💻 **Phạm Hoàng Gia Huy** | `SE192041` | Backend Developer |
| **3** | 🎨 **Trương Nguyễn Minh Khương** | `SE193311` | Frontend Developer |
| **4** | 📋 **Lê Đoàn Gia Hưng** | `SE193449` | Business Analyst (BA) / System Design |
| **5** | 🧪 **Tống Vỹ Thuận** | `SE194643` | UI/UX Designer / Tester |

<br />

<details>
<summary><b>🎭 Các Vai trò (Actors) trực tiếp trong hệ thống</b></summary>
<br/>

* 👤 **Customer (Khách hàng):** Đăng ký, quản lý biển số xe, đặt lịch hẹn, đổi điểm thưởng.
* 👔 **Staff (Nhân viên / Thu ngân):** Quản lý check-in, xử lý khách walk-in, ghi nhận wash session, tính tiền checkout.
* 🛠️ **Admin (Quản trị viên):** Cấu hình quy tắc xếp hạng (tier rules), chiến dịch khuyến mãi (promotion), kiểm tra báo cáo phân tích (dashboard analytics).

</details>

---

## 🛠️ 3. Công Nghệ Sử Dụng

Dự án được xây dựng với kiến trúc Web-based, sử dụng các công nghệ hiện đại nhằm đảm bảo tính ổn định và bảo mật:

### 🖥️ Frontend
* ⚛️ **ReactJS**: Xây dựng giao diện người dùng tương tác.
* 📊 **Chart.js**: Vẽ biểu đồ, hỗ trợ dashboard thống kê (Analytics nâng cao).

### ⚙️ Backend
* 🍃 **Spring Boot**: Xây dựng hệ thống RESTful APIs, xử lý logic nghiệp vụ phức tạp (*business rules*).
* ⏱️ **Scheduled Jobs (Cron Jobs)**: Chạy các tác vụ tự động ở background (tự động xét duyệt tier vào mùng 1 hàng tháng, tự động quét điểm hết hạn, gửi thông báo nhắc lịch).

### 🗄️ Database
* 🐘 **PostgreSQL**: Quản lý cơ sở dữ liệu quan hệ, đảm bảo tính toàn vẹn dữ liệu (*data integrity*), hỗ trợ lưu trữ Audit Logs.

### 🛡️ Security & Khác
* 🔐 **JWT (JSON Web Token)**: Xác thực và phân quyền (Role-Based Access Control - RBAC) chặt chẽ cho Customer, Staff và Admin.
* 🛡️ **Server-side Validation**: Đảm bảo tất cả các rules của hệ thống luôn được kiểm tra an toàn tại backend trước khi lưu.

---

## 🎨 4. Prototype & UI Design

Nhằm mục đích hình dung nghiệp vụ ban đầu và tạo nhanh luồng chạy thực tế (Main Flow), dự án đã sử dụng công cụ **Lovable.dev** để thiết kế Prototype nhanh chóng thông qua Prompt.

* 🖌️ **Công cụ thiết kế:** Lovable.dev
* 🚀 **Mục đích:** Khảo sát UI/UX, mô phỏng các tính năng cốt lõi (Customer Registration, Advance Booking, Wash-session tracking, Point Redemption) trước khi tiến hành code thực tế.
* 🔗 **Link Prototype:** *(Điền link Lovable.dev của nhóm vào đây)*
* 💡 **Mô tả (Prompt):** *(Có thể bổ sung prompt bạn đã dùng trên Lovable.dev vào đây)*
