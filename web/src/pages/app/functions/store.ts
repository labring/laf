import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { TFunction } from "@/apis/typing";
import useGlobalStore from "@/pages/globalStore";

type State = {
  allFunctionList: TFunction[];
  currentFunction: TFunction | { [key: string]: any };
  currentRequestId: string | undefined;
  functionCodes: { [key: string]: string };
  isFetchButtonClicked: Boolean;
  getFunctionUrl: () => string;
  setCurrentRequestId: (requestId: string | undefined) => void;
  setAllFunctionList: (functionList: TFunction[]) => void;
  setCurrentFunction: (currentFunction: TFunction | { [key: string]: any }) => void;
  updateFunctionCode: (current: TFunction | { [key: string]: any }, codes: string) => void;
  setIsFetchButtonClicked: () => void;
};

const useFunctionStore = create<State>()(
  devtools(
    immer((set, get) => ({
      allFunctionList: [],
      currentFunction: {},
      functionCodes: {},
      currentRequestId: undefined,
      isFetchButtonClicked: false,

      getFunctionUrl: () => {
        const currentApp = useGlobalStore.getState().currentApp;
        const currentFunctionName = get().currentFunction?.name;

        if (!currentFunctionName) return "";

        const origin = currentApp?.origin;

        return `${origin}/${currentFunctionName}`;
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
          state.functionCodes[currentFunction!._id] = codes;
        });
      },

      setIsFetchButtonClicked: async () => {
        set((state) => {
          state.isFetchButtonClicked = !state.isFetchButtonClicked;
        });
      },
    })),
  ),
);

export default useFunctionStore;
