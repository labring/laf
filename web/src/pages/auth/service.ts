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

export const useSigninByPasswordMutation = (config?: { onSuccess: (result: any) => void }) => {
  const globalStore = useGlobalStore();
  return useMutation(
    (values: any) => {
      return AuthControllerSigninByPassword(values);
    },
    {
      onSuccess: async (result) => {
        if (result.error) {
          globalStore.showError(result.error);
        } else {
          localStorage.setItem("token", result?.data);
          config?.onSuccess(result);
        }
      },
    },
  );
};

export const useSigninBySmsCodeMutation = (config?: { onSuccess: (result: any) => void }) => {
  const globalStore = useGlobalStore();
  return useMutation(
    (values: any) => {
      return AuthControllerSigninBySmsCode(values);
    },
    {
      onSuccess: async (result) => {
        if (result.error) {
          globalStore.showError(result.error);
        } else {
          localStorage.setItem("token", result?.data);
          config?.onSuccess(result);
        }
      },
    },
  );
};

export const useSignupMutation = (config?: { onSuccess: (result: any) => void }) => {
  const globalStore = useGlobalStore();
  return useMutation(
    (values: any) => {
      return AuthControllerSignup(values);
    },
    {
      onSuccess: async (result) => {
        if (result.error) {
          globalStore.showError(result.error);
        } else {
          config?.onSuccess(result);
        }
      },
    },
  );
};

export const useSendSmsCodeMutation = (config?: { onSuccess: (result: any) => void }) => {
  return useMutation(
    (values: any) => {
      return AuthControllerSendSmsCode(values);
    },
    {
      onSuccess: async (result) => {
        config?.onSuccess(result);
      },
    },
  );
};

export const useResetPasswordMutation = (config?: { onSuccess: (result: any) => void }) => {
  return useMutation(
    (values: any) => {
      return AuthControllerResetPassword(values);
    },
    {
      onSuccess: async (result) => {
        config?.onSuccess(result);
      },
    },
  );
};

export const useGetProvidersQuery = (onSuccess: (result: any) => void) => {
  return useQuery(
    queryKeys.useGetProvidersQuery,
    () => {
      return AuthControllerGetProviders({});
    },
    {
      onSuccess,
    },
  );
};
