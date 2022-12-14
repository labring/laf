import create from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { TBucket } from "@/apis/typing";

export type TFile = {
  name: string;
  path: string;
  size: number;
  updateTime: string;
  prefix: string;
};

type State = {
  currentStorage?: TBucket;
  setCurrentStorage: (currentStorage: TBucket) => void;
};

const useStorageStore = create<State>()(
  devtools(
    immer((set, get) => ({
      currentStorage: undefined,
      setCurrentStorage: (currentStorage) =>
        set((state) => {
          state.currentStorage = currentStorage;
        }),
    })),
  ),
);

export default useStorageStore;
