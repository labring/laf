import { Pages, SiderBarWidth } from "@/constants/index";

import useGlobalStore from "../globalStore";

import SiderBar from "./mods/SiderBar";
import DatabasePage from "./database";
import FunctionPage from "./functions";
import LogsPage from "./logs";
import StoragePage from "./storages";

function AppDetail() {
  const { visitedViews, currentPageId, setCurrentPage } = useGlobalStore();

  return (
    <>
      <SiderBar
        pageId={currentPageId}
        setPageId={(pageId: string) => {
          setCurrentPage(pageId);
        }}
      />
      <div className="h-full" style={{ marginLeft: SiderBarWidth }}>
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
                  ? "block h-full"
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
