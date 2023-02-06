/****************************
 * cloud functions database page
 ***************************/
import { Center } from "@chakra-ui/react";
import { t } from "i18next";

import Content from "@/components/Content";
import EmptyBox from "@/components/EmptyBox";
import { Col, Row } from "@/components/Grid";
import Panel from "@/components/Panel";

import AddPolicyModal from "./mods/AddPolicyModal";
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
            {store.currentShow === "DB" ? (
              <CollectionDataList />
            ) : store.currentPolicy === undefined ? (
              <Center className="h-full">
                <EmptyBox>
                  <div>
                    {t("CollectionPanel.EmptyPolicyText")}
                    <AddPolicyModal>
                      <span className="ml-2 text-primary-600 hover:border-b-2 hover:border-primary-600 cursor-pointer">
                        {t("CreateNow")}
                      </span>
                    </AddPolicyModal>
                  </div>
                </EmptyBox>
              </Center>
            ) : (
              <PolicyDataList />
            )}
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
