import { useState } from "react";
import { useTranslation } from "react-i18next";
import { BiRefresh } from "react-icons/bi";
import { AddIcon, CopyIcon, Search2Icon } from "@chakra-ui/icons";
import { Center, Input, InputGroup, InputLeftElement, Spinner } from "@chakra-ui/react";

import CopyText from "@/components/CopyText";
import EmptyBox from "@/components/EmptyBox";
import FileTypeIcon from "@/components/FileTypeIcon";
import IconText from "@/components/IconText";
import IconWrap from "@/components/IconWrap";
import MoreButton from "@/components/MoreButton";
import Panel from "@/components/Panel";
import SectionList from "@/components/SectionList";

import CreateCollectionModal from "../mods/CreateCollectionModal";
import DeleteCollectionModal from "../mods/DeleteCollectionModal";
import { useCollectionListQuery } from "../service";
import useDBMStore from "../store";

export default function CollectionListPanel() {
  const store = useDBMStore((store) => store);
  const { t } = useTranslation();
  const collectionListQuery = useCollectionListQuery({
    onSuccess: (data) => {
      if (data.data.length === 0) {
        store.setCurrentDB(undefined);
      } else if (store.currentDB === undefined) {
        store.setCurrentDB(data?.data[0]);
      }
    },
  });

  const [search, setSearch] = useState("");

  return (
    <Panel
      className="flex-grow overflow-hidden min-w-[200px]"
      onClick={() => {
        store.setCurrentShow("DB");
      }}
    >
      <Panel.Header
        title={t("CollectionPanel.CollectionList").toString()}
        actions={[
          <IconWrap
            key="refresh_database"
            tooltip={t("Refresh").toString()}
            onClick={() => {
              collectionListQuery.refetch();
            }}
          >
            <BiRefresh size={16} />
          </IconWrap>,
          <CreateCollectionModal key={"create_database"}>
            <IconWrap tooltip={t("CollectionPanel.AddCollection").toString()} size={20}>
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
            placeholder={t("CollectionPanel.Search").toString()}
            size="sm"
            bg={"gray.100"}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>
      </div>

      <div className="overflow-auto flex-grow relative">
        {collectionListQuery.isFetching ? (
          <Center className="opacity-60 bg-white-200 absolute left-0 right-0 top-0 bottom-0 z-10">
            <Spinner />
          </Center>
        ) : null}
        {collectionListQuery?.data?.data?.length ? (
          <SectionList>
            {collectionListQuery?.data?.data
              .filter((db: any) => db.name.indexOf(search) >= 0)
              .map((db: any) => {
                return (
                  <SectionList.Item
                    isActive={store.currentShow === "DB" && db.name === store.currentDB?.name}
                    key={db.name}
                    onClick={() => {
                      store.setCurrentDB(db);
                    }}
                  >
                    <div className="w-full flex justify-between group">
                      <div className="leading-loose font-semibold">
                        <FileTypeIcon type="db" />
                        <span className="ml-2 text-base">{db.name}</span>
                      </div>
                      <MoreButton
                        isHidden={db.name !== store.currentDB?.name || store.currentShow !== "DB"}
                      >
                        <>
                          <CopyText hideToolTip text={db.name} tip="名称复制成功">
                            <IconText icon={<CopyIcon />} text={t("Copy")} />
                          </CopyText>
                          <DeleteCollectionModal database={db} />
                        </>
                      </MoreButton>
                    </div>
                  </SectionList.Item>
                );
              })}
          </SectionList>
        ) : (
          <EmptyBox hideIcon>
            <p>{t("CollectionPanel.EmptyCollectionTip")}</p>
          </EmptyBox>
        )}
      </div>
    </Panel>
  );
}
