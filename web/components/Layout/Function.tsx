import React, { ReactNode, useEffect } from "react";
import { Spinner } from "@chakra-ui/react";
import { useRouter } from "next/router";
import useGlobalStore from "pages/globalStore";

import { SmallNavHeight } from "@/constants/index";

import Header from "../Header";

export default function FunctionLayout(props: { children: ReactNode }) {
  const { init, loading, setCurrentApp, currentApp } = useGlobalStore((state) => state);
  const {
    query: { app_id },
  } = useRouter();

  useEffect(() => {
    init();
    setCurrentApp(app_id);
  }, [app_id, init, setCurrentApp]);

  return (
    <div>
      <Header size="sm" />
      <div
        className="bg-white"
        style={{
          height: `calc(100vh - ${SmallNavHeight}px)`,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {loading || !currentApp ? <Spinner /> : props.children}
      </div>
    </div>
  );
}
