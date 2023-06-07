import { HStack } from "@chakra-ui/react";

import { formatLimitCPU, formatLimitMemory } from "@/utils/format";

function BundleInfo(props: { bundle: any }) {
  const { bundle } = props;
  if (!bundle) return null;
  return (
    <div className="group">
      <HStack spacing={1} mt={1}>
        <span>{formatLimitCPU(bundle?.resource?.limitCPU)}</span>
        <span>/</span>
        <span>{formatLimitMemory(bundle?.resource?.limitMemory)}</span>
        {/* <span className="invisible ml-2 rounded border px-1 text-base text-yellow-500 group-hover:visible">
          ≈¥10.00/Day
        </span> */}
      </HStack>
    </div>
  );
}

export default BundleInfo;
