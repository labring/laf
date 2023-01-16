import { Pages, SideBarWidth } from "@/constants/index";

import useGlobalStore from "../globalStore";

import SideBar from "./mods/SideBar";
import DatabasePage from "./database";
import FunctionPage from "./functions";
import LogsPage from "./logs";
import StoragePage from "./storages";

function AppDetail() {
  const { visitedViews, currentPageId } = useGlobalStore();

  return (
    <>
      <SideBar />
      <div className="m-2" style={{ marginLeft: SideBarWidth, height: "calc(100vh - 1rem)" }}>
        {[
          {
            pageId: Pages.function,
            component: FunctionPage,
          },
          {
            pageId: Pages.database,
            component: DatabasePage,
          },
          {
            pageId: Pages.storage,
            component: StoragePage,
          },
          {
            pageId: Pages.logs,
            component: LogsPage,
          },
        ].map((item) =>
          visitedViews.includes(item.pageId) ? (
            <div
              key={item.pageId}
              className={
                currentPageId === item.pageId && visitedViews.includes(currentPageId)
                  ? "flex h-full"
                  : "hidden"
              }
            >
              <item.component />
            </div>
          ) : null,
        )}
      </div>
    </>
  );
}

export default AppDetail;
