/* eslint-disable no-unused-vars */
export const SideBarWidth = 52;
export const SmallNavHeight = 42;
export const PanelMinHeight = 32;

export const VITE_SERVER_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL || "";

export const Pages = {
  function: "function",
  storage: "storage",
  database: "database",
  setting: "setting",
  userSetting: "userSetting",
};

export enum APP_STATUS {
  Running = "Running",
  Stopped = "Stopped",
  Restarting = "Restarting",
  Deleted = "Deleted",
  Releasing = "Releasing",
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
  login: "/login",
  dashboard: "/dashboard",
  templates: "/market/templates",
};

export const site_url = {
  laf_github: "https://github.com/labring/laf",
  laf_index_video: "https://itceb8-video.oss.laf.run/laf-website.mp4",
};

export const CHAKRA_UI_COLOR_MODE_KEY = "chakra-ui-color-mode";

export const COLOR_MODE = {
  light: "light",
  dark: "dark",
};

export const DEFAULT_CODE = `import cloud from '@lafjs/cloud'

export default async function (ctx: FunctionContext) {
  console.log('Hello World')
  return { data: 'hi, laf' }
}
`;

export enum APP_SETTING_KEY {
  INFO = "info",
  ENV = "env",
  MONITOR_RUNTIME = "monitorRuntime",
  MONITOR_DATABASE = "monitorDatabase",
  DOMAIN = "domain",
  COMMON = "common",
}

export enum PROVIDER_NAME {
  PHONE = "phone",
  EMAIL = "email",
  GITHUB = "github",
  PASSWORD = "user-password",
}

export const RUNTIMES_PATH = "/app/functions";
