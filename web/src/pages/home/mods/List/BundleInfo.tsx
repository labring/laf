import React from "react";
import { useTranslation } from "react-i18next";

import { formatLimitCPU, formatLimitMemory } from "@/utils/format";

function BundleInfo(props: { bundle: any }) {
  const { t } = useTranslation();
  const { bundle } = props;
  if (!bundle) return null;
  return (
    <div>
      {formatLimitCPU(bundle?.resource?.limitCPU)} {t("Unit.CPU")} /
      {formatLimitMemory(bundle?.resource?.limitMemory)} {t("Unit.MB")}
    </div>
  );
}

export default BundleInfo;
