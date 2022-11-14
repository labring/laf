import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import ColPannel from "./mods/ColPannel";
import DataPannel from "./mods/DataPannel";
import IndexPannel from "./mods/IndexPannel";

export default function CollectionDataList() {
  return (
    <div className="flex-1 m-4">
      <Tabs>
        <TabList>
          <Tab>数据管理</Tab>
          <Tab>索引管理</Tab>
          <Tab>集合结构</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <DataPannel />
          </TabPanel>
          <TabPanel>
            <IndexPannel />
          </TabPanel>
          <TabPanel>
            <ColPannel />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
}
