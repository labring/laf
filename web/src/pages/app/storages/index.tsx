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
      <Col className="max-w-[300px] flex-none">
        <StorageListPanel />
      </Col>
      <Col>
        {currentStorage === undefined ? (
          <Panel className="items-center h-full">
            <Center className="h-full">
              {t("StoragePanel.EmptyText")}
              <CreateBucketModal>
                <span className="ml-2 text-blue-500 cursor-pointer">{t("Common.CreateNow")}</span>
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
