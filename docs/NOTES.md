# Project notes

Why the main parts of **tech-commerce** are built the way they are.
This is not a tutorial: it explains the decisions, the trade-offs and the
traps we hit, so the code can be changed safely later.

## Contents

1. [Stack](#stack)
2. [How a request travels](#how-a-request-travels)
3. [Server structure](#server-structure)
4. [Data model](#data-model)
5. [Authentication](#authentication)
6. [API overview](#api-overview)
7. [Validation (Zod)](#validation-zod)
8. [Error handling: server](#error-handling-server)
9. [Orders and money](#orders-and-money)
10. [Client state: where data lives](#client-state-where-data-lives)
11. [TanStack Query patterns](#tanstack-query-patterns)
12. [Error handling: client](#error-handling-client)
13. [Forms](#forms)
14. [Product images](#product-images)
15. [Environment variables](#environment-variables)
16. [Known traps](#known-traps)

---

## Stack

| Part | Technology |
|---|---|
| Client | React 19, TypeScript, Vite, React Router 7 |
| Server state (client) | TanStack Query |
| UI state (client) | Zustand |
| Forms | react-hook-form + Zod |
| Server | Express 5, TypeScript, tsx |
| Database | MySQL 8 with Prisma 7 (`@prisma/adapter-mariadb`) |
| Auth | JWT in an httpOnly cookie, bcrypt password hashes |
| Validation | Zod 4 (server and client) |

---

## How a request travels

```
Browser (localhost:5173)                         Express (localhost:5000)
────────────────────────                         ─────────────────────────
component
  → hook (TanStack Query)
    → services/*Api.ts
      → lib/apiClient.ts  ── fetch + cookie ──►  cors → express.json → cookieParser
                                                   → routes → requireAuth (if needed)
                                                   → controller: parseInput (Zod)
                                                   → service: Prisma → MySQL
                          ◄── JSON or {message} ─  errorHandler (for any thrown error)
      ← ApiError on failure
    ← cache, isPending / isError
  ← re-render
```

---

## Server structure

| Folder | Job | Knows about HTTP? |
|---|---|---|
| `routes/` | URL + method → controller; adds `requireAuth` | yes |
| `controllers/` | Read `req`, validate with Zod, call a service, pick the status code | yes |
| `services/` | Business rules and Prisma queries | **no** |
| `schemas/` | Zod schemas for body, params and query | no |
| `middleware/` | `requireAuth`, `notFound`, `errorHandler` | yes |
| `lib/` | Small shared helpers (`HttpError`, `parseInput`, `toApiProduct`, token, Prisma client) | mixed |

Services return plain results (`null`, or `{ status: "limit_reached" }`) instead
of HTTP errors. The controller decides that `null` means 404. This keeps the
business logic testable without Express.

---

## Data model

```
users ──< favorites  >── products
users ──< cart_items >── products
users ──< orders ──< order_items >── products
```

| Table | Key rule | Why |
|---|---|---|
| `favorites` | `@@unique([userId, productId])` | One heart per user and product; the database rejects duplicates even under double clicks |
| `cart_items` | `@@unique([userId, productId])`, `quantity` 1–10 | Adding the same product again increases the quantity instead of adding a row |
| `orders` | address and totals are **copied** | An order must show what was paid, even if the address or prices change later |
| `order_items` | `productName` and `unitPrice` are **copied**, `productId` is nullable | Product edits never change old orders; a deleted product leaves the item with its name and price |

**Why favorites and cart do not copy the price:** they show the current state
of the shop. Only an order is history.

### Delete rules (`onDelete`)

| When this is deleted | Then | Why |
|---|---|---|
| User → favorites, cart items | Cascade | Private data without an owner is useless |
| Product → favorites, cart items | Cascade | You cannot keep a deleted product in a cart |
| Order → order items | Cascade | Items belong to their order |
| Product → order items | SetNull | Keep the order history |
| User → orders | **Restrict** | Orders are financial records; they must not disappear by accident |

---

## Authentication

### Token vs cookie

- The **token (JWT)** is the content: who the user is (`sub` = user id) and
  their role, signed with `JWT_SECRET`. It is **signed, not encrypted**:
  anyone can read it, nobody can change it. So it only holds ids.
- The **cookie** is only the transport. The server sets it with
  `Set-Cookie`, the browser sends it back automatically.

### Cookie options

| Option | Why |
|---|---|
| `httpOnly` | JavaScript cannot read the cookie, so an injected script cannot steal the token. This is why we do not use localStorage. |
| `sameSite: "lax"` | Not sent on requests started by other sites (CSRF protection) |
| `secure` in production | https only; localhost has no https |
| `maxAge` = token lifetime (7 days) | Cookie and token expire together |

`clearCookie` must get the same options as `cookie` (except `maxAge`),
otherwise the browser treats it as a different cookie and logout fails.

### Flow

| Step | Endpoint | What happens |
|---|---|---|
| Register | `POST /api/auth/register` | Zod check, bcrypt hash (12 rounds), 409 if the email exists. Does not log in. |
| Login | `POST /api/auth/login` | bcrypt compare, sign JWT, set cookie, return the user (never the token in JSON) |
| Who am I | `GET /api/auth/me` | `requireAuth` verifies the token; the user is loaded fresh from the database |
| Logout | `POST /api/auth/logout` | Clears the cookie. Idempotent. POST, not GET, so another site cannot log you out with an `<img>` |

### Security decisions

- **Same message** for "no such email" and "wrong password", so nobody can
  find out which emails have an account.
- **Timing:** when the email does not exist, bcrypt still compares against a
  dummy hash, so both cases take the same time.
- **Never trust the client for identity:** `userId` always comes from
  `req.auth` (the verified token), never from the body or the URL.
  `z.object` also drops unknown keys, so a client cannot send `role: "ADMIN"`.
- `/me` reads the user from the database, not from the token, so a deleted
  account is logged out and a changed name shows immediately.

### CORS with cookies

The client (5173) and the API (5000) are different origins. Cookies only work
when **both** sides agree:

- server: `cors({ origin: CLIENT_URL, credentials: true })`, never `"*"`
- client: `fetch(..., { credentials: "include" })` (done once in `apiClient`)

---

## API overview

All routes except products, categories, register and login need the login
cookie (`requireAuth`).

| Method | Path | Notes |
|---|---|---|
| GET | `/api/products` | Query: `categoryId`, `minPrice`, `maxPrice`, `ids`, `search`, `limit` |
| GET | `/api/products/:id` | 404 if it does not exist |
| GET | `/api/categories` | |
| POST | `/api/auth/register`, `/login`, `/logout` | |
| GET | `/api/auth/me` | 401 when not logged in |
| GET / POST | `/api/favorites` | POST body `{ productId }`; adding twice is not an error (upsert) |
| DELETE | `/api/favorites/:productId` | Removing twice is not an error (deleteMany) |
| GET / POST | `/api/cart` | POST adds 1 piece (database `increment`) |
| PATCH | `/api/cart/:productId` | Body `{ quantity }`, 1–10 |
| DELETE | `/api/cart/:productId` | |
| POST | `/api/orders` | Body: address only; 400 empty cart, 409 cart changed |
| GET | `/api/orders`, `/api/orders/:orderId` | Someone else's order → 404 (do not reveal it exists) |

Every error has the same shape:

```json
{ "message": "Full name is required", "errors": [{ "field": "fullName", "message": "Full name is required" }] }
```

`errors` is only present for validation problems.

---

## Validation (Zod)

- One schema per body, params or query in `server/src/schemas/`.
- Controllers call `parseInput(schema, req.body)`. It returns a typed,
  cleaned value (trimmed strings, numbers instead of `"5"`) or throws a 400
  `HttpError` with one entry per field.
- **Why a helper, not a middleware:** in Express 5 `req.query` is read-only,
  so a middleware cannot replace it with the parsed version, and a middleware
  would lose the types. The helper keeps full TypeScript types where they are used.
- Ids from the URL go through `/^\d+$/` before `Number()`, because `Number()`
  accepts `" 5"`, `"1e3"` and `"0x10"`.
- Ids are capped at the MySQL `INT` maximum (2 147 483 647); a bigger number
  would make Prisma fail with a 500 instead of a clear 400.
- Types such as `DeliveryAddress` are derived from the schema
  (`z.output<typeof schema>`), so they can never differ from the validation.

Zod only checks the **shape** of data. Rules that need the database (product
exists, email taken, cart limit) stay in services and controllers.

---

## Error handling: server

| Piece | Job |
|---|---|
| `HttpError(status, message, errors?)` | Expected errors. `throw` it from anywhere. |
| `notFound` | Unknown `/api/...` route → 404 JSON instead of an HTML page |
| `errorHandler` | The one place every error ends up |

`errorHandler` order:

1. `HttpError` → its status and message
2. Broken JSON body (`entity.parse.failed`) → 400; body too large → 413
3. Known Prisma errors: `P2002` duplicate → 409, `P2003` still in use → 409, `P2025` not found → 404
4. Anything else → log the full error in the terminal, send only
   `"Something went wrong"` (500). Stack traces and SQL help attackers.

Express 5 forwards errors from `async` handlers to `errorHandler` by itself,
so controllers have no `try/catch`. `notFound` and `errorHandler` must be
registered **after** all routes.

---

## Orders and money

### Placing an order

The client sends **only the address**. The server, inside one
`prisma.$transaction`:

1. Reads the user's cart from the database, with current prices
2. Calculates subtotal, shipping and total itself
3. Creates the order and its items (name and price copied)
4. Deletes exactly the cart rows it ordered

If any step fails, everything is rolled back. Never accept prices from the
client: anyone could send `price: 1` with Postman.

### Double click protection

Two "Place order" requests can arrive at the same time. Step 4 checks that it
deleted as many rows as it read. If fewer were deleted, another request
already ordered this cart, so the transaction throws and is undone (409).
The client also disables the button while sending.

### Money

- Database: `Decimal(12, 2)`. Server: `Prisma.Decimal` with `.plus()` and
  `.times()`. Never JavaScript `number` for calculations: `0.1 + 0.2` is not `0.3`.
- Decimals become numbers only in the JSON answer (`toApiProduct`, `toApiOrder`).
- Shipping: free from 75 €, otherwise 9.90 €. The client shows the same
  rule in `lib/cart.ts`, but only the server's numbers are saved.

---

## Client state: where data lives

| Kind of state | Example | Tool | Why |
|---|---|---|---|
| Server data | products, user, favorites, cart, orders | **TanStack Query** | Lives in the database; needs loading, caching, refetching, errors |
| Global UI state | is the cart drawer open, current toast | **Zustand** | Browser-only, shared by unrelated components, no Provider needed |
| Local UI state | an open dropdown | **useState** | Used by one component only |

There is no React Context left in the app. Zustand stores can also be used
outside React (`useToastStore.getState()`), which `lib/queryClient.ts` needs
to show toasts.

---

## TanStack Query patterns

### Keys per user

Private data is keyed by user id: `['cart', userId]`, `['favorites', userId]`,
`['orders', userId, ...]`. Another user on the same computer never sees
someone else's data, and logout removes all of it (`lib/session.ts`).

### `/me`

`staleTime: Infinity`, because the login state only changes through
login/logout, which write the cache themselves. `retry: false`: a failed
`/me` just means "logged out". 401 is turned into `null`, not an error.

### Optimistic updates (favorites, cart quantity and remove)

1. `onMutate`: cancel running queries, remember the old value, change the cache now
2. `onError`: put the old value back (the heart flips back)
3. `onSettled`: refetch from the server so the cache matches the database

"Add to cart" is **not** optimistic: the page shows "Adding…", then
"Added to cart" or the server's error (limit of 10).

### Cart: order of quick clicks

All cart mutations share `scope: { id: 'cart' }`, so they reach the server
one after another in click order. The cart is refetched only after the last
one (`isMutating() === 1`); refetching in between would flash old numbers
(3 → 2 → 3).

### Disabled queries

`enabled: false` (for guests) keeps `isPending` true forever, so hooks
compute their own `isPending` from "is the user known" + "is the query loading".

---

## Error handling: client

| Error | Example | Handled by | User sees |
|---|---|---|---|
| Loading data fails | server down while opening My Orders | `isError` in the page | "Something went wrong" + **Try again** (`refetch`) |
| An action fails | ♥, +, ×, logout | `MutationCache.onError` | Red toast |
| An action whose page shows the error | login, register, Add to cart, Place order | the page (`meta: { inlineError: true }`) | Message under the button or field |
| Session expired | any 401 | `handleUnauthorized` → `clearSession` | Logged out immediately |
| Bug while rendering | reading a property of `undefined` | `ErrorBoundary` | "Something went wrong" + Reload |

- `lib/apiClient.ts` is the only `fetch` in the app. It adds the cookie,
  turns every failed answer into `ApiError(status, message, errors)` and
  uses status `0` when there is no answer at all (server down, no network).
- Queries are **not retried** for 4xx (the answer will not change); 5xx and
  network errors are retried up to 2 times.
- Toasts are opt-out (`inlineError`), so a new mutation never fails silently.
- `ErrorBoundary` gets `key={pathname}`, so after a crash the user can still
  open another page. It must be a class component.

---

## Forms

- react-hook-form + `zodResolver(schema)`, `mode: 'onTouched'`, `noValidate`
  (our messages instead of the browser's bubbles).
- Client schemas in `client/src/schemas/` are **copies** of the server rules
  and messages. The client check is for speed; the server check is for safety.
  When a rule changes on the server, change it here too.
- On submit: `mutateAsync`, then `navigate`. Field errors from the server go
  under the inputs (`showServerFieldErrors`), other errors into `root.server`.
- `mutateAsync` instead of `mutate` + `onSuccess` on checkout: the cart is
  emptied, the form unmounts, and `mutate` callbacks do not run for an
  unmounted component, so the redirect would be lost.
- Forms that need user data (checkout name) are mounted only after the user
  is known, so `defaultValues` is already correct.

---

## Product images

- Originals in `server/images-source/` (not in Git). `npm run images:optimize`
  (sharp) writes `server/public/images/products/<sku lowercase>.webp`.
- The database stores a **relative path**; the API returns a full URL using
  `IMAGE_BASE_URL`. Moving images to a CDN means changing one variable, not the data.
- `express.static` serves them at `/images`.

---

## Environment variables

`server/.env` (never committed):

| Name | Example | Notes |
|---|---|---|
| `DATABASE_URL` | `mysql://user:password@localhost:3306/tech_commerce_db` | |
| `IMAGE_BASE_URL` | `http://localhost:5000/images` | |
| `JWT_SECRET` | 128 random hex characters | Generate: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`. Changing it logs everyone out. |
| `CLIENT_URL` | `http://localhost:5173` | Exact origin for CORS |

`client/.env`:

| Name | Example |
|---|---|
| `VITE_API_URL` | `http://localhost:5000` |

The server refuses to start when a required variable is missing.

---

## Known traps

| Trap | Symptom | Fix |
|---|---|---|
| MySQL 8 restarted (e.g. Windows update) | Every `/api/...` request hangs, images still load; driver error `ER_CANNOT_RETRIEVE_RSA_KEY` | Connect once with MySQL Workbench (warms the `caching_sha2_password` cache). Permanent options: `allowPublicKeyRetrieval` for localhost, or SSL. |
| Route param name | `router.delete("/:id")` but controller reads `req.params.productId` → always 400 | The name after `:` must match the controller |
| `findUnique` vs `findFirst` | Cannot filter by `id` **and** `userId` with `findUnique` | Use `findFirst({ where: { id, userId } })` for "mine only" |
| `delete` vs `deleteMany` | `delete` throws when the row does not exist | `deleteMany` for idempotent removes |
| Prisma config | CLI cannot find the config | Use `--config prisma7.config.ts` |
| Disabled query | Page stuck on "Loading…" for guests | Compute `isPending` yourself (see above) |
