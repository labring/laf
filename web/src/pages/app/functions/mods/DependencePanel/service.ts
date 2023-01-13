import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { DependencySearch, GetDependencyVersions } from "@/apis/dependence";
import {
  DependencyControllerAdd,
  DependencyControllerGetDependencies,
  DependencyControllerRemove,
  DependencyControllerUpdate,
} from "@/apis/v1/apps";
import useGlobalStore from "@/pages/globalStore";
export type TDependenceItem = {
  versions: (string | undefined)[];
  package: {
    name: string;
    version: string;
    description: undefined | string;
    [key: string]: any;
  };
  [key: string]: any;
};
export type TPackage = {
  name: string;
  spec: string;
  builtin?: boolean;
};

const queryKeys = {
  usePackageQuery: ["usePackageQuery"],
  usePackageSearchQuery: (q: string) => ["usePackageSearchQuery", q],
  usePackageVersionsQuery: (q: string) => ["usePackageVersionsQuery", q],
};

export const usePackageQuery = (callback?: (data: any) => void) => {
  return useQuery(
    queryKeys.usePackageQuery,
    () => {
      return DependencyControllerGetDependencies({});
    },
    {
      onSuccess: (data) => {
        callback && callback(data?.data);
      },
    },
  );
};

export const useAddPackageMutation = (callback?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation((params: TPackage[]) => DependencyControllerAdd(params), {
    onSuccess: async () => {
      useGlobalStore.getState().showSuccess("add package success");
      await queryClient.invalidateQueries(queryKeys.usePackageQuery);
      callback && callback();
    },
  });
};

export const useEditPackageMutation = (callback?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation((params: TPackage[]) => DependencyControllerUpdate(params), {
    onSuccess: async () => {
      useGlobalStore.getState().showSuccess("edit package success");
      await queryClient.invalidateQueries(queryKeys.usePackageQuery);
      callback && callback();
    },
  });
};

export const useDelPackageMutation = (callback?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation((params: { name: string | undefined }) => DependencyControllerRemove(params), {
    onSuccess: async () => {
      useGlobalStore.getState().showSuccess("delete package success");
      await queryClient.invalidateQueries(queryKeys.usePackageQuery);
      callback && callback();
    },
  });
};

export const usePackageSearchQuery = (q: string, callback?: (data: any) => void) => {
  return useQuery(
    queryKeys.usePackageSearchQuery(q),
    async () => {
      return DependencySearch({ q: q });
    },
    {
      onSuccess(data: any) {
        callback && callback(data?.data?.objects);
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
