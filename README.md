# 🛒 KrisiConnect — Farmer & Buyer Marketplace (No Middlemen)

KrisiConnect is a modern **agriculture marketplace platform** built with **Next.js 13+**.  
It connects **farmers directly with buyers**, eliminating middlemen and ensuring fair pricing for both sides.

---

## Environment Configuration

The project uses MongoDB for data storage. During development you can run a local MongoDB instance, while production should connect to a cloud-hosted database (e.g. Atlas).

Uploads normally go through Cloudinary in **production only**. During development the app will ignore Cloudinary even if credentials exist; files will be stored under `public/uploads` instead. You can also leave the Cloudinary env vars unset to force local behavior.

1. Copy `.env.example` to `.env.local` (for development) or set the variables in your deployment environment.
2. Set values as follows:
   - `MONGODB_LOCAL_URI` – your local URI, e.g. `mongodb://127.0.0.1:27017/krisiconnect`
   - `MONGODB_URI` – production/cloud URI (Atlas string or similar).
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` – leave blank for local upload fallback.
   - `NODE_ENV` will typically be `development` locally and `production` in deployed environments.

The connection logic in `lib/connect.js` automatically picks `MONGODB_LOCAL_URI` when `NODE_ENV` is not `production`, falling back to `MONGODB_URI` if necessary.

---



This platform enables:
- Farmers to showcase their products  
- Buyers to directly find and contact farmers  
- Transparent and fast communication  
- A smooth, middleman-free marketplace experience  

---

## ✨ Features

### 👨‍🌾 For Farmers
- Create an account and list available products  
- Add product details (name, price, quantity, etc.)  
- Communicate directly with buyers  
- No commissions, no third-party interference  

### 🛍️ For Buyers
- Browse products from real farmers  
- Filter and search based on product types  
- Contact farmers instantly  
- Fair and transparent pricing  

### ⚙️ Platform Features
- **Signup with role selection** (Farmer / Buyer)  
- API route for secure user registration  
- Modern UI powered by Next.js App Router  
- Redirects, client-side validation, and error handling  
- Extendable architecture for future Marketplace features  

---

## 📂 Tech Stack

- **Next.js 13+ (App Router)**  
- **React 18**  
- **Axios** for API requests  
- **Node.js** backend via Next.js API routes  

---

## 📥 Clone the Repository

```bash
git clone https://github.com/aadarsh-adhikari/KrisiConnect.git
cd KrisiConnect

##📦 Install Dependencies
npm install
or
yarn install

🏃 Run the Development Server
npm run dev

Then open:

👉 http://localhost:3000
