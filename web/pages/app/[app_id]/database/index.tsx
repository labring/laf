/****************************
 * cloud functions database page
 ***************************/
import React, { useEffect } from "react";

import CollectionDataList from "./CollectionDataList";
import CollectionListPanel from "./CollectionListPanel";

import useDBMStore from "./store";

function DatabasePage() {
  const { initDBPage } = useDBMStore((store) => store);
  useEffect(() => {
    initDBPage();
    return () => {};
  }, [initDBPage]);

  return (
    <>
      <CollectionListPanel />
      <CollectionDataList />
    </>
  );
}

export default DatabasePage;
