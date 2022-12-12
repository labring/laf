import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BucketsControllerCreate,
  BucketsControllerFindAll,
  BucketsControllerRemove,
  BucketsControllerUpdate,
} from "@/apis/v1/apps";
import useGlobalStore from "@/pages/globalStore";

import request from "@/utils/request";

const queryKeys = {
  useBucketListQuery: ["useBucketListQuery"],
  useFileListQuery: ["useFileListQuery"],
};

export const useBucketListQuery = (config?: { onSuccess: (data: any) => void }) => {
  return useQuery(
    queryKeys.useBucketListQuery,
    () => {
      return BucketsControllerFindAll({});
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
      return BucketsControllerCreate(values);
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
      return BucketsControllerUpdate(values);
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
      return BucketsControllerRemove(values);
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

export const useFileListQuery = () => {
  return useQuery(
    queryKeys.useFileListQuery,
    () => {
      return request.get("/api/files");
    },
    {},
  );
};

const server = () => {
  return null;
};
export default server;
