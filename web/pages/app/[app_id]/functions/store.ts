import useGlobalStore from "pages/globalStore";
import { FunctionsControllerCreate, FunctionsControllerFindAll } from "services/v1/apps";
import create from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import request from "@/utils/request";

export type TFunction =
  | {
      apiVersion: string;
      kind: string;
      metadata: {
        creationTimestamp: string;
        generation: number;
        name: string;
        namespace: string;
        resourceVersion: string;
        uid: string;
      };
      spec: {
        description: string;
        methods: string[];
        source: {
          codes: string;
          version: number;
        };
        websocket: boolean;
      };
    }
  | undefined;

export type TPackage =
  | {
      name: string;
      version: string;
    }
  | undefined;

type State = {
  currentFunction: TFunction;
  favFunctoinList: any[];
  allFunctionList?: TFunction[];
  allPackages?: TPackage[];

  initFunctionPage: () => void;

  createFunction: (values: any) => Paths.FunctionsControllerCreate.Responses;

  getPacakges: () => void;

  setCurrentFunction: (currentFunction: TFunction) => void;
};

const useFunctionStore = create<State>()(
  devtools(
    immer((set, get) => ({
      currentFunction: undefined,
      favFunctoinList: [],

      allFunctionList: [],
      allPackages: [],

      initFunctionPage: async () => {
        const globalStore = useGlobalStore.getState();
        const res = await FunctionsControllerFindAll({
          appid: globalStore.currentApp,
        });
        set((state) => {
          state.allFunctionList = res.data.items;
          state.currentFunction = res.data.items[0];
        });
      },

      createFunction: async (values) => {
        const res = await FunctionsControllerCreate({
          appid: useGlobalStore.getState().currentApp,
          ...values,
        });
        get().initFunctionPage();
        return res;
      },

      getPacakges: async () => {
        const res = await request.get("/api/packages");
        set((state) => {
          state.allPackages = res.data;
        });
      },

      setCurrentFunction: (currentFunction) =>
        set((state) => {
          state.currentFunction = JSON.parse(JSON.stringify(currentFunction));
          return state;
        }),
    })),
  ),
);

export default useFunctionStore;
