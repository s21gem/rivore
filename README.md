# Rivoré - Luxury Perfume E-Commerce

> **Developed by [Musa Abdullah / s21gem]**

## 📖 Project Overview
Rivoré is a premium, full-stack e-commerce web application designed for a luxury perfume brand. Developed independently, it features a sleek, modern, and responsive user interface with smooth animations, alongside an enterprise-grade backend for managing products, combos, secure payments, and extensive site settings.

## 🚀 Tech Stack

### Frontend
*   **Framework:** React 19 with Vite
*   **Styling:** Tailwind CSS
*   **Routing:** React Router DOM
*   **State Management:** Zustand (Cart & Auth state)
*   **Animations:** Framer Motion
*   **Icons:** Lucide React
*   **Notifications:** Sonner (Toast notifications)

### Backend
*   **Server:** Node.js with Express.js
*   **Database:** MongoDB (via Mongoose)
*   **Authentication:** JWT (JSON Web Tokens) & bcryptjs
*   **Security:** Cloudflare Turnstile (WAF), express-rate-limit, helmet, mongoSanitize
*   **Image Storage:** Cloudinary (f_auto, q_auto optimizations)
*   **Integrations:** UddoktaPay, Steadfast Courier, bKash

---

## 📂 Project Structure

```text
/
├── public/               # Static assets
├── server/               # Backend Express Application
│   ├── middleware/       # JWT Auth, Rate Limiting, Security middleware
│   ├── models/           # Mongoose Schemas
│   ├── services/         # Automated Crons (Backups, Courier)
│   └── routes/           # API Endpoints (auth, products, orders, payment, admin)
├── src/                  # Frontend React Application
│   ├── components/       # Reusable UI components
│   ├── pages/            # Public and Account pages
│   │   ├── admin/        # Admin Dashboard & Enterprise Audit Center
│   ├── store/            # Zustand stores
│   ├── App.tsx           # Main application routing (with Code Splitting)
│   └── main.tsx          # React entry point
├── .env                  # Environment variables
└── server.ts             # Main backend entry point
```

---

## 📜 Development History & Milestones

### Phase 1: UI/UX Design & Static Frontend
*   Designed a luxury-themed UI with a dark/light aesthetic.
*   Integrated **Framer Motion** for smooth animations.

### Phase 2: State Management & Admin UI
*   Integrated **Zustand** for global state management.
*   Built the Admin Dashboard layout with sidebar navigation.

### Phase 3: Backend Architecture & Database
*   Converted to Full-Stack using Express.js and **MongoDB**.
*   Implemented **JWT Authentication** for the Admin panel.

### Phase 4: Dynamic Data Integration
*   Refactored pages to fetch dynamic data from the database.
*   Implemented server-side **Pagination**, **Search**, and **Category Filtering**.

### Phase 5: Cloud Storage & Invoices
*   Migrated image hosting to **Cloudinary** for optimized asset delivery.
*   Added `jspdf` for generating A4 Invoices and POS Thermal receipts.

### Phase 6: CMS & Post-Payment Automations
*   Expanded the `Settings` model into a full-scale Headless CMS.
*   Implemented automated post-payment workflows (Loyalty Points, Membership Tiers, Automated Courier Dispatch).

### Phase 7: Production-Ready Security & Payments (Latest)
*   **Payment Center:** Fully integrated production-grade **UddoktaPay** gateway with secure IPN webhooks and idempotency checks.
*   **Enterprise Audit & System Health:** Created a dedicated Security Center to monitor Database health, active JWT sessions, API response times, and Cloudinary asset limits.
*   **Security Hardening:** Enforced **Cloudflare Turnstile** across sensitive endpoints, along with strict rate limiting, XSS protection, and Mongo sanitization.
*   **Performance:** Code-split bundles via `React.lazy()` for massive performance gains resulting in sub-8-second builds.

---

## ⚙️ Environment Variables Setup

```env
# MongoDB Connection String (Atlas)
MONGODB_URI="your_mongodb_uri"

# JWT Secret for Authentication
JWT_SECRET="your_secret"

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

## 🛠️ Current Status
*   **Production Ready:** The project successfully compiles via `tsc && vite build` with zero TypeScript or Linting errors.
*   Fully optimized for SEO, security, and scalability.

## 🤝 Developer
**Developed exclusively by [Musa Abdullah / s21gem]**.
Feel free to fork, explore, or reach out if you have any questions regarding the architecture.
