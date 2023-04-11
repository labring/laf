/* eslint-disable no-unused-vars */
export const SideBarWidth = 64;
export const SmallNavHeight = 42;

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
  // [ Initializing, Initialized, Starting, Running, Stopping, Stopped ]
  Initializing = "Initializing",
  Initialized = "Initialized",
  Starting = "Starting",
  Running = "Running",
  Stopping = "Stopping",
  Stopped = "Stopped",
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
  Started = "Started",
  Starting = "Starting",
  Restarting = "Restarting",
  Deleting = "Deleting",
  Deleted = "Deleted",
  Stopping = "Stopping",
  Stopped = "Stopped",
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
