import { HStack } from "@chakra-ui/react";
import { useColorMode } from "@chakra-ui/react";
import clsx from "clsx";

import { formatLimitCPU, formatLimitMemory } from "@/utils/format";

function BundleInfo(props: { bundle: any; className?: string }) {
  const { bundle, className } = props;
  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";
  if (!bundle) return null;
  return (
    <HStack
      spacing={1}
      mt={1}
      className={clsx(
        darkMode ? "-ml-5 scale-[.83]" : "-ml-5 scale-[.83] text-grayModern-600",
        className,
      )}
    >
      <span>{formatLimitCPU(bundle?.resource?.limitCPU)}</span>
      <span>/</span>
      <span>{formatLimitMemory(bundle?.resource?.limitMemory)}</span>
      {/* <span className="invisible ml-2 rounded border px-1 text-base text-yellow-500 group-hover:visible">
        ≈¥10.00/Day
      </span> */}
    </HStack>
  );
}

export default BundleInfo;
