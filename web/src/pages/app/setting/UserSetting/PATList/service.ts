import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { PatControllerCreate, PatControllerFindAll, PatControllerRemove } from "@/apis/v1/pats";
import useGlobalStore from "@/pages/globalStore";

export type TPAT = {
  id?: string;
  name: string;
  expiresIn: number;
};

const queryKeys = {
  usePATQuery: ["usePATQuery"],
};

export const usePATQuery = (callback?: (data: any) => void) => {
  return useQuery(
    queryKeys.usePATQuery,
    () => {
      return PatControllerFindAll({});
    },
    {
      onSuccess: (data) => {
        callback && callback(data?.data);
      },
    },
  );
};

export const useAddPATMutation = (callback?: (data: any) => void) => {
  const queryClient = useQueryClient();
  return useMutation((params: TPAT) => PatControllerCreate(params), {
    onSuccess: async (data) => {
      useGlobalStore.getState().showSuccess("update PAT success");
      await queryClient.invalidateQueries(queryKeys.usePATQuery);
      callback && callback(data?.data);
    },
  });
};

export const useDelPATMutation = (callback?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation((params: { id: string | undefined }) => PatControllerRemove(params), {
    onSuccess: async () => {
      useGlobalStore.getState().showSuccess("delete PAT success");
      await queryClient.invalidateQueries(queryKeys.usePATQuery);
      callback && callback();
    },
  });
};
