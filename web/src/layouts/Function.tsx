import { useEffect } from "react";
import { Outlet, useParams } from "react-router-dom";
import { Badge, Center, Spinner, useColorMode } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";

import { APP_PHASE_STATUS, APP_STATUS, COLOR_MODE, Pages } from "@/constants/index";

import { ApplicationControllerFindOne } from "@/apis/v1/applications";
import InitLog from "@/pages/app/mods/StatusBar/LogsModal/initLog";
import useGlobalStore from "@/pages/globalStore";

export default function FunctionLayout() {
  const { colorMode } = useColorMode();
  const darkMode = colorMode === COLOR_MODE.dark;
  const { init, loading, setCurrentApp, currentApp, setCurrentPage } = useGlobalStore(
    (state) => state,
  );

  const params = useParams();

  const { appid, pageId = Pages.function } = params;

  useQuery(
    ["getAppDetailQuery", appid],
    () => {
      return ApplicationControllerFindOne({ appid: appid });
    },
    {
      enabled: !!appid,
      refetchInterval:
        currentApp?.phase === APP_PHASE_STATUS.Started ||
        (currentApp?.state === APP_PHASE_STATUS.Stopped &&
          currentApp?.phase === APP_PHASE_STATUS.Stopped) ||
        currentApp?.state === APP_PHASE_STATUS.Deleted
          ? false
          : 1000,
      onSuccess(data) {
        setCurrentApp(data?.data);
      },
    },
  );

  useEffect(() => {
    if (currentApp?.appid) {
      init();
      setCurrentPage(pageId);
    }
  }, [currentApp, init, pageId, setCurrentPage]);

  return (
    <div
      style={{
        overflow: "hidden",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      {loading || !currentApp?.appid ? (
        <Center height={200}>
          <Spinner />
        </Center>
      ) : (
        <>
          {currentApp.phase === APP_PHASE_STATUS.Starting &&
          currentApp.state !== APP_STATUS.Restarting ? (
            <InitLog />
          ) : [
              APP_PHASE_STATUS.Creating,
              APP_PHASE_STATUS.Deleting,
              APP_PHASE_STATUS.Stopping,
            ].includes(currentApp.phase) || currentApp.state === APP_STATUS.Restarting ? (
            <div
              className={clsx(
                "absolute bottom-0 left-0 right-0 top-0 z-[999] flex flex-col items-center justify-center opacity-70",
                darkMode ? "bg-lafDark-100" : "bg-lafWhite-600",
              )}
            >
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
  );
}
