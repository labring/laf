import { useMutation, useQuery } from "@tanstack/react-query";

import {
  UserControllerBindEmail,
  UserControllerBindPhone,
  UserControllerBindUsername,
  UserControllerGetProfile,
  UserControllerUpdateAvatar,
} from "@/apis/v1/user";

export const useUpdateUserAvatar = (config?: { onSuccess: (result: any) => void }) => {
  return useMutation(
    (values: any) => {
      return UserControllerUpdateAvatar(values);
    },
    {
      onSuccess: async (result) => {
        config?.onSuccess(result);
      },
    },
  );
};

export const useBindPhoneMutation = (config?: { onSuccess: (result: any) => void }) => {
  return useMutation(
    (values: any) => {
      return UserControllerBindPhone(values);
    },
    {
      onSuccess: async (result) => {
        config?.onSuccess(result);
      },
    },
  );
};

export const useBindUsernameMutation = (config?: { onSuccess: (result: any) => void }) => {
  return useMutation(
    (values: any) => {
      return UserControllerBindUsername(values);
    },
    {
      onSuccess: async (result) => {
        config?.onSuccess(result);
      },
    },
  );
};

export const useGetUserProfile = (config?: { onSuccess: (result: any) => void }) => {
  return useQuery(
    ["useGetUserProfileQuery"],
    () => {
      return UserControllerGetProfile({});
    },
    {
      onSuccess: async (result) => {
        config?.onSuccess(result);
      },
    },
  );
};

export const useBindEmailMutation = (config?: { onSuccess: (result: any) => void }) => {
  return useMutation(
    (values: any) => {
      return UserControllerBindEmail(values);
    },
    {
      onSuccess: async (result) => {
        config?.onSuccess(result);
      },
    },
  );
};
