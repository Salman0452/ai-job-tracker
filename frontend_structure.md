frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/login/
│   │   ├── (auth)/register/
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx     ← sidebar + navbar wrapper
│   │   │   ├── dashboard/
│   │   │   ├── applications/
│   │   │   ├── resume/
│   │   │   └── analytics/
│   │   ├── (admin)/
│   │   │   ├── layout.tsx     ← admin layout with role guard
│   │   │   └── admin/
│   │   └── page.tsx           ← landing page
│   ├── components/
│   │   ├── ui/                ← shadcn components
│   │   ├── dashboard/
│   │   ├── applications/
│   │   └── admin/
│   ├── lib/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── utils.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── usePolling.ts      ← for AI result polling
│   └── middleware.ts