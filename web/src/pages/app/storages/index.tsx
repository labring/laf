/****************************
 * cloud functions storage page
 ***************************/

import React from "react";

import CreateBucketModal from "./mods/CreateBucketModal";
import FileList from "./mods/FileList";
import StorageListPanel from "./mods/StorageListPanel";

import useStorageStore from "./store";

export default function StoragePage() {
  const { currentStorage } = useStorageStore();
  return (
    <>
      <StorageListPanel />
      {currentStorage === undefined ? (
        <div className="h-full flex items-center  justify-center">
          <CreateBucketModal showText={true} />
        </div>
      ) : (
        <FileList />
      )}
    </>
  );
}
