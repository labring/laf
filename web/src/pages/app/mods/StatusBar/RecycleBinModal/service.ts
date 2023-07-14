import { useMutation, useQuery } from "@tanstack/react-query";

import {
  FunctionRecycleBinControllerDeleteRecycleBinItems,
  FunctionRecycleBinControllerEmptyRecycleBin,
  FunctionRecycleBinControllerGetRecycleBin,
  FunctionRecycleBinControllerRestoreRecycleBinItems,
} from "@/apis/v1/recycle-bin";

export const useGetRecycleBinQuery = (
  params: any,
  config?: { onSuccess?: (data: any) => void; enabled?: boolean },
) => {
  return useQuery(
    ["useGetRecycleBin", params],
    () => {
      return FunctionRecycleBinControllerGetRecycleBin(params);
    },
    {
      enabled: config?.enabled,
      onSuccess: config?.onSuccess,
    },
  );
};

export const useDeleteRecycleBinItemsMutation = () => {
  return useMutation(
    (values: any) => {
      return FunctionRecycleBinControllerDeleteRecycleBinItems(values);
    },
    {
      onSuccess(data) {
        if (!data.error) {
          console.log("data", data);
        }
      },
    },
  );
};

export const useRestoreRecycleBinItemsMutation = () => {
  return useMutation(
    (values: any) => {
      return FunctionRecycleBinControllerRestoreRecycleBinItems(values);
    },
    {
      onSuccess(data) {
        if (!data.error) {
          // console.log("data", data);
        }
      },
    },
  );
};

export const useEmptyRecycleBinMutation = () => {
  return useMutation(
    (values: any) => {
      return FunctionRecycleBinControllerEmptyRecycleBin(values);
    },
    {
      onSuccess(data) {
        if (!data.error) {
          // console.log("data", data);
        }
      },
    },
  );
};
