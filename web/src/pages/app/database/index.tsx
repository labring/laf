/****************************
 * cloud functions database page
 ***************************/
import Content from "@/components/Content";
import { Col, Row } from "@/components/Grid";
import Panel from "@/components/Panel";

import BottomPanel from "./BottomPanel";
import CollectionDataList from "./CollectionDataList";
import CollectionListPanel from "./CollectionListPanel";
import PolicyDataList from "./PolicyDataList";
import PolicyListPanel from "./PolicyListPanel";

import useDBMStore from "./store";

import useCustomSettingStore from "@/pages/customSetting";
function DatabasePage() {
  const store = useDBMStore((state) => state);
  const settingStore = useCustomSettingStore();
  return (
    <Content>
      <Row className="flex-grow overflow-hidden">
        <Col {...settingStore.layoutInfo.collectionPage.SideBar}>
          <CollectionListPanel />
          <Row {...settingStore.layoutInfo.collectionPage.PolicyPanel}>
            <PolicyListPanel />
          </Row>
        </Col>
        <Col>
          <Panel className="items-center h-full">
            {store.currentShow === "DB" ? <CollectionDataList /> : <PolicyDataList />}
          </Panel>
        </Col>
      </Row>
      <Row {...settingStore.layoutInfo.collectionPage.Bottom}>
        <BottomPanel />
      </Row>
    </Content>
  );
}

export default DatabasePage;
