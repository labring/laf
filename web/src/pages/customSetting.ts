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
  | "RunningPanel"
  | string;
type collectionPanel = "SideBar" | "Bottom" | "PolicyPanel" | string;
type storagePanel = "SideBar" | string;
export type panel = functionPanel | collectionPanel | storagePanel;
export type page = "functionPage" | "collectionPage" | "storagePage";

type State = {
  layoutInfo: {
    storagePage: {
      // eslint-disable-next-line no-unused-vars
      [K in storagePanel]: TLayoutConfig;
    };
    functionPage: {
      // eslint-disable-next-line no-unused-vars
      [K in functionPanel]: TLayoutConfig;
    };
    collectionPage: {
      // eslint-disable-next-line no-unused-vars
      [K in collectionPanel]: TLayoutConfig;
    };
  };
  getLayoutInfo: (pageId: page, panelId: panel) => any;
  setLayoutInfo: (
    pageId: page,
    panelId: panel,
    position: { width: number; height: number },
  ) => void;
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
                minWidth: 0,
                maxWidth: 500,
              },
            },

            RightPanel: {
              style: {
                width: 320,
                minWidth: 0,
                maxWidth: 500,
              },
            },

            DependencePanel: {
              style: {
                height: 300,
                minHeight: 45,
                maxHeight: 500,
              },
            },

            ConsolePanel: {
              style: {
                height: 200,
                minHeight: 45,
                maxHeight: 500,
              },
            },

            RunningPanel: {
              style: {
                height: 200,
                minHeight: 45,
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
                minWidth: 0,
                maxWidth: 500,
              },
            },
            CollectionPanel: {
              style: {},
            },

            PolicyPanel: {
              style: {
                height: 200,
                minHeight: 45,
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
                minWidth: 0,
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
        getLayoutInfo: (pageId, panelId) => get().layoutInfo[pageId][panelId].style,
        setLayoutInfo: (pageId, panelId, position: { width: number; height: number }) => {
          set((state: any) => {
            const { display, width } = state.layoutInfo[pageId][panelId].style;
            if (display === "none") return;
            if (width) {
              state.layoutInfo[pageId][panelId].style.width = position.width;
            } else {
              state.layoutInfo[pageId][panelId].style.height = position.height;
            }
          });
        },
      })),

      {
        name: "laf_custom_setting",
        version: 1,
      },
    ),
  ),
);

export default useCustomSettingStore;
