/****************************
 * cloud functions storage page
 ***************************/

import { AddIcon } from "@chakra-ui/icons";
import { Button } from "@chakra-ui/react";

import Content from "@/components/Content";
import { Col, Row } from "@/components/Grid";

import CreateBucketModal from "./mods/CreateBucketModal";
import FileList from "./mods/FileList";
import StorageListPanel from "./mods/StorageListPanel";

import useStorageStore from "./store";

export default function StoragePage() {
  const { currentStorage } = useStorageStore();
  return (
    <Content>
      <Row>
        <StorageListPanel />
        <Col>
          {currentStorage === undefined ? (
            <div className="h-full flex items-center  justify-center">
              <CreateBucketModal>
                <Button size="lg" variant="ghost" leftIcon={<AddIcon />}>
                  创建 Bucket
                </Button>
              </CreateBucketModal>
            </div>
          ) : (
            <FileList />
          )}
        </Col>
      </Row>
    </Content>
  );
}
