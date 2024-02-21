import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

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
          state.githubProvider = res.data.find((provider: any) => provider.name === "github");
          state.phoneProvider = res.data.find((provider: any) => provider.name === "phone");
          state.passwordProvider = res.data.find(
            (provider: any) => provider.name === "user-password",
          );
          state.emailProvider = res.data.find((provider: any) => provider.name === "email");
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
