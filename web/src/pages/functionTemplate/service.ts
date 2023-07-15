import { useMutation, useQuery } from "@tanstack/react-query";

import {
  FunctionTemplateControllerCreateFunctionTemplate,
  FunctionTemplateControllerDeleteFunctionTemplate,
  FunctionTemplateControllerGetAllFunctionTemplate,
  FunctionTemplateControllerGetFunctionTemplateUsedBy,
  FunctionTemplateControllerGetMyFunctionTemplate,
  FunctionTemplateControllerGetOneFunctionTemplate,
  FunctionTemplateControllerGetRecommendFunctionTemplate,
  FunctionTemplateControllerGetUserFunctionTemplateStarState,
  FunctionTemplateControllerStarFunctionTemplate,
  FunctionTemplateControllerUpdateFunctionTemplate,
  FunctionTemplateControllerUseFunctionTemplate,
} from "@/apis/v1/function-templates";

export const useGetFunctionTemplatesQuery = (
  params: any,
  config?: { onSuccess?: (data: any) => void; enabled?: boolean },
) => {
  return useQuery(
    ["useGetFunctionTemplatesQuery", params],
    () => {
      return FunctionTemplateControllerGetAllFunctionTemplate(params);
    },
    {
      enabled: config?.enabled,
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
      // onSuccess(data) {
      //   if (!data.error) {
      //     console.log("data", data);
      //   }
      // },
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

export const useCreateFunctionTemplateMutation = () => {
  return useMutation(
    (values: any) => {
      return FunctionTemplateControllerCreateFunctionTemplate(values);
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

export const useGetMyFunctionTemplatesQuery = (
  params: any,
  config?: { onSuccess?: (data: any) => void; enabled?: boolean },
) => {
  return useQuery(
    ["useGetMyFunctionTemplatesQuery", params],
    () => {
      return FunctionTemplateControllerGetMyFunctionTemplate(params);
    },
    {
      enabled: config?.enabled,
      onSuccess: config?.onSuccess,
    },
  );
};

export const useGetRecommendFunctionTemplatesQuery = (
  params: any,
  config?: { onSuccess?: (data: any) => void; enabled?: boolean },
) => {
  return useQuery(
    ["useGetRecommendFunctionTemplatesQuery", params],
    () => {
      return FunctionTemplateControllerGetRecommendFunctionTemplate(params);
    },
    {
      enabled: config?.enabled,
      onSuccess: config?.onSuccess,
    },
  );
};

export const useUpdateFunctionTemplateMutation = () => {
  return useMutation(
    (values: any) => {
      return FunctionTemplateControllerUpdateFunctionTemplate(values);
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

export const useDeleteFunctionTemplateMutation = () => {
  return useMutation(
    (values: any) => {
      return FunctionTemplateControllerDeleteFunctionTemplate(values);
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
