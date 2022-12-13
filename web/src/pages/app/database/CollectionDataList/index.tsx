import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";

import RightPanel from "../../mods/RightPanel";

import ColPannel from "./mods/ColPannel";
import DataPannel from "./mods/DataPannel";
import IndexPannel from "./mods/IndexPannel";

export default function CollectionDataList() {
  return (
    <RightPanel>
      <Tabs className="h-full">
        <TabList>
          <Tab>数据管理</Tab>
          <Tab>索引管理</Tab>
          <Tab>集合结构</Tab>
        </TabList>
        <TabPanels className="h-full">
          <TabPanel className="overflow-hidden relative" style={{ height: "calc(100% - 55px)" }}>
            <DataPannel />
          </TabPanel>
          <TabPanel>
            <IndexPannel />
          </TabPanel>
          <TabPanel className="overflow-hidden relative" style={{ height: "calc(100% - 35px)" }}>
            <ColPannel />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </RightPanel>
  );
}
