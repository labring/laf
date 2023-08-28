import { Outlet } from "react-router-dom";
import { useColorMode } from "@chakra-ui/react";
import clsx from "clsx";

import { COLOR_MODE } from "@/constants";

import styles from "./index.module.scss";

export default function LoginReg() {
  const { colorMode } = useColorMode();
  const darkMode = colorMode === COLOR_MODE.dark;

  return (
    <div
      className={clsx(styles.container, { "bg-[#F5F6F8]": !darkMode, "bg-lafDark-300": darkMode })}
    >
      <div className="absolute left-[104px] top-[80px]">
        <div
          className={clsx("text-[36px]", {
            "text-primary-600": !darkMode,
            "text-primary-400": darkMode,
          })}
        >
          Welcome to Laf !
        </div>
        <div
          className={clsx("text-[20px]", {
            "text-frostyNightfall-700": !darkMode,
            "text-grayModern-300": darkMode,
          })}
        >
          life is short, you need laf.
        </div>
      </div>
      <Outlet />
    </div>
  );
}
