import { useEffect } from "react";
import { Outlet, useParams } from "react-router-dom";
import { Spinner } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";

import { SmallNavHeight } from "@/constants/index";

import Header from "./Header";

import { ApplicationsControllerFindOne } from "@/apis/v1/applications";
import useGlobalStore from "@/pages/globalStore";

export default function FunctionLayout() {
  const { init, loading, setCurrentApp, currentApp } = useGlobalStore((state) => state);

  const params = useParams();

  const { appid } = params;

  useQuery(
    ["getAppDetailQuery", appid],
    () => {
      return ApplicationsControllerFindOne({ appid: appid });
    },
    {
      enabled: !!appid,
      onSuccess(data) {
        setCurrentApp(data?.data);
      },
    },
  );

  useEffect(() => {
    if (currentApp?.appid) {
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
        {loading || !currentApp?.appid ? <Spinner /> : <Outlet />}
      </div>
    </div>
  );
}
