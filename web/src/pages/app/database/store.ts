import create from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { TDB } from "@/apis/typing";

type State = {
  currentDB?: TDB | undefined;
  setCurrentDB: (currentDB: TDB | undefined) => void;
};

const useDBMStore = create<State>()(
  devtools(
    immer((set) => ({
      currentDB: undefined,

      setCurrentDB: async (currentDB: any) => {
        set((state) => {
          state.currentDB = currentDB;
        });
      },
    })),
  ),
);

export default useDBMStore;
