import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

type State = {
  showTemplateItem: boolean;
  currentTab: string;
  currentPage: number;
  currentSearchKey: string;
  myTemplateType: string;

  setShowTemplateItem: (show: boolean) => void;
  setCurrentTab: (tab: string) => void;
  setCurrentPage: (page: number) => void;
  setCurrentSearchKey: (key: string) => void;
  setMyTemplateType: (type: string) => void;
};

const useTemplateStore = create<State>()(
  devtools(
    immer((set, get) => ({
      showTemplateItem: false,
      currentTab: "all",
      currentPage: 1,
      currentSearchKey: "",
      myTemplateType: "stared",

      setShowTemplateItem: (show) => {
        set((state) => {
          state.showTemplateItem = show;
        });
      },

      setCurrentTab: (tab) => {
        set((state) => {
          state.currentTab = tab;
        });
      },

      setCurrentPage: (page) => {
        set((state) => {
          state.currentPage = page;
        });
      },

      setCurrentSearchKey: (key) => {
        set((state) => {
          state.currentSearchKey = key;
        });
      },

      setMyTemplateType: (type) => {
        set((state) => {
          state.myTemplateType = type;
        });
      },
    })),
  ),
);

export default useTemplateStore;
