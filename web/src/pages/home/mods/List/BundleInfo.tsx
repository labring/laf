import React from "react";
import { useTranslation } from "react-i18next";
import { HStack } from "@chakra-ui/react";

import { formatLimitCPU, formatLimitMemory } from "@/utils/format";

function BundleInfo(props: { bundle: any }) {
  const { t } = useTranslation();
  const { bundle } = props;
  if (!bundle) return null;
  return (
    <div>
      <HStack spacing={1} mt={1}>
        <span>
          {formatLimitCPU(bundle?.resource?.limitCPU)} {t("Unit.CPU")}
        </span>
        <span>/</span>
        <span>
          {formatLimitMemory(bundle?.resource?.limitMemory)} {t("Unit.MB")}
        </span>
      </HStack>
    </div>
  );
}

export default BundleInfo;
