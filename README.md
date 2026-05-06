# Rivore - Luxury Perfume E-Commerce

## 📖 Project Overview
Rivore is a premium, full-stack e-commerce web application designed for a luxury perfume brand. It features a sleek, modern, and responsive user interface with smooth animations, alongside a robust backend for managing products, combo sets, orders, and site settings.

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
*   **Authentication:** JWT (JSON Web Tokens) & bcryptjs for Admin login
*   **Image Storage:** Cloudinary (via Multer memory storage)
*   **Payment Gateways:** bKash, SSLCommerz, UddoktaPay (Integrated)

---

## 📂 Project Structure

```text
/
├── public/               # Static assets
├── server/               # Backend Express Application
│   ├── middleware/       # JWT Auth middleware
│   ├── models/           # Mongoose Schemas (Product, Combo, Order, Settings, User)
│   └── routes/           # API Endpoints (auth, products, combos, orders, settings, upload, payment)
├── src/                  # Frontend React Application
│   ├── components/       # Reusable UI components (Layout, Navbar, Footer, MetaPixel)
│   ├── pages/            # Public-facing pages
│   │   ├── admin/        # Admin Dashboard pages (Products, Combos, Settings, etc.)
│   │   ├── About.tsx
│   │   ├── Cart.tsx
│   │   ├── Checkout.tsx
│   │   ├── ComboPage.tsx
│   │   ├── Contact.tsx
│   │   ├── Home.tsx
│   │   ├── ProductDetails.tsx
│   │   └── Shop.tsx
│   ├── store/            # Zustand stores (cartStore.ts, authStore.ts)
│   ├── App.tsx           # Main application routing
│   └── main.tsx          # React entry point
├── .env                  # Environment variables
├── package.json          # Project dependencies and scripts
└── server.ts             # Main backend entry point & Vite middleware integration
```

---

## 📜 Development History & Milestones

### Phase 1: UI/UX Design & Static Frontend
*   Initialized the React + Vite project with Tailwind CSS.
*   Designed a luxury-themed UI with a dark/light aesthetic.
*   Integrated **Framer Motion** for smooth animations.

### Phase 2: State Management & Admin UI
*   Integrated **Zustand** for global state management (Shopping Cart).
*   Built the Admin Dashboard layout with a sidebar navigation.

### Phase 3: Backend Architecture & Database
*   Converted to Full-Stack using Express.js and **MongoDB**.
*   Implemented **JWT Authentication** for the Admin panel.

### Phase 4: Dynamic Data Integration
*   Refactored Shop, Home, and Product Details pages to fetch data from the database.
*   Implemented server-side **Pagination**, **Search**, and **Category Filtering**.

### Phase 5: Cloud Storage & Deployment Readiness
*   Migrated image hosting to **Cloudinary** for optimized asset delivery.

### Phase 6: Production Polish & Business Integrations
*   **Professional Invoice System:** Added `jspdf` for A4 Invoices and 58mm Thermal receipts.
*   **Dynamic Theme Branding:** Implemented intelligent dark/white logo swapping.
*   **Process Failsafes:** Fixed server lifecycle issues and token persistence bugs.

### Phase 7: Full CMS & Payment Gateway (Latest)
*   **Advanced CMS Panel:** Expanded the `Settings` model into a full-scale CMS. The Admin Settings page is now a 9-tab interface allowing control over:
    *   **Notification Banner:** Dynamic scrolling messages with a toggle.
    *   **Signature Collection:** Select up to 6 products + custom taglines for the homepage.
    *   **Why Rivore Section:** Customizable features with Lucide icons.
    *   **Store Location:** Manage store name, address, hours, and map image/URL.
    *   **Contact Page:** Control Google Maps embed, phone, and email info.
    *   **Social Links:** Dynamic links for Facebook, Instagram, TikTok, and WhatsApp.
*   **Payment Gateway Integration:**
    *   Integrated **bKash (Tokenized)**, **SSLCommerz**, and **UddoktaPay**.
    *   Credentials and toggles are managed directly via the Admin CMS.
    *   Implemented backend payment verification and webhook handlers.
    *   Dynamic Checkout: Users can choose between multiple payment methods during checkout.

---

## ⚙️ Environment Variables Setup

```env
# MongoDB Connection String (Atlas)
MONGODB_URI="your_mongodb_uri"

# JWT Secret for Admin Authentication
JWT_SECRET="your_secret"

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

## 🛠️ Current Status & Known Issues
*   **Type Safety:** Some minor TypeScript errors exist in `Home.tsx` and `Testimonials.tsx` (missing React imports or prop mismatches) that need cleaning up.
*   **Payment Flow:** Gateway credentials must be filled in the Admin Settings tab before testing live redirects.

## 🛠️ Future Roadmap
*   **Email Notifications:** Integrate order confirmations via SendGrid.
*   **Analytics:** Expand Meta Pixel tracking performance.
*   **User Accounts:** Allow customers to track order history.
