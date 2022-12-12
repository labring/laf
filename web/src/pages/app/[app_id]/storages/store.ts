import create from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

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
  setCurrentStorage: (currentStorage: TStorage) => void;
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
