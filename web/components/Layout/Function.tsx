import React, { ReactNode, useEffect } from "react";
import { Spinner } from "@chakra-ui/react";
import useGlobalStore from "pages/app_store";

import { SmallNavHeight } from "@/constants/index";

import Header from "../Header";

export default function FunctionLayout(props: { children: ReactNode }) {
  const { init, loading } = useGlobalStore((state) => state);
  useEffect(() => {
    init();
  }, [init]);

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
        {loading ? <Spinner /> : props.children}
      </div>
    </div>
  );
}
