import { useQuery } from "@tanstack/react-query";

import { AccountControllerFindOne } from "@/apis/v1/accounts";

const queryKeys = {
  useAccountQuery: ["useAccountQuery"],
};

export const useAccountQuery = () => {
  return useQuery(queryKeys.useAccountQuery, async () => {
    return AccountControllerFindOne({});
  });
};
