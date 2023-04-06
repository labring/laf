import { useState } from "react";
import { BiRefresh } from "react-icons/bi";
import { AddIcon, EditIcon, Search2Icon } from "@chakra-ui/icons";
import { Center, Input, InputGroup, InputLeftElement, Spinner, Tag } from "@chakra-ui/react";
import { t } from "i18next";

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

// import styles from "../index.module.scss";
import { TBucket } from "@/apis/typing";
// import useGlobalStore from "@/pages/globalStore";

export default function StorageListPanel() {
  const [search, setSearch] = useState("");
  const [storageList, setStorageList] = useState<any>([]);
  // const globalStore = useGlobalStore();
  const store = useStorageStore((store) => store);
  const bucketListQuery = useBucketListQuery({
    onSuccess(data) {
      if (data?.data?.length) {
        setStorageList(data.data);
        if (store?.currentStorage === undefined) {
          store.setCurrentStorage(data?.data[0]);
        } else {
          store.setCurrentStorage(
            data?.data?.filter((item: any) => item.id === store?.currentStorage?.id)[0],
          );
        }
      } else {
        setStorageList([]);
        store.setCurrentStorage(undefined);
      }
    },
  });

  return (
    <Panel className="h-full min-w-[250px]">
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
            <BiRefresh size={16} />
          </IconWrap>,
          <CreateBucketModal key="create_modal">
            <IconWrap size={20} tooltip={t("Create") + " Bucket"}>
              <AddIcon fontSize={10} />
            </IconWrap>
          </CreateBucketModal>,
        ]}
      />
      <div className="flex w-full flex-col" style={{ height: "calc(100% - 36px)" }}>
        <InputGroup className="mb-4">
          <InputLeftElement
            height={"8"}
            pointerEvents="none"
            children={<Search2Icon color="gray.300" />}
          />
          <Input
            rounded={"full"}
            placeholder={t("StoragePanel.SearchBucket").toString()}
            size="sm"
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
                      className="group"
                      onClick={() => {
                        store.setCurrentStorage(storage);
                        store.setPrefix("/");
                      }}
                    >
                      <>
                        <div className="font-semibold">
                          <FileTypeIcon type={FileType.bucket} />
                          <span className="ml-2 text-base">{storage.name}</span>
                        </div>
                        <div className="flex items-center">
                          <Tag size="sm" className="w-16 justify-center" variant={storage?.policy}>
                            {storage?.policy}
                          </Tag>
                          <MoreButton isHidden={false} label={t("Operation")}>
                            <>
                              <CreateBucketModal storage={storage}>
                                <IconText icon={<EditIcon />} text={t("Edit")} />
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
        {/* <div className="bg-lafWhite-400 w-full rounded-md flex px-4 mb-4 justify-around  items-center h-[139px] flex-none">
          <div>
            <CircularProgress color="primary.500" value={30} thickness="7px" size="90px">
              <CircularProgressLabel>20%</CircularProgressLabel>
            </CircularProgress>
          </div>
          <div>
            <div>
              <span className={"before:bg-error-500 " + styles.circle}>{t("StoragePanel.All")}</span>
              <p className="text-lg">{globalStore.currentApp?.bundle.storageCapacity}</p>
            </div>
            <div className="mt-4">
              <span className={"before:bg-primary-500 " + styles.circle}>{t("StoragePanel.Used")}</span>
              <p className="text-lg">1Gi</p>
            </div>
          </div>
        </div> */}
      </div>
    </Panel>
  );
}
