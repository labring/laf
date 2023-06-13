import { useMutation, useQuery } from "@tanstack/react-query";

import {
  FunctionTemplateControllerGetAllFunctionTemplate,
  FunctionTemplateControllerGetAllFunctionTemplateByName,
  FunctionTemplateControllerGetFunctionTemplateUsedBy,
  FunctionTemplateControllerGetHotFunctionTemplate,
  FunctionTemplateControllerGetOneFunctionTemplate,
  FunctionTemplateControllerGetUserFunctionTemplateStarState,
  FunctionTemplateControllerStarFunctionTemplate,
  FunctionTemplateControllerUseFunctionTemplate,
} from "@/apis/v1/function-template";

export const useGetFunctionTemplatesQuery = (
  params: any,
  config?: { onSuccess?: (data: any) => void },
) => {
  return useQuery(
    ["useGetFunctionTemplatesQuery", params],
    () => {
      return FunctionTemplateControllerGetAllFunctionTemplate(params);
    },
    {
      onSuccess: config?.onSuccess,
    },
  );
};

export const useGetOneFunctionTemplateQuery = (
  params: any,
  config?: { onSuccess?: (data: any) => void; enabled?: boolean },
) => {
  return useQuery(
    ["useFunctionTemplatesQuery", params],
    () => {
      return FunctionTemplateControllerGetOneFunctionTemplate(params);
    },
    {
      enabled: config?.enabled,
      onSuccess: config?.onSuccess,
    },
  );
};

export const useFunctionTemplateUseMutation = () => {
  return useMutation(
    (values: any) => {
      return FunctionTemplateControllerUseFunctionTemplate(values);
    },
    {
      onSuccess(data) {
        if (!data.error) {
          console.log("data", data);
        }
      },
    },
  );
};

export const useGetStarStateQuery = (params: any, config?: { onSuccess?: (data: any) => void }) => {
  return useQuery(
    ["useGetStarStateQuery"],
    () => {
      return FunctionTemplateControllerGetUserFunctionTemplateStarState(params);
    },
    {
      onSuccess: config?.onSuccess,
    },
  );
};

export const useFunctionTemplateStarMutation = () => {
  return useMutation(
    (values: any) => {
      return FunctionTemplateControllerStarFunctionTemplate(values);
    },
    {
      onSuccess(data) {
        if (!data.error) {
          console.log("data", data);
        }
      },
    },
  );
};

export const useGetFunctionTemplateUsedByQuery = (
  params: any,
  config?: { onSuccess?: (data: any) => void; enabled?: boolean },
) => {
  return useQuery(
    ["useGetFunctionTemplateUsedByQuery", params],
    () => {
      return FunctionTemplateControllerGetFunctionTemplateUsedBy(params);
    },
    {
      enabled: config?.enabled,
      onSuccess: config?.onSuccess,
    },
  );
};

export const useGetFunctionTemplateByNameQuery = (
  params: any,
  config?: { onSuccess?: (data: any) => void },
) => {
  return useQuery(
    ["useGetFunctionTemplateByNameQuery", params],
    () => {
      return FunctionTemplateControllerGetAllFunctionTemplateByName(params);
    },
    {
      onSuccess: config?.onSuccess,
    },
  );
};

export const useGetHotFunctionTemplateQuery = (
  params: any,
  config?: { onSuccess?: (data: any) => void },
) => {
  return useQuery(
    ["useGetHotFunctionTemplateQuery"],
    () => {
      return FunctionTemplateControllerGetHotFunctionTemplate(params);
    },
    {
      onSuccess: config?.onSuccess,
    },
  );
};
