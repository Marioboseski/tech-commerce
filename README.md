# TechStore

A full-stack online tech store: laptops, phones, computers, consoles and
tablets. Customers can browse, search, save favorites, fill a cart and place
orders; admins manage products and orders in their own panel.

Built with **React + TypeScript** on the client and **Express + Prisma +
MySQL** on the server.

## Features

**Shop**

- Categories with product specs (each category has its own spec table)
- Search with live suggestions, price filter and sorting
- Product pages with specifications and related products

**Account**

- Register and log in (JWT in an httpOnly cookie, passwords hashed with bcrypt)
- Favorites and cart saved in the database, per account
- Checkout with pay on delivery; prices and totals are always calculated by
  the server
- Order history with order details

**Admin panel** (`/admin`, only for users with the ADMIN role)

- Dashboard: sales, pending orders, recent orders and top products
- Products: create, edit, archive / restore, image upload (converted to WebP)
- Orders: list with filters and search, status changes
  (pending → shipped → delivered, or cancelled)

**Quality**

- Validation with Zod on the server and the client (same rules and messages)
- One JSON error format and a global error handler
- Clear loading, error and "try again" states in the UI
- The admin panel is lazy-loaded, so shoppers never download it

## Tech stack

| Part     | Technologies                                                                                       |
| -------- | -------------------------------------------------------------------------------------------------- |
| Client   | React 19, TypeScript, Vite, React Router, TanStack Query, Zustand, React Hook Form, Zod, plain CSS |
| Server   | Node.js, Express 5, TypeScript, Prisma 7, Zod, JSON Web Tokens, bcrypt, multer, sharp              |
| Database | MySQL 8                                                                                            |

## Getting started

### Requirements

- Node.js 22 or newer
- MySQL 8 running locally

### 1. Install

```bash
git clone https://github.com/Marioboseski/tech-commerce.git
cd tech-commerce
cd server && npm install
cd ../client && npm install
```

### 2. Create the database

```sql
CREATE DATABASE tech_commerce_db;
```

### 3. Environment variables

Copy the example files and fill in your own values:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

In `server/.env`, set at least your MySQL user and password in
`DATABASE_URL` and a long random `JWT_SECRET`. The other defaults work for
local development. Every variable is explained in the example files.

### 4. Set up the database

```bash
cd server
npx prisma generate        # creates the Prisma client
npx prisma migrate deploy  # creates the tables
npx prisma db seed         # adds categories and 50 products with images
```

### 5. Run

In two terminals:

```bash
cd server && npm run dev   # API on http://localhost:5000
cd client && npm run dev   # shop on http://localhost:5173
```

### 6. Create an admin

Register an account on the website, then give it the ADMIN role:

```bash
cd server
npm run admin:create -- you@example.com
```

Refresh the page and the **Admin panel** link appears in the profile
menu. Admins can only be created this way, never through the website.

## Project structure

```text
tech-commerce/
├── client/                React app (Vite)
│   ├── public/            static images (categories, favicon)
│   └── src/
│       ├── admin/         admin panel (lazy-loaded)
│       ├── components/    UI components
│       ├── hooks/         TanStack Query hooks (cart, favorites, orders...)
│       ├── pages/         shop pages
│       ├── schemas/       Zod form validation
│       ├── services/      API calls
│       └── stores/        Zustand (UI state only)
├── server/                Express API
│   ├── prisma/            schema, migrations, seed
│   ├── public/images/     product images
│   ├── scripts/           admin and image CLI scripts
│   └── src/
│       ├── controllers/   HTTP layer (read request, send response)
│       ├── services/      business logic and database queries
│       ├── routes/        API routes
│       ├── schemas/       Zod request validation
│       ├── middleware/    auth, admin check, uploads, errors
│       └── lib/           shared helpers
└── docs/NOTES.md          technical notes and decisions
```

## Technical notes

How authentication, server state, optimistic updates, order transactions and
error handling work, and why they were built this way, is explained in
[docs/NOTES.md](docs/NOTES.md).

## Author

Mario Boseski · [GitHub](https://github.com/Marioboseski)
