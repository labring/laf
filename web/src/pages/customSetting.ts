import React from "react";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { PanelMinHeight } from "@/constants";

type TLayoutConfig = {
  id: string;
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

type TCommonSettings = {
  fontSize: number;
  funcListDisplay: string;
  useLSP: boolean;
  useCopilot: boolean;
};

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
  getLayoutInfoStyle: (pageId: page, panelId: panel) => any;
  getLayoutInfo: (pageId: page, panelId: panel) => any;
  setLayoutInfo: (
    pageId: page,
    panelId: panel,
    position: { width: number; height: number },
  ) => void;
  togglePanel: (pageId: page, panelId: panel) => void;
  commonSettings: TCommonSettings;
  setCommonSettings: (settings: TCommonSettings) => void;
};

const useCustomSettingStore = create<State>()(
  devtools(
    persist(
      immer((set, get) => ({
        layoutInfo: {
          functionPage: {
            SideBar: {
              id: "SideBar",
              style: {
                width: 240,
                minWidth: 220,
              },
            },

            RightPanel: {
              id: "RightPanel",
              style: {
                width: 270,
                minWidth: 232,
              },
            },

            DependencePanel: {
              id: "DependencePanel",
              style: {
                height: 200,
                minHeight: PanelMinHeight,
                maxHeight: 500,
              },
            },

            ConsolePanel: {
              id: "ConsolePanel",
              style: {
                height: 118,
                minHeight: PanelMinHeight,
              },
            },

            RunningPanel: {
              id: "RunningPanel",
              style: {
                height: 322,
                minHeight: PanelMinHeight,
              },
            },

            Bottom: {
              id: "Bottom",
              style: {
                height: 40,
              },
            },
          },

          collectionPage: {
            SideBar: {
              id: "SideBar",
              style: {
                width: 300,
                minWidth: 206,
              },
            },
            CollectionPanel: {
              id: "CollectionPanel",
              style: {},
            },

            PolicyPanel: {
              id: "PolicyPanel",
              style: {
                height: 200,
                minHeight: PanelMinHeight,
                maxHeight: 500,
              },
            },
            Bottom: {
              id: "Bottom",
              style: {
                height: 40,
              },
            },
          },

          storagePage: {
            SideBar: {
              id: "SideBar",
              style: {
                width: 300,
                minWidth: 230,
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
        getLayoutInfoStyle: (pageId, panelId) => get().layoutInfo[pageId][panelId].style,
        getLayoutInfo: (pageId, panelId) => get().layoutInfo[pageId][panelId],
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

        commonSettings: {
          fontSize: 14,
          funcListDisplay: "name",
          useLSP: true,
          useCopilot: true,
        },

        setCommonSettings: (settings) => {
          set((state: any) => {
            state.commonSettings = settings;
          });
        },
      })),

      {
        name: "laf_custom_setting",
        version: 3,
      },
    ),
  ),
);

export default useCustomSettingStore;
