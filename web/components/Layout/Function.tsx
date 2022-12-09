import React, { ReactNode, useEffect } from "react";
import { Spinner } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { ApplicationsControllerFindOne } from "apis/v1/applications";
import { useRouter } from "next/router";
import useGlobalStore from "pages/globalStore";

import { SmallNavHeight } from "@/constants/index";

import Header from "../Header";

export default function FunctionLayout(props: { children: ReactNode }) {
  const { init, loading, setCurrentApp, currentApp } = useGlobalStore((state) => state);
  const {
    query: { app_id },
  } = useRouter();

  useQuery(
    ["getAppDetailQuery", app_id],
    () => {
      return ApplicationsControllerFindOne({ appid: app_id });
    },
    {
      enabled: !!app_id,
      onSuccess(data) {
        setCurrentApp(data?.data);
      },
    },
  );

  useEffect(() => {
    if (currentApp.appid) {
      init();
    }
  }, [currentApp, init]);

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
        {loading || !currentApp.appid ? <Spinner /> : props.children}
      </div>
    </div>
  );
}
