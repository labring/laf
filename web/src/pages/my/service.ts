import { useMutation, useQuery } from "@tanstack/react-query";

import {
  FunctionTemplateControllerCreateFunctionTemplate,
  FunctionTemplateControllerDeleteFunctionTemplate,
  FunctionTemplateControllerGetMyFunctionTemplate,
  FunctionTemplateControllerUpdateFunctionTemplate,
} from "@/apis/v1/function-template";

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
  config?: { onSuccess?: (data: any) => void },
) => {
  return useQuery(
    ["useGetMyFunctionTemplatesQuery", params],
    () => {
      return FunctionTemplateControllerGetMyFunctionTemplate(params);
    },
    {
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
