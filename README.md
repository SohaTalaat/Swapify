# Swapify (BarterLink) – Smart Barter Exchange Platform

![Laravel 12](https://img.shields.io/badge/Laravel-12.x-FF2D20?logo=laravel)
![Angular](https://img.shields.io/badge/Angular-20.x-DD0031?logo=angular)
![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?logo=mysql)
![License](https://img.shields.io/badge/License-MIT-green)

Swapify is a **smart, secure, and sustainable barter platform** that enables users to exchange products and services **without money**. Built with **Laravel 12 (API backend)** and **Angular (SPA frontend)**, Swapify empowers eco-conscious consumers, budget-savvy shoppers, collectors, and service providers to trade fairly and build trust within a verified community.

---

## 🌟 Features

### ✅ Core Functionality

- **User Registration & Authentication**

  - Email + password (with strong validation)
  - Google OAuth login
  - Email verification (24-hour expiry)
  - Password reset (24-hour secure link)
  - Session-based SPA auth with Laravel Sanctum

- **Profile & Trust System**

  - Upload profile picture
  - Set bio, location, and communication preferences
  - ID verification (upload ID + selfie)
  - Verified badge for trusted users

- **Barter Listings**

  - Create **product** listings (with condition, images, category)
  - Create **service** listings (with availability, portfolio)
  - Up to 5 images per listing
  - Describe what you seek in return

- **Smart Matching & Discovery**

  - AI-powered barter suggestions (NLP-based)
  - Full-text search + advanced filters
  - Category browsing

- **Communication & Workflow**

  - Real-time messaging per barter
  - In-app + email notifications
  - Choose **delivery** or **in-person** exchange
  - Manage multiple shipping addresses

- **Post-Exchange Trust**

  - Multi-aspect ratings (communication, condition, timeliness)
  - Dispute resolution with evidence upload
  - Return requests with tracking

- **Admin & Monetization**
  - Admin dashboard (users, listings, disputes)
  - Premium subscriptions
  - Transaction fees (configurable by tier)

---

## 🛠️ Tech Stack

| Layer            | Technology                        |
| ---------------- | --------------------------------- |
| **Backend**      | Laravel 12, PHP 8.2+, MySQL 8     |
| **Frontend**     | Angular 20, TypeScript, RxJS      |
| **Auth**         | Laravel Sanctum (SPA mode)        |
| **File Storage** | Cloudinary (images, ID documents) |
| **Email**        | SMTP (Gmail)                      |

---

## 📦 Installation

### Prerequisites

- PHP 8.2+
- Composer
- Node.js 18+
- MySQL 8
- Cloudinary account (free tier)
- SMTP email service (e.g., Brevo, Gmail)

```bash
git clone https://github.com/SohaTalaat/Swapify.git
```

### Backend (Laravel)

```bash
cd backend

# Install dependencies
composer install

# Environment setup
cp .env.example .env
# Edit .env with your DB, Cloudinary, and SMTP credentials

# Generate app key
php artisan key:generate

# Run migrations
php artisan migrate

# Start server
php artisan serve
```

### Frontend (Angular)

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
ng serve
```

> 💡 **Note**: Ensure `SESSION_DOMAIN=.localhost` and `SANCTUM_STATEFUL_DOMAINS` include `localhost:4200` in `.env`.

---

## 🔐 Security Highlights

- **Email verification required** before full access (US-8.1)
- **One-time, expiring tokens** for verification & password reset
- **ID documents stored privately** in Cloudinary (US-8.3)
- **Rate limiting** on auth endpoints
- **Soft deletes** for user data (GDPR-compliant)

---

## 📄 User Stories Coverage

Swapify fully implements all 14 Epics from the official requirements (Check Docs), including:

- **Epic 1**: Secure registration & profile (US-1.1 to US-1.5)
- **Epic 2**: Product & service listings (US-2.1 to US-2.5)
- **Epic 3**: AI matching + search (US-3.1 to US-3.4)
- **Epic 5**: Trust via ratings & disputes (US-5.1 to US-5.3)
- **Epic 6/7**: Shipping, receipt confirmation, returns (US-6.1–6.4, US-7.1–7.3)
- **Epic 8**: Email + ID verification (US-8.1, US-8.3)
- **Epic 9**: Admin dashboard (US-9.1–9.4)
- **Epic 14**: Subscriptions & fees (US-14.1, US-14.2)

---

## 🧪 Testing

- **Postman collection** included for all API endpoints
- **Auth flow**: Register → Verify → Complete Profile → Login → Upload → Barter
- **File uploads**: Profile picture, listing images, ID verification
- **Token expiry**: Verification (24h), Password Reset (24h), Login (30 days)

---

## 👥 Team

- **Soha Talaat** – Team Lead, Backend Developer
- **Abdelrahman Ramadan** – Backend Developer
- **Abanoub Yousry** – Frontend Developer
- **Sarah Mahmoud** – Frontend Developer

---

## 📄 License

This project is licensed under the **MIT License** – see the [LICENSE](LICENSE) file for details.

---

> **Swapify** – Trade Smarter, Not Harder.  
> _Sustainability meets community in every exchange._
