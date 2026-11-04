# 🏟️ Sports Hall Booking Management System

A web-based application that simplifies sports hall reservations through online booking requests, administrator approval, and booking status management.

## 📌 Project Overview

The **Sports Hall Booking Management System** is designed to digitize the process of reserving sports facilities. Students can register, log in, check availability, and submit booking requests. Administrators can review requests and approve or reject them.

The application provides a centralized platform for managing sports hall reservations efficiently.

## 🎯 Objectives

- Simplify sports hall reservation.
- Reduce manual booking procedures.
- Prevent conflicting bookings.
- Provide administrator-controlled booking approval.
- Improve communication between students and administrators.
- Maintain booking information in a centralized database.

## ✨ Key Features

### Student
- Account registration.
- Email OTP verification.
- Secure login.
- Check sports hall availability.
- Submit booking requests.
- View personal booking history.
- Track booking approval status.

### Administrator
- View booking requests.
- Review pending bookings.
- Approve or reject booking requests.
- Manage booking operations.

### Super Administrator
- Manage administrator invitations.
- Control administrator access.
- Oversee booking management.

### Notifications
- Booking request submission feedback.
- Email OTP functionality.
- Booking approval and rejection email functionality.
- Booking status updates.

*Email delivery requires valid Gmail SMTP configuration.*

## 🔄 Booking Workflow

1. Student registers using an email address.
2. Student verifies their email using OTP.
3. Student logs into the application.
4. Student checks sports hall availability.
5. Student submits a booking request.
6. Administrator receives and reviews the request.
7. Administrator approves or rejects it.
8. Student can view the updated booking status.

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| Frontend | React.js |
| Backend | Java Spring Boot |
| Programming Language | Java 21 |
| Database | MySQL 8 |
| Build Tool | Maven |
| API Communication | REST APIs |
| Email Service | Gmail SMTP |
| Development Environment | Visual Studio Code |
| Version Control | Git and GitHub |

## 🏗️ Project Structure

```text
SportsHallBookingSystem/
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   └── resources/
│   │   └── test/
│   ├── pom.xml
│   └── mvnw.cmd
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── package-lock.json
│
├── .env.example
├── .gitignore
├── start-backend.ps1
└── start-frontend.ps1
```

## ⚙️ Installation and Setup

### Prerequisites

Install the following:

- Java Development Kit 21
- MySQL Server 8
- Node.js and npm
- Git
- Visual Studio Code

### 1. Clone the repository

```bash
git clone https://github.com/maradaraghu96-cmd/Sports-Hall-Booking-Management-System.git
```

```bash
cd Sports-Hall-Booking-Management-System
```

### 2. Configure MySQL

Create the database:

```sql
CREATE DATABASE sports_hall_booking_system;
```

Configure a MySQL user and grant the necessary database permissions.

### 3. Configure environment variables

Create a `.env` file in the project root using `.env.example` as a template.

Configure these variables:

```env
DB_PASSWORD=your_database_password
MAIL_USERNAME=your_gmail_address
MAIL_APP_PASSWORD=your_gmail_app_password
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
FRONTEND_URL=http://localhost:5173
```

**Important:** Never upload your `.env` file or expose your credentials on GitHub.

### 4. Start the backend

Open PowerShell in the project root:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\start-backend.ps1
```

Backend URL:

```text
http://localhost:8080
```

### 5. Start the frontend

Open another PowerShell terminal:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\start-frontend.ps1
```

Frontend URL:

```text
http://127.0.0.1:5173
```

## 🌐 API Overview

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/health` | GET | Application health check |
| `/api/auth/register` | POST | Student registration |
| `/api/auth/login` | POST | User authentication |
| `/api/auth/send-otp` | POST | Send email OTP |
| `/api/auth/verify-otp` | POST | Verify email OTP |
| `/api/bookings/availability` | GET | Check booking availability |
| `/api/bookings/my` | GET | View personal bookings |
| `/api/admin/bookings` | GET | View bookings |
| `/api/admin/bookings/pending` | GET | View pending requests |
| `/api/admin/bookings/{id}/approve` | PATCH | Approve a booking |
| `/api/admin/bookings/{id}/reject` | PATCH | Reject a booking |

## 🔐 Security

- Password-based authentication.
- Role-based authorization.
- Session-based authentication.
- Environment-based credential configuration.
- Administrator and Super Administrator access controls.

## 🚀 Future Enhancements

- Payment gateway integration.
- Interactive booking calendar.
- Booking cancellation and rescheduling.
- Advanced analytics dashboard.
- Deployment to a cloud platform.
- Automated testing and CI/CD integration.

## 👨‍💻 Developer

**Developed by:** Charan Tej

**Project:** Sports Hall Booking Management System

**GitHub Repository:**  
https://github.com/maradaraghu96-cmd/Sports-Hall-Booking-Management-System

---

⭐ If you find this project interesting, consider giving the repository a star!