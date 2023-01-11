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

export const useEntryDataQuery = (params: any, onSuccess: () => void) => {
  const { currentDB } = useDBMStore();
  const { db } = useDB();
  return useQuery(
    [queryKeys.useEntryDataQuery(currentDB?.name || ""), params],
    async () => {
      if (!currentDB) return;
      const { limit = 10, page = 1, _id } = params;

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
      onSuccess && onSuccess();
      return { list: res.data, total, page, limit };
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

export const useAddDataMutation = (config?: { onSuccess: (data: any) => void }) => {
  const { currentDB } = useDBMStore();
  const globalStore = useGlobalStore();
  const { db } = useDB();
  const queryClient = useQueryClient();

  return useMutation(
    async (values: any) => {
      const result = await db.collection(currentDB?.name!).add({ ...values });
      return result;
    },
    {
      onSuccess(data) {
        if (data.ok) {
          globalStore.showSuccess("add success");
          queryClient.invalidateQueries([queryKeys.useEntryDataQuery(currentDB?.name || "")]);
          //config && config.onSuccess(data);
        } else {
          globalStore.showError(data.error);
        }
      },
    },
  );
};

export const useUpdateDataMutation = (config?: { onSuccess: (data: any) => void }) => {
  const { currentDB } = useDBMStore();
  const globalStore = useGlobalStore();
  const { db } = useDB();
  const queryClient = useQueryClient();

  return useMutation(
    async (values: any) => {
      const query = db.collection(currentDB?.name!).where({ _id: values._id });
      delete values._id;
      const result = query.update({ ...values });
      return result;
    },
    {
      onSuccess(data) {
        console.log(data);
        if (data.ok) {
          globalStore.showSuccess("update success");
          queryClient.invalidateQueries([queryKeys.useEntryDataQuery(currentDB?.name || "")]);
          //config && config.onSuccess(data);
        } else {
          globalStore.showError(data.error);
        }
      },
    },
  );
};

export const useDeleteDataMutation = (config?: { onSuccess: (data: any) => void }) => {
  const { currentDB } = useDBMStore();
  const globalStore = useGlobalStore();
  const { db } = useDB();
  const queryClient = useQueryClient();

  return useMutation(
    async (values: any) => {
      const result = await db.collection(currentDB?.name!).where({ _id: values._id }).remove();
      return result;
    },
    {
      onSuccess(data) {
        if (data.ok) {
          globalStore.showSuccess("delete success");
          queryClient.invalidateQueries([queryKeys.useEntryDataQuery(currentDB?.name || "")]);
          config && config.onSuccess(data);
        } else {
          globalStore.showError(data.error);
        }
      },
    },
  );
};
