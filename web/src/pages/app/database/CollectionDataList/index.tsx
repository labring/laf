import { useTranslation } from "react-i18next";

import EmptyBox from "@/components/EmptyBox";

import CreateCollectionModal from "../mods/CreateCollectionModal";
import useDBMStore from "../store";

import DataPanel from "./mods/DataPanel";

export default function CollectionDataList() {
  const { t } = useTranslation();
  const store = useDBMStore((state) => state);
  return (
    <>
      {store.currentDB === undefined ? (
        <EmptyBox>
          <div>
            {t("CollectionPanel.EmptyCollectionText")}
            <CreateCollectionModal>
              <span className="ml-2 cursor-pointer text-primary-600 hover:border-b-2 hover:border-primary-600">
                {t("CreateNow")}
              </span>
            </CreateCollectionModal>
          </div>
        </EmptyBox>
      ) : (
        <DataPanel />
      )}
    </>
  );
}
