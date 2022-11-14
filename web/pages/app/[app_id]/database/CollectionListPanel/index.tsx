import React from "react";
import { CopyIcon, Search2Icon } from "@chakra-ui/icons";
import { Input, InputGroup, InputLeftElement } from "@chakra-ui/react";

import FileTypeIcon, { FileType } from "@/components/FileTypeIcon";
import Panel from "@/components/Panel";
import SectionList from "@/components/SectionList";

import CreateModal from "../../functions/mods/FunctionPanel/CreateModal";
import useDBMStore from "../store";
import { BlockList } from "net";

export default function CollectionListPanel() {
  const store = useDBMStore((store) => store);

  return (
    <div style={{ width: 300, height: "100%", borderRight: "1px solid #eee" }}>
      <Panel title="集合列表" actions={[<CreateModal key={"create_database"} />]}>
        <div className="flex items-center m-2 mr-0 mb-3">
          <InputGroup>
            <InputLeftElement
              height={"8"}
              width="12"
              pointerEvents="none"
              children={<Search2Icon bgSize="sm" color="gray.300" />}
            />
            <Input size="sm" className="mr-2" variant="filled" placeholder="输入集ID查找" />
          </InputGroup>
        </div>

        <SectionList>
          {(store.allDBs || []).map((db) => {
            return (
              <SectionList.Item
                isActive={db.name === store.currentDB?.name}
                key={db.name}
                onClick={() => {
                  store.setCurrentDB(db);
                }}
              >
                <div className="w-full flex justify-between">
                  <div>
                    <FileTypeIcon type={FileType.db} />
                    <span className="ml-2 text-base">{db.name}</span>
                  </div>
                  <CopyIcon className="mt-3" />
                </div>
              </SectionList.Item>
            );
          })}
        </SectionList>
      </Panel>
    </div>
  );
}
