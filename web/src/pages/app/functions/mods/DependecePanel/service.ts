import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import request from "@/utils/request";

import { DependencySearch, GetDependencyVersions } from "@/apis/v2/dependence";
import useGlobalStore from "@/pages/globalStore";
export type TDependenceItem = {
  versions: string[];
  package: {
    name: string;
    version: string;
    description: undefined | string;
    [key: string]: any;
  };
  [key: string]: any;
};

const queryKeys = {
  usePackageQuery: ["usePackageQuery"],
  usePackageSearchQuery: (q: string) => ["usePackageSearchQuery", q],
  usePackageVersionsQuery: (q: string) => ["usePackageVersionsQuery", q],
};

export const usePackageQuery = () => {
  return useQuery(queryKeys.usePackageQuery, async () => {
    return request.get("/api/packages");
  });
};

export const useAddPackageMutation = (callback?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation(
    (params: { name: string; version: string }) => request.post("/api/packages", params),
    {
      onSuccess: async () => {
        useGlobalStore.getState().showSuccess("add package success");
        await queryClient.invalidateQueries(queryKeys.usePackageQuery);
        callback && callback();
      },
    },
  );
};

export const usePackageSearchQuery = (q: string, setList: any, checkList: any) => {
  return useQuery(
    queryKeys.usePackageSearchQuery(q),
    async () => {
      return DependencySearch({ q: q });
    },
    {
      onSuccess(data: any) {
        const list: TDependenceItem[] = (data?.data?.objects || []).map((item: any) => {
          const existItem = checkList.find((checkItem: TDependenceItem) => {
            return checkItem.package.name === item.package.name;
          });
          return existItem ? existItem : { ...item, versions: [] };
        });
        setList(list);
      },
    },
  );
};

export const usePackageVersionsQuery = (q: string, callback?: (versions: string[]) => void) => {
  return useQuery(
    queryKeys.usePackageVersionsQuery(q),
    async () => {
      return GetDependencyVersions({ q: q });
    },
    {
      onSuccess(data: any) {
        const versions: string[] = Object.keys(data?.data?.versions || {});
        callback && callback(versions);
      },
    },
  );
};
