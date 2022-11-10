import React, { useState } from "react";

import FunctionLayout from "@/components/Layout/Function";
import { Pages, SiderBarWidth } from "@/constants/index";

import SiderBar from "./mods/SiderBar";
import DatabasePage from "./database";
import FunctionPage from "./functions";
import StoragePage from "./storages";

function AppDetail() {
  const [pageId, setPageId] = useState("function");
  return (
    <>
      <SiderBar pageId={pageId} setPageId={(pageId: string) => setPageId(pageId)} />
      <div className="flex h-full" style={{ marginLeft: SiderBarWidth, fontSize: "12px" }}>
        {pageId === Pages.function ? <FunctionPage key={Pages.function} /> : null}
        {pageId === Pages.database ? <DatabasePage key={Pages.database} /> : null}
        {pageId === Pages.storage ? <StoragePage key={Pages.storage} /> : null}
      </div>
    </>
  );
}

AppDetail.getLayout = (page: React.ReactElement) => {
  return <FunctionLayout>{page}</FunctionLayout>;
};

export default AppDetail;
