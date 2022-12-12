import { createStandaloneToast } from "@chakra-ui/react";
import { TApplication } from "apis/typing";
import { SpecsControllerGetBundles } from "apis/v1/bundles";
import { AuthControllerGetSigninUrl } from "apis/v1/login";
import { AuthControllerGetProfile } from "apis/v1/profile";
import { SpecsControllerGetRuntimes } from "apis/v1/runtimes";
import create from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

const { toast } = createStandaloneToast();

type State = {
  userInfo: any;
  loading: boolean;
  runtimes?: any[];
  bundles?: any[];
  currentApp: TApplication | undefined;
  setCurrentApp(app: TApplication): void;
  init(appid?: string): void;

  showSuccess: (text: string | React.ReactNode) => void;
  showError: (text: string | React.ReactNode) => void;
};

const useGlobalStore = create<State>()(
  devtools(
    immer((set, get) => ({
      userInfo: {},

      currentApp: undefined,

      loading: true,

      init: async () => {
        const userInfo = get().userInfo;
        if (userInfo.id) {
          return;
        }

        const userInfoRes = await AuthControllerGetProfile({});

        const runtimesRes = await SpecsControllerGetRuntimes({});
        const bundlesRes = await SpecsControllerGetBundles({});

        set((state) => {
          state.userInfo = userInfoRes.data;
          state.loading = false;
          state.runtimes = runtimesRes.data;
          state.bundles = bundlesRes.data;
        });
      },

      setCurrentApp: (app) => {
        localStorage.setItem("app", app.appid);
        set((state) => {
          state.currentApp = app;
        });
      },

      login: async () => {
        const res = await AuthControllerGetSigninUrl({});
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
    })),
  ),
);

export default useGlobalStore;
