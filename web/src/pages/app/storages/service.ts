import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { formatCapacity } from "@/utils/format";

import useStorageStore from "./store";

import {
  BucketControllerCreate,
  BucketControllerFindAll,
  BucketControllerRemove,
  BucketControllerUpdate,
  WebsiteControllerBindDomain,
  WebsiteControllerCreate,
  WebsiteControllerFindAll,
  WebsiteControllerRemove,
} from "@/apis/v1/apps";
import useGlobalStore from "@/pages/globalStore";
const queryKeys = {
  useBucketListQuery: ["useBucketListQuery"],
  useFileListQuery: ["useFileListQuery"],
  useWebsiteListQuery: ["useWebsiteListQuery"],
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
        data.data = data.data.filter((item: any) => item.state === "Active");
        let number = formatCapacity(
          String(globalStore.currentApp?.bundle.resource.storageCapacity),
        );
        if (data?.data?.items?.length) {
          data?.data?.items.forEach((item: any) => {
            number -= formatCapacity(item.spec.storage);
          });
        }
        const { setMaxStorage } = store;
        setMaxStorage(number);
        config?.onSuccess(data);
      },
    },
  );
};

export const useBucketCreateMutation = (config?: { onSuccess: (data: any) => void }) => {
  const queryClient = useQueryClient();
  const store = useStorageStore();
  return useMutation(
    (values: any) => {
      return BucketControllerCreate(values);
    },
    {
      onSuccess: async (data) => {
        if (!data.error) {
          store.setCurrentStorage(data.data);
          await queryClient.invalidateQueries(queryKeys.useBucketListQuery);
        }
      },
    },
  );
};

export const useBucketUpdateMutation = (config?: { onSuccess: (data: any) => void }) => {
  const queryClient = useQueryClient();
  return useMutation(
    (values: any) => {
      return BucketControllerUpdate(values);
    },
    {
      onSuccess: async (data) => {
        if (!data.error) {
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
  const store = useStorageStore();
  return useMutation(
    (values: any) => {
      return BucketControllerRemove(values);
    },
    {
      onSuccess: async (data) => {
        if (!data.error) {
          globalStore.showSuccess("delete success");
          store.setCurrentStorage(undefined);
          await queryClient.invalidateQueries(queryKeys.useBucketListQuery);
        }
      },
    },
  );
};

export const useWebsiteListQuery = (config?: { onSuccess: (data: any) => void }) => {
  // const globalStore = useGlobalStore();
  // const store = useStorageStore();
  return useQuery(
    queryKeys.useWebsiteListQuery,
    () => {
      return WebsiteControllerFindAll({});
    },
    {
      onSuccess: (data) => {
        config?.onSuccess(data);
      },
    },
  );
};

export const useWebsiteCreateMutation = (config?: { onSuccess: (data: any) => void }) => {
  const queryClient = useQueryClient();
  return useMutation(
    (values: any) => {
      return WebsiteControllerCreate(values);
    },
    {
      onSuccess: async (data) => {
        if (!data.error) {
          await queryClient.invalidateQueries(queryKeys.useBucketListQuery);
        }
      },
    },
  );
};

export const useWebsiteDeleteMutation = () => {
  const globalStore = useGlobalStore();
  const queryClient = useQueryClient();
  return useMutation(
    (values: any) => {
      return WebsiteControllerRemove(values);
    },
    {
      onSuccess: async (data) => {
        if (!data.error) {
          globalStore.showSuccess("delete success");
          await queryClient.invalidateQueries(queryKeys.useBucketListQuery);
        }
      },
    },
  );
};

export const useWebSiteUpdateMutation = (config?: { onSuccess: (data: any) => void }) => {
  const queryClient = useQueryClient();
  return useMutation(
    (values: any) => {
      return WebsiteControllerBindDomain(values);
    },
    {
      onSuccess: async (data) => {
        if (!data.error) {
          await queryClient.invalidateQueries(queryKeys.useBucketListQuery);
          config?.onSuccess && config.onSuccess(data);
        }
      },
    },
  );
};
