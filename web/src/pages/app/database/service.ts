import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import useDBMStore from "./store";

import {
  CollectionControllerCreate,
  CollectionControllerFindAll,
  CollectionControllerRemove,
} from "@/apis/v1/apps";
import useDB from "@/hooks/useDB";
import useGlobalStore from "@/pages/globalStore";

const queryKeys = {
  useCollectionListQuery: ["useCollectionListQuery"],
  useEntryDataQuery: (db: string) => ["useEntryDataQuery", db],
};

export const useCollectionListQuery = (config?: { onSuccess: (data: any) => void }) => {
  return useQuery(
    queryKeys.useCollectionListQuery,
    () => {
      return CollectionControllerFindAll({});
    },
    {
      onSuccess: config?.onSuccess,
    },
  );
};

export const useEntryDataQuery = () => {
  const { currentDB } = useDBMStore();
  const { db } = useDB();
  return useQuery(
    queryKeys.useEntryDataQuery(currentDB?.name || ""),
    async () => {
      if (!currentDB) return;

      const { limit = 10, page = 1, _id }: any = {};

      const query = _id ? { _id } : {};

      // 执行数据查询
      const res = await db
        .collection(currentDB?.name)
        .where(query)
        .limit(limit)
        .skip((page - 1) * limit)
        .get();

      // 获取数据总数
      const { total } = await db.collection(currentDB?.name).where(query).count();
      return { list: res.data, total };
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
      return CollectionControllerCreate(values);
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
      return CollectionControllerRemove(values);
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
