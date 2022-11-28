import { AppControllerGetSigninUrl } from "services/v1/login";
import { AppControllerGetProfile } from "services/v1/profile";
import create from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

type State = {
  userInfo: any;
  init(): void;
};

const useGlobalStore = create<State>()(
  devtools(
    immer((set) => ({
      userInfo: {},

      init: async () => {
        const res = await AppControllerGetProfile({});
      },

      login: async () => {
        const res = await AppControllerGetSigninUrl({});
        console.log(222, res);
      },
    })),
  ),
);

export default useGlobalStore;
