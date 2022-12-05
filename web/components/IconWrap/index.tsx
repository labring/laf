import React from "react";
import { Center, Tooltip } from "@chakra-ui/react";

export default function IconWrap(props: {
  size?: number;
  children: React.ReactNode;
  tooltip?: string | undefined;
  onClick?: () => void;
}) {
  const { size = 20, tooltip } = props;
  return (
    <Tooltip label={tooltip} placement="top">
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
