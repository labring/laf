import create from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import request from "@/utils/request";

export type TStorage = {
  name: string;
  mode: string;
  quota: number;
  idIndex: any;
};

export type TFile = {
  name: string;
  path: string;
  size: number;
  updateTime: string;
  prefix: string;
};

type State = {
  currentStorage?: TStorage;
  allStorages?: TStorage[];
  files?: TFile[];

  initStoragePage: () => void;

  setCurrentStorage: (currentStorage: TStorage) => void;
  editStorage: (currentStorage: TStorage) => void;
  deleteStorage: (currentStorage: TStorage) => void;
};

const useStorageStore = create<State>()(
  devtools(
    immer((set) => ({
      currentStorage: undefined,
      allStorages: [],
      files: [],

      initStoragePage: async () => {
        const res = await request.get("/api/buckets");
        set((state) => {
          state.allStorages = res.data;
          state.currentStorage = res.data[0];
        });

        const files = await request.get("/api/files");
        set((state) => {
          state.files = files.data;
        });
      },

      setCurrentStorage: (currentStorage) =>
        set((state) => {
          state.currentStorage = JSON.parse(JSON.stringify(currentStorage));
          return state;
        }),

      editStorage: async (storage: TStorage) => {
        const res = await request.post("/api/buckets", storage);
        set((state) => {
          state.allStorages = res.data;
          state.currentStorage = res.data[0];
        });
      },

      deleteStorage: async (storage: TStorage) => {
        const res = await request.delete(`/api/buckets${storage.idIndex}`);
        set((state) => {
          state.allStorages = res.data;
          state.currentStorage = res.data[0];
        });
      },
    })),
  ),
);

export default useStorageStore;
