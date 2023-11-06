import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { TFunction, TFunctionNode } from "@/apis/typing";
import useGlobalStore from "@/pages/globalStore";

type State = {
  allFunctionList: TFunctionNode[];
  recentFunctionList: TFunction[];
  currentFunction: TFunction | { [key: string]: any };
  currentRequestId: string | undefined;
  currentFuncLogs: string;
  currentFuncTimeUsage: string;
  functionCodes: { [key: string]: string };
  isFetchButtonClicked: Boolean;
  getFunctionUrl: () => string;
  setCurrentRequestId: (requestId: string | undefined) => void;
  setCurrentFuncLogs: (logs: string) => void;
  setCurrentFuncTimeUsage: (timeUsage: string) => void;
  setAllFunctionList: (functionList: TFunctionNode[]) => void;
  setRecentFunctionList: (functionList: TFunction[]) => void;
  setCurrentFunction: (currentFunction: TFunction | { [key: string]: any }) => void;
  updateFunctionCode: (current: TFunction | { [key: string]: any }, codes: string) => void;
  setIsFetchButtonClicked: () => void;
};

const useFunctionStore = create<State>()(
  devtools(
    immer((set, get) => ({
      allFunctionList: [],
      recentFunctionList: [],
      currentFunction: {},
      functionCodes: {},
      currentRequestId: undefined,
      isFetchButtonClicked: false,
      currentFuncLogs: "",
      currentFuncTimeUsage: "",

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

      setRecentFunctionList: (recentFunctionList) => {
        set((state) => {
          state.recentFunctionList = recentFunctionList;
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

      setCurrentFuncLogs: (logs) => {
        set((state) => {
          state.currentFuncLogs = logs;
        });
      },

      setCurrentFuncTimeUsage: (timeUsage) => {
        set((state) => {
          state.currentFuncTimeUsage = timeUsage;
        });
      },
    })),
  ),
);

export default useFunctionStore;
