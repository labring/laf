import { useState } from "react";
import { useTranslation } from "react-i18next";
import { BiRefresh } from "react-icons/bi";
import { AddIcon, CopyIcon, Search2Icon } from "@chakra-ui/icons";
import { Badge, Center, Input, InputGroup, InputLeftElement, Spinner } from "@chakra-ui/react";

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
  const { data: res, ...collectionListQuery } = useCollectionListQuery({
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
      className="min-w-[200px] flex-grow overflow-hidden"
      onClick={() => {
        store.setCurrentShow("DB");
      }}
    >
      <Panel.Header
        title={
          <div className="flex">
            {t("CollectionPanel.CollectionList").toString()}
            {res?.data.length >= 10 ? (
              <Badge rounded={"full"} ml="1">
                {res?.data.length}
              </Badge>
            ) : null}
          </div>
        }
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
      <div className="mb-3 flex w-full items-center">
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
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>
      </div>

      <div className="relative flex-grow overflow-auto">
        {collectionListQuery.isFetching ? (
          <Center className="bg-white-200 absolute bottom-0 left-0 right-0 top-0 z-10 opacity-60">
            <Spinner />
          </Center>
        ) : null}
        {res?.data?.length ? (
          <SectionList>
            {res?.data
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
                    <div className="group flex w-full justify-between">
                      <div className="font-semibold leading-loose">
                        <FileTypeIcon type="db" />
                        <span className="ml-2 text-base">{db.name}</span>
                      </div>
                      <MoreButton
                        label={t("Operation")}
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
