This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
pnpm install
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

tree:

```
.
├── README.md
├── components
│   ├── Header
│   │   └── index.tsx
│   └── Layout
│       ├── Basic.tsx
│       └── Function.tsx
├── constants
│   └── index.ts
├── locales
│   ├── en
│   │   └── message.js
│   └── zh-CN
│       └── message.js
├── next-env.d.ts
├── next.config.js
├── package.json
├── pages
│   ├── _app.tsx
│   ├── _document.tsx
│   ├── api
│   │   ├── app.ts
│   │   └── response.ts
│   ├── app
│   │   ├── [id]
│   │   │   ├── databases
│   │   │   │   └── index.tsx
│   │   │   ├── functions
│   │   │   │   ├── [function_id].tsx
│   │   │   │   ├── index.module.scss
│   │   │   │   ├── mockFuncTextString.tsx
│   │   │   │   ├── mods
│   │   │   │   │   ├── CreateModal
│   │   │   │   │   │   └── index.tsx
│   │   │   │   │   ├── DebugPannel
│   │   │   │   │   │   └── index.tsx
│   │   │   │   │   ├── DependecePanel
│   │   │   │   │   │   ├── index.module.scss
│   │   │   │   │   │   └── index.tsx
│   │   │   │   │   ├── FunctionPanel
│   │   │   │   │   │   ├── index.module.scss
│   │   │   │   │   │   └── index.tsx
│   │   │   │   │   └── List
│   │   │   │   │       └── index.tsx
│   │   │   │   └── store.ts
│   │   │   ├── index.tsx
│   │   │   ├── mods
│   │   │   │   └── SiderBar
│   │   │   │       ├── index.module.scss
│   │   │   │       └── index.tsx
│   │   │   └── storages
│   │   │       └── index.tsx
│   │   ├── index.tsx
│   │   └── mods
│   │       └── CrateDialog
│   │           └── index.tsx
│   ├── globals.css
│   ├── home
│   │   └── index.tsx
│   └── index.tsx
├── pnpm-lock.yaml
├── postcss.config.js
├── public
│   ├── favicon.ico
│   ├── logo.png
│   └── vercel.svg
├── tailwind.config.js
├── tsconfig.json
└── utils
    ├── i18n.ts
    └── request.ts
```
