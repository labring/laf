/****************************
 * cloud functions database page
 ***************************/
import { AddIcon } from "@chakra-ui/icons";
import { Button } from "@chakra-ui/react";

import Content from "@/components/Content";
import { Col, Row } from "@/components/Grid";
import Panel from "@/components/Panel";

import AddPolicyModal from "./mods/AddPolicyModal";
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
        <Col {...settingStore.layoutInfo.collectionPage.SiderBar}>
          <CollectionListPanel />
          <Row className="!flex-none" {...settingStore.layoutInfo.collectionPage.PolicyPanel}>
            <PolicyListPanel />
          </Row>
        </Col>
        <Col>
          <Panel className="items-center h-full">
            {store.currentShow === "DB" ? (
              <CollectionDataList />
            ) : store.currentPolicy === undefined ? (
              <div className="flex h-full justify-center items-center">
                <AddPolicyModal>
                  <Button size="md" className="w-40" variant="ghost" leftIcon={<AddIcon />}>
                    添加策略
                  </Button>
                </AddPolicyModal>
              </div>
            ) : (
              <PolicyDataList />
            )}
          </Panel>
        </Col>
      </Row>
      <Row className="!flex-none" {...settingStore.layoutInfo.collectionPage.Bottom}>
        <Panel className="w-full">
          <Panel.Header>
            <Button
              size="xs"
              variant="plain"
              onClick={() => settingStore.togglePanel("collectionPage", "PolicyPanel")}
            >
              访问策略
            </Button>
          </Panel.Header>
        </Panel>
      </Row>
    </Content>
  );
}

export default DatabasePage;
