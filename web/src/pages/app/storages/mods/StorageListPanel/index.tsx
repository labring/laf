import { AddIcon, EditIcon } from "@chakra-ui/icons";
import { Tag } from "@chakra-ui/react";

import FileTypeIcon, { FileType } from "@/components/FileTypeIcon";
import { Col } from "@/components/Grid";
import IconWrap from "@/components/IconWrap";
import Panel from "@/components/Panel";
import SectionList from "@/components/SectionList";

import { useBucketListQuery } from "../../service";
import useStorageStore from "../../store";
import CreateBucketModal from "../CreateBucketModal";
import DeleteBucketModal from "../DeleteBucketModal";

import { TBucket } from "@/apis/typing";

export default function StorageListPanel() {
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
            // <IconWrap key="options" onClick={() => {}}>
            //   <HamburgerIcon fontSize={12} />
            // </IconWrap>,
          ]}
        />
        <SectionList>
          {(bucketListQuery?.data?.data?.items || []).map((storage: TBucket) => {
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

                    <Tag size="sm" colorScheme={"green"}>
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
      </Panel>
    </Col>
  );
}
