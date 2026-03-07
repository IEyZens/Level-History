# LevelHistory

> A full-stack web application dedicated to the history of the video game industry, featuring an interactive timeline, influential personalities, comments, and likes.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-4169E1?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-HTTP--only%20Cookie-F7B731)
![License](https://img.shields.io/badge/license-Holberton-lightgrey)

---

## 📑 Table of Contents

- [📘 Overview](#-overview)
- [🏗️ Project Structure](#️-project-structure)
- [⚙️ Technologies](#️-technologies)
- [🗄️ Database Design](#️-database-design)
- [🚀 Getting Started](#-getting-started)
- [🌍 Environment Variables](#-environment-variables)
- [🔌 API Endpoints](#-api-endpoints)
- [🔐 Authentication & Security](#-authentication--security)
- [🖥️ Admin Panel](#️-admin-panel)
- [🎨 Design System](#-design-system)
- [🧪 Testing](#-testing)
- [📦 Deployment](#-deployment)
- [💡 Technical Decisions](#-technical-decisions)
- [👤 Author](#-author)

---

## 📘 Overview

**LevelHistory** is a full-stack web application that allows users to explore the history of the video game industry through an interactive timeline. Users can browse historical events, discover key industry personalities, like content, and engage in discussions through comments.

The application was built in two phases:

1. **Backend**: RESTful API with Node.js, Express, Prisma, and PostgreSQL — authentication, CRUD, role-based access control.
2. **Frontend**: React SPA with Vite, React Router, Context API, and a fully custom design system with dark/light mode.

A complete administration panel enables content management (events, personalities, users) directly from the UI.

---

## 🏗️ Project Structure

```
levelhistory/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Models and relations
│   │   ├── migrations/            # Migration history
│   │   └── seed.js                # Initial seed data
│   ├── src/
│   │   ├── controllers/           # Business logic per resource
│   │   │   ├── auth.controller.js
│   │   │   ├── event.controller.js
│   │   │   ├── comment.controller.js
│   │   │   ├── like.controller.js
│   │   │   ├── personality.controller.js
│   │   │   └── user.controller.js
│   │   ├── middlewares/
│   │   │   ├── verifyToken.js     # JWT validation
│   │   │   ├── isAdmin.js         # ADMIN role enforcement
│   │   │   ├── validate.js        # Zod schema validation
│   │   │   └── upload.js          # Multer configuration
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── event.routes.js
│   │   │   ├── comment.routes.js
│   │   │   ├── like.routes.js
│   │   │   ├── personality.routes.js
│   │   │   └── user.routes.js
│   │   ├── validators/            # Zod validation schemas
│   │   ├── lib/
│   │   │   └── prisma.js          # Prisma Client singleton
│   │   └── index.js               # Express bootstrap
│   └── uploads/                   # Multer local file storage
│
└── frontend/
    ├── src/
    │   ├── api/                   # Fetch functions (one per resource)
    │   │   ├── auth.js
    │   │   ├── events.js
    │   │   ├── comments.js
    │   │   ├── likes.js
    │   │   ├── personalities.js
    │   │   └── users.js
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── Footer.jsx
    │   │   ├── Timeline.jsx
    │   │   ├── TimelinePreview.jsx
    │   │   ├── EventModal.jsx     # Rendered via React Portal
    │   │   └── Accordion.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx    # Auth + Theme providers
    │   ├── hooks/
    │   │   └── useAutoResize.js   # Auto-resize textarea hook
    │   ├── pages/
    │   │   ├── HomePage.jsx
    │   │   ├── EventsPage.jsx
    │   │   ├── EventDetailPage.jsx
    │   │   ├── PersonalitiesPage.jsx
    │   │   ├── ProfilePage.jsx
    │   │   ├── AdminPage.jsx
    │   │   ├── LoginPage.jsx
    │   │   └── RegisterPage.jsx
    │   ├── router/
    │   │   └── AppRouter.jsx      # Routes + ProtectedRoute wrapper
    │   ├── styles/
    │   │   └── global.css         # Full design system (~2000 lines)
    │   ├── App.jsx                # Root layout + ScrollToTop
    │   └── main.jsx               # React entry point
    └── vite.config.js
```

---

## ⚙️ Technologies

- **Frontend**:
  - React 18 (UI framework)
  - Vite 5 (bundler & dev server)
  - React Router v6 (SPA routing)
  - Context API (global state — auth & theme)
  - Custom CSS design system (CSS variables, dark/light mode)

- **Backend**:
  - Node.js 20+ (runtime)
  - Express.js 4 (HTTP framework)
  - Prisma 5 (type-safe ORM)
  - PostgreSQL 15+ (relational database)
  - bcryptjs (password hashing)
  - jsonwebtoken (JWT generation)
  - Multer (file upload handling)
  - cookie-parser (HTTP-only cookie reading)
  - cors (CORS configuration)
  - Zod (payload validation)

- **Testing**:
  - Bruno (REST client for backend endpoint testing)
  - Manual UAT (frontend — cross-browser, responsive)

---

## 🗄️ Database Design

### Schema (Prisma)

```prisma
model User {
  id        Int       @id @default(autoincrement())
  username  String    @unique
  email     String    @unique
  password  String
  role      Role      @default(USER)
  avatar    String?
  createdAt DateTime  @default(now())
  comments  Comment[]
  likes     Like[]
}

model Event {
  id          Int       @id @default(autoincrement())
  title       String
  description String
  date        DateTime
  image       String?
  category    Category  @default(OTHER)
  createdAt   DateTime  @default(now())
  comments    Comment[]
  likes       Like[]
}

model Personality {
  id        Int                 @id @default(autoincrement())
  name      String
  role      String?
  biography String?
  image     String?
  category  PersonalityCategory @default(VISIONARY)
  twitter   String?
  linkedin  String?
  website   String?
  createdAt DateTime            @default(now())
  likes     Like[]
}

model Comment {
  id        Int      @id @default(autoincrement())
  content   String
  createdAt DateTime @default(now())
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  authorId  Int
  event     Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  eventId   Int
}

// Polymorphic Like: eventId OR personalityId (both nullable)
model Like {
  id            Int          @id @default(autoincrement())
  createdAt     DateTime     @default(now())
  user          User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId        Int
  event         Event?       @relation(fields: [eventId], references: [id], onDelete: Cascade)
  eventId       Int?
  personality   Personality? @relation(fields: [personalityId], references: [id], onDelete: Cascade)
  personalityId Int?
}

enum Role                { USER ADMIN }
enum Category            { CONSOLE_RELEASE GAME_RELEASE COMPANY_FOUNDING TECHNOLOGY CULTURAL_IMPACT OTHER }
enum PersonalityCategory { VISIONARY BUILDER EXECUTIVE }
```

### Entity-Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ COMMENT : writes
    USER ||--o{ LIKE : gives
    EVENT ||--o{ COMMENT : receives
    EVENT ||--o{ LIKE : receives
    PERSONALITY ||--o{ LIKE : receives
```

### Key design decisions

- `Like` is **polymorphic**: `eventId` OR `personalityId` nullable — a single table handles likes on both entity types.
- **Cascade deletes**: removing a `User` or `Event` automatically deletes associated `Comment` and `Like` records.
- Personality images stored as **file paths** (uploaded via Multer), not external URLs, to avoid third-party dependencies.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- npm or yarn

### 1. Clone the repository

```bash
git clone https://github.com/your-username/levelhistory.git
cd levelhistory
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file (see [Environment Variables](#-environment-variables)), then:

```bash
# Apply Prisma migrations
npx prisma migrate dev

# (Optional) Seed initial data
npx prisma db seed

# Start the development server
npm run dev
```

> API available at `http://localhost:3000`

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

> App available at `http://localhost:5173`

---

## 🌍 Environment Variables

### `backend/.env`

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/levelhistory"

# JWT
JWT_SECRET="your_long_random_jwt_secret"
JWT_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV=development

# CORS
CLIENT_URL="http://localhost:5173"
```

### `frontend/.env`

```env
VITE_API_URL="http://localhost:3000"
```

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `POST` | `/auth/register` | — | Create a new account |
| `POST` | `/auth/login` | — | Log in, sets JWT cookie |
| `POST` | `/auth/logout` | — | Log out, clears JWT cookie |
| `GET` | `/auth/me` | Cookie | Get the currently authenticated user |

### Events

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `GET` | `/events` | — | List all events (sorted by date) |
| `GET` | `/events/:id` | — | Get an event with its likes |
| `POST` | `/events` | Admin | Create an event |
| `PUT` | `/events/:id` | Admin | Update an event |
| `DELETE` | `/events/:id` | Admin | Delete an event |

### Comments

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `GET` | `/comments/event/:eventId` | — | List comments for an event |
| `POST` | `/comments/:eventId` | User | Add a comment |
| `DELETE` | `/comments/:id` | User / Admin | Delete a comment |

### Likes

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `POST` | `/likes/:type/:id` | User | Toggle like/unlike (`type` = `event` or `personality`) |

### Personalities

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `GET` | `/personalities` | — | List all personalities |
| `GET` | `/personalities/:id` | — | Get a personality |
| `POST` | `/personalities` | Admin | Create (multipart/form-data) |
| `PATCH` | `/personalities/:id` | Admin | Update a personality |
| `DELETE` | `/personalities/:id` | Admin | Delete a personality |

### Users

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `GET` | `/users/me` | User | Full profile with likes and comments |
| `PUT` | `/users/me` | User | Update own profile |
| `GET` | `/users/stats` | Admin | Platform-wide statistics |
| `GET` | `/users` | Admin | List all users |
| `PATCH` | `/users/:id` | Admin | Update a user |
| `DELETE` | `/users/:id` | Admin | Delete a user |

---

## 🔐 Authentication & Security

### Authentication flow

```
1. POST /auth/login
   → Password verified with bcrypt.compare()
   → JWT signed with jsonwebtoken
   → HTTP-only cookie set on the response (httpOnly: true, sameSite: 'lax')

2. Every protected request
   → verifyToken middleware reads the cookie automatically
   → Verifies JWT signature, injects req.userId

3. Admin routes
   → isAdmin middleware checks req.userId against the database
   → Rejects with 403 if role !== 'ADMIN'

4. GET /auth/me on app load
   → Restores session from the existing cookie
   → Enables auto-login without re-entering credentials
```

### Security measures

| Threat | Protection |
|--------|-----------|
| XSS | JWT in `httpOnly` cookie — inaccessible to JavaScript |
| SQL Injection | All queries via Prisma (parameterized), no raw SQL |
| CSRF | `sameSite: 'lax'` on cookie + strict CORS origin whitelist |
| Unauthorized access | `isAdmin` middleware on all admin routes |
| Password exposure | bcryptjs, 10 salt rounds, never stored or returned in plain text |

---

## 🖥️ Admin Panel

Accessible at `/admin` for users with the `ADMIN` role only.

### Events tab
- Sticky create/edit form in the left column
- Real-time image URL preview
- List with thumbnail, colored category badge, formatted date
- Edit (✏️) and Delete (🗑️) icon buttons per item

### Personalities tab
- Photo upload via `<input type="file">` (Multer on the backend)
- Circular avatar preview before submission
- Social fields: Twitter, LinkedIn, website
- Initials fallback if no image is provided

### Users tab
- Real-time search filter (username and email)
- Role badge: **Admin** (black background, white text) / **User** (grey)
- Edit: username, email, avatar URL, role (promote/demote)
- Delete disabled for admin accounts (anti-lockout protection)

---

## 🎨 Design System

### Typography

| Usage | Font | Weight |
|-------|------|--------|
| Headings / Display | DM Serif Display | 400 |
| Body / UI | DM Sans | 400, 500, 700 |
| Logo | Pacifico | 400 |

### Color palette (CSS variables)

```css
/* Light mode */
--color-bg:             #f8f7f5;
--color-surface-raised: #ffffff;
--color-text:           #161614;
--color-text-muted:     #5a5855;
--color-border:         #e0ddd8;

/* Dark mode */
--color-bg:             #111110;
--color-surface-raised: #252422;
--color-text:           #eceae6;
--color-text-muted:     #888580;
--color-border:         #2c2b28;
```

### Theme toggle — View Transitions API

The theme button uses the native **View Transitions API** to animate an expanding circle from the button's exact position:

```javascript
const { top, left, width, height } = event.currentTarget.getBoundingClientRect();
const x = left + width / 2;
const y = top + height / 2;
const radius = Math.hypot(
  Math.max(x, window.innerWidth - x),
  Math.max(y, window.innerHeight - y)
);

const transition = document.startViewTransition(() => setTheme(newTheme));
await transition.ready;

document.documentElement.animate(
  {
    clipPath: [
      `circle(0px at ${x}px ${y}px)`,
      `circle(${radius}px at ${x}px ${y}px)`
    ]
  },
  { duration: 500, easing: "ease-in-out", pseudoElement: "::view-transition-new(root)" }
);
```

> Automatic fallback if the browser does not support the API or if `prefers-reduced-motion` is enabled.

---

## 🧪 Testing

### Backend — Bruno (REST client)

Scenarios covered:

- **Auth**: register, login, cookie persistence, auto-login via `/auth/me`, logout, invalid token
- **RBAC**: admin routes with USER token (→ `403`), without token (→ `401`)
- **CRUD**: create, read, update, delete for every resource
- **Edge cases**: duplicate email, non-existent resource, invalid payload, expired JWT

### Frontend — Manual UAT

- Navigation and routing (including ScrollToTop)
- Form validation (required fields, formats)
- API error display and loading states
- Dark/light mode across all pages and components
- View Transition with `prefers-reduced-motion` enabled (fallback verified)

### Responsive breakpoints

| Breakpoint | Target |
|------------|--------|
| 480px | Mobile portrait |
| 768px | Mobile landscape / tablet |
| 900px | Large tablet |
| 1100px | Small desktop |
| 1440px | Standard desktop |

---

## 📦 Deployment

> ⚠️ Multer's local file storage is not suitable for production. Replace with a cloud storage service (AWS S3, Cloudinary) before deploying.

### Production environment variables

```env
# Backend
DATABASE_URL="postgresql://..."
JWT_SECRET="long_random_production_secret"
NODE_ENV=production
CLIENT_URL="https://your-domain.com"

# Frontend
VITE_API_URL="https://api.your-domain.com"
```

### Frontend build

```bash
cd frontend
npm run build
# Static files output to /dist
```

---

## 💡 Technical Decisions

| Decision | Justification |
|----------|---------------|
| **PostgreSQL + Prisma** | Strongly relational data. Prisma provides type-safety, migration management, and SQL injection protection. |
| **JWT in HTTP-only cookies** | Inaccessible to JavaScript — protects against XSS. Cookie sent automatically with every request, simplifying the frontend. |
| **Context API over Redux** | Global state is limited to auth and theme. Redux would be over-engineered for this scope. |
| **Multer (local storage)** | Pragmatic MVP choice. To be replaced by S3/Cloudinary in production. |
| **React Portal for EventModal** | `TimelinePreview` creates a stacking context (overflow + transform). A portal renders the modal in `document.body`, guaranteeing it always appears above all content. |
| **View Transitions API** | Native animation without a JS library. Circle radius calculated with `Math.hypot()` from the button's exact coordinates. Graceful `prefers-reduced-motion` fallback. |

---

## 📚 Resources

- [React Documentation](https://react.dev/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [View Transitions API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)
- [jsonwebtoken Documentation](https://github.com/auth0/node-jsonwebtoken)
- [Multer Documentation](https://github.com/expressjs/multer)
- [Mermaid.js ER Diagrams](https://mermaid.js.org/syntax/entityRelationshipDiagram.html)

---

## 👤 Author

Developed by **[Your Name]** as part of Holberton School's full-stack curriculum.

---

## 📄 License

This project is for educational purposes and licensed under the Holberton School Terms of Service.
See [Holberton School's License Policy](https://www.holbertonschool.com/terms-of-service) for details.
