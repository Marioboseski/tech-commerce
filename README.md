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
| Docker   | Docker Compose (development and production), Nginx                                                 |

## Getting started

There are two ways to run the project locally. Docker is the easiest: no
Node.js, MySQL or `.env` files needed.

### Option A: Docker (recommended)

**Requirements:** [Docker Desktop](https://www.docker.com/products/docker-desktop/)

```bash
git clone https://github.com/Marioboseski/tech-commerce.git
cd tech-commerce
docker compose -f compose.dev.yaml up --watch
```

The first start takes a minute. Docker starts three containers:

| Container | What it does                                                              | Address                 |
| --------- | ------------------------------------------------------------------------- | ----------------------- |
| `client`  | React app (Vite)                                                          | <http://localhost:5173> |
| `server`  | API; on start it updates the tables and seeds 50 products (no duplicates) | <http://localhost:5000> |
| `db`      | MySQL 8 with its own data (user `root`, password `root`)                  | `localhost:3307`        |

`--watch` copies every change you save in `server/src` and `client/src` into
the containers, so the app updates right away. Changes to `package.json` or
`server/prisma` rebuild the container automatically.

#### Create an admin in Docker

Register an account on the website, then run this **from the project root**
in a second terminal (while the app is running):

```bash
docker compose -f compose.dev.yaml exec server npm run admin:create -- you@example.com
```

Refresh the page and the **Admin panel** link appears in the profile menu.

> Commands for the server must run **inside** the `server` container
> (`docker compose ... exec server ...`). Running `npm run admin:create` on
> your own computer uses your local database from `server/.env`, not the
> Docker database.

#### Useful Docker commands

| Command                                                             | What it does                                            |
| ------------------------------------------------------------------- | ------------------------------------------------------- |
| `docker compose -f compose.dev.yaml up --watch`                     | Start and update the app while you code                 |
| `docker compose -f compose.dev.yaml up -d`                          | Start in the background (code changes are not copied)   |
| `docker compose -f compose.dev.yaml logs -f server`                 | Show the server logs                                    |
| `docker compose -f compose.dev.yaml exec server npx prisma db seed` | Run the seed again                                      |
| `docker compose -f compose.dev.yaml down`                           | Stop the app; the database and uploaded images are kept |
| `docker compose -f compose.dev.yaml down -v`                        | Stop the app **and delete** the database and uploads    |

Stop any local `npm run dev` first: Docker uses the same ports 5000 and 5173.
The values in `compose.dev.yaml` are for local development only.

### Option B: Without Docker

#### Requirements

- Node.js 22 or newer
- MySQL 8 running locally

#### 1. Install

```bash
git clone https://github.com/Marioboseski/tech-commerce.git
cd tech-commerce
cd server && npm install
cd ../client && npm install
```

#### 2. Create the database

```sql
CREATE DATABASE tech_commerce_db;
```

#### 3. Environment variables

Copy the example files and fill in your own values:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

In `server/.env`, set at least your MySQL user and password in
`DATABASE_URL` and a long random `JWT_SECRET`. The other defaults work for
local development. Every variable is explained in the example files.

#### 4. Set up the database

```bash
cd server
npx prisma generate        # creates the Prisma client
npx prisma migrate deploy  # creates the tables
npx prisma db seed         # adds categories and 50 products with images
```

#### 5. Run

In two terminals:

```bash
cd server && npm run dev   # API on http://localhost:5000
cd client && npm run dev   # shop on http://localhost:5173
```

#### 6. Create an admin

Register an account on the website, then give it the ADMIN role:

```bash
cd server
npm run admin:create -- you@example.com
```

Refresh the page and the **Admin panel** link appears in the profile
menu. Admins can only be created this way, never through the website.

## Production (Docker)

The production setup runs the same app as optimized images: the React build
is served by **Nginx**, which also forwards `/api` and `/images` to the API,
so the whole shop is on one address. The database and the API are not
reachable from outside.

```text
Browser ──▶ client (Nginx, port 80) ──▶ server (Node.js) ──▶ db (MySQL)
             /           React build
             /api, /images  → server
```

| File                     | Purpose                                                              |
| ------------------------ | -------------------------------------------------------------------- |
| `server/Dockerfile.prod` | Compiles TypeScript, then runs `node` with runtime packages only     |
| `client/Dockerfile.prod` | Builds the React app, then serves it with Nginx                      |
| `client/nginx.conf`      | Static files, `/api` and `/images` forwarding, React Router fallback |
| `compose.prod.yaml`      | Runs the three containers from images on Docker Hub                  |
| `.env.prod.example`      | Template for the secrets (copy to `.env.prod`, never commit it)      |

### 1. Build and publish the images

From the project root, with the version you are releasing:

```bash
docker login
docker build -f server/Dockerfile.prod -t marioboseski/tech-commerce-server:1.0.0 ./server
docker build -f client/Dockerfile.prod -t marioboseski/tech-commerce-client:1.0.0 ./client
docker push marioboseski/tech-commerce-server:1.0.0
docker push marioboseski/tech-commerce-client:1.0.0
```

### 2. Run on the server

The server only needs Docker, `compose.prod.yaml` and `.env.prod`:

```bash
cp .env.prod.example .env.prod   # then set IMAGE_TAG, CLIENT_URL and new random secrets
docker compose -f compose.prod.yaml --env-file .env.prod up -d
```

On the first start, add the categories and products, then create an admin
(register on the website first):

```bash
docker compose -f compose.prod.yaml --env-file .env.prod exec server node prisma/seed.js
docker compose -f compose.prod.yaml --env-file .env.prod exec server node scripts/set-admin.js you@example.com
```

The shop is then on `http://<server address>`. Migrations run automatically
on every start; the seed only once, because running it again would overwrite
specs edited in the admin panel.

### Release a new version

Build and push the images with a new tag (for example `1.0.1`), set
`IMAGE_TAG=1.0.1` in `.env.prod`, then:

```bash
docker compose -f compose.prod.yaml --env-file .env.prod pull
docker compose -f compose.prod.yaml --env-file .env.prod up -d
```

To roll back, set the previous tag and run the same two commands.

> Without a domain the shop runs on plain HTTP. The login cookie is marked
> `Secure`, which browsers accept over HTTP only on `localhost`, so test from
> a browser on the same machine. A real deployment needs a domain and HTTPS.

## CI/CD (GitHub Actions)

| Workflow                        | When                                        | What it does                                                                                                                          |
| ------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `.github/workflows/ci.yml`      | every pull request and every push to `main` | Server: type check, build and tests (with a MySQL service). Client: lint, formatting, tests, build. Both production images must build |
| `.github/workflows/release.yml` | a pushed version tag such as `v1.0.1`       | Builds both production images and pushes them to Docker Hub as `1.0.1` and `latest`                                                   |

Release a new version from `main`:

```bash
git switch main && git pull
git tag v1.0.1
git push origin v1.0.1
```

Then on the server set `IMAGE_TAG=1.0.1` in `.env.prod` and run `pull` and
`up -d` as shown above. The release workflow needs two repository secrets:
`DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` (a Docker Hub access token with
read and write access).

### Run the tests locally

```bash
cd server
npm run test:db      # starts a throwaway MySQL for tests (Docker, port 3308)
npm test
npm run test:db:stop

cd ../client
npm test
```

The server tests refuse to run against a database whose name does not end
with `_test`, because they delete all data before each test.

## Project structure

```text
tech-commerce/
├── client/                React app (Vite), Dockerfiles, nginx.conf
│   ├── public/            static images (categories, favicon)
│   └── src/
│       ├── admin/         admin panel (lazy-loaded)
│       ├── components/    UI components
│       ├── hooks/         TanStack Query hooks (cart, favorites, orders...)
│       ├── pages/         shop pages
│       ├── schemas/       Zod form validation
│       ├── services/      API calls
│       └── stores/        Zustand (UI state only)
├── server/                Express API, Dockerfiles
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
├── .github/workflows/     CI (checks and tests) and release (Docker Hub)
├── docs/NOTES.md          technical notes and decisions
├── compose.dev.yaml       Docker setup for local development
├── compose.prod.yaml      Docker setup for production
└── .env.prod.example      production secrets template
```

## Technical notes

How authentication, server state, optimistic updates, order transactions and
error handling work, and why they were built this way, is explained in
[docs/NOTES.md](docs/NOTES.md).

## Author

Mario Boseski · [GitHub](https://github.com/Marioboseski)
