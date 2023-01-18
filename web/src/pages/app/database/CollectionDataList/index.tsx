import { useTranslation } from "react-i18next";
import { Center } from "@chakra-ui/react";

import CreateCollectionModal from "../mods/CreateCollectionModal";
import useDBMStore from "../store";

import DataPanel from "./mods/DataPanel";

export default function CollectionDataList() {
  const { t } = useTranslation();
  const store = useDBMStore((state) => state);
  return (
    <>
      {store.currentDB === undefined ? (
        <Center className="h-full">
          {t("CollectionPanel.EmptyCollectionText")}
          <CreateCollectionModal>
            <span className="ml-2 text-blue-500 cursor-pointer">{t("CreateNow")}</span>
          </CreateCollectionModal>
        </Center>
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
                    {t("CollectionPanel.AddCollection")}
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
