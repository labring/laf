## Getting Started

First, run the development server:

```bash
pnpm install
// or
pnpm i --registry=https://registry.npmmirror.com

// then
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### File Tree:

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

### Tech Stack：

- base: react / nextjs 12.x https://nextjs.org/docs/getting-started (will be update to 13.x)
- request: react-query + axios https://tanstack.com/query/v4/
- state mange: zustand + immer https://zustand-demo.pmnd.rs/
- i18n: lingui https://lingui.js.org/
- UI : chakra : https://chakra-ui.com/getting-started
- Style: tailwind + sass https://tailwindcss.com/
- Icon: react-icons: https://react-icons.github.io/react-icons

### DX:

- click-to-component https://github.com/ericclemmons/click-to-component
