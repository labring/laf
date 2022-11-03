import React, { useState } from "react";

import FunctionLayout from "@/components/Layout/Function";
import { Pages } from "@/constants/index";

import SiderBar from "./mods/SiderBar";
import DatabasePage from "./database";
import FunctionPage from "./functions";
import StoragePage from "./storages";

function AppDetail() {
  const [pageId, setPageId] = useState("function");
  return (
    <div className="bg-white">
      <SiderBar setPageId={(pageId: string) => setPageId(pageId)} />

      {pageId === Pages.function ? <FunctionPage /> : null}
      {pageId === Pages.database ? <DatabasePage /> : null}
      {pageId === Pages.storage ? <StoragePage /> : null}
    </div>
  );
}

AppDetail.getLayout = (page: React.ReactElement) => {
  return <FunctionLayout>{page}</FunctionLayout>;
};

export default AppDetail;
