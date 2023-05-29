import { useColorMode } from "@chakra-ui/react";
import clsx from "clsx";

import HeadBar from "./Mods/HeadBar";
import SideBar from "./Mods/SideBar";
import FunctionTemplate from "./FunctionTemplate";

export default function Template() {
  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";

  return (
    <div className={clsx("h-screen", darkMode ? "" : "bg-white")}>
      <HeadBar />
      <SideBar />
      <div className="pl-72">
        <FunctionTemplate />
      </div>
    </div>
  );
}
