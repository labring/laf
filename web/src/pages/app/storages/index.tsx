/****************************
 * cloud functions storage page
 ***************************/
import { t } from "i18next";

import EmptyBox from "@/components/EmptyBox";
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
            <EmptyBox>
              <div>
                {t("StoragePanel.EmptyText")}
                <CreateBucketModal>
                  <span className="ml-2 text-primary-600 hover:border-b-2 hover:border-primary-600 cursor-pointer">
                    {t("CreateNow")}
                  </span>
                </CreateBucketModal>
              </div>
            </EmptyBox>
          </Panel>
        ) : (
          <FileList />
        )}
      </Col>
    </Row>
  );
}
