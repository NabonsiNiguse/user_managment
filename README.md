# 🛡️ Enterprise-Grade Auth & User Management System (MySQL Edition)

A robust, full-stack authentication and authorization engine built with a **Security-First** philosophy. This project demonstrates advanced implementation of Role-Based Access Control (RBAC) and industry-standard protection layers to mitigate common web vulnerabilities in a relational database environment.

---

## 🔒 Advanced Security Architecture

This system implements a multi-layered defense strategy:

### 1. Identity & Session Management
* **Dual-Token Strategy:** Implements short-lived **JWT Access Tokens** for authorization and long-lived **Database-backed Refresh Tokens** for persistent sessions.
* **Secure Storage:** Tokens are delivered via **HttpOnly & Secure Cookies**, providing a strong defense against Cross-Site Scripting (XSS).
* **BcryptJS (v3.0.3):** Utilizes industry-standard password hashing with adaptive salt rounds to ensure user credentials remain secure even in the event of a data breach.

### 2. API Hardening & Middleware
* **Helmet.js:** Automatically configures secure HTTP headers to prevent Clickjacking, MIME-sniffing, and XSS.
* **Express-Rate-Limit:** Implements a sliding-window algorithm to thwart Brute-force login attempts and DoS attacks.
* **HPP (HTTP Parameter Pollution):** Protects the API from attacks that exploit how the server handles multiple parameters of the same name.
* **CORS:** Strict Cross-Origin Resource Sharing policies to ensure only authorized frontend domains can interact with the API.

### 3. Data Integrity & Optimization
* **MySQL2 & Prepared Statements:** Leveraging `mysql2` to ensure high-performance database interactions and built-in protection against **SQL Injection**.
* **Compression:** Gzip compression middleware to reduce payload size, significantly improving response times for the end-user.
* **Input Validation:** Robust data sanitization and server-side validation to ensure only clean, structured data enters the database.

---

## 🛠️ Technical Stack Deep-Dive

| Dependency | Core Function | Advanced Definition |
| :--- | :--- | :--- |
| **express (5.2.1)** | Web Framework | The latest release featuring native Promise support and improved routing logic. |
| **mysql2** | RDBMS Driver | High-performance MySQL client supporting prepared statements and connection pooling. |
| **jsonwebtoken** | Stateless Auth | Implements RFC 7519 for secure, compact information transmission via JSON objects. |
| **helmet** | Header Security | A collection of middleware to set security-related HTTP headers for browser protection. |
| **compression** | Optimization | Implements Gzip/Deflate to minimize bandwidth consumption and reduce latency. |
| **hpp** | Security | Defense against Parameter Pollution by filtering the HTTP query string. |
| **dotenv** | Configuration | Decouples credentials from code following the Twelve-Factor App methodology. |

---

## 🚀 Key Functionalities

* **Role-Based Access Control (RBAC):** Granular permission system distinguishing between **Super Admins**, **Admins**, and **Users**.
* **Session Revocation:** Full capability to invalidate sessions by removing Refresh Tokens from the MySQL database upon logout.
* **Modern Backend:** Built with **Express 5.x**, ensuring the application is ready for the future of the Node.js ecosystem.

---

## 📂 Architecture
Built with **Clean Architecture** principles, maintaining a strict separation of concerns between Controllers, Routes, Models, and Middlewares to ensure the codebase remains scalable and maintainable.