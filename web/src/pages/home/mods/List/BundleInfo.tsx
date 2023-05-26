import { HStack } from "@chakra-ui/react";

import { formatLimitCPU, formatLimitMemory } from "@/utils/format";

function BundleInfo(props: { bundle: any }) {
  const { bundle } = props;
  if (!bundle) return null;
  return (
    <div>
      <HStack spacing={1} mt={1}>
        <span>{formatLimitCPU(bundle?.resource?.limitCPU)}</span>
        <span>/</span>
        <span>{formatLimitMemory(bundle?.resource?.limitMemory)}</span>
      </HStack>
    </div>
  );
}

export default BundleInfo;
