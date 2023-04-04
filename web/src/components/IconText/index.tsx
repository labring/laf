import React from "react";
import { useColorMode } from "@chakra-ui/react";
import clsx from "clsx";

export default function IconText(props: {
  icon: React.ReactElement;
  text: string;
  onClick?: () => void;
}) {
  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";

  return (
    <div
      onClick={props.onClick}
      className={clsx("flex flex-col items-center text-grayIron-600", {
        "hover:text-black": !darkMode,
        "hover:text-white": darkMode,
      })}
    >
      {React.cloneElement(props.icon, {
        height: "20px",
      })}
      {props.text}
    </div>
  );
}
