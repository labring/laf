import { useMutation, useQuery } from "@tanstack/react-query";

import {
  AuthenticationControllerGetProviders,
  PhoneControllerSendCode,
  PhoneControllerSignin,
  UserPasswordControllerReset,
  UserPasswordControllerSignin,
  UserPasswordControllerSignup,
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
      return UserPasswordControllerSignin(values);
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
      return PhoneControllerSignin(values);
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
      return UserPasswordControllerSignup(values);
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
      return PhoneControllerSendCode(values);
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
      return UserPasswordControllerReset(values);
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
      return AuthenticationControllerGetProviders({});
    },
    {
      onSuccess,
    },
  );
};
