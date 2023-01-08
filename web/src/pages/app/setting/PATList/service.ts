import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  AuthControllerGetPATs,
  AuthControllerPATsCreate,
  AuthControllerPATsRemove,
} from "@/apis/v1/pats";
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
      return AuthControllerGetPATs({});
    },
    {
      onSuccess: (data) => {
        callback && callback(data?.data);
      },
    },
  );
};

export const useAddPATMutation = (callback?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation((params: TPAT) => AuthControllerPATsCreate(params), {
    onSuccess: async () => {
      useGlobalStore.getState().showSuccess("update PAT success");
      await queryClient.invalidateQueries(queryKeys.usePATQuery);
      callback && callback();
    },
  });
};

export const useDelPATMutation = (callback?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation((params: { id: string | undefined }) => AuthControllerPATsRemove(params), {
    onSuccess: async () => {
      useGlobalStore.getState().showSuccess("delete PAT success");
      await queryClient.invalidateQueries(queryKeys.usePATQuery);
      callback && callback();
    },
  });
};
