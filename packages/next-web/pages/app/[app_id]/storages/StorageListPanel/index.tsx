import React from "react";
import { Search2Icon } from "@chakra-ui/icons";
import { Input, InputGroup, InputLeftElement } from "@chakra-ui/react";

import FileTypeIcon, { FileType } from "@/components/FileTypeIcon";
import Panel from "@/components/Panel";
import SectionList from "@/components/SectionList";

import CreateModal from "../CreateModal";
import useStorageStore from "../store";

export default function StorageListPanel() {
  const store = useStorageStore((store) => store);
  return (
    <div style={{ width: 300, height: "100%", borderRight: "1px solid #eee" }}>
      <Panel title="云存储" actions={[<CreateModal key={"create_database"} />]}>
        <div className="flex items-center m-2 mr-0 mb-3">
          <InputGroup>
            <InputLeftElement
              height={"8"}
              width="12"
              pointerEvents="none"
              children={<Search2Icon bgSize="sm" color="gray.300" />}
            />
            <Input size="sm" className="mr-2" variant="filled" placeholder="输入集合_id查找" />
          </InputGroup>
        </div>

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
                <div>
                  <FileTypeIcon type={FileType.bucket} />
                  <span className="ml-2 text-base">{storage.name}</span>
                </div>
              </SectionList.Item>
            );
          })}
        </SectionList>
      </Panel>
    </div>
  );
}
