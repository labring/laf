import { createStandaloneToast } from "@chakra-ui/react";
import { AppControllerGetSigninUrl } from "services/v1/login";
import { AppControllerGetProfile } from "services/v1/profile";
import create from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

const { toast } = createStandaloneToast();

type State = {
  userInfo: any;
  loading: boolean;
  currentApp: any;
  setCurrentApp(app: any): void;
  init(appid: string): void;

  showSuccess: (text: string | React.ReactNode) => void;
};

const useGlobalStore = create<State>()(
  devtools(
    immer((set, get) => ({
      userInfo: {},

      currentApp: {},

      loading: true,

      init: async (appid) => {
        const userInfo = get().userInfo;
        if (userInfo.id) {
          return;
        }
        set((state) => {
          state.loading = true;
        });
        const res = await AppControllerGetProfile({});

        set((state) => {
          state.currentApp = appid;
          state.userInfo = res.data;
          state.loading = false;
        });
      },

      setCurrentApp: (app: any) => {
        set((state) => {
          state.currentApp = app;
        });
      },

      login: async () => {
        const res = await AppControllerGetSigninUrl({});
        console.log(222, res);
      },

      showSuccess: (text: string | React.ReactNode) => {
        toast({
          position: "top",
          title: text,
          status: "success",
          duration: 1000,
        });
      },
    })),
  ),
);

export default useGlobalStore;
