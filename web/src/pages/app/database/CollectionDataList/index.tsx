import { useTranslation } from "react-i18next";
import { AddIcon } from "@chakra-ui/icons";
import { Button, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";

import RightPanel from "../../mods/RightPanel";
import CreateCollectionModal from "../mods/CreateCollectionModal";
import useDBMStore from "../store";

// import ColPannel from "./mods/ColPannel";
import DataPannel from "./mods/DataPannel";
// import IndexPannel from "./mods/IndexPannel";

export default function CollectionDataList() {
  const { t } = useTranslation();
  const store = useDBMStore((state) => state);
  return (
    <RightPanel>
      <Tabs className="h-full">
        <TabList>
          <Tab>数据管理</Tab>
          {/* <Tab>索引管理</Tab>
          <Tab>集合结构</Tab> */}
        </TabList>
        <TabPanels className="h-full">
          <TabPanel
            className="overflow-hidden relative !pt-1"
            style={{ height: "calc(100% - 55px)" }}
          >
            {store.currentDB === undefined ? (
              <div className="h-full flex items-center  justify-center">
                <CreateCollectionModal>
                  <Button size="lg" variant="ghost" leftIcon={<AddIcon />}>
                    {t("CollectionPanel.CollectionAdd")}
                  </Button>
                </CreateCollectionModal>
              </div>
            ) : (
              <DataPannel />
            )}
          </TabPanel>
          {/* <TabPanel>
            <IndexPannel />
          </TabPanel>
          <TabPanel className="overflow-hidden relative" style={{ height: "calc(100% - 35px)" }}>
            <ColPannel />
          </TabPanel> */}
        </TabPanels>
      </Tabs>
    </RightPanel>
  );
}
