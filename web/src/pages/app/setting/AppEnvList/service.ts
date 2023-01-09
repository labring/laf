import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  EnvironmentsControllerAdd,
  EnvironmentsControllerGetEnvironments,
  EnvironmentsControllerRemove,
} from "@/apis/v1/apps";
import useGlobalStore from "@/pages/globalStore";

export type TEnvironment = {
  name: string;
  value: string;
};

const queryKeys = {
  useEnvironmentQuery: ["useEnvironmentQuery"],
};

export const useEnvironmentQuery = (callback?: (data: any) => void) => {
  return useQuery(
    queryKeys.useEnvironmentQuery,
    () => {
      return EnvironmentsControllerGetEnvironments({});
    },
    {
      onSuccess: (data) => {
        callback && callback(data?.data);
      },
    },
  );
};

export const useAddEnvironmentMutation = (callback?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation((params: TEnvironment[]) => EnvironmentsControllerAdd(params), {
    onSuccess: async () => {
      useGlobalStore.getState().showSuccess("update environment success");
      await queryClient.invalidateQueries(queryKeys.useEnvironmentQuery);
      callback && callback();
    },
  });
};

export const useDelEnvironmentMutation = (callback?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation(
    (params: { name: string | undefined }) => EnvironmentsControllerRemove(params),
    {
      onSuccess: async () => {
        useGlobalStore.getState().showSuccess("delete environment success");
        await queryClient.invalidateQueries(queryKeys.useEnvironmentQuery);
        callback && callback();
      },
    },
  );
};
