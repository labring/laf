/****************************
 * cloud functions storage page
 ***************************/

import React from "react";

import FileList from "./mods/FileList";
import StorageListPanel from "./mods/StorageListPanel";

export default function StoragePage() {
  return (
    <>
      <StorageListPanel />
      <FileList />
    </>
  );
}
