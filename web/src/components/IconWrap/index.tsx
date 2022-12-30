import React from "react";
import { Center, Tooltip } from "@chakra-ui/react";

export default function IconWrap(props: {
  size?: number;
  children: React.ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
  tooltip?: string | undefined;
  onClick?: () => void;
}) {
  const { size = 20, tooltip, placement = "top" } = props;
  return (
    <Tooltip label={tooltip} placement={placement}>
      <Center
        onClick={props.onClick}
        className="hover:bg-slate-200 rounded inline-block cursor-pointer "
        style={{ width: size, height: size }}
      >
        {props.children}
      </Center>
    </Tooltip>
  );
}
