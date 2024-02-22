import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { PROVIDER_NAME } from "@/constants";

import { AuthenticationControllerGetProviders } from "@/apis/v1/auth";

type State = {
  initProviders: () => void;
  githubProvider: any;
  phoneProvider: any;
  passwordProvider: any;
  emailProvider: any;
  defaultProvider: any;
};

const useAuthStore = create<State>()(
  devtools(
    immer((set, get) => ({
      initProviders: async () => {
        const res = await AuthenticationControllerGetProviders({});
        set((state) => {
          state.githubProvider = res.data.find(
            (provider: any) => provider.name === PROVIDER_NAME.GITHUB,
          );
          state.phoneProvider = res.data.find(
            (provider: any) => provider.name === PROVIDER_NAME.PHONE,
          );
          state.passwordProvider = res.data.find(
            (provider: any) => provider.name === PROVIDER_NAME.PASSWORD,
          );
          state.emailProvider = res.data.find(
            (provider: any) => provider.name === PROVIDER_NAME.EMAIL,
          );
          state.defaultProvider = res.data.find((provider: any) => provider.default);
        });
      },
      githubProvider: {},
      phoneProvider: {},
      passwordProvider: {},
      emailProvider: {},
      defaultProvider: {},
    })),
  ),
);

export default useAuthStore;
