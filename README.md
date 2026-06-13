# 🛡️ SecLab - Web Attack Simulator

A full-stack cybersecurity educational platform designed to demonstrate common web application vulnerabilities in a safe and controlled lab environment. The project allows students and security enthusiasts to simulate attacks, observe detection mechanisms, and learn prevention techniques.

> ⚠️ Educational Use Only
> This application is intended strictly for cybersecurity education, training, and awareness purposes. Do not deploy vulnerable configurations in production environments.

---

# 📌 Features

## Vulnerability Demonstrations

The platform provides hands-on demonstrations for:

### 1. SQL Injection (SQLi)

* Login bypass attacks
* Data extraction payloads
* UNION SELECT attacks
* Time-based SQLi examples
* Detection of suspicious SQL patterns

### 2. Stored Cross-Site Scripting (Stored XSS)

* Persistent script injection
* Demonstrates how malicious scripts affect future users
* Payload storage and rendering simulation
* XSS detection alerts

### 3. Reflected Cross-Site Scripting (Reflected XSS)

* Reflection of user input in responses
* Script execution simulation
* Detection of reflected payloads

### 4. Cross-Site Request Forgery (CSRF)

* CSRF token validation demonstration
* Secure vs vulnerable implementations
* Request forgery simulation

### 5. Brute Force Login Attack

* Multiple failed login monitoring
* Suspicious login attempt detection
* Account protection demonstration

---

# 🚀 Key Features

* Vulnerable Mode vs Secure Mode
* Real-time Attack Detection
* Attack Logging Dashboard
* Login and Signup Demonstrations
* SQL Injection Payload Testing
* XSS Payload Testing
* CSRF Token Validation
* Brute Force Detection
* Educational Explanations
* Prevention Techniques
* Attack Reports

---

# 🏗️ System Architecture

```text
User Input
     │
     ▼
Attack Simulation Module
     │
     ▼
Detection Engine
     │
     ▼
Attack Logger
     │
     ▼
Database Storage
     │
     ▼
Dashboard & Reports
```

---

# 📂 Project Modules

## Home Page

Provides an overview of all attack simulations and learning objectives.

## Login Demo

Demonstrates:

* SQL Injection login bypass
* Brute force attack detection
* Secure authentication practices

## Signup Demo

Demonstrates:

* Stored XSS attacks
* Input validation techniques
* Secure registration workflow

## SQL Injection Module

Demonstrates:

* Authentication bypass
* Data extraction
* Malicious SQL payload execution
* SQLi pattern detection

### Example Payloads

```sql
' OR '1'='1
' OR 1=1 --
admin'--
' UNION SELECT username,password FROM users--
'; DROP TABLE users; --
```

---

## Stored XSS Module

### Example Payloads

```html
<script>alert('XSS')</script>

<img src=x onerror=alert(1)>

<svg onload=alert(1)>
```

---

## Reflected XSS Module

### Example Payloads

```html
<script>alert(document.cookie)</script>

<img src=x onerror=alert('Reflected XSS')>
```

---

## CSRF Module

Demonstrates:

* Forged requests
* Missing CSRF token validation
* Secure token verification process

---

## Brute Force Module

Demonstrates:

* Repeated login attempts
* Failed login monitoring
* Detection thresholds
* Alert generation

---

# 🔍 Detection Mechanisms

## SQL Injection Detection

Patterns monitored:

```text
OR 1=1
UNION SELECT
DROP TABLE
--
SLEEP()
xp_cmdshell
```

---

## XSS Detection

Patterns monitored:

```html
<script>
javascript:
onerror=
onload=
iframe
svg
```

---

## CSRF Detection

Checks:

* Missing CSRF tokens
* Invalid tokens
* Request origin validation

---

## Brute Force Detection

Monitors:

* Failed login count
* Login frequency
* IP-based attack attempts

---

# 📊 Attack Dashboard

The dashboard records:

* Timestamp
* Attack Type
* Source IP Address
* Payload
* Detection Status
* Severity Level

---

# 📈 Reports Section

Provides:

* Attack summaries
* Detection statistics
* Logged payloads
* Prevention recommendations

---

# 🛡️ Prevention Techniques

## SQL Injection Prevention

* Parameterized Queries
* Prepared Statements
* Input Validation
* Least Privilege Access

## XSS Prevention

* Output Encoding
* Input Sanitization
* Content Security Policy (CSP)

## CSRF Prevention

* CSRF Tokens
* SameSite Cookies
* Origin Validation

## Brute Force Prevention

* Rate Limiting
* Account Lockout
* CAPTCHA
* Multi-Factor Authentication

---

# 🛠️ Technologies Used

### Frontend

* React
* TypeScript
* Tailwind CSS
* Vite

### Backend

* Node.js
* Express.js

### Database

* MongoDB / MySQL / Supabase

### Security Features

* Input Validation
* Attack Pattern Detection
* Logging System
* Authentication

---

# ⚙️ Installation

Clone the repository:

```bash
git clone https://github.com/Heshaja/SecLab---Web-Attack-Stimualtor.git
```

Move into the project directory:

```bash
cd SecLab---Web-Attack-Stimualtor
```

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

---


# 🎯 Learning Outcomes

By using this platform, students can:

* Understand common web vulnerabilities
* Learn how attacks are performed
* Observe attack detection techniques
* Study secure coding practices
* Explore prevention mechanisms

---

# 👨‍💻 Authors
* Priyavadhan Sai
  
Department of Computer Science and Engineering
Indian Institute of Technology , Bhubhaneswar

* T. Heshaja

Department of Computer Science and Engineering
Amrita Vishwa Vidyapeetham

---

# ⚠️ Disclaimer

This project is developed solely for educational and research purposes. The vulnerabilities demonstrated are intentionally simulated within a controlled environment. The authors are not responsible for misuse of the concepts presented in this project.
