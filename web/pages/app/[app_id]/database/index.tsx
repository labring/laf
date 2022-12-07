/****************************
 * cloud functions database page
 ***************************/
import React from "react";

import CollectionDataList from "./CollectionDataList";
import CollectionListPanel from "./CollectionListPanel";

function DatabasePage() {
  return (
    <>
      <CollectionListPanel />
      <CollectionDataList />
    </>
  );
}

export default DatabasePage;
