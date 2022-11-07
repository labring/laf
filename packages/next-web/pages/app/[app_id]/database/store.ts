import create from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import request from "@/utils/request";

type TDB = {
  name: string;
  type: string;
  options: any;
  info: any;
  idIndex: any;
};

type State = {
  currentDB?: TDB;
  allDBs?: TDB[];

  initDBPage: () => void;

  setCurrentDB: (currentFunction: TDB) => void;
};

const useDBMStore = create<State>()(
  devtools(
    immer((set) => ({
      currentDB: undefined,
      allDBs: [],

      initDBPage: async () => {
        const res = await request.get("/api/collections");
        set((state) => {
          state.allDBs = res.data;
          state.currentDB = res.data[0];
        });
      },

      setCurrentDB: (currentFunction) =>
        set((state) => {
          state.currentDB = JSON.parse(JSON.stringify(currentFunction));
          return state;
        }),
    })),
  ),
);

export default useDBMStore;
