/****************************
 * cloud functions database page
 ***************************/
import React, { useEffect } from "react";

import CollectionListPanel from "./CollectionListPanel";

import useDBMStore from "./store";

function DatabasePage() {
  const { initDBPage } = useDBMStore((store) => store);
  useEffect(() => {
    initDBPage();
    return () => {};
  }, [initDBPage]);

  return (
    <div className="h-full">
      <CollectionListPanel />
    </div>
  );
}

export default DatabasePage;
