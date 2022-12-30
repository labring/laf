import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { AddIcon, Search2Icon } from "@chakra-ui/icons";
import { Input, InputGroup, InputLeftElement } from "@chakra-ui/react";

import CopyText from "@/components/CopyText";
import FileTypeIcon, { FileType } from "@/components/FileTypeIcon";
import IconWrap from "@/components/IconWrap";
import Panel from "@/components/Panel";
import SectionList from "@/components/SectionList";

import LeftPanel from "../../mods/LeftPanel";
import CreateCollectionModal from "../mods/CreateCollectionModal";
import DeleteCollectionModal from "../mods/DeleteCollectionModal";
import { useCollectionListQuery } from "../service";
import useDBMStore from "../store";

export default function CollectionListPanel() {
  const store = useDBMStore((store) => store);
  const { t } = useTranslation();
  const collectionListQuery = useCollectionListQuery({
    onSuccess: (data) => {
      if (data.data.length > 0) {
        store.setCurrentDB(data.data[0]);
      } else {
        store.setCurrentDB(undefined);
      }
    },
  });

  const [search, setSearch] = useState("");

  return (
    <LeftPanel>
      <Panel
        title="集合列表"
        actions={[
          <CreateCollectionModal key={"create_database"}>
            <IconWrap tooltip={t("CollectionPanel.CollectionAdd").toString()} size={20}>
              <AddIcon fontSize={10} />
            </IconWrap>
          </CreateCollectionModal>,
        ]}
      >
        <div className="flex items-center m-2 mr-0 mb-3">
          <InputGroup>
            <InputLeftElement
              height={"8"}
              width="12"
              pointerEvents="none"
              children={<Search2Icon bgSize="sm" color="gray.300" />}
            />
            <Input
              size="sm"
              className="mr-2"
              variant="filled"
              placeholder="输入集ID查找"
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
        </div>

        <SectionList>
          {(collectionListQuery?.data?.data || [])
            .filter((db: any) => db.name.indexOf(search) >= 0)
            .map((db: any) => {
              return (
                <SectionList.Item
                  isActive={db.name === store.currentDB?.name}
                  key={db.name}
                  onClick={() => {
                    store.setCurrentDB(db);
                  }}
                >
                  <div className="w-full flex justify-between group">
                    <div>
                      <FileTypeIcon type={FileType.db} />
                      <span className="ml-2 text-base">{db.name}</span>
                    </div>
                    <div className="invisible flex group-hover:visible">
                      <IconWrap>
                        <CopyText text={db.name} tip="名称复制成功" />
                      </IconWrap>
                      <DeleteCollectionModal database={db} />
                    </div>
                  </div>
                </SectionList.Item>
              );
            })}
        </SectionList>
      </Panel>
    </LeftPanel>
  );
}
