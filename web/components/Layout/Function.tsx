import React, { ReactNode, useEffect } from "react";
import { Spinner } from "@chakra-ui/react";
import { useRouter } from "next/router";
import useGlobalStore from "pages/globalStore";

import { SmallNavHeight } from "@/constants/index";

import Header from "../Header";

export default function FunctionLayout(props: { children: ReactNode }) {
  const { init, loading } = useGlobalStore((state) => state);
  const {
    query: { app_id },
  } = useRouter();

  useEffect(() => {
    init((app_id || "").toString());
  }, [app_id, init]);

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
