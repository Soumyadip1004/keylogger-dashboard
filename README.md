<div align="center">

# ⌨️ Keylogger Dashboard

**A modern, real-time web dashboard for monitoring captured keystrokes from connected devices over the network.**

Built for cybersecurity education and awareness.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Neon](https://img.shields.io/badge/Neon-PostgreSQL-00E599?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

---

[Getting Started](#-getting-started) · [How It Works](#-how-it-works) · [API Reference](#-api-reference) · [Tech Stack](#-tech-stack) · [Project Structure](#-project-structure)

</div>

---

## 🔍 Overview

**Keylogger Dashboard** is a full-stack web application that acts as a centralized command center for receiving, storing, and displaying keystrokes captured by Python keylogger clients deployed on remote machines.

The dashboard provides a clean, sortable, and filterable data table to review all captured logs — organized by device name, IP address, and timestamp — with real-time auto-refresh, dark mode support, and API key authentication.

### ✨ Key Features

| Feature | Description |
|---|---|
| **📡 Real-Time Ingestion** | RESTful API endpoint receives keystroke data from Python clients via HTTP POST |
| **📊 Interactive Dashboard** | Sortable, filterable, paginated data table powered by TanStack Table |
| **🔐 API Key Auth** | All endpoints are protected with constant-time API key validation |
| **🌗 Dark Mode** | System-aware theme switching with `next-themes` |
| **🐘 Neon PostgreSQL** | Serverless Postgres database via Prisma ORM with the Neon adapter |
| **⚡ Auto-Refresh** | Dashboard polls for new data every 15 seconds automatically |
| **🗑️ Log Management** | View, copy, or delete individual logs; bulk-clear by device or all at once |
| **📱 Responsive** | Fully responsive UI built with Tailwind CSS and shadcn/ui components |
| **🔄 React Compiler** | Next.js 16 with the React Compiler enabled for optimal performance |

---

## 🏗 How It Works

```
┌──────────────────┐       HTTPS POST        ┌──────────────────────┐       Prisma        ┌────────────────┐
│                  │   /api/logs + API Key    │                      │    ORM Queries      │                │
│  Python Client   │ ──────────────────────▶  │   Next.js API Routes │ ──────────────────▶ │  Neon Postgres │
│  (Keylogger)     │                          │                      │                     │   (Database)   │
└──────────────────┘                          └──────────┬───────────┘                     └────────────────┘
                                                         │
                                                         │ Server-side
                                                         │ data fetching
                                                         ▼
                                              ┌──────────────────────┐
                                              │                      │
                                              │   React Dashboard    │
                                              │   (Browser UI)       │
                                              │                      │
                                              └──────────────────────┘
```

1. **Capture** — The Python keylogger runs on a target machine, capturing every keystroke and translating special keys into readable tags like `[ENTER]`, `[BACKSPACE]`, `[TAB]`, etc.

2. **Transmit** — Every few seconds, the client batches and sends captured keystrokes to the dashboard's `/api/logs` endpoint via an authenticated HTTP POST request.

3. **Store** — The API route validates the API key, extracts the client IP, and persists the log entry to a Neon PostgreSQL database via Prisma.

4. **Monitor** — Open the `/dashboard` page in any browser, enter your API key, and view all captured logs in a rich, interactive data table with sorting, filtering, pagination, and per-row actions.

---

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or [Node.js](https://nodejs.org/) v20+
- A [Neon](https://neon.tech/) PostgreSQL database (free tier works great)

### 1. Clone the Repository

```bash
git clone https://github.com/Soumyadip1004/keylogger-dashboard.git
cd keylogger-dashboard
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Neon PostgreSQL connection string
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# API key for authenticating keylogger clients and dashboard access
API_KEY="your-secret-api-key-here"
```

> **💡 Tip:** Generate a strong API key with `openssl rand -hex 32`

### 4. Set Up the Database

Run Prisma migrations to create the database schema:

```bash
bun run db:migrate
```

Or push the schema directly (useful for prototyping):

```bash
bun run db:push
```

### 5. Start the Development Server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 API Reference

All endpoints require the `x-api-key` header for authentication.

### Logs

#### `POST /api/logs`

Receive keystrokes from a Python client.

**Request:**

```json
{
  "device": "LAPTOP-01",
  "data": "Hello World[ENTER]"
}
```

**Response** `201`:

```json
{
  "success": true,
  "message": "Log entry saved successfully.",
  "entry": {
    "id": "clx...",
    "device": "LAPTOP-01",
    "data": "Hello World[ENTER]",
    "ip": "203.0.113.42",
    "timestamp": "2025-06-20T12:34:56.789Z"
  }
}
```

---

#### `GET /api/logs`

Fetch logs with optional filtering and pagination.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `device` | string | — | Filter by device name |
| `start` | ISO date | — | Filter by start date |
| `end` | ISO date | — | Filter by end date |
| `limit` | number | `100` | Max results (capped at 500) |
| `offset` | number | `0` | Pagination offset |

**Response** `200`:

```json
{
  "success": true,
  "logs": [ ... ],
  "total": 142,
  "limit": 100,
  "offset": 0
}
```

---

#### `DELETE /api/logs`

Clear all logs, or filter by device.

| Parameter | Type | Description |
|-----------|------|-------------|
| `device` | string | Only delete logs for this device |

---

#### `GET /api/logs/:id`

Fetch a single log entry by its ID.

---

#### `DELETE /api/logs/:id`

Delete a single log entry by its ID.

---

### Devices

#### `GET /api/devices`

List all unique device names that have sent logs.

**Response** `200`:

```json
{
  "success": true,
  "devices": ["LAPTOP-01", "DESKTOP-02"],
  "count": 2
}
```

---

### Statistics

#### `GET /api/stats`

Get summary statistics about the system.

**Response** `200`:

```json
{
  "success": true,
  "stats": {
    "totalLogs": 1284,
    "totalDevices": 3,
    "devices": ["LAPTOP-01", "DESKTOP-02", "WORKSTATION-03"],
    "oldestLog": "2025-06-01T08:00:00.000Z",
    "newestLog": "2025-06-20T14:30:00.000Z"
  }
}
```

---

## 🛡️ Security

| Measure | Details |
|---------|---------|
| **API Key Auth** | Every API route validates the `x-api-key` header before processing |
| **Constant-Time Comparison** | API key validation uses bitwise XOR comparison to prevent timing attacks |
| **Client IP Extraction** | Supports `x-forwarded-for` and `x-real-ip` headers for accurate IP logging behind proxies |
| **Client-Side Key Storage** | The dashboard stores the API key in `localStorage` — enter once, stay authenticated |
| **Environment Variables** | Secrets are never hardcoded; all sensitive values live in `.env.local` |

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **UI** | [React 19](https://react.dev/) + [React Compiler](https://react.dev/learn/react-compiler) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| **Data Table** | [TanStack Table v8](https://tanstack.com/table) |
| **Database** | [Neon PostgreSQL](https://neon.tech/) (serverless) |
| **ORM** | [Prisma 7](https://www.prisma.io/) with `@prisma/adapter-neon` |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Theming** | [next-themes](https://github.com/pacocoursey/next-themes) |
| **Linting** | [Biome](https://biomejs.dev/) |
| **Git Hooks** | [Husky](https://typicode.github.io/husky/) |
| **Runtime** | [Bun](https://bun.sh/) |

---

## 📁 Project Structure

```
keylogger-dashboard/
├── prisma/
│   ├── migrations/          # Database migrations
│   └── schema.prisma        # Prisma schema (Log model)
├── public/
│   └── KeyLogger.exe        # Downloadable keylogger client
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── devices/
│   │   │   │   └── route.ts       # GET /api/devices
│   │   │   ├── logs/
│   │   │   │   ├── [id]/
│   │   │   │   │   └── route.ts   # GET & DELETE /api/logs/:id
│   │   │   │   └── route.ts       # POST, GET & DELETE /api/logs
│   │   │   └── stats/
│   │   │       └── route.ts       # GET /api/stats
│   │   ├── dashboard/
│   │   │   ├── columns.tsx        # Table column definitions
│   │   │   ├── data-table.tsx     # Reusable DataTable component
│   │   │   ├── layout.tsx         # Dashboard layout
│   │   │   └── page.tsx           # Dashboard page (client component)
│   │   ├── globals.css            # Global styles & Tailwind
│   │   ├── layout.tsx             # Root layout with ThemeProvider
│   │   └── page.tsx               # Landing page / hero
│   ├── components/
│   │   ├── providers/
│   │   │   └── theme.tsx          # Theme provider wrapper
│   │   └── ui/                    # shadcn/ui components
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── input.tsx
│   │       └── table.tsx
│   ├── generated/
│   │   └── prisma/                # Auto-generated Prisma client
│   └── lib/
│       ├── auth.ts                # API key validation & helpers
│       ├── db.ts                  # Database access layer
│       ├── fonts.ts               # Font configuration (Geist)
│       ├── prisma.ts              # Prisma client singleton
│       └── utils.ts               # Utility functions (cn, etc.)
├── .env.local                     # Environment variables (not committed)
├── biome.json                     # Biome linter/formatter config
├── next.config.ts                 # Next.js configuration
├── package.json
├── prisma.config.ts               # Prisma configuration
└── tsconfig.json
```

---

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start the development server |
| `bun run build` | Generate Prisma client & build for production |
| `bun run start` | Start the production server |
| `bun run db:migrate` | Run Prisma migrations |
| `bun run db:push` | Push schema to database (no migration) |
| `bun run db:studio` | Open Prisma Studio (visual DB editor) |
| `bun run check` | Run Biome linter & formatter checks |
| `bun run check:fix` | Auto-fix linting & formatting issues |

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository on [Vercel](https://vercel.com/)
3. Add environment variables (`DATABASE_URL`, `API_KEY`) in the Vercel dashboard
4. Deploy — Vercel automatically detects Next.js and handles the build

### Other Platforms

The app can be deployed anywhere that supports Node.js. Just make sure to:

1. Set the `DATABASE_URL` and `API_KEY` environment variables
2. Run `bun run build` (or `npm run build`) to generate the Prisma client and build the app
3. Run `bun run start` (or `npm start`) to start the production server

---

## 🗄️ Database Schema

The application uses a single `logs` table:

| Column | Type | Description |
|--------|------|-------------|
| `id` | `String` (CUID) | Unique identifier |
| `device` | `String` | Name of the source device |
| `data` | `String` | Captured keystroke data |
| `ip` | `String` | Client IP address |
| `timestamp` | `DateTime` | When the log was received |

Indexed on `device` and `timestamp` for fast queries.

---

## ⚠️ Legal Disclaimer

> **This software is intended for educational and authorized use only.**
>
> Using a keylogger on a system you do not own or without explicit written authorization is **illegal** in most jurisdictions. The authors are not responsible for any misuse of this software.
>
> Always obtain proper consent before monitoring any system. This project was built as part of an Internship to demonstrate cybersecurity concepts and raise awareness about keystroke logging threats.

---

<div align="center">

**Built with ❤️ for cybersecurity education**

</div>