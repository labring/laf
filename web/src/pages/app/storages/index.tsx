/****************************
 * cloud functions storage page
 ***************************/
import { Center } from "@chakra-ui/react";

import { Col, Row } from "@/components/Grid";
import Panel from "@/components/Panel";

import CreateBucketModal from "./mods/CreateBucketModal";
import FileList from "./mods/FileList";
import StorageListPanel from "./mods/StorageListPanel";

import useStorageStore from "./store";

export default function StoragePage() {
  const { currentStorage } = useStorageStore();
  return (
    <Row>
      <Col className="max-w-[300px] flex-none">
        <StorageListPanel />
      </Col>
      <Col>
        {currentStorage === undefined ? (
          <Panel className="items-center h-full">
            <Center className="h-full">
              暂无Bucket数据
              <CreateBucketModal>
                <span className="ml-2 text-blue-500 cursor-pointer">立即创建</span>
              </CreateBucketModal>
            </Center>
          </Panel>
        ) : (
          <FileList />
        )}
      </Col>
    </Row>
  );
}
