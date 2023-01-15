import { useTranslation } from "react-i18next";
import { AddIcon } from "@chakra-ui/icons";
import { Button } from "@chakra-ui/react";

import CreateCollectionModal from "../mods/CreateCollectionModal";
import useDBMStore from "../store";

import DataPanel from "./mods/DataPanel";

export default function CollectionDataList() {
  const { t } = useTranslation();
  const store = useDBMStore((state) => state);
  return (
    <>
      {store.currentDB === undefined ? (
        <div className="flex h-full justify-center items-center">
          <CreateCollectionModal>
            <Button size="md" className="w-40" variant="ghost" leftIcon={<AddIcon />}>
              {t("CollectionPanel.CollectionAdd")}
            </Button>
          </CreateCollectionModal>
        </div>
      ) : (
        <DataPanel />
      )}
      {/* <Tabs className="h-full">
        <TabList>
          <Tab>数据管理</Tab>
          <Tab>索引管理</Tab>
          <Tab>集合结构</Tab>
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
              <DataPanel />
            )}
          </TabPanel>
          <TabPanel>
            <IndexPanel />
          </TabPanel>
          <TabPanel className="overflow-hidden relative" style={{ height: "calc(100% - 35px)" }}>
            <ColPanel />
          </TabPanel>
        </TabPanels>
      </Tabs > */}
    </>
  );
}
