

# ReciteRecipe — Recipe Sharing App

## Overview
A recipe sharing web app with user authentication, rich-text recipe posts, image uploads, search, and an admin panel. Built with React + Tailwind CSS, powered by Lovable Cloud (Supabase).

---

## Database Schema

### Tables
- **profiles** — `id (FK to auth.users)`, `username`, `avatar_url`, `created_at`
- **user_roles** — `id`, `user_id (FK)`, `role (enum: user, admin)` — secure role management
- **recipes** — `id`, `user_id (FK)`, `title`, `description (rich text HTML)`, `image_url`, `created_at`, `updated_at`

### Storage
- **recipe-images** bucket — public bucket for uploaded recipe images

### Security
- RLS policies on all tables: users can CRUD their own recipes, admins can delete any recipe
- `has_role()` security definer function for safe role checks

---

## Pages & Features

### 1. Auth Pages (`/login`, `/register`)
- Email/password registration and login
- Auto-creates profile on signup with default "user" role
- Clean forms with validation and friendly error toasts

### 2. Home Page (`/`)
- Grid of recipe cards showing image, title, author, and date
- **Search bar** at the top — filters recipes by title in real-time against the database
- Click a card to view the full recipe

### 3. Recipe Detail Page (`/recipe/:id`)
- Full recipe view with image, rich-text description, author info
- Edit/Delete buttons visible only to the recipe author

### 4. Create/Edit Recipe (`/recipe/new`, `/recipe/:id/edit`)
- Title input
- Rich text editor for description (bold, italic, links, lists) using a lightweight editor (tiptap or similar)
- Image handling: **Upload a file** OR **paste an external URL** — toggle between both options
- Uploaded files go to Supabase Storage; external URLs stored directly

### 5. Admin Panel (`/admin`)
- Only accessible to users with admin role
- **Users tab**: list all registered users
- **Recipes tab**: list all recipes with ability to delete any recipe
- Protected route — redirects non-admins

### 6. Navigation
- Top navbar with logo, search, and auth links
- Shows "Admin" link only for admin users
- User dropdown with profile and logout

---

## Design
- Clean, modern UI using Tailwind CSS (already in the project)
- Responsive layout — works on mobile and desktop
- Toast notifications for errors and success messages (user-friendly, no raw stack traces)

