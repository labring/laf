import React from "react";
import { Center, Tooltip, useColorMode } from "@chakra-ui/react";
import clsx from "clsx";

export default function IconWrap(props: {
  size?: number;
  children: React.ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
  tooltip?: string | undefined;
  onClick?: (data: any) => void;
  showBg?: boolean;
  className?: string;
}) {
  const { size = 20, tooltip, placement = "top", showBg = false, className } = props;
  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";
  return (
    <Tooltip label={tooltip} placement={placement}>
      <Center
        onClick={props.onClick}
        className={clsx("inline-block cursor-pointer rounded-full ", className, {
          "hover:bg-lafWhite-600": !darkMode && !showBg,
          "bg-lafWhite-600": !darkMode && showBg,
          "hover:bg-lafDark-300": darkMode && !showBg,
          "bg-lafDark-300": darkMode && showBg,
        })}
        style={{ width: size, height: size }}
      >
        {props.children}
      </Center>
    </Tooltip>
  );
}
