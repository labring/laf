import { useState } from "react";
import { AddIcon, Search2Icon } from "@chakra-ui/icons";
import {
  Center,
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
  Tag,
  useColorMode,
} from "@chakra-ui/react";
import clsx from "clsx";
import { t } from "i18next";

import { EditIconLine, RefreshIcon } from "@/components/CommonIcon";
import EmptyBox from "@/components/EmptyBox";
import FileTypeIcon, { FileType } from "@/components/FileTypeIcon";
import IconText from "@/components/IconText";
import IconWrap from "@/components/IconWrap";
import MoreButton from "@/components/MoreButton";
import Panel from "@/components/Panel";
import SectionList from "@/components/SectionList";

import { useBucketListQuery } from "../../service";
import useStorageStore from "../../store";
import CreateBucketModal from "../CreateBucketModal";
import DeleteBucketModal from "../DeleteBucketModal";

import { TBucket } from "@/apis/typing";

export default function StorageListPanel() {
  const [search, setSearch] = useState("");
  const [storageList, setStorageList] = useState<any>([]);
  const store = useStorageStore((store) => store);
  const darkMode = useColorMode().colorMode === "dark";
  const bucketListQuery = useBucketListQuery({
    onSuccess(data) {
      if (data?.data?.length) {
        setStorageList(data.data);
        if (store?.currentStorage === undefined) {
          store.setCurrentStorage(data?.data[0]);
        } else {
          store.setCurrentStorage(
            data?.data?.filter((item: any) => item._id === store?.currentStorage?._id)[0],
          );
        }
      } else {
        setStorageList([]);
        store.setCurrentStorage(undefined);
      }
    },
  });

  return (
    <Panel className="h-full min-w-[215px]">
      <Panel.Header
        title={t("StoragePanel.StorageList")}
        actions={[
          <IconWrap
            key="refresh_storage"
            tooltip={t("Refresh").toString()}
            onClick={() => {
              bucketListQuery.refetch();
            }}
          >
            <RefreshIcon fontSize={16} />
          </IconWrap>,
          <CreateBucketModal key="create_modal">
            <IconWrap size={20} tooltip={t("Create") + " Bucket"}>
              <AddIcon fontSize={10} />
            </IconWrap>
          </CreateBucketModal>,
        ]}
      />
      <div className="flex w-full flex-col" style={{ height: "calc(100% - 36px)" }}>
        <InputGroup className="my-1.5">
          <InputLeftElement
            height="6"
            pointerEvents="none"
            children={<Search2Icon color="gray.300" fontSize="12" />}
          />
          <Input
            rounded="full"
            placeholder={t("StoragePanel.SearchBucket").toString()}
            height="6"
            pl="8"
            fontSize="sm"
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>
        <div className="relative flex-grow overflow-auto">
          {bucketListQuery.isFetching ? (
            <Center className="bg-white-200 absolute bottom-0 left-0 right-0 top-0 z-10 opacity-60">
              <Spinner />
            </Center>
          ) : null}
          {storageList?.length ? (
            <SectionList>
              {storageList
                ?.filter((storage: TBucket) => storage?.name.indexOf(search) >= 0)
                .map((storage: TBucket) => {
                  return (
                    <SectionList.Item
                      isActive={storage?.name === store.currentStorage?.name}
                      key={storage?.name}
                      className={clsx(
                        "group h-7 hover:!text-primary-700",
                        darkMode ? "text-grayIron-200" : " text-grayIron-700",
                        storage?.name === store.currentStorage?.name && "!text-primary-700",
                      )}
                      onClick={() => {
                        store.setCurrentStorage(storage);
                        store.setPrefix("/");
                        store.setMarkerArray([]);
                      }}
                    >
                      <>
                        <div className="flex flex-1 truncate font-medium">
                          <FileTypeIcon type={FileType.bucket} />
                          <div className="ml-1 text-base">{storage.name}</div>
                        </div>
                        <div className="flex items-center">
                          <Tag size="sm" className="w-16 justify-center" variant={storage?.policy}>
                            {storage?.policy}
                          </Tag>
                          <MoreButton isHidden={false} label={t("Operation")}>
                            <>
                              <CreateBucketModal storage={storage}>
                                <IconText
                                  icon={
                                    <div className="flex h-full items-center">
                                      <EditIconLine />
                                    </div>
                                  }
                                  text={t("Edit")}
                                />
                              </CreateBucketModal>
                              <DeleteBucketModal storage={storage} onSuccessAction={() => {}} />
                            </>
                          </MoreButton>
                        </div>
                      </>
                    </SectionList.Item>
                  );
                })}
            </SectionList>
          ) : (
            <EmptyBox hideIcon>
              <p>{t("StoragePanel.EmptyStorageTip")}</p>
            </EmptyBox>
          )}
        </div>
      </div>
    </Panel>
  );
}
