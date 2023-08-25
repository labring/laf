import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { useColorMode } from "@chakra-ui/react";
import clsx from "clsx";

import { COLOR_MODE } from "@/constants";

export default function ColorModeSwitch(props: { className?: string; fontSize?: number }) {
  const { toggleColorMode } = useColorMode();
  const { className, fontSize = 18 } = props;
  const darkMode = useColorMode().colorMode === COLOR_MODE.dark;

  return (
    <div
      className={clsx("flex cursor-pointer items-center", className)}
      onClick={() => {
        toggleColorMode();
        window.dispatchEvent(new Event("ColorModeChange"));
      }}
    >
      {darkMode ? <MoonIcon fontSize={fontSize} /> : <SunIcon fontSize={fontSize} />}
    </div>
  );
}
