import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import useFunctionStore from "./store";

import {
  FunctionControllerCompile,
  FunctionControllerCreate,
  FunctionControllerFindAll,
  FunctionControllerRemove,
  FunctionControllerUpdate,
} from "@/apis/v1/apps";
import useFunctionCache from "@/hooks/useFunctionCache";
import useGlobalStore from "@/pages/globalStore";

const queryKeys = {
  useFunctionListQuery: ["useFunctionListQuery"],
};

export const useFunctionListQuery = ({ onSuccess }: { onSuccess: (data: any) => void }) => {
  return useQuery(
    queryKeys.useFunctionListQuery,
    () => {
      return FunctionControllerFindAll({});
    },
    {
      onSuccess,
    },
  );
};

export const useCreateFunctionMutation = () => {
  const store = useFunctionStore();
  const globalStore = useGlobalStore();
  const queryClient = useQueryClient();
  return useMutation(
    (values: any) => {
      return FunctionControllerCreate(values);
    },
    {
      onSuccess(data) {
        if (data.error) {
          globalStore.showError(data.error);
        } else {
          queryClient.invalidateQueries(queryKeys.useFunctionListQuery);
          store.setCurrentFunction(data.data);
        }
      },
    },
  );
};

export const useUpdateFunctionMutation = () => {
  const globalStore = useGlobalStore();
  const queryClient = useQueryClient();
  return useMutation(
    (values: any) => {
      return FunctionControllerUpdate(values);
    },
    {
      onSuccess(data) {
        if (data.error) {
          globalStore.showError(data.error);
        } else {
          queryClient.invalidateQueries(queryKeys.useFunctionListQuery);
        }
      },
    },
  );
};

export const useDeleteFunctionMutation = () => {
  const globalStore = useGlobalStore();
  const store = useFunctionStore();
  const functionCache = useFunctionCache();
  const queryClient = useQueryClient();
  return useMutation(
    (values: any) => {
      return FunctionControllerRemove(values);
    },
    {
      onSuccess(data) {
        if (data.error) {
          globalStore.showError(data.error);
        } else {
          queryClient.invalidateQueries(queryKeys.useFunctionListQuery);
          store.setCurrentFunction({});
          functionCache.removeCache(data?.data?.id);
        }
      },
    },
  );
};

export const useCompileMutation = () => {
  const globalStore = useGlobalStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["compileMutation"],
    mutationFn: (values: { code: string; name: string }) => {
      return FunctionControllerCompile(values);
    },
    onSuccess(data) {
      if (data.error) {
        globalStore.showError(data.error);
      }
      queryClient.setQueryData(["compileMutation"], data);
    },
  });
};
