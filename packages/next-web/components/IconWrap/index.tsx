import React from "react";
import { Center } from "@chakra-ui/react";

export default function IconWrap(props: {
  size?: number;
  children: React.ReactNode;
  onClick: () => void;
}) {
  const { size = 20 } = props;
  return (
    <Center
      onClick={props.onClick}
      className="hover:bg-slate-200 rounded inline-block cursor-pointer "
      style={{ width: size, height: size }}
    >
      {props.children}
    </Center>
  );
}
