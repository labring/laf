import { createStandaloneToast, ThemeTypings } from "@chakra-ui/react";
import * as Sentry from "@sentry/react";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { APP_PHASE_STATUS, APP_STATUS, CHAKRA_UI_COLOR_MODE_KEY } from "@/constants";
import { formatPort } from "@/utils/format";

import { TApplicationDetail, TRegion, TRuntime } from "@/apis/typing";
import { ApplicationControllerUpdateState } from "@/apis/v1/applications";
import { RegionControllerGetRegions } from "@/apis/v1/regions";
import { AppControllerGetRuntimes } from "@/apis/v1/runtimes";
import { UserControllerGetProfile } from "@/apis/v1/user";

const { toast } = createStandaloneToast();

type CloseFunc = () => void;

export type State = {
  userInfo: Definitions.UserWithProfile | undefined;
  loading: boolean;
  runtimes?: TRuntime[];
  regions?: TRegion[];
  currentApp: TApplicationDetail | any;
  setCurrentApp(app: TApplicationDetail | any): void;
  init(appid?: string): void;
  updateCurrentApp(app: TApplicationDetail, state: APP_STATUS): void;
  deleteCurrentApp(): void;
  currentPageId: string | undefined;
  setCurrentPage: (pageId: string) => void;
  avatarUpdatedAt: string;
  updateUserInfo(): void;
  visitedViews: string[];
  isLSPEffective: boolean;

  showSuccess: (
    text: string | React.ReactNode,
    duration?: number | null,
    isClosable?: boolean,
  ) => CloseFunc;
  showInfo: (
    text: string | React.ReactNode,
    duration?: number | null,
    isClosable?: boolean,
  ) => CloseFunc;
  showWarning: (
    text: string | React.ReactNode,
    duration?: number | null,
    isClosable?: boolean,
  ) => CloseFunc;
  showLoading: (
    text: string | React.ReactNode,
    duration?: number | null,
    color?: ThemeTypings["colorSchemes"],
    isClosable?: boolean,
  ) => CloseFunc;
  showError: (
    text: string | React.ReactNode,
    duration?: number | null,
    isClosable?: boolean,
  ) => CloseFunc;
};

const useGlobalStore = create<State>()(
  devtools(
    immer((set, get) => ({
      userInfo: undefined,

      currentApp: undefined,

      loading: true,

      currentPageId: undefined,

      visitedViews: [],

      avatarUpdatedAt: "",

      setCurrentPage: (pageId) => {
        set((state) => {
          state.currentPageId = pageId;
          if (!state.visitedViews.includes(pageId)) {
            state.visitedViews.push(pageId);
          }
        });
      },

      init: async () => {
        const userInfo = get().userInfo;
        if (userInfo?._id) {
          return;
        }

        const userInfoRes = await UserControllerGetProfile({});

        const runtimesRes = await AppControllerGetRuntimes({});
        const regionsRes = await RegionControllerGetRegions({});

        Sentry.setUser({
          username: userInfoRes.data.username,
        });

        set((state) => {
          state.userInfo = userInfoRes.data;
          state.loading = false;
          state.runtimes = runtimesRes.data;
          state.regions = regionsRes.data;
        });
      },

      updateUserInfo: async () => {
        const userInfoRes = await UserControllerGetProfile({});
        set((state) => {
          state.userInfo = userInfoRes.data;
          state.avatarUpdatedAt = new Date().toISOString();
        });
      },

      updateCurrentApp: async (app: TApplicationDetail, newState: APP_STATUS) => {
        if (!app) {
          return;
        }
        const restartRes = await ApplicationControllerUpdateState({
          state: newState,
        });
        if (!restartRes.error) {
          set((state) => {
            if (state.currentApp) {
              state.currentApp.phase =
                newState === APP_STATUS.Running
                  ? APP_PHASE_STATUS.Starting
                  : newState === APP_STATUS.Restarting
                  ? "Restarting"
                  : APP_PHASE_STATUS.Stopping;
            }
          });
        }
      },

      deleteCurrentApp: async () => {
        const app = get().currentApp;
        if (!app) {
          return;
        }
      },

      setCurrentApp: (app) => {
        set((state) => {
          state.currentApp = app;
          state.isLSPEffective =
            app?.bundle?.resource?.limitCPU! / 1000 >= 0.5 &&
            app?.bundle?.resource.limitMemory / 1024 >= 1;

          if (typeof state.currentApp === "object") {
            const host = `${
              state.currentApp?.domain?.customDomain || state.currentApp?.domain?.domain
            }${formatPort(state.currentApp.port)}`;
            state.currentApp.host = host;
            state.currentApp.origin = `${state.currentApp?.tls ? "https://" : "http://"}${host}`;
          }
        });
      },

      isLSPEffective: false,

      showSuccess: (text: string | React.ReactNode, duration = 1000, isClosable = false) => {
        const id = toast({
          position: "top",
          title: text,
          status: "success",
          variant: localStorage.getItem(CHAKRA_UI_COLOR_MODE_KEY) ? "subtle" : "solid",
          duration,
          isClosable,
          containerStyle: {
            maxWidth: "100%",
            minWidth: "100px",
          },
        });

        return () => {
          toast.close(id);
        };
      },

      showError: (text: string | React.ReactNode, duration = 1500, isClosable = false) => {
        const id = toast({
          position: "top",
          title: text,
          status: "error",
          variant: localStorage.getItem(CHAKRA_UI_COLOR_MODE_KEY) ? "subtle" : "solid",
          duration,
          isClosable,
          containerStyle: {
            maxWidth: "100%",
            minWidth: "100px",
          },
        });

        return () => {
          toast.close(id);
        };
      },

      showWarning: (text: string | React.ReactNode, duration = 3000, isClosable = false) => {
        const id = toast({
          position: "top",
          title: text,
          status: "warning",
          variant: localStorage.getItem(CHAKRA_UI_COLOR_MODE_KEY) ? "subtle" : "solid",
          duration,
          isClosable,
          containerStyle: {
            maxWidth: "100%",
            minWidth: "100px",
          },
        });

        return () => {
          toast.close(id);
        };
      },

      showLoading: (text: string | React.ReactNode, duration = null, color, isClosable = false) => {
        const id = toast({
          position: "top",
          title: text,
          status: "loading",
          variant: localStorage.getItem(CHAKRA_UI_COLOR_MODE_KEY) ? "subtle" : "solid",
          duration,
          colorScheme: color,
          isClosable,
          containerStyle: {
            maxWidth: "100%",
            minWidth: "100px",
          },
        });

        return () => {
          toast.close(id);
        };
      },

      showInfo: (text: string | React.ReactNode, duration = 1000, isClosable = false) => {
        const id = toast({
          position: "top",
          title: text,
          variant: localStorage.getItem(CHAKRA_UI_COLOR_MODE_KEY) ? "subtle" : "solid",
          duration: duration,
          containerStyle: {
            maxWidth: "100%",
            minWidth: "100px",
          },
          isClosable: isClosable,
        });

        return () => {
          toast.close(id);
        };
      },
    })),
  ),
);

export default useGlobalStore;
