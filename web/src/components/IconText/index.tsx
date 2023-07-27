import React from "react";
import { useColorMode } from "@chakra-ui/react";
import clsx from "clsx";

import { COLOR_MODE } from "@/constants";

export default function IconText(props: {
  icon: React.ReactElement;
  text: string;
  className?: string;
  onClick?: () => void;
}) {
  const { colorMode } = useColorMode();
  const darkMode = colorMode === COLOR_MODE.dark;

  return (
    <div
      onClick={props.onClick}
      className={clsx(
        "flex flex-col items-center text-grayIron-600",
        {
          "hover:text-black": !darkMode,
          "hover:text-white": darkMode,
        },
        props.className,
      )}
    >
      {React.cloneElement(props.icon, {
        height: "20px",
      })}
      {props.text}
    </div>
  );
}
