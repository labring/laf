import useGlobalStore from "pages/globalStore";
import {
  CollectionsControllerCreate,
  CollectionsControllerFindAll,
  CollectionsControllerRemove,
} from "services/v1/apps";
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
  createDB: (name: string) => void;

  deleteDB: (name: string) => Promise<Paths.CollectionsControllerRemove.Responses>;
  setCurrentDB: (currentDB: TDB) => void;

  currentData?: any;
  updateCurrentData: (data: any) => void;
};

const useDBMStore = create<State>()(
  devtools(
    immer((set, get) => ({
      currentDB: undefined,
      allDBs: [],

      entryList: [],

      currentData: undefined,

      initDBPage: async () => {
        const globalStore = useGlobalStore.getState();

        const res = await CollectionsControllerFindAll({ appid: globalStore.currentApp });
        const entryRes = await request.get("/api/dbm_entry");
        set((state) => {
          state.allDBs = res.data;
          state.currentDB = res.data[0];
          state.entryList = entryRes.data?.list;
        });
      },

      createDB: async (name: string) => {
        const globalStore = useGlobalStore.getState();

        const res = await CollectionsControllerCreate({
          appid: globalStore.currentApp,
          name,
        });

        get().initDBPage();
      },

      deleteDB: async (name: string) => {
        const globalStore = useGlobalStore.getState();

        const res = await CollectionsControllerRemove({
          appid: globalStore.currentApp,
          name,
        });
        return res;
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
