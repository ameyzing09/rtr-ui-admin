# RTR UI Admin

A production-ready, multi-tenant SaaS admin dashboard built with Next.js 15, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Multi-tenant Architecture** - Support for multiple tenants with custom branding
- **Modular Component System** - Reusable dashboard components (StatCard, ChartCard, etc.)
- **Generic Sidebar** - Flexible navigation system for any admin structure
- **Glassmorphism Design** - Modern UI with glass-effect navbar
- **TypeScript First** - Fully typed with strict mode, no `any` types
- **Responsive Design** - Mobile-first with proper accessibility
- **Theme System** - CSS variables with tenant-specific theming

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
├── components/
│   ├── ui/                # Reusable UI components
│   ├── layout/            # Layout components (Navbar, Sidebar)
│   └── composite/         # Complex composed components
├── features/              # Feature-based modules
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and configurations
├── config/                # App configuration
└── styles/                # Global styles and themes
```

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **State**: React hooks
- **Build**: Turbopack

## 🏃‍♂️ Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Visit the dashboard**:
   Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

## 🧩 Component System

### Dashboard Cards
- **StatCard** - Metrics and KPIs with trend indicators
- **ChartCard** - Consistent chart containers
- **ActivityCard** - Activity feeds and recent events
- **QuickActionsCard** - Action buttons and shortcuts
- **StatusCard** - System status indicators
- **NotificationsCard** - Alerts and messages

### Layout System
- **GenericSidebar** - Flexible navigation for any structure
- **Navbar** - Glassmorphism top navigation
- **DashboardShell** - Complete layout wrapper

## 📚 Documentation

Detailed documentation is available in the [`/docs`](./docs) folder:

- [Component Usage Guide](./docs/component-usage.md)
- [Theming System](./docs/theming.md)
- [Development Guidelines](./docs/development.md)

## 🔧 Development

### Build
```bash
npm run build
```

### Lint
```bash
npm run lint
```

### Type Check
```bash
npx tsc --noEmit
```

## 🚀 Deployment

This project is optimized for deployment on Vercel, but can be deployed anywhere that supports Node.js.

```bash
npm run build
npm start
```

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

Built with ❤️ using Next.js and TypeScript