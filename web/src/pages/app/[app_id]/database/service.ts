import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CollectionsControllerCreate,
  CollectionsControllerFindAll,
  CollectionsControllerRemove,
} from "@/apis/v1/apps";
import useGlobalStore from "@/pages/globalStore";

import request from "@/utils/request";

import useDBMStore from "./store";

const queryKeys = {
  useCollectionListQuery: ["useCollectionListQuery"],
  useEntryDataQuery: (db: string) => ["useEntryDataQuery", db],
};

export const useCollectionListQuery = (config?: { onSuccess: (data: any) => void }) => {
  return useQuery(
    queryKeys.useCollectionListQuery,
    () => {
      return CollectionsControllerFindAll({});
    },
    {
      onSuccess: config?.onSuccess,
    },
  );
};

export const useEntryDataQuery = () => {
  const { currentDB } = useDBMStore();
  return useQuery(
    queryKeys.useEntryDataQuery(currentDB?.name || ""),
    () => {
      return request.get("/api/dbm_entry?db=" + currentDB?.name);
    },
    {
      enabled: !!currentDB,
    },
  );
};

export const useCreateDBMutation = (config?: { onSuccess: (data: any) => void }) => {
  const globalStore = useGlobalStore();
  const queryClient = useQueryClient();
  return useMutation(
    (values: any) => {
      return CollectionsControllerCreate(values);
    },
    {
      onSuccess: async (data) => {
        if (data.error) {
          globalStore.showError(data.error);
        } else {
          await queryClient.invalidateQueries(queryKeys.useCollectionListQuery);

          config?.onSuccess && config.onSuccess(data);
        }
      },
    },
  );
};

export const useDeleteDBMutation = (config?: { onSuccess: (data: any) => void }) => {
  const globalStore = useGlobalStore();
  const queryClient = useQueryClient();
  return useMutation(
    (values: any) => {
      return CollectionsControllerRemove(values);
    },
    {
      onSuccess(data) {
        if (data.error) {
          globalStore.showError(data.error);
        } else {
          queryClient.invalidateQueries(queryKeys.useCollectionListQuery);
          globalStore.showSuccess("delete success");
          config && config.onSuccess(data);
        }
      },
    },
  );
};

const server = () => {
  return null;
};
export default server;
