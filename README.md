# EduVault

## Project Structure

```
EduVault/
├── .gitignore
├── .local/
├── .replit
├── attached_assets/
│   ├── image_1755005314034.png
│   └── Pasted-1-ShikshaWallet-Detailed-Build-Plan-Core-Concept-A-mobile-first-learner-identity-wallet-that-St-1755003400447_1755003400450.txt
├── client/
│   ├── index.html
│   └── src/
│       ├── App.tsx
│       ├── index.css
│       ├── main.tsx
│       ├── components/
│       │   ├── credential-card.tsx
│       │   ├── qr-generator.tsx
│       │   ├── qr-scanner.tsx
│       │   └── ui/
│       │       ├── accordion.tsx
│       │       ├── alert-dialog.tsx
│       │       ├── ... (many UI components)
│       ├── hooks/
│       │   ├── use-mobile.tsx
│       │   └── use-toast.ts
│       ├── lib/
│       │   ├── auth.ts
│       │   ├── auth.tsx
│       │   ├── queryClient.ts
│       │   └── utils.ts
│       ├── pages/
│       │   ├── dashboard.tsx
│       │   ├── login.tsx
│       │   ├── not-found.tsx
│       │   └── services.tsx
├── components.json
├── drizzle.config.ts
├── node_modules/
├── package-lock.json
├── package.json
├── postcss.config.js
├── replit.md
├── server/
│   ├── index.ts
│   ├── routes.ts
│   ├── storage.ts
│   └── vite.ts
├── shared/
│   └── schema.ts
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

## Description
- **client/**: Frontend code (React, TypeScript, UI components, hooks, pages, etc.)
- **server/**: Backend code (Express server, routes, storage, Vite integration)
- **shared/**: Shared code/schema between client and server
- **attached_assets/**: Images and documentation assets
- **.local/**: Local environment/config (ignored in git)

## Getting Started
1. Install dependencies: `npm install`
2. Start development server: `npm run dev`

---
Feel free to add more details about setup, usage, or contributing as needed.
