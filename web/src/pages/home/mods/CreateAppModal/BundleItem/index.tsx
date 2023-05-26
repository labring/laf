import { useColorMode } from "@chakra-ui/react";
import clsx from "clsx";

import { COLOR_MODE } from "@/constants";

import { TBundle } from "@/apis/typing";

export default function BundleItem(props: {
  onChange: (...event: any[]) => void;
  bundle: TBundle | any;
  isActive: boolean;
}) {
  const { bundle, isActive, onChange } = props;
  const { colorMode } = useColorMode();
  const darkMode = colorMode === COLOR_MODE.dark;

  return (
    <div
      onClick={() => onChange(bundle._id)}
      key={bundle._id}
      className={clsx("mb-2 min-w-[170px] cursor-pointer rounded-md border bg-lafWhite-600 p-2", {
        "bg-primary-500 text-white": isActive && !darkMode,
        "border-primary-500": isActive && !darkMode,
        "bg-lafDark-400": isActive && darkMode,
      })}
    >
      <div>
        <p className="text-lg font-semibold">{bundle.displayName}</p>
      </div>
    </div>
  );
}
