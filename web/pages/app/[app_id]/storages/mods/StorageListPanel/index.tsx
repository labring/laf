import React from "react";
import { HamburgerIcon, Search2Icon, SunIcon } from "@chakra-ui/icons";
import { Button, Input, InputGroup, InputLeftElement } from "@chakra-ui/react";

import FileTypeIcon, { FileType } from "@/components/FileTypeIcon";
import IconWrap from "@/components/IconWrap";
import Panel from "@/components/Panel";
import SectionList from "@/components/SectionList";

import useStorageStore, { TStorage } from "../../store";
import CreateBucketModal from "../CreateBucketModal";
import DeleteBucketModal from "../DeleteBucketModal";
import EditBucketModal from "../EditBucketModal";

export default function StorageListPanel() {
  const store = useStorageStore((store) => store);

  return (
    <div style={{ width: 300, height: "100%", borderRight: "1px solid #eee" }}>
      <Panel title="云存储" actions={[
        <CreateBucketModal key="create_modal" />,
        <IconWrap key="options" onClick={() => {}}>
          <HamburgerIcon fontSize={12} />
        </IconWrap>,
      ]}>
        <SectionList>
          {(store.allStorages || []).map((storage) => {
            return (
              <SectionList.Item
                isActive={storage.name === store.currentStorage?.name}
                key={storage.name}
                onClick={() => {
                  store.setCurrentStorage(storage);
                }}
              >
                <div className="relative flex-1">
                  <FileTypeIcon type={FileType.bucket} />
                  <span className="ml-2 text-base">{storage.name}(私有)</span>
                </div>
                <EditBucketModal />
                <DeleteBucketModal />
              </SectionList.Item>
            );
          })}
        </SectionList>
      </Panel>
    </div>
  );
}
