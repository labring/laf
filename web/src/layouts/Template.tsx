import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useColorMode } from "@chakra-ui/react";
import { Center, Spinner } from "@chakra-ui/react";
import clsx from "clsx";

import Header from "./Header";

import useGlobalStore from "@/pages/globalStore";

export default function TemplateLayout() {
  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";

  const { init, loading } = useGlobalStore((state) => state);
  useEffect(() => {
    init();
  }, [init]);

  return (
    <div className={clsx("h-screen overflow-hidden", darkMode ? "" : "bg-white")}>
      <div className={clsx("flex justify-center", darkMode ? "" : "bg-gray-100")}>
        <Header width="max-w-screen-xl" />
      </div>
      <div className={clsx("flex justify-center", darkMode ? "" : "border-t border-[#E4E9EE]")}>
        <div className="w-full max-w-screen-xl">
          {loading ? (
            <Center style={{ minHeight: 300 }}>
              <Spinner />
            </Center>
          ) : (
            <Outlet />
          )}
        </div>
      </div>
    </div>
  );
}
