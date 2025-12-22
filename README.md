# React + Vite + TypeScript Front-End Template

A production-ready, fully-featured React front-end template built with modern tools and best practices. This template provides a solid foundation for building scalable web applications with authentication, routing, state management, and a comprehensive UI component library.

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.8-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.13-38bdf8.svg)](https://tailwindcss.com/)

## ✨ Features

### 🎨 UI & Styling
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **shadcn/ui** - Beautiful, accessible component library built on Radix UI
- **Framer Motion** - Smooth animations and page transitions
- **Dark/Light Mode** - Built-in theme support with system preference detection
- **Responsive Design** - Mobile-first, fully responsive layouts

### 🏗️ Architecture & Components
- **AppShell Layout** - Pre-built application shell with sidebar navigation and header
- **PageLayout** - Flexible page layout component with breadcrumbs, actions, and empty states
- **DataTable** - Advanced table component with sorting, filtering, and pagination (TanStack Table)
- **EditableTable** - Inline editing capabilities for data tables
- **GenericToolbar** - Reusable toolbar with search, filters, and export functionality
- **Form Components** - Complete form ecosystem with validation (React Hook Form + Zod)

### 🔐 Authentication & State
- **Authentication System** - Complete auth flow with login, signup, and password recovery pages
- **Protected Routes** - Route guards with automatic redirects for unauthenticated users
- **Zustand Store** - Lightweight state management with TypeScript support
- **LocalStorage Encryption** - Secure storage utilities using crypto-js
- **Session Management** - Token-based authentication with expiry handling

### 🛠️ Developer Experience
- **TypeScript** - Full type safety throughout the application
- **ESLint** - Code quality and consistency enforcement
- **Hot Module Replacement** - Instant updates during development
- **Path Aliases** - Clean imports with `@/` prefix
- **Component Organization** - Logical file structure with separation of concerns

### 📦 Additional Features
- **React Router v7** - Modern routing with nested routes and layouts
- **React Hook Form** - Performant form handling with validation
- **Recharts** - Data visualization library for charts and graphs
- **Lucide Icons** - Beautiful, consistent icon set
- **Sonner** - Elegant toast notifications
- **Date Picker** - Accessible date/time selection components

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/bs-enterprises/multi-tenant-front-end-template.git
   cd front-end-template
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality checks |
| `npm run typecheck` | Run TypeScript type checking |

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AppShell/       # Application shell layout
│   ├── PageLayout/     # Page layout components
│   ├── common/         # Shared components (DataTable, EditableTable, etc.)
│   ├── GenericToolbar/ # Toolbar with search and filters
│   └── ui/             # shadcn/ui components
├── contexts/           # React Context providers
│   ├── AuthContext.tsx # Authentication state
│   ├── ThemeContext.tsx # Theme management
│   └── LayoutContext.tsx # Layout state
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and helpers
├── modules/            # Feature modules (Auth, Dashboard, etc.)
├── services/           # API services and utilities
├── store/              # Zustand state management
├── types/              # TypeScript type definitions
└── constants/          # Application constants
```

## 🔑 Authentication

The template includes a complete authentication system with dummy login for development:

### Demo Credentials
- **Organization Owner**: `owner@example.com` / `password123`
- **Organization Admin**: `admin@example.com` / `password123`

### Features
- Login/Signup/Forgot Password pages
- Protected route wrapper (`RequireAuth`)
- Session management with localStorage
- Token expiry handling (24-hour sessions)
- User profile and session inspector pages

### Connecting to Real API
The authentication system is ready for API integration. Update the `login()` function in `src/contexts/AuthContext.tsx`:

```typescript
// Uncomment the API section and configure your endpoints
const response = await apiLogin(username, password, "default");
```

## 🎨 Theme System

Built-in dark/light mode support with:
- System preference detection
- Manual theme toggle
- Persistent theme selection
- CSS variables for easy customization

### Customizing Theme
Edit `src/index.css` to modify theme colors:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ... more variables */
}
```

## 🧩 Component Usage

### AppShell Layout
Provides the main application structure with sidebar and header:

```tsx
import { LayoutWithAppShell } from '@/components/AppShell';

<LayoutWithAppShell>
  <YourPageContent />
</LayoutWithAppShell>
```

### PageLayout
Flexible page layout with breadcrumbs and actions:

```tsx
import { PageLayout } from '@/components/PageLayout';

<PageLayout
  title="Dashboard"
  breadcrumbs={[
    { label: 'Home', href: '/' },
    { label: 'Dashboard' }
  ]}
  actions={<Button>New Item</Button>}
>
  <YourContent />
</PageLayout>
```

### DataTable
Advanced table with sorting and filtering:

```tsx
import { DataTable } from '@/components/common/DataTable';

<DataTable
  columns={columns}
  data={data}
  enableSorting
  enableFiltering
  enablePagination
/>
```

### GenericToolbar
Search, filter, and export functionality:

```tsx
import { GenericToolbar } from '@/components/GenericToolbar';

<GenericToolbar
  searchPlaceholder="Search..."
  onSearch={handleSearch}
  onExport={handleExport}
  filterFields={filterConfig}
/>
```

## 🔧 Configuration

### Path Aliases
The template uses `@/` as an alias for the `src/` directory:

```typescript
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
```

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=https://api.example.com
VITE_APP_NAME=Your App Name
```

Access in code:
```typescript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

## 🛣️ Routing

The template uses React Router v7 with nested routes:

```
/                       → Redirects to /dashboard
/auth/login            → Login page (public)
/auth/signup           → Signup page (public)
/auth/forgot-password  → Password recovery (public)
/dashboard             → Dashboard (protected)
/settings              → Settings (protected)
/support               → Support (protected)
/account/profile       → User profile (protected)
/account/session       → Session inspector (protected)
```

### Adding New Routes
Edit `src/App.tsx`:

```tsx
<Route element={<LayoutWithAppShell />}>
  <Route path="/your-route" element={<YourComponent />} />
</Route>
```

## 📦 State Management

The template uses Zustand for state management. The store is pre-configured with a minimal setup:

```typescript
// src/store/useStore.ts
interface AppStore {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  // Add your state here
}
```

### Usage
```typescript
import { useStore } from '@/store/useStore';

function MyComponent() {
  const { loading, setLoading } = useStore();
  // ...
}
```

## 🎯 Best Practices

- **Component Organization**: Keep components small and focused
- **Type Safety**: Leverage TypeScript for better code quality
- **Code Splitting**: Use React.lazy() for route-based code splitting
- **Performance**: Utilize React.memo and useMemo for expensive computations
- **Accessibility**: All components follow WCAG guidelines
- **Error Boundaries**: Implement error boundaries for graceful error handling

## 📚 Technology Stack

| Category | Technology |
|----------|-----------|
| **Framework** | React 18.3.1 |
| **Build Tool** | Vite 5.4.8 |
| **Language** | TypeScript 5.5.3 |
| **Styling** | Tailwind CSS 3.4.13 |
| **UI Components** | shadcn/ui + Radix UI |
| **Routing** | React Router DOM 7.11.0 |
| **State Management** | Zustand 5.0.9 |
| **Form Handling** | React Hook Form 7.53.0 |
| **Validation** | Zod 3.23.8 |
| **HTTP Client** | Wretch 3.0.6 |
| **Animations** | Framer Motion 12.23.26 |
| **Tables** | TanStack Table 8.21.3 |
| **Icons** | Lucide React 0.446.0 |
| **Notifications** | Sonner 1.5.0 |
| **Charts** | Recharts 2.12.7 |

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) - For the beautiful component library
- [Radix UI](https://www.radix-ui.com/) - For accessible UI primitives
- [Lucide Icons](https://lucide.dev/) - For the icon set
- [Tailwind CSS](https://tailwindcss.com/) - For the utility-first CSS framework

## 📮 Support

For questions or issues, please open an issue on GitHub or contact the maintainers.

---

**Built with ❤️ using modern web technologies**
