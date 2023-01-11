import { useState } from "react";
import { AddIcon, EditIcon, Search2Icon } from "@chakra-ui/icons";
import {
  CircularProgress,
  CircularProgressLabel,
  Input,
  InputGroup,
  InputLeftElement,
  Tag,
} from "@chakra-ui/react";

import FileTypeIcon, { FileType } from "@/components/FileTypeIcon";
import { Col } from "@/components/Grid";
import IconWrap from "@/components/IconWrap";
import Panel from "@/components/Panel";
import SectionList from "@/components/SectionList";

import { useBucketListQuery } from "../../service";
import useStorageStore from "../../store";
import CreateBucketModal from "../CreateBucketModal";
import DeleteBucketModal from "../DeleteBucketModal";

import styles from "../index.module.scss";

import { TBucket } from "@/apis/typing";
import useGlobalStore from "@/pages/globalStore";

export default function StorageListPanel() {
  const [search, setSearch] = useState("");
  const globalStore = useGlobalStore();
  const store = useStorageStore((store) => store);
  const bucketListQuery = useBucketListQuery({
    onSuccess(data) {
      if (data?.data?.items?.length) {
        if (!store.currentStorage) store.setCurrentStorage(data?.data?.items[0]);
      } else {
        store.setCurrentStorage(undefined);
      }
    },
  });

  return (
    <Col className=" max-w-[300px]">
      <Panel>
        <Panel.Header
          title="云存储"
          actions={[
            <CreateBucketModal key="create_modal">
              <IconWrap size={20} tooltip="创建 Bucket">
                <AddIcon fontSize={10} />
              </IconWrap>
            </CreateBucketModal>,
          ]}
        />
        <div className="w-full">
          <InputGroup className="mb-4">
            <InputLeftElement
              height={"8"}
              pointerEvents="none"
              children={<Search2Icon color="gray.300" />}
            />
            <Input
              rounded={"full"}
              placeholder="输入bucket名进行搜索"
              size="sm"
              bg={"gray.100"}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
          <SectionList style={{ height: "calc(100vh - 260px)", overflow: "auto" }}>
            {(bucketListQuery?.data?.data?.items || [])
              .filter((storage: any) => storage?.metadata?.name.indexOf(search) >= 0)
              .map((storage: TBucket) => {
                return (
                  <SectionList.Item
                    isActive={storage?.metadata?.name === store.currentStorage?.metadata?.name}
                    key={storage?.metadata?.name}
                    className="group"
                    onClick={() => {
                      store.setCurrentStorage(storage);
                      store.setPrefix("/");
                    }}
                  >
                    <div className="relative flex-1">
                      <div className="flex justify-between">
                        <div>
                          <FileTypeIcon type={FileType.bucket} />
                          <span className="ml-2 text-base">{storage.metadata?.name}</span>
                        </div>

                        <Tag
                          size="sm"
                          className="w-16 justify-center"
                          variant={storage?.spec?.policy}
                        >
                          {storage?.spec?.policy}
                        </Tag>
                      </div>
                    </div>
                    <div className="invisible flex group-hover:visible">
                      <CreateBucketModal storage={storage}>
                        <IconWrap size={20} tooltip="编辑Bucket">
                          <EditIcon fontSize={10} />
                        </IconWrap>
                      </CreateBucketModal>
                      <DeleteBucketModal
                        storage={storage}
                        onSuccessAction={() => {
                          if (storage.metadata.name === store.currentStorage?.metadata.name) {
                            store.setCurrentStorage(bucketListQuery?.data?.data?.items[0]);
                          }
                        }}
                      />
                    </div>
                  </SectionList.Item>
                );
              })}
          </SectionList>
          <div className="bg-gray-100 w-full rounded-md flex p-4 justify-around h-32">
            <div>
              <CircularProgress color="primary.500" value={30} size="90px">
                <CircularProgressLabel>20%</CircularProgressLabel>
              </CircularProgress>
            </div>
            <div>
              <div>
                <span className={"before:bg-error " + styles.circle}>总容量</span>
                <p className="text-lg">{globalStore.currentApp?.oss.spec.capacity.storage}</p>
              </div>
              <div className="mt-4">
                <span className={"before:bg-primary " + styles.circle}>已使用</span>
                <p className="text-lg">1Gi</p>
              </div>
            </div>
          </div>
        </div>
      </Panel>
    </Col>
  );
}
