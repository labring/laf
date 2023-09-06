import { Tooltip } from "@chakra-ui/react";
import { t } from "i18next";

import DotBadge from "@/components/DotBadge";
import { BUCKET_POLICY_TYPE } from "@/constants";

import useStorageStore from "../../store";

export default function Status() {
  const { currentStorage } = useStorageStore();
  const isReadOnly = currentStorage?.policy === BUCKET_POLICY_TYPE.readonly;
  return (
    <DotBadge
      type={!isReadOnly ? "warning" : "success"}
      text={
        <>
          {!isReadOnly ? (
            <Tooltip placement="bottom-end" label={!isReadOnly ? t("Bucket.StatusTip") : ""}>
              {t("StoragePanel.Inaccessible")}
            </Tooltip>
          ) : (
            <span>{t("StoragePanel.isResolved")}</span>
          )}
        </>
      }
    />
  );
}
