# 🎬 PHIMIUM - Real-World Experience Connecting Platform

<p align="center">
  <img src="https://img.shields.io/badge/Spring%20Boot-F21437?style=for-the-badge&logo=springboot&logoColor=white" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/MySQL-00758F?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
  <img src="https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white" alt="JWT" />
</p>

---

## 📖 Overview & Value Proposition

**Phimium** là nền tảng kết nối mô hình **B2C2C** tiên phong, kết hợp giải pháp **Verified Experience Buddy** và **Không gian trải nghiệm công khai**. Hệ thống được thiết kế nhằm giúp Gen Z, người hướng nội và sinh viên xa nhà xóa tan rào cản tâm lý, thúc đẩy họ tự tin bước ra khỏi vùng an toàn để tham gia các hoạt động thực tế (workshop, boardgame, triển lãm), đồng thời tối ưu hóa tỷ lệ lấp đầy cho các đối tác tổ chức sự kiện.

### Key Solutions Addressed:
* **Trust & Safety First:** Chuyển dịch nghĩa vụ eKYC nghiêm ngặt sang phía cung (Buddy). Khách hàng phổ thông chỉ cần thông tin cơ bản để trải nghiệm mượt mà.
* **Controlled Environment:** Tuyệt đối không hỗ trợ gặp riêng 1-1 ở giai đoạn đầu. Toàn bộ hoạt động diễn ra theo nhóm nhỏ (4-6 người) tại các địa điểm đối tác đã được xác thực danh tính.
* **Social Support Layer:** Buddy đóng vai trò là "chất xúc tác xã hội" hỗ trợ đón tiếp, gợi chuyện, phá băng kết nối thành viên chứ không can thiệp chuyên môn.

---

## 🛠️ Tech Stack & Architecture

Dự án áp dụng kiến trúc **Decoupled Architecture (Client-Server Split)** giúp tối ưu năng suất phát triển độc lập và khả năng mở rộng hệ thống.

### 💻 Front-end (Client Side)
* **Core:** ReactJS (v18+) với Functional Components & Hooks.
* **Styling:** Tailwind CSS (Utility-first, Responsive UI).
* **State & Routing:** Context API / React Router DOM.
* **HTTP Client:** Axios (Tích hợp Interceptors tự động đính kèm JWT Bearer Token).

### ⚙️ Back-end (Server Side)
* **Framework:** Spring Boot (Java 17).
* **Security:** Spring Security cấu hình Stateless Session, tích hợp bộ lọc **JWT Authentication Filter**.
* **Persistence Layer:** Spring Data JPA kết nối cơ sở dữ liệu quan hệ **MySQL**.
* **Pattern:** Cấu trúc phân lớp chuẩn: `Controller` ➡️ `Service` ➡️ `Repository` ➡️ `Entity`.

---

## 📂 Project Structure

```text
phimium-root/
│
├── phimium-backend/               # Spring Boot Application
│   ├── src/main/java/com/phimium/app/
│   │   ├── config/                # Security, JWT & App Configurations
│   │   ├── controllers/           # REST Controllers (API Endpoints)
│   │   ├── dtos/                  # Data Transfer Objects (Requests/Responses)
│   │   ├── entities/              # JPA Data Models (MySQL Schemas)
│   │   ├── repositories/          # Spring Data JPA Repositories
│   │   └── services/              # Core Business Logic Layer
│   └── src/main/resources/
│       └── application.properties # Database & JWT Signing Key Configs
│
└── phimium-frontend/              # ReactJS + Tailwind Application
    ├── public/
    └── src/
        ├── assets/                # Images, Icons, Logos
        ├── components/            # Reusable UI Components (Navbar, Cards, Modals)
        ├── context/               # Global Authentication State
        ├── hooks/                 # Custom Hooks (useAuth, useFetch)
        ├── pages/                 # Page Views (Home, Discovery, Booking, Dashboard)
        └── services/              # API Client (Axios Instances & Endpoints)
