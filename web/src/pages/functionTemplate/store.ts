import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

type State = {
  showTemplateItem: boolean;
  setShowTemplateItem: (show: boolean) => void;
};

const useTemplateStore = create<State>()(
  devtools(
    immer((set, get) => ({
      showTemplateItem: false,

      setShowTemplateItem: (show) => {
        set((state) => {
          state.showTemplateItem = show;
        });
      },
    })),
  ),
);

export default useTemplateStore;
