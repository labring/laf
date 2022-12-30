import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import useStorageStore from "./store";

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
  const globalStore = useGlobalStore();
  const store = useStorageStore();
  return useQuery(
    queryKeys.useBucketListQuery,
    () => {
      return BucketControllerFindAll({});
    },
    {
      onSuccess: (data) => {
        let number = parseInt(
          globalStore.currentApp?.oss.spec.capacity.storage.split("Gi")[0] || "",
          10,
        );
        if (data?.data?.items?.length) {
          data?.data?.items.forEach((item: any) => {
            number -= parseInt(item.spec.storage.split("Gi")[0], 10);
          });
        }
        store.setMaxStorage(number);
        config?.onSuccess(data);
      },
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
