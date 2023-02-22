import create from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { TDB } from "@/apis/typing";

type State = {
  currentShow: "DB" | "Policy";
  currentDB?: TDB | undefined;
  currentPolicy?: any;
  setCurrentShow: (currentItem: "DB" | "Policy") => void;
  setCurrentDB: (currentDB: TDB | undefined) => void;
  setCurrentPolicy: (currentPolicy: any) => void;
};

const useDBMStore = create<State>()(
  devtools(
    immer((set) => ({
      currentShow: "DB",
      currentDB: undefined,
      currentPolicy: undefined,
      setCurrentDB: async (currentDB: any) => {
        set((state) => {
          state.currentDB = currentDB;
          state.setCurrentShow("DB");
        });
      },
      setCurrentPolicy: async (currentPolicy: any) => {
        set((state) => {
          state.currentPolicy = currentPolicy;
          state.setCurrentShow("Policy");
        });
      },
      setCurrentShow: async (currentItem: "DB" | "Policy") => {
        set((state) => {
          state.currentShow = currentItem;
        });
      },
    })),
  ),
);

export default useDBMStore;
