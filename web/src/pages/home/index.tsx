import { useEffect, useState } from "react";
import { Center, Spinner } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";

import { APP_PHASE_STATUS } from "@/constants";

import Empty from "./mods/Empty";
import List from "./mods/List";

import { ApplicationControllerFindAll } from "@/apis/v1/applications";

export const APP_LIST_QUERY_KEY = ["appListQuery"];

function HomePage() {
  const [shouldRefetch, setShouldRefetch] = useState(true);

  const { data: appListQuery, isLoading } = useQuery(
    APP_LIST_QUERY_KEY,
    () => {
      return ApplicationControllerFindAll({});
    },
    {
      staleTime: 2000,
      refetchInterval: shouldRefetch ? 1000 : false,
      onSuccess(data) {
        setShouldRefetch(
          data?.data?.filter(
            (item: any) =>
              !(
                item?.phase === APP_PHASE_STATUS.Started || item?.phase === APP_PHASE_STATUS.Stopped
              ),
          ).length > 0,
        );
      },
    },
  );

  useEffect(() => {
    setTimeout(() => {
      setShouldRefetch(true);
    }, 500);
  }, [appListQuery]);

  return isLoading ? (
    <Center style={{ minHeight: 500 }}>
      <Spinner />
    </Center>
  ) : appListQuery?.data.length === 0 ? (
    <Empty />
  ) : (
    <div className="mx-auto mt-10 flex w-[1060px] flex-col">
      <List appList={appListQuery?.data} />
    </div>
  );
}

export default HomePage;
