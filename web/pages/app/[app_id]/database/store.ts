import create from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import request from "@/utils/request";

type TDB = {
  name: string;
  type: string;
  options: any;
  info: any;
  idIndex: string;
};

type State = {
  currentDB?: TDB;
  allDBs?: TDB[];

  entryList?: any[];

  initDBPage: () => void;

  setCurrentDB: (currentDB: TDB) => void;

  currentData?: any;
  updateCurrentData: (data: any) => void;
};

const useDBMStore = create<State>()(
  devtools(
    immer((set) => ({
      currentDB: undefined,
      allDBs: [],

      entryList: [],

      currentData: undefined,

      initDBPage: async () => {
        const res = await request.get("/api/collections");
        const entryRes = await request.get("/api/dbm_entry");
        set((state) => {
          state.allDBs = res.data;
          state.currentDB = res.data[0];
          state.entryList = entryRes.data?.list;
        });
      },

      setCurrentDB: async (currentDB) => {
        const entryRes = await request.get("/api/dbm_entry", {
          params: {
            name: currentDB.name, // todo
          },
        });
        set((state) => {
          state.currentDB = JSON.parse(JSON.stringify(currentDB));
          state.entryList = entryRes.data?.list;
          state.currentData = undefined;
          return state;
        });
      },

      updateCurrentData: (data) => {
        set((state) => {
          state.currentData = data;
          return state;
        });
      },
    })),
  ),
);

export default useDBMStore;
