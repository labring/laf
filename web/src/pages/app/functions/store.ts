import create from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { TFunction } from "@/apis/typing";
import useGlobalStore from "@/pages/globalStore";

type State = {
  allFunctionList: TFunction[];
  currentFunction: TFunction | { [key: string]: any };
  functionCodes: { [key: string]: string };
  getFunctionUrl: () => string;
  getFunctionDebugUrl: () => string;

  setAllFunctionList: (funcionList: TFunction[]) => void;
  setCurrentFunction: (currentFunction: TFunction | { [key: string]: any }) => void;
  updateFunctionCode: (current: TFunction | { [key: string]: any }, codes: string) => void;
};

const useFunctionStore = create<State>()(
  devtools(
    immer((set, get) => ({
      allFunctionList: [],

      currentFunction: {},

      functionCodes: {},

      getFunctionUrl: () => {
        const currentApp = useGlobalStore.getState().currentApp;
        const currentFunction = get().currentFunction;

        return currentFunction?.name
          ? `http://${currentApp?.gateway.status.appRoute.domain}/${currentFunction?.name}`
          : "";
      },

      getFunctionDebugUrl: () => {
        const currentApp = useGlobalStore.getState().currentApp;
        const currentFunction = get().currentFunction;

        return currentFunction?.name
          ? `http://${currentApp?.gateway.status.appRoute.domain}/${currentFunction?.name}`
          : "";
      },

      setAllFunctionList: (allFunctionList) => {
        set((state) => {
          state.allFunctionList = allFunctionList;
        });
      },

      setCurrentFunction: (currentFunction) => {
        set((state) => {
          state.currentFunction = currentFunction;
        });
      },

      updateFunctionCode: async (currentFunction, codes) => {
        set((state) => {
          state.functionCodes[currentFunction!.id] = codes;
        });
      },
    })),
  ),
);

export default useFunctionStore;
