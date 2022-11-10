import create from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import request from "@/utils/request";

type TStorage = {
  name: string;
  type: string;
  options: any;
  info: any;
  idIndex: any;
};

type State = {
  currentStorage?: TStorage;
  allStorages?: TStorage[];

  initStoragePage: () => void;

  setCurrentStorage: (currentFunction: TStorage) => void;
};

const useStorageStore = create<State>()(
  devtools(
    immer((set) => ({
      currentStorage: undefined,
      allStorages: [],

      initStoragePage: async () => {
        const res = await request.get("/api/buckets");
        set((state) => {
          state.allStorages = res.data;
          state.currentStorage = res.data[0];
        });
      },

      setCurrentStorage: (currentFunction) =>
        set((state) => {
          state.currentStorage = JSON.parse(JSON.stringify(currentFunction));
          return state;
        }),
    })),
  ),
);

export default useStorageStore;
