import { useQuery } from "@tanstack/react-query";

import { AccountControllerFindOne } from "@/apis/v1/accounts";
import { ResourceControllerGetResourceBundles } from "@/apis/v1/resources";

export const queryKeys = {
  useAccountQuery: ["useAccountQuery"],
  useBillingPriceQuery: ["useBillingPriceQuery"],
  useBillingResourceOptionsQuery: ["useBillingResourceOptionsQuery"],
  useResourceBundlesQuery: ["useBillingResourceBundlesQuery"],
};

export const useAccountQuery = () => {
  return useQuery(queryKeys.useAccountQuery, async () => {
    return AccountControllerFindOne({});
  });
};

export const useResourceBundlesQuery = () => {
  return useQuery(queryKeys.useResourceBundlesQuery, async () => {
    return ResourceControllerGetResourceBundles({});
  });
};
