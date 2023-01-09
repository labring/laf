import { createStandaloneToast } from "@chakra-ui/react";
import create from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { APP_PHASE_STATUS } from "@/constants";

import { TApplication } from "@/apis/typing";
import { ApplicationControllerUpdate } from "@/apis/v1/applications";
import { AppControllerGetBundles } from "@/apis/v1/bundles";
import { AuthControllerGetSigninUrl } from "@/apis/v1/login";
import { AuthControllerGetProfile } from "@/apis/v1/profile";
import { AppControllerGetRegions } from "@/apis/v1/regions";
import { AppControllerGetRuntimes } from "@/apis/v1/runtimes";

const { toast } = createStandaloneToast();

type State = {
  userInfo: any;
  loading: boolean;
  runtimes?: any[];
  regions?: any[];
  bundles?: any[];
  currentApp: TApplication | undefined;
  setCurrentApp(app: TApplication): void;
  init(appid?: string): void;
  restartCurrentApp(): void;

  currentPageId: string | undefined;
  setCurrentPage: (pageId: string) => void;

  visitedViews: string[];

  showSuccess: (text: string | React.ReactNode) => void;
  showInfo: (text: string | React.ReactNode) => void;
  showError: (text: string | React.ReactNode) => void;
};

const useGlobalStore = create<State>()(
  devtools(
    immer((set, get) => ({
      userInfo: {},

      currentApp: undefined,

      loading: true,

      currentPageId: undefined,

      visitedViews: [],

      setCurrentPage(pageId) {
        set((state) => {
          state.currentPageId = pageId;
          if (!state.visitedViews.includes(pageId)) {
            state.visitedViews.push(pageId);
          }
        });
      },

      init: async () => {
        const userInfo = get().userInfo;
        if (userInfo.id) {
          return;
        }

        const userInfoRes = await AuthControllerGetProfile({});

        const runtimesRes = await AppControllerGetRuntimes({});
        const bundlesRes = await AppControllerGetBundles({});
        const regionsRes = await AppControllerGetRegions({});

        set((state) => {
          state.userInfo = userInfoRes.data;
          state.loading = false;
          state.runtimes = runtimesRes.data;
          state.bundles = bundlesRes.data;
          state.regions = regionsRes.data;
        });
      },

      restartCurrentApp: async () => {
        const app = get().currentApp;
        if (!app) {
          return;
        }
        const restartRes = await ApplicationControllerUpdate({
          name: app.name,
          state: APP_PHASE_STATUS.Restarting,
        });
        if (!restartRes.error) {
          set((state) => {
            if (state.currentApp) {
              state.currentApp.phase = APP_PHASE_STATUS.Restarting;
            }
          });
        }
      },

      setCurrentApp: (app) => {
        localStorage.setItem("app", app.appid);
        set((state) => {
          state.currentApp = app;
        });
      },

      login: async () => {
        await AuthControllerGetSigninUrl({});
      },

      showSuccess: (text: string | React.ReactNode) => {
        toast({
          position: "top",
          title: text,
          status: "success",
          duration: 1000,
          containerStyle: {
            maxWidth: "100%",
            minWidth: "100px",
          },
        });
      },

      showError: (text: string | React.ReactNode) => {
        toast({
          position: "top",
          title: text,
          status: "error",
          duration: 1000,
          containerStyle: {
            maxWidth: "100%",
            minWidth: "100px",
          },
        });
      },

      showInfo: (text: string | React.ReactNode) => {
        toast({
          position: "top",
          title: text,
          variant: "subtle",
          duration: 1000,
          containerStyle: {
            maxWidth: "100%",
            minWidth: "100px",
          },
        });
      },
    })),
  ),
);

export default useGlobalStore;
