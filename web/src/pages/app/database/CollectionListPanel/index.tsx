import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AddIcon, Search2Icon } from "@chakra-ui/icons";
import { Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import clsx from "clsx";

// import CopyText from "@/components/CopyText";
import FileTypeIcon, { FileType } from "@/components/FileTypeIcon";
import { Col } from "@/components/Grid";
import IconWrap from "@/components/IconWrap";
import Panel from "@/components/Panel";
import SectionList from "@/components/SectionList";

import CreateCollectionModal from "../mods/CreateCollectionModal";
// import DeleteCollectionModal from "../mods/DeleteCollectionModal";
import { useCollectionListQuery } from "../service";
import useDBMStore from "../store";

import MoreButton from "./MoreButton";

export default function CollectionListPanel(props: { isHidden?: boolean }) {
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
    <Col className=" max-w-[300px]">
      <Panel>
        <Panel.Header
          title="集合列表"
          actions={[
            <CreateCollectionModal key={"create_database"}>
              <IconWrap tooltip={t("CollectionPanel.CollectionAdd").toString()} size={20}>
                <AddIcon fontSize={10} />
              </IconWrap>
            </CreateCollectionModal>,
          ]}
        />
        <div className="flex items-center mb-3 w-full">
          <InputGroup>
            <InputLeftElement
              height={"8"}
              pointerEvents="none"
              children={<Search2Icon color="gray.300" />}
            />
            <Input
              rounded={"full"}
              placeholder="输入集合ID搜索"
              size="sm"
              bg={"gray.100"}
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
                    <div className="leading-loose">
                      <FileTypeIcon type={FileType.db} />
                      <span className="ml-2 text-base">{db.name}</span>
                    </div>
                    <div
                      className={clsx("flex group-hover:inline ", {
                        hidden: db.name !== store.currentDB?.name,
                      })}
                    >
                      <MoreButton data={db} />
                    </div>
                  </div>
                </SectionList.Item>
              );
            })}
        </SectionList>
      </Panel>
    </Col>
  );
}
