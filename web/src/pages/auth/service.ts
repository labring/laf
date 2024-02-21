import { useMutation, useQuery } from "@tanstack/react-query";

import {
  EmailControllerSendCode,
  EmailControllerSignin,
  GithubAuthControllerBind,
  GithubAuthControllerJumpLogin,
  GithubAuthControllerSignin,
  GithubAuthControllerUnbind,
  PhoneControllerSendCode,
  PhoneControllerSignin,
  UserPasswordControllerReset,
  UserPasswordControllerSignin,
  UserPasswordControllerSignup,
} from "@/apis/v1/auth";

const queryKeys = {
  useSigninByPasswordMutation: ["useSigninByPasswordMutation"],
  useSigninBySmsCodeMutation: ["useSigninBySmsCodeMutation"],
  useSignupMutation: ["useSignupMutation"],
  useSendSmsCodeMutation: ["useSendSmsCodeMutation"],
  useResetPasswordMutation: ["useResetPasswordMutation"],
  useGetProvidersQuery: ["useGetProvidersQuery"],
};

export const useSigninByPasswordMutation = (config?: { onSuccess: (result: any) => void }) => {
  return useMutation(
    (values: any) => {
      return UserPasswordControllerSignin(values);
    },
    {
      onSuccess: async (result) => {
        if (!result.error) {
          localStorage.setItem("token", result?.data);
          config?.onSuccess(result);
        }
      },
    },
  );
};

export const useSigninBySmsCodeMutation = (config?: { onSuccess: (result: any) => void }) => {
  return useMutation(
    (values: any) => {
      return PhoneControllerSignin(values);
    },
    {
      onSuccess: async (result) => {
        if (!result.error) {
          localStorage.setItem("token", result?.data);
          config?.onSuccess(result);
        }
      },
    },
  );
};

export const useSigninByEmailMutation = (config?: { onSuccess: (result: any) => void }) => {
  return useMutation(
    (values: any) => {
      return EmailControllerSignin(values);
    },
    {
      onSuccess: async (result) => {
        if (!result.error) {
          localStorage.setItem("token", result?.data);
          config?.onSuccess(result);
        }
      },
    },
  );
};

export const useSignupMutation = (config?: { onSuccess: (result: any) => void }) => {
  return useMutation(
    (values: any) => {
      return UserPasswordControllerSignup(values);
    },
    {
      onSuccess: async (result) => {
        if (!result.error) {
          localStorage.setItem("token", result?.data.token);
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

export const useSendEmailCodeMutation = (config?: { onSuccess: (result: any) => void }) => {
  return useMutation(
    (values: any) => {
      return EmailControllerSendCode(values);
    },
    {
      onSuccess: async (result) => {
        config?.onSuccess(result);
      },
    },
  );
};

export const useGithubAuthControllerSigninMutation = (config?: {
  onSuccess: (result: any) => void;
}) => {
  return useMutation(
    (values: any) => {
      return GithubAuthControllerSignin(values);
    },
    {
      onSuccess: async (result) => {
        if (!result.error) {
          config?.onSuccess(result);
        }
      },
    },
  );
};

export const useGithubAuthControllerBindMutation = (config?: {
  onSuccess: (result: any) => void;
}) => {
  return useMutation(
    (values: any) => {
      return GithubAuthControllerBind(values);
    },
    {
      onSuccess: async (result) => {
        if (!result.error) {
          config?.onSuccess(result);
        }
      },
    },
  );
};

export const useGithubAuthControllerJumpLoginQuery = (
  params: any,
  onSuccess?: (result: any) => void,
) => {
  return useQuery(
    queryKeys.useGetProvidersQuery,
    () => {
      return GithubAuthControllerJumpLogin(params);
    },
    {
      onSuccess,
    },
  );
};

export const useGithubAuthControllerUnbindMutation = (config?: {
  onSuccess: (result: any) => void;
}) => {
  return useMutation(
    (values: any) => {
      return GithubAuthControllerUnbind({});
    },
    {
      onSuccess: async (result) => {
        if (!result.error) {
          config?.onSuccess(result);
        }
      },
    },
  );
};
