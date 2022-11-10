/****************************
 * cloud functions storage page
 ***************************/

import React, { useEffect } from "react";

import FileList from "./FileList";
import StorageListPanel from "./StorageListPanel";

import useStorageStore from "./store";

export default function StoragePage() {
  const { initStoragePage } = useStorageStore((store) => store);
  useEffect(() => {
    initStoragePage();
    return () => {};
  }, [initStoragePage]);

  return (
    <>
      <StorageListPanel />
      <FileList />
    </>
  );
}
