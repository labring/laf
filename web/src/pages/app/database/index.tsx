/****************************
 * cloud functions database page
 ***************************/
import { useRef } from "react";

import Content from "@/components/Content";
import { Col, Row } from "@/components/Grid";
import Panel from "@/components/Panel";
import Resize from "@/components/Resize";

import StatusBar from "../mods/StatusBar";

import CollectionDataList from "./CollectionDataList";
import CollectionListPanel from "./CollectionListPanel";
import PolicyDataList from "./PolicyDataList";
import PolicyListPanel from "./PolicyListPanel";
import { usePolicyListQuery } from "./service";

import useDBMStore from "./store";

import useCustomSettingStore from "@/pages/customSetting";
function DatabasePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const store = useDBMStore((state) => state);
  const settingStore = useCustomSettingStore();

  const { data: policyList } = usePolicyListQuery((data) => {
    if (data.data.length === 0) {
      store.setCurrentPolicy(undefined);
    } else if (store.currentPolicy === undefined) {
      store.setCurrentPolicy(data?.data[0]);
    }
  });

  return (
    <Content>
      <Row className="flex-grow" ref={containerRef}>
        <Col style={{ width: settingStore.layoutInfo.collectionPage.SideBar.style.width }}>
          <CollectionListPanel />
          {!!policyList?.data?.length && (
            <>
              <Resize
                type="y"
                pageId="collectionPage"
                panelId="PolicyPanel"
                reverse
                containerRef={containerRef}
              />
              <Row {...settingStore.layoutInfo.collectionPage.PolicyPanel}>
                <PolicyListPanel policyList={policyList} />
              </Row>
            </>
          )}
        </Col>
        <Resize type="x" pageId="collectionPage" panelId="SideBar" containerRef={containerRef} />
        <Col>
          <Panel className="h-full items-stretch">
            {store.currentShow === "DB" ? <CollectionDataList /> : <PolicyDataList />}
          </Panel>
        </Col>
      </Row>
      <StatusBar />
    </Content>
  );
}

export default DatabasePage;
