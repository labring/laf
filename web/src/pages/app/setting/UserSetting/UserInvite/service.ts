import { useQuery } from "@tanstack/react-query";

import { AccountControllerInviteCode, AccountControllerInviteCodeProfit } from "@/apis/v1/accounts";

export const useGetInviteCode = (config?: { onSuccess: (result: any) => void }) => {
  return useQuery(
    ["useGetInviteCodeQuery"],
    () => {
      return AccountControllerInviteCode({});
    },
    {
      onSuccess: async (result) => {
        config?.onSuccess(result);
      },
    },
  );
};

export const useGetInviteCodeProfit = (
  params: any,
  config?: { onSuccess: (result: any) => void },
) => {
  return useQuery(
    ["useGetInviteCodeProfitQuery", params],
    () => {
      return AccountControllerInviteCodeProfit({ ...params });
    },
    {
      onSuccess: async (result) => {
        config?.onSuccess(result);
      },
    },
  );
};
