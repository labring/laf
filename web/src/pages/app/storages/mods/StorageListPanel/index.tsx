import { Tag } from "@chakra-ui/react";

import FileTypeIcon, { FileType } from "@/components/FileTypeIcon";
import Panel from "@/components/Panel";
import SectionList from "@/components/SectionList";

import { useBucketListQuery } from "../../service";
import useStorageStore from "../../store";
import CreateBucketModal from "../CreateBucketModal";
import DeleteBucketModal from "../DeleteBucketModal";

import { TBucket } from "@/apis/typing";
import LeftPanel from "@/pages/app/mods/LeftPanel";

export default function StorageListPanel() {
  const store = useStorageStore((store) => store);

  const bucketListQuery = useBucketListQuery({
    onSuccess(data) {
      if (data?.data?.items?.length) {
        store.setCurrentStorage(data?.data?.items[0]);
      }
    },
  });

  return (
    <LeftPanel>
      <Panel
        title="云存储"
        actions={[
          <CreateBucketModal key="create_modal" />,
          // <IconWrap key="options" onClick={() => {}}>
          //   <HamburgerIcon fontSize={12} />
          // </IconWrap>,
        ]}
      >
        <SectionList>
          {(bucketListQuery?.data?.data?.items || []).map((storage: TBucket) => {
            return (
              <SectionList.Item
                isActive={storage?.metadata?.name === store.currentStorage?.metadata?.name}
                key={storage?.metadata?.name}
                className="group"
                onClick={() => {
                  store.setCurrentStorage(storage);
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
                  <CreateBucketModal storage={storage} />
                  <DeleteBucketModal storage={storage} />
                </div>
              </SectionList.Item>
            );
          })}
        </SectionList>
      </Panel>
    </LeftPanel>
  );
}
