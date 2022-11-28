import { AppControllerGetSigninUrl } from "services/v1/login";
import { AppControllerGetProfile } from "services/v1/profile";
import create from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

type State = {
  userInfo: any;
  loading: boolean;
  init(): void;
};

const useGlobalStore = create<State>()(
  devtools(
    immer((set, get) => ({
      userInfo: {},

      loading: false,

      init: async () => {
        const userInfo = get().userInfo;
        if (userInfo.id) {
          return;
        }
        set((state) => {
          state.loading = true;
        });
        const res = await AppControllerGetProfile({});

        set((state) => {
          state.userInfo = res.data;
          state.loading = false;
        });
      },

      login: async () => {
        const res = await AppControllerGetSigninUrl({});
        console.log(222, res);
      },
    })),
  ),
);

export default useGlobalStore;
