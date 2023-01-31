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
        <Center className="h-full text-lg">
          {t("CollectionPanel.EmptyCollectionText")}
          <CreateCollectionModal>
            <span className="ml-2 text-blue-500 cursor-pointer">{t("CreateNow")}</span>
          </CreateCollectionModal>
        </Center>
      ) : (
        <DataPanel />
      )}
    </>
  );
}
