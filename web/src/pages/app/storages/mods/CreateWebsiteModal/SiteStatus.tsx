import { Tooltip } from "@chakra-ui/react";
import { t } from "i18next";

import DotBadge from "@/components/DotBadge";
import { BUCKET_POLICY_TYPE } from "@/constants";

import useStorageStore from "../../store";

export default function Status() {
  const { currentStorage } = useStorageStore();
  const isPrivate = currentStorage?.policy === BUCKET_POLICY_TYPE.private;
  return (
    <DotBadge
      type={isPrivate ? "warning" : "success"}
      text={
        <>
          {isPrivate ? (
            <Tooltip placement="bottom-end" label={isPrivate ? t("Bucket.StatusTip") : ""}>
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
