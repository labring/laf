/* eslint-disable no-unused-vars */
export const SideBarWidth = 52;
export const SmallNavHeight = 42;
export const PanelMinHeight = 32;

export const VITE_SERVER_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL || "";

export const Pages = {
  function: "function",
  storage: "storage",
  database: "database",
  logs: "logs",
  setting: "setting",
  userSetting: "userSetting",
};

export enum APP_STATUS {
  // [ "Running", "Stopped", "Restarting", "Deleted" ]
  Running = "Running",
  Stopped = "Stopped",
  Restarting = "Restarting",
  Deleted = "Deleted",
}

export const DEFAULT_REGION = "default";

export enum SUPPORTED_METHODS {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
}

export enum APP_PHASE_STATUS {
  Creating = "Creating",
  Created = "Created",
  Starting = "Starting",
  Started = "Started",
  Stopping = "Stopping",
  Stopped = "Stopped",
  Deleting = "Deleting",
  Deleted = "Deleted",
  Releasing = "Releasing",
}

export enum BUCKET_POLICY_TYPE {
  private = "private",
  readonly = "readonly",
  readwrite = "readwrite",
}

export enum BUCKET_STATUS {
  Active = "Active",
}

export enum CHARGE_CHANNEL {
  WeChat = "WeChat",
  Alipay = "Alipay",
}

export enum CURRENCY {
  CNY = "CNY",
  USD = "USD",
}

export const Routes = {
  dashboard: "/dashboard",
};

export const CHAKRA_UI_COLOR_MODE_KEY = "chakra-ui-color-mode";

export const COLOR_MODE = {
  light: "light",
  dark: "dark",
};

export const LAF_AI_URL = "https://htr4n1.laf.run/laf-gpt";

export const DEFAULT_CODE = `import cloud from '@lafjs/cloud'

export default async function (ctx: FunctionContext) {
  console.log('Hello World')
  return { data: 'hi, laf' }
}
`;

export enum TEMPLATE_CATEGORY {
  recommended = "recommended",
  all = "all",
  default = "default",
  stared = "stared",
  recentUsed = "recentUsed",
}
