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
    <>
      <div
        className={clsx(
          "sticky top-0 z-50 flex justify-center",
          darkMode ? "bg-[#1A202C]" : "border-b border-[#E4E9EE] bg-[#F8FAFB]",
        )}
      >
        <Header className="max-w-screen-xl" />
      </div>
      <div className="overflow-auto">
        <div
          className={clsx("fixed bottom-0 left-0 right-0 top-0 -z-40", !darkMode && "bg-white")}
        ></div>

        <div className="flex justify-center">
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
    </>
  );
}
