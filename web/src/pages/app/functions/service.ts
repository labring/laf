import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import useFunctionStore from "./store";

import { TFunction } from "@/apis/typing";
import {
  FunctionControllerCompile,
  FunctionControllerCreate,
  FunctionControllerFindAll,
  FunctionControllerFindOne,
  FunctionControllerGetHistory,
  FunctionControllerRemove,
  FunctionControllerUpdate,
  FunctionControllerUpdateDebug,
} from "@/apis/v1/apps";
import useFunctionCache from "@/hooks/useFunctionCache";

const queryKeys = {
  useFunctionListQuery: ["useFunctionListQuery"],
  useFunctionDetailQuery: (name: string) => ["useFunctionDetailQuery", name],
};

export const useFunctionListQuery = (
  config?: { onSuccess?: (data: any) => void; enabled?: boolean },
  params?: any,
) => {
  return useQuery(
    queryKeys.useFunctionListQuery,
    () => {
      return FunctionControllerFindAll(params);
    },
    {
      enabled: config?.enabled,
      onSuccess: config?.onSuccess,
    },
  );
};

export const useFunctionDetailQuery = (name: string, config: any) => {
  return useQuery(
    queryKeys.useFunctionDetailQuery(name),
    () => {
      return FunctionControllerFindOne({
        name,
      });
    },
    config,
  );
};

export const useFunctionHistoryQuery = (name: string, config: any) => {
  return useQuery(
    ["useFunctionHistoryQuery", name],
    () => {
      return FunctionControllerGetHistory({
        name,
      });
    },
    config,
  );
};

export const useCreateFunctionMutation = () => {
  const store = useFunctionStore();
  const queryClient = useQueryClient();
  return useMutation(
    (values: any) => {
      return FunctionControllerCreate(values);
    },
    {
      onSuccess(data) {
        if (!data.error) {
          queryClient.invalidateQueries(queryKeys.useFunctionListQuery);
          store.setCurrentFunction(data.data);
          store.setRecentFunctionList([data.data as TFunction, ...store.recentFunctionList]);
        }
      },
    },
  );
};

export const useUpdateFunctionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (values: any) => {
      const updatedValues = {
        ...values,
        name: encodeURIComponent(values.name),
      };
      return FunctionControllerUpdate(updatedValues);
    },
    {
      onSuccess(data) {
        if (!data.error) {
          queryClient.invalidateQueries(queryKeys.useFunctionListQuery);
        }
      },
    },
  );
};

export const useUpdateDebugFunctionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (values: any) => {
      const updatedValues = {
        ...values,
        name: encodeURIComponent(values.name),
      };
      return FunctionControllerUpdateDebug(updatedValues);
    },
    {
      onSuccess(data) {
        if (!data.error) {
          queryClient.invalidateQueries(queryKeys.useFunctionListQuery);
        }
      },
    },
  );
};

export const useDeleteFunctionMutation = () => {
  const store = useFunctionStore();
  const functionCache = useFunctionCache();
  const queryClient = useQueryClient();
  return useMutation(
    (values: any) => {
      const updatedValues = {
        ...values,
        name: encodeURIComponent(values.name),
      };
      return FunctionControllerRemove(updatedValues);
    },
    {
      onSuccess(data: any) {
        if (!data.error) {
          queryClient.invalidateQueries(queryKeys.useFunctionListQuery);
          if (store.currentFunction?._id === data.data._id) {
            const newFunction = store.recentFunctionList[0] || store.allFunctionList[0] || {};
            store.setCurrentFunction(newFunction);
          }
          store.setRecentFunctionList(
            store.recentFunctionList.filter((item) => item._id !== data.data._id),
          );
          functionCache.removeCache(data?.data?._id);
        }
      },
    },
  );
};

export const useCompileMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["compileMutation"],
    mutationFn: (values: { code: string; name: string }) => {
      const updatedValues = {
        ...values,
        name: encodeURIComponent(values.name),
      };
      return FunctionControllerCompile(updatedValues);
    },
    onSuccess(data) {
      if (!data.error) {
        queryClient.setQueryData(["compileMutation"], data);
      }
    },
  });
};
