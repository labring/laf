import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AddIcon, Search2Icon } from "@chakra-ui/icons";
import {
  Badge,
  Center,
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
  useColorMode,
} from "@chakra-ui/react";
import clsx from "clsx";

import { DatabaseIcon, OutlineCopyIcon, RefreshIcon } from "@/components/CommonIcon";
import CopyText from "@/components/CopyText";
import EmptyBox from "@/components/EmptyBox";
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
  const darkMode = useColorMode().colorMode === "dark";

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
            <RefreshIcon fontSize={15} />
          </IconWrap>,
          <CreateCollectionModal key={"create_database"}>
            <IconWrap tooltip={t("CollectionPanel.AddCollection").toString()} size={20}>
              <AddIcon fontSize={10} />
            </IconWrap>
          </CreateCollectionModal>,
        ]}
      />
      <div className="my-1.5 flex w-full items-center">
        <InputGroup>
          <InputLeftElement
            height="6"
            pointerEvents="none"
            children={<Search2Icon color="gray.300" fontSize="12" />}
          />
          <Input
            rounded="full"
            pl="8"
            placeholder={t("CollectionPanel.Search").toString()}
            height="6"
            fontSize="sm"
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
              .sort((a: any, b: any) => {
                return a.name.localeCompare(b.name);
              })
              .map((db: any) => {
                return (
                  <SectionList.Item
                    isActive={store.currentShow === "DB" && db.name === store.currentDB?.name}
                    key={db.name}
                    className={clsx(
                      "group h-7 hover:!text-primary-700",
                      darkMode ? "text-grayIron-200" : "text-grayIron-700",
                      store.currentShow !== "Policy" &&
                        db?.name === store.currentDB?.name &&
                        "!text-primary-700",
                    )}
                    onClick={() => {
                      store.setCurrentDB(db);
                    }}
                  >
                    <div className="group flex w-full items-center justify-between">
                      <div className="flex items-center overflow-hidden text-ellipsis whitespace-nowrap font-medium">
                        <DatabaseIcon
                          className={
                            store.currentShow !== "Policy" && db?.name === store.currentDB?.name
                              ? ""
                              : "!text-grayModern-400 group-hover:!text-primary-700"
                          }
                        />
                        <span className="ml-2">{db.name}</span>
                      </div>
                      <MoreButton
                        label={t("Operation")}
                        isHidden={db.name !== store.currentDB?.name || store.currentShow !== "DB"}
                      >
                        <>
                          <CopyText
                            hideToolTip
                            text={db.name}
                            tip={String(t("NameCopiedSuccessfully"))}
                          >
                            <IconText
                              icon={
                                <div className="flex h-full items-center">
                                  <OutlineCopyIcon size={16} />
                                </div>
                              }
                              text={t("Copy")}
                            />
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
