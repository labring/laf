import useGlobalStore from "pages/globalStore";
import {
  FunctionsControllerCreate,
  FunctionsControllerFindAll,
  FunctionsControllerRemove,
  FunctionsControllerUpdate,
} from "services/v1/apps";
import create from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import request from "@/utils/request";

export type TFunction =
  | {
      id: string;
      appid: string;
      name: string;
      source: { code: string; compiled: string; uri: any; version: number; hash: any; lang: any };
      desc: string;
      tags: any[];
      websocket: boolean;
      methods: string[];
      createdAt: string;
      updatedAt: string;
      createdBy: string;
      isEdit?: boolean;
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
  allFunctionList: TFunction[];
  allPackages?: TPackage[];

  initFunctionPage: (current?: TFunction) => Promise<void>;

  createFunction: (values: any) => Paths.FunctionsControllerCreate.Responses;
  updateFunction: (values: any) => Paths.FunctionsControllerCreate.Responses;
  deleteFunction: (values: TFunction) => Paths.FunctionsControllerRemove.Responses;

  updateFunctionCode: (current: TFunction, codes: string) => void;

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

      initFunctionPage: async (current: TFunction) => {
        const globalStore = useGlobalStore.getState();
        const res = await FunctionsControllerFindAll({
          appid: globalStore.currentApp,
        });

        const data = res.data || [];
        set((state) => {
          state.allFunctionList = data;
          state.currentFunction = current
            ? res.data.find((item: TFunction) => item?.name === current?.name)
            : data[0];
        });
      },

      createFunction: async (values) => {
        const res = await FunctionsControllerCreate({
          appid: useGlobalStore.getState().currentApp,
          ...values,
        });
        get().initFunctionPage(values);
        return res;
      },

      deleteFunction: async (values) => {
        const res = await FunctionsControllerRemove({
          appid: useGlobalStore.getState().currentApp,
          name: values?.name,
        });
        get().initFunctionPage();
        return res;
      },

      updateFunction: async (values) => {
        const res = await FunctionsControllerUpdate({
          appid: useGlobalStore.getState().currentApp,
          ...values,
        });

        get().initFunctionPage(values);
        return res;
      },

      getPacakges: async () => {
        const res = await request.get("/api/packages");
        set((state) => {
          state.allPackages = res.data;
        });
      },

      updateFunctionCode: async (current, codes) => {
        set((state) => {
          state.allFunctionList.map((item) => {
            if (item?.name === current?.name) {
              item!.source.code = codes;
              item!.isEdit = true;
              state.currentFunction = item;
            }
          });
        });
      },

      setCurrentFunction: (currentFunction) =>
        set((state) => {
          state.currentFunction = currentFunction;
        }),
    })),
  ),
);

export default useFunctionStore;
