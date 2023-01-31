/****************************
 * cloud functions storage page
 ***************************/
import { Center } from "@chakra-ui/react";
import { t } from "i18next";

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
      <Col className="flex-none" style={{ width: 300 }}>
        <StorageListPanel />
      </Col>
      <Col>
        {currentStorage === undefined ? (
          <Panel className="items-center h-full">
            <Center className="h-full text-lg">
              {t("StoragePanel.EmptyText")}
              <CreateBucketModal>
                <span className="ml-2 text-blue-500 cursor-pointer">{t("CreateNow")}</span>
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
