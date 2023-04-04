import React from "react";
import { Box, useColorModeValue } from "@chakra-ui/react";
import clsx from "clsx";

import PanelHeader from "./Header";

const Panel = (props: {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  onClick?: () => void;
}) => {
  const { className, style = {}, onClick } = props;
  const bg = useColorModeValue("lafWhite.200", "lafDark.200");
  return (
    <Box
      style={style}
      bg={bg}
      onClick={onClick}
      className={clsx("flex w-full flex-col rounded px-4", className)}
    >
      {props.children}
    </Box>
  );
};

Panel.Header = PanelHeader;

export default Panel;
