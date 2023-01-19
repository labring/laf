import { useEffect } from "react";
import { Outlet, useParams } from "react-router-dom";
import { Badge, Center, Spinner } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";

import { APP_PHASE_STATUS, Pages } from "@/constants/index";

import { ApplicationControllerFindOne } from "@/apis/v1/applications";
import useGlobalStore from "@/pages/globalStore";

export default function FunctionLayout() {
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
      refetchInterval: currentApp?.phase !== APP_PHASE_STATUS.Started ? 1000 : false,
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
    <div>
      <div
        style={{
          height: "100vh",
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
              <div className="absolute top-0 bottom-0 left-0 right-0 z-[999] flex flex-col justify-center items-center bg-lafWhite-200 opacity-70 ">
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
