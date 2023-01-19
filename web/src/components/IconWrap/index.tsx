import React from "react";
import { Center, Tooltip } from "@chakra-ui/react";
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
  return (
    <Tooltip label={tooltip} placement={placement}>
      <Center
        onClick={props.onClick}
        className={clsx("rounded-full inline-block cursor-pointer text-gray-500", className, {
          "hover:bg-lafWhite-600": !showBg,
          "bg-lafWhite-600": showBg,
        })}
        style={{ width: size, height: size }}
      >
        {props.children}
      </Center>
    </Tooltip>
  );
}
