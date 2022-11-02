import create from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

type State = {
  currentFunction: number;
  favFunctoinList: any[];
  allFunctionList: any[];

  setCurrentFunction: (currentFunction: number) => void;
};

const useFunctionStore = create<State>()(
  devtools(
    immer((set) => ({
      currentFunction: 0,
      favFunctoinList: [
        {
          id: "123",
          name: "addToto",
        },
        {
          id: "222",
          name: "antDirt",
        },
        {
          id: "333",
          name: "getUser",
        },
        {
          id: "444",
          name: "getQrCode",
        },
        {
          id: "555",
          name: "getUxserInfo",
        },
      ],

      allFunctionList: [
        {
          id: "123",
          name: "addToto",
        },
        {
          id: "222",
          name: "antDirt",
        },
        {
          id: "333",
          name: "getUser",
        },
        {
          id: "444",
          name: "getQrCode",
        },
        {
          id: "555",
          name: "getUxserInfo",
        },
      ],

      setCurrentFunction: (currentFunction) =>
        set((state) => {
          state.currentFunction = currentFunction;
          return state;
        }),
    }))
  )
);

export default useFunctionStore;
