/****************************
 * cloud functions storage page
 ***************************/
import { useRef } from "react";
import { useTranslation } from "react-i18next";

import Content from "@/components/Content";
import EmptyBox from "@/components/EmptyBox";
import { Col, Row } from "@/components/Grid";
import Panel from "@/components/Panel";
import Resize from "@/components/Resize";

import StatusBar from "../mods/StatusBar";

import CreateBucketModal from "./mods/CreateBucketModal";
import FileList from "./mods/FileList";
import StorageListPanel from "./mods/StorageListPanel";

import useStorageStore from "./store";

import useCustomSettingStore from "@/pages/customSetting";
export default function StoragePage() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const settingStore = useCustomSettingStore();
  const { currentStorage } = useStorageStore();
  return (
    <Content>
      <Row ref={containerRef}>
        <Col {...settingStore.layoutInfo.storagePage.SideBar}>
          <StorageListPanel />
        </Col>
        <Resize type="x" pageId="storagePage" panelId="SideBar" containerRef={containerRef} />
        <Col>
          {currentStorage === undefined ? (
            <Panel className="h-full items-center">
              <EmptyBox>
                <div>
                  {t("StoragePanel.EmptyText")}
                  <CreateBucketModal>
                    <span className="ml-2 cursor-pointer text-primary-600 hover:border-b-2 hover:border-primary-600">
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
      <StatusBar />
    </Content>
  );
}
