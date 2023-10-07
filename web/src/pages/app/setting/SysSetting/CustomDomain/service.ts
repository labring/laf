import { useMutation } from "@tanstack/react-query";

import {
  ApplicationControllerBindDomain,
  ApplicationControllerCheckResolved,
  ApplicationControllerRemove,
} from "@/apis/v1/applications";

export const useBindDomainMutation = (config?: { onSuccess: (data: any) => void }) => {
  return useMutation(
    (values: any) => {
      return ApplicationControllerBindDomain(values);
    },
    {
      onSuccess: async (data) => {
        if (!data.error) {
          config?.onSuccess && config.onSuccess(data);
        }
      },
    },
  );
};

export const useCheckResolvedMutation = (config?: { onSuccess: (data: any) => void }) => {
  return useMutation(
    (values: any) => {
      return ApplicationControllerCheckResolved(values);
    },
    {
      onSuccess: async (data) => {
        if (!data.error) {
          config?.onSuccess && config.onSuccess(data);
        }
      },
    },
  );
};

export const useRemoveApplicationMutation = (config?: { onSuccess: (data: any) => void }) => {
  return useMutation(
    (values: any) => {
      return ApplicationControllerRemove(values);
    },
    {
      onSuccess: async (data) => {
        if (!data.error) {
          config?.onSuccess && config.onSuccess(data);
        }
      },
    },
  );
};
