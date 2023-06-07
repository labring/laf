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
    <div className={clsx("h-screen", darkMode ? "" : "bg-white")}>
      <Header bg="bg-gray-100" />
      <div className="pb-10">
        {loading ? (
          <Center style={{ minHeight: 300 }}>
            <Spinner />
          </Center>
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  );
}
