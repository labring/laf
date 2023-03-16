import { useMutation, useQuery } from "@tanstack/react-query";

import {
  AuthControllerGetProviders,
  AuthControllerResetPassword,
  AuthControllerSendSmsCode,
  AuthControllerSigninByPassword,
  AuthControllerSigninBySmsCode,
  AuthControllerSignup,
} from "@/apis/v1/auth";
import useGlobalStore from "@/pages/globalStore";

const queryKeys = {
  useSigninByPasswordMutation: ["useSigninByPasswordMutation"],
  useSigninBySmsCodeMutation: ["useSigninBySmsCodeMutation"],
  useSignupMutation: ["useSignupMutation"],
  useSendSmsCodeMutation: ["useSendSmsCodeMutation"],
  useResetPasswordMutation: ["useResetPasswordMutation"],
  useGetProvidersQuery: ["useGetProvidersQuery"],
};

export const useSigninByPasswordMutation = (config?: { onSuccess: (data: any) => void }) => {
  const globalStore = useGlobalStore();
  return useMutation(
    (values: any) => {
      return AuthControllerSigninByPassword(values);
    },
    {
      onSuccess: async (data) => {
        if (data.error) {
          globalStore.showError(data.error);
        } else {
          localStorage.setItem("token", data?.data);
          config?.onSuccess(data);
        }
      },
    },
  );
};

export const useSigninBySmsCodeMutation = (config?: { onSuccess: (data: any) => void }) => {
  const globalStore = useGlobalStore();
  return useMutation(
    (values: any) => {
      return AuthControllerSigninBySmsCode(values);
    },
    {
      onSuccess: async (data) => {
        if (data.error) {
          globalStore.showError(data.error);
        } else {
          localStorage.setItem("token", data?.data);
          config?.onSuccess(data);
        }
      },
    },
  );
};

export const useSignupMutation = (config?: { onSuccess: (data: any) => void }) => {
  const globalStore = useGlobalStore();
  return useMutation(
    (values: any) => {
      return AuthControllerSignup(values);
    },
    {
      onSuccess: async (data) => {
        if (data.error) {
          globalStore.showError(data.error);
        } else {
          config?.onSuccess(data);
        }
      },
    },
  );
};

export const useSendSmsCodeMutation = (config?: { onSuccess: (data: any) => void }) => {
  return useMutation(
    (values: any) => {
      return AuthControllerSendSmsCode(values);
    },
    {
      onSuccess: async (data) => {
        config?.onSuccess(data);
      },
    },
  );
};

export const useResetPasswordMutation = (config?: { onSuccess: (data: any) => void }) => {
  return useMutation(
    (values: any) => {
      return AuthControllerResetPassword(values);
    },
    {
      onSuccess: async (data) => {
        config?.onSuccess(data);
      },
    },
  );
};

export const useGetProvidersQuery = (onSuccess: (data: any) => void) => {
  return useQuery(
    queryKeys.useGetProvidersQuery,
    () => {
      return AuthControllerGetProviders({});
    },
    {
      onSuccess: onSuccess,
    },
  );
};
