import React from "react";
import create from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

type TLayoutConfig = {
  style: React.CSSProperties;
};

type functionPanel =
  | "SideBar"
  | "RightPanel"
  | "DependencePanel"
  | "ConsolePanel"
  | "Bottom"
  | "RunningPanel";
type collectionPanel = "SideBar" | "Bottom" | "PolicyPanel";
type storagePanel = "SideBar";
export type panel = functionPanel | collectionPanel | storagePanel;
export type page = "functionPage" | "collectionPage" | "storagePage";

type State = {
  layoutInfo: {
    functionPage: {
      // eslint-disable-next-line no-unused-vars
      [K in functionPanel]: TLayoutConfig;
    };
    collectionPage: {
      // eslint-disable-next-line no-unused-vars
      [K in collectionPanel]: TLayoutConfig;
    };
    storagePage: {
      // eslint-disable-next-line no-unused-vars
      [K in storagePanel]: TLayoutConfig;
    };
  };
  setLayoutInfo: (pageId: page, panelId: panel, offset: { x: number; y: number }) => void;
  togglePanel: (pageId: page, panelId: panel) => void;
};

const useCustomSettingStore = create<State>()(
  devtools(
    persist(
      immer((set, get) => ({
        layoutInfo: {
          functionPage: {
            SideBar: {
              style: {
                width: 300,
                minWidth: 200,
                maxWidth: 800,
              },
            },

            RightPanel: {
              style: {
                width: 320,
                minWidth: 200,
                maxWidth: 800,
              },
            },

            DependencePanel: {
              style: {
                height: 300,
                minHeight: 100,
                maxHeight: 500,
              },
            },

            ConsolePanel: {
              style: {
                height: 200,
                minHeight: 100,
                maxHeight: 500,
              },
            },

            RunningPanel: {
              style: {
                height: 200,
                minHeight: 100,
                maxHeight: 500,
              },
            },

            Bottom: {
              style: {
                height: 40,
              },
            },
          },

          collectionPage: {
            SideBar: {
              style: {
                width: 300,
                minWidth: 200,
                maxWidth: 500,
              },
            },

            PolicyPanel: {
              style: {
                height: 200,
                minHeight: 100,
                maxHeight: 500,
              },
            },
            Bottom: {
              style: {
                height: 40,
              },
            },
          },

          storagePage: {
            SideBar: {
              style: {
                width: 300,
                minWidth: 200,
                maxWidth: 800,
              },
            },
          },
        },

        togglePanel: (pageId, panelId) => {
          set((state: any) => {
            const display = state.layoutInfo[pageId];
            state.layoutInfo[pageId][panelId].style.display =
              display[panelId].style.display === "none" ? "flex" : "none";
          });
        },

        setLayoutInfo: (pageId, panelId, offset: { x: number; y: number }) => {
          set((state: any) => {
            const { display, width, height, maxWidth, minWidth, minHeight, maxHeight } =
              state.layoutInfo[pageId][panelId].style;
            if (display === "none") return;
            if (width) {
              const newWidth = width + offset.x;
              if (newWidth < minWidth || newWidth > maxWidth) return;
              state.layoutInfo[pageId][panelId].style.width = newWidth;
            } else {
              const newHeight = height + offset.y;
              if (newHeight < minHeight || newHeight > maxHeight) return;
              state.layoutInfo[pageId][panelId].style.height = newHeight;
            }
          });
        },
      })),
      { name: "laf_custom_setting" },
    ),
  ),
);

export default useCustomSettingStore;
