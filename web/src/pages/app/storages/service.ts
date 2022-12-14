import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  BucketControllerCreate,
  BucketControllerFindAll,
  BucketControllerRemove,
  BucketControllerUpdate,
} from "@/apis/v1/apps";
import useGlobalStore from "@/pages/globalStore";

const queryKeys = {
  useBucketListQuery: ["useBucketListQuery"],
  useFileListQuery: ["useFileListQuery"],
};

export const useBucketListQuery = (config?: { onSuccess: (data: any) => void }) => {
  return useQuery(
    queryKeys.useBucketListQuery,
    () => {
      return BucketControllerFindAll({});
    },
    {
      onSuccess: config?.onSuccess,
    },
  );
};

export const useBucketCreateMutation = (config?: { onSuccess: (data: any) => void }) => {
  const globalStore = useGlobalStore();
  const queryClient = useQueryClient();
  return useMutation(
    (values: any) => {
      return BucketControllerCreate(values);
    },
    {
      onSuccess: async (data) => {
        if (data.error) {
          globalStore.showError(data.error);
        } else {
          await queryClient.invalidateQueries(queryKeys.useBucketListQuery);
        }
      },
    },
  );
};

export const useBucketUpdateMutation = (config?: { onSuccess: (data: any) => void }) => {
  const globalStore = useGlobalStore();
  const queryClient = useQueryClient();
  return useMutation(
    (values: any) => {
      return BucketControllerUpdate(values);
    },
    {
      onSuccess: async (data) => {
        if (data.error) {
          globalStore.showError(data.error);
        } else {
          await queryClient.invalidateQueries(queryKeys.useBucketListQuery);

          config?.onSuccess && config.onSuccess(data);
        }
      },
    },
  );
};

export const useBucketDeleteMutation = () => {
  const globalStore = useGlobalStore();
  const queryClient = useQueryClient();
  return useMutation(
    (values: any) => {
      return BucketControllerRemove(values);
    },
    {
      onSuccess: async (data) => {
        if (data.error) {
          globalStore.showError(data.error);
        } else {
          globalStore.showSuccess("delete success");
          await queryClient.invalidateQueries(queryKeys.useBucketListQuery);
        }
      },
    },
  );
};
