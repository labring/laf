import { useEffect } from "react";
import { Outlet, useParams } from "react-router-dom";
import { Badge, Center, Spinner } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";

import { APP_PHASE_STATUS, SmallNavHeight } from "@/constants/index";

import Header from "./Header";

import { ApplicationControllerFindOne } from "@/apis/v1/applications";
import useGlobalStore from "@/pages/globalStore";

export default function FunctionLayout() {
  const { init, loading, setCurrentApp, currentApp } = useGlobalStore((state) => state);

  const params = useParams();

  const { appid } = params;

  useQuery(
    ["getAppDetailQuery", appid],
    () => {
      return ApplicationControllerFindOne({ appid: appid });
    },
    {
      enabled: !!appid,
      refetchInterval: currentApp?.phase !== APP_PHASE_STATUS.Started ? 1000 : false,
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
        {loading || !currentApp?.appid ? (
          <Center height={200}>
            <Spinner />
          </Center>
        ) : (
          <>
            {currentApp?.phase !== APP_PHASE_STATUS.Started ? (
              <div className="absolute top-0 bottom-0 left-0 right-0 z-[999] flex flex-col justify-center items-center bg-white opacity-70 ">
                <Spinner
                  thickness="4px"
                  speed="0.65s"
                  emptyColor="gray.200"
                  color="blue.500"
                  size="xl"
                />
                <Badge className="mt-4">{currentApp.phase}...</Badge>
              </div>
            ) : null}
            <Outlet />
          </>
        )}
      </div>
    </div>
  );
}
