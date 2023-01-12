/****************************
 * cloud functions database page
 ***************************/

import Content from "@/components/Content";
import { Col, Row } from "@/components/Grid";

import BottomPanel from "./BottomPanel";
import CollectionDataList from "./CollectionDataList";
import CollectionListPanel from "./CollectionListPanel";

import useCustomSettingStore from "@/pages/customSetting";

function DatabasePage() {
  const collectionPageConfig = useCustomSettingStore((store) => store.layoutInfo.collectionPage);
  return (
    <Content>
      <Row>
        <Col {...collectionPageConfig.SiderBar}>
          <CollectionListPanel />
        </Col>

        <Col>
          <CollectionDataList />
        </Col>
      </Row>
      <Row {...collectionPageConfig.Bottom}>
        <BottomPanel />
      </Row>
    </Content>
  );
}

export default DatabasePage;
