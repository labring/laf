/* eslint-disable no-unused-vars */
export const SideBarWidth = 64;
export const SmallNavHeight = 42;

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
  Started = "Started",
  Restarting = "Restarting",
}
