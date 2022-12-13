import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import useFunctionStore from "./store";

import {
  FunctionsControllerCreate,
  FunctionsControllerFindAll,
  FunctionsControllerRemove,
  FunctionsControllerUpdate,
} from "@/apis/v1/apps";
import useGlobalStore from "@/pages/globalStore";

const queryKeys = {
  useFunctionListQuery: ["useFunctionListQuery"],
};

export const useFunctionListQuery = ({ onSuccess }: { onSuccess: (data: any) => void }) => {
  return useQuery(
    queryKeys.useFunctionListQuery,
    () => {
      return FunctionsControllerFindAll({});
    },
    {
      onSuccess,
    },
  );
};

export const useCreateFuncitonMutation = () => {
  const store = useFunctionStore();
  const globalStore = useGlobalStore();
  const queryClient = useQueryClient();
  return useMutation(
    (values: any) => {
      return FunctionsControllerCreate(values);
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
      return FunctionsControllerUpdate(values);
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
  const queryClient = useQueryClient();
  return useMutation(
    (values: any) => {
      return FunctionsControllerRemove(values);
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

const server = () => {
  return null;
};
export default server;
