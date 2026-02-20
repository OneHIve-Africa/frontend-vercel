OneHive Frontend
=================

A React + TypeScript single-page application built with Vite and Tailwind CSS for OneHive's investor, farmer, and admin portals.

This README onboards new developers and explains how things work and why choices were made.

# Quick Start

1) Prerequisites
- Node.js 20+ and npm
- Access to the backend API base URL and credentials

2) Install
```bash
npm install
```

3) Environment variables
Create a `.env` file in the project root with at least:
```
VITE_API_URL=http://127.0.0.1:8000/api
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
```

4) Run
```bash
npm run dev          # local dev server (Vite)
npm run start        # same, but binds host for LAN testing
```

5) Build & Preview
```bash
npm run build        # type-check + production build
npm run preview      # preview built app
```

6) Lint
```bash
npm run lint
```

# Tech Stack & Rationale

- React 18 + TypeScript: robust type-safety and familiar ecosystem.
- Vite 6: fast dev server, modern bundling.
- Tailwind CSS 4 + Radix UI: rapid, consistent styling + a11y primitives.
- React Router v7: SPA routing and nested layouts.
- Axios: HTTP client with interceptors for auth and error normalization.
- Zustand: simple, minimal global state for auth/profile.
- date-fns: lightweight date formatting.
- Cloudinary: reliable asset hosting/transformations for uploads.

These choices optimize for development speed, DX, and maintainability, with minimal framework lock-in.

# Project Structure

Key paths:
- `src/` – App source
  - `v1/api/` – API layer modules (e.g., `AuthApi.ts`, `ResourcesApi.ts`).
  - `v1/features/` – Feature-first organization for pages and UI.
    - `admin/` – Admin-only features.
    - `resources/` – End-user resources listing page.
    - `notifications/`, `feedback/`, etc.
  - `v1/components/` – Shared layout and UI components.
  - `v1/routes/` – Router config (`router.tsx`, `ProtectedRoute.tsx`).
  - `v1/lib/` – Libraries/utilities (e.g., `cloudinary.ts`).
  - `v1/utils/` – Utilities (e.g., `dateutils.tsx`).
- `vite.config.ts` – Build config and alias setup.
- `vercel.json` – SPA rewrite rule for Vercel deployments.

Path Alias:
- `@` points to `src/` (see `vite.config.ts`). Example: `import X from "@/v1/api/ResourcesApi"`.

# Routing & Roles

- Router definition: `src/v1/routes/router.tsx`.
- After login, `ProtectedRoute` mounts the primary layout.
- Routes are split for admins vs. non-admins via `profile.position`:
  - Admin position: `Administrator` → admin routes (e.g., `/admin/resources`).
  - Non-admin: users route set (e.g., `/resources`).

# Authentication & API Layer

- Base class: `src/v1/api/Api.ts` wraps axios.
  - Reads `VITE_API_URL` as base URL.
  - Adds Authorization header from `localStorage.access_token`.
  - Normalizes backend error responses (Django REST Framework-friendly).
  - Handles token expiry by redirecting to `/login`.

- APIs follow a small pattern per domain (e.g., `ResourcesApi.ts`). Example:
```ts
class ResourcesApi extends Api {
  listResources() { return this.get<ResourceItem[]>("/resources/"); }
  createResource(payload: CreateResourcePayload) { return this.post("/resources/", payload); }
}
```

- Conventions:
  - Paths are relative to `VITE_API_URL`.
  - Avoid double `/api` in paths; client uses `/resources/` not `/api/resources`.
  - Server derives `created_by_email`; client does not send `created_by`.
  - `accessed_by` values are Title Case: `"Admins" | "Farmers" | "Investors"`.

# State Management

- `zustand` stores in `src/v1/features/auth/store/` hold `profile` and tokens.
- `useUserProfileStore` hydrates from `localStorage.user` and syncs with backend.
- Keep store logic minimal; prefer local component state for view state.

# Styling & UI

- Tailwind CSS utility-first classes with `@tailwindcss/typography` for rich text.
- Radix UI components for accessible primitives.
- Icons: `lucide-react`.

# Features Deep-Dive

Resources (Admin)
- Path: `src/v1/features/admin/features/resources/`
- Upload flow: `UploadResourceModal.tsx` handles previews (images, PDF, CSV, TXT, XLSX, Markdown) and uses `uploadToCloudinary`.
- On success, admin posts to `/resources/` with payload: `{ title, desc?, accessed_by: ("Admins"|"Farmers"|"Investors")[], public_url }`.
- The admin table auto-refreshes after upload.

Resources (End Users)
- Path: `src/v1/features/resources/features/ResourcesPage.tsx`
- Fetches `/resources/` and filters by role:
  - Investors see `accessed_by === "Investors"`.
  - Farmers see `accessed_by === "Farmers"`.
- Search across title/description/email, file-type icons, size display (via HEAD `Content-Length`), retry UI, and sort by `created_at`.

# Environment Management

We target three environments (example):
- Dev: local backend, debugging enabled.
- Staging: preview builds for QA.
- Prod: optimized builds.

Switch environments by changing `.env` or provider environment variables:
- `VITE_API_URL`: points to the desired backend base.
- Cloudinary vars: change per environment.

Vercel
- `vercel.json` contains a rewrite `{ 
  "rewrites": [{ "source": "/(.*)", "destination": "/" }] 
}` so client-side routing works in SPA.

# Error Handling

- API layer normalizes backend errors and validation errors into `{ error, fieldErrors? }`.
- Token expiry triggers a redirect to `/login`.
- UI components should show inline errors with retry actions where appropriate.

# Adding a New Feature

1) Create API module in `src/v1/api/DomainApi.ts` extending `Api`.
2) Create feature in `src/v1/features/<domain>/features/` and route in `router.tsx`.
3) Use alias imports from `@/` and follow the state + API conventions above.
4) Add UI with Tailwind + Radix primitives.

# Adding a New API Client

Template:
```ts
// src/v1/api/ExampleApi.ts
import Api from "./Api";
import type { ApiResponse } from "./types";

export interface ExampleItem { id: number; name: string; }

export default class ExampleApi extends Api {
  static instance: ExampleApi;
  static getInstance() { return this.instance ?? (this.instance = new ExampleApi()); }

  list(): Promise<ApiResponse<ExampleItem[]>> { return this.get("/examples/"); }
  create(payload: Partial<ExampleItem>): Promise<ApiResponse<ExampleItem>> { return this.post("/examples/", payload); }
}
```

# Development Tips

- Use `npm run dev` and keep the browser console open for network errors.
- Check the Network tab for CORS or auth header issues.
- If uploads fail: verify Cloudinary env values and unsigned preset.
- If API 401 appears: token likely expired; login again.
- Large bundle warnings are okay in dev; consider code-splitting for future optimizations.

# Coding Conventions

- TypeScript strictness: keep types explicit for API payloads and responses.
- Prefer composition over deep prop drilling; use small components.
- Keep feature folders self-contained (components, features, local hooks).
- Use `dateUtils` for any date rendering consistency.

# Scripts Reference

- `npm run dev` – start dev server
- `npm run start` – dev server, host bound
- `npm run build` – type-check + build
- `npm run preview` – preview build
- `npm run lint` – run ESLint

# License

Private repository – internal use only.

