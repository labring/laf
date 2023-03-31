import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { APP_PHASE_STATUS } from "../../constants";

import Empty from "./mods/Empty";
import List from "./mods/List";

import { ApplicationControllerFindAll } from "@/apis/v1/applications";

export const APP_LIST_QUERY_KEY = ["appListQuery"];

function HomePage() {
  const [shouldRefetch, setShouldRefetch] = useState(true);
  useEffect(() => {
    setTimeout(() => {
      setShouldRefetch(true);
    }, 1500);
  }, []);

  const appListQuery = useQuery(
    APP_LIST_QUERY_KEY,
    () => {
      return ApplicationControllerFindAll({});
    },
    {
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

  if (appListQuery.isLoading) {
    return null;
  }

  return (appListQuery.data?.data || []).length === 0 ? (
    <Empty />
  ) : (
    <div className="mx-auto mt-10 flex w-11/12 flex-col lg:w-8/12">
      <List
        appListQuery={appListQuery}
        setShouldRefetch={() => {
          setTimeout(() => {
            setShouldRefetch(true);
          }, 1500);
        }}
      />
    </div>
  );
}

export default HomePage;
