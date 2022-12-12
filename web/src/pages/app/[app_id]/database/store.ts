import create from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

type TDB = {
  name: string;
  type: string;
  options: any;
  info: any;
  idIndex: string;
};

type State = {
  currentDB?: TDB;
  setCurrentDB: (currentDB: TDB) => void;
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
