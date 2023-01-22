import create from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { TFunction } from "@/apis/typing";
import useGlobalStore from "@/pages/globalStore";

type State = {
  allFunctionList: TFunction[];
  currentFunction: TFunction | { [key: string]: any };
  currentRequestId: string | undefined;
  functionCodes: { [key: string]: string };
  getFunctionUrl: () => string;

  setCurrentRequestId: (requestId: string | undefined) => void;
  setAllFunctionList: (functionList: TFunction[]) => void;
  setCurrentFunction: (currentFunction: TFunction | { [key: string]: any }) => void;
  updateFunctionCode: (current: TFunction | { [key: string]: any }, codes: string) => void;
};

const useFunctionStore = create<State>()(
  devtools(
    immer((set, get) => ({
      allFunctionList: [],
      currentFunction: {},
      functionCodes: {},
      currentRequestId: undefined,

      getFunctionUrl: () => {
        const currentApp = useGlobalStore.getState().currentApp;
        const currentFunction = get().currentFunction;

        return currentFunction?.name
          ? `http://${currentApp?.domain?.domain}/${currentFunction?.name}`
          : "";
      },

      setCurrentRequestId: (requestId) => {
        set((state) => {
          state.currentRequestId = requestId;
        });
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
