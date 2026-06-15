# 🎬 PHIMIUM - Real-World Experience Connecting Platform

<p align="center">
  <img src="https://img.shields.io/badge/Spring%20Boot-F21437?style=for-the-badge&logo=springboot&logoColor=white" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white" alt="JWT" />
</p>

---

## 📖 Overview & Value Proposition

**Phimium** là nền tảng kết nối mô hình **B2C2C** tiên phong, kết hợp giải pháp **Verified Experience Buddy** và **Không gian trải nghiệm công khai**. Hệ thống được thiết kế nhằm giúp Gen Z, người hướng nội và sinh viên xa nhà xóa tan rào cản tâm lý, thúc đẩy họ tự tin bước ra khỏi vùng an toàn để tham gia các hoạt động thực tế như workshop, boardgame, triển lãm, đồng thời tối ưu hóa tỷ lệ lấp đầy cho các đối tác tổ chức sự kiện.

### Key Solutions Addressed:
* **Trust & Safety First:** Chuyển dịch nghĩa vụ eKYC nghiêm ngặt sang phía cung (Buddy). Khách hàng phổ thông chỉ cần thông tin cơ bản để trải nghiệm mượt mà.
* **Controlled Environment:** Tuyệt đối không hỗ trợ gặp riêng 1-1 ở giai đoạn đầu. Toàn bộ hoạt động diễn ra theo nhóm nhỏ từ 4-6 người tại các địa điểm đối tác công khai đã được xác thực danh tính.
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
* **Persistence Layer:** Spring Data JPA kết nối cơ sở dữ liệu quan hệ **PostgreSQL**.
* **Pattern:** Cấu trúc phân lớp chuẩn: `Controller` ➡️ `Service` ➡️ `Repository` ➡️ `Entity`.

---

## 📂 Project Structure

### ⚙️ Back-end Architecture (Spring Boot)
Cấu trúc package của Server được thiết kế theo mô hình phân lớp chuẩn (Layered Architecture) dưới package gốc `com.be` (Tham chiếu chi tiết tại image_f24926.png):

```text
com.be/
│
├── controller/         # Tiếp nhận HTTP Requests, điều hướng và trả về REST Response
├── dto/                # Data Transfer Objects - Gói dữ liệu trao đổi giữa Client và Server
├── entity/             # Cấu trúc các bảng dữ liệu (JPA Mapping) đồng bộ với PostgreSQL
├── mapper/             # Xử lý chuyển đổi qua lại giữa Entity và DTO
├── repository/         # Tầng giao tiếp trực tiếp với Database (Spring Data JPA)
├── service/            # Nơi xử lý toàn bộ logic nghiệp vụ (Business Logic Layer)
└── BeApplication.java  # Main class khởi chạy ứng dụng Spring Boot

##💻 Front-end Architecture (ReactJS + Tailwind CSS)

src/
│
├── app/                # Cấu hình thiết lập global cho ứng dụng (Axios Instance, Context...)
├── assets/             # Lưu trữ tài nguyên tĩnh (Images, Icons, Logos)
├── components/common/  # Các UI Components dùng chung toàn hệ thống (Button, Input, Modal, Navbar)
├── constants/          # Quản lý các biến hằng số cố định, Endpoint URLs
├── features/movies/    # Quản lý các Components & Logic xử lý riêng theo từng tính năng đặc thù
├── hooks/              # Custom Hooks tách biệt logic trạng thái tái sử dụng (useAuth, useFetch)
├── layouts/            # Các khung giao diện mẫu của hệ thống (MainLayout, AuthLayout)
├── pages/              # Các View/Screen chính hiển thị trên Router (Home, Discovery, Booking)
├── routes/             # Cấu hình hệ thống tuyến đường và phân quyền Router (React Router DOM)
├── services/           # Quản lý các hàm gọi API tương tác trực tiếp với Server
├── utils/              # Các hàm trợ giúp xử lý logic chung (Format date, validate...)
├── index.css           # File cấu hình Tailwind CSS toàn cục
└── main.jsx            # Điểm khởi tạo cấu trúc DOM của ứng dụng React
