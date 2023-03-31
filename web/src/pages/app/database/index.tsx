/****************************
 * cloud functions database page
 ***************************/
import { useRef } from "react";

import Content from "@/components/Content";
import { Col, Row } from "@/components/Grid";
import Panel from "@/components/Panel";
import Resize from "@/components/Resize";

import CollectionDataList from "./CollectionDataList";
import CollectionListPanel from "./CollectionListPanel";
import PolicyDataList from "./PolicyDataList";
import PolicyListPanel from "./PolicyListPanel";

import useDBMStore from "./store";

import useCustomSettingStore from "@/pages/customSetting";
function DatabasePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const store = useDBMStore((state) => state);
  const settingStore = useCustomSettingStore();
  return (
    <Content>
      <Row className="flex-grow" ref={containerRef}>
        <Col {...settingStore.layoutInfo.collectionPage.SideBar}>
          <CollectionListPanel />
          <Resize
            type="y"
            pageId="collectionPage"
            panelId="PolicyPanel"
            reverse
            containerRef={containerRef}
          />
          <Row {...settingStore.layoutInfo.collectionPage.PolicyPanel}>
            <PolicyListPanel />
          </Row>
        </Col>
        <Resize type="x" pageId="collectionPage" panelId="SideBar" containerRef={containerRef} />
        <Col>
          <Panel className="h-full items-center">
            {store.currentShow === "DB" ? <CollectionDataList /> : <PolicyDataList />}
          </Panel>
        </Col>
      </Row>
    </Content>
  );
}

export default DatabasePage;
