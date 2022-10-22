/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_CONSOLE_URI: string
  readonly VITE_APP_BASE_API_SYS: string
  // 更多环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
