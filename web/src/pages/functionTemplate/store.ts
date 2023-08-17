import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

type State = {
  showTemplateItem: boolean;
  currentTab: string;
  myTemplateType: string;

  setShowTemplateItem: (show: boolean) => void;
  setCurrentTab: (tab: string) => void;
  setMyTemplateType: (type: string) => void;
};

const useTemplateStore = create<State>()(
  devtools(
    immer((set, get) => ({
      showTemplateItem: false,
      currentTab: "all",
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

      setMyTemplateType: (type) => {
        set((state) => {
          state.myTemplateType = type;
        });
      },
    })),
  ),
);

export default useTemplateStore;
