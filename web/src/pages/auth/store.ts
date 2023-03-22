import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

type State = {
  providers: any[];
  setProviders: (providers: any) => void;
};

const useAuthStore = create<State>()(
  devtools(
    immer((set, get) => ({
      providers: [],
      setProviders: (providers: any) =>
        set((state) => {
          state.providers = providers;
        }),
    })),
  ),
);

export default useAuthStore;
