import useGlobalStore from "pages/globalStore";
import {
  BucketsControllerCreate,
  BucketsControllerFindAll,
  BucketsControllerRemove,
  BucketsControllerUpdate,
} from "services/v1/apps";
import create from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import request from "@/utils/request";

export type TStorage = {
  name: string;
  mode: string;
  quota: number;
  idIndex: any;
  spec: {
    policy: string;
    storage: string;
  };
  metadata: {
    name: string;
  };
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
  updateStorage: (currentStorage: Definitions.UpdateBucketDto | any) => any;
  createStorage: (
    currentStorage: Definitions.CreateBucketDto,
  ) => Paths.BucketsControllerCreate.Responses;
  deleteStorage: (currentStorage: TStorage) => Promise<Paths.BucketsControllerRemove.Responses>;
};

const useStorageStore = create<State>()(
  devtools(
    immer((set, get) => ({
      currentStorage: undefined,
      allStorages: [],
      files: [],

      initStoragePage: async () => {
        const globalStore = useGlobalStore.getState();
        const res = await BucketsControllerFindAll({
          appid: globalStore.currentApp,
        });
        set((state) => {
          state.allStorages = res.data.items || [];
          state.currentStorage = res.data.items[0];
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

      createStorage: async (storage) => {
        const globalStore = useGlobalStore.getState();

        const res = await BucketsControllerCreate({
          appid: globalStore.currentApp,
          ...storage,
        });
        return res;
      },

      updateStorage: async (storage) => {
        const globalStore = useGlobalStore.getState();

        const res = await BucketsControllerUpdate({
          appid: globalStore.currentApp,
          ...storage,
          name: storage.shortName,
        });
        return res;
      },

      editStorage: async (storage: TStorage) => {
        const res = await request.post("/api/buckets", storage);
        set((state) => {
          state.allStorages = res.data;
          state.currentStorage = res.data[0];
        });
      },

      deleteStorage: async (storage: TStorage) => {
        const globalStore = useGlobalStore.getState();
        const res = await BucketsControllerRemove({
          appid: globalStore.currentApp,
          name: storage.metadata.name,
        });
        return res;
      },
    })),
  ),
);

export default useStorageStore;
