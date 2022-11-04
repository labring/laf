import { Center } from "@chakra-ui/react";
import React from "react";

export default function IconWrap(props: {
  size?: number;
  children: React.ReactNode;
  onClick: () => void;
}) {
  const { size = 20 } = props;
  return (
    <Center
      onClick={props.onClick}
      className="hover:bg-slate-200 rounded inline-block "
      style={{ width: size, height: size }}
    >
      {props.children}
    </Center>
  );
}
