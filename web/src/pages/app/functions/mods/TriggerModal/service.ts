import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  TriggerControllerCreate,
  TriggerControllerFindAll,
  TriggerControllerRemove,
} from "@/apis/v1/apps";
import useGlobalStore from "@/pages/globalStore";

const queryKeys = {
  useTriggerQuery: ["useTriggerQuery"],
};

export const useTriggerListQuery = (onSuccess: (data: any) => void) => {
  return useQuery(
    queryKeys.useTriggerQuery,
    () => {
      return TriggerControllerFindAll({});
    },
    {
      onSuccess: onSuccess,
    },
  );
};

export const useCreateTriggerMutation = (onSuccess: (data: any) => void) => {
  const globalStore = useGlobalStore();
  const queryClient = useQueryClient();
  return useMutation(
    (values: any) => {
      return TriggerControllerCreate(values);
    },
    {
      onSuccess: async (data) => {
        if (data.error) {
          globalStore.showError(data.error);
        } else {
          await queryClient.invalidateQueries(queryKeys.useTriggerQuery);
          onSuccess && onSuccess(data);
        }
      },
    },
  );
};

export const useDeleteTriggerMutation = (onSuccess: (data: any) => void) => {
  const globalStore = useGlobalStore();
  const queryClient = useQueryClient();
  return useMutation(
    (values: any) => {
      return TriggerControllerRemove(values);
    },
    {
      onSuccess(data) {
        if (data.error) {
          globalStore.showError(data.error);
        } else {
          queryClient.invalidateQueries(queryKeys.useTriggerQuery);
          globalStore.showSuccess("delete success");
          onSuccess && onSuccess(data);
        }
      },
    },
  );
};
