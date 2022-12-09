import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useGlobalStore from "pages/globalStore";

import request from "@/utils/request";

const queryKeys = {
  usePackageQuery: ["usePackageQuery"],
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
