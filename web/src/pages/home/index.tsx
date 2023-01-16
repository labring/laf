import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { APP_PHASE_STATUS } from "../../constants";

import Empty from "./mods/Empty";
import List from "./mods/List";

import { ApplicationControllerFindAll } from "@/apis/v1/applications";

function HomePage() {
  const [shouldRefetch, setShouldRefetch] = useState(false);

  const appListQuery = useQuery(
    ["appListQuery"],
    () => {
      return ApplicationControllerFindAll({});
    },
    {
      refetchInterval: shouldRefetch ? 1000 : false,
      onSuccess(data) {
        setShouldRefetch(
          data?.data?.filter((item: any) => item?.phase !== APP_PHASE_STATUS.Started).length > 0,
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
    <div className="w-8/12 mt-10 mx-auto">
      <List appListQuery={appListQuery} />
    </div>
  );
}

export default HomePage;
