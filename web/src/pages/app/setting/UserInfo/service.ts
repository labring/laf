import { useMutation, useQuery } from "@tanstack/react-query";

import {
  UserControllerBindPhone,
  UserControllerBindUsername,
  UserControllerGetAvatar,
  UserControllerGetProfile,
  UserControllerUpdateAvatar,
} from "@/apis/v1/user";

export const useGetUserAvatar = (onSuccess: (result: any) => void) => {
  return useQuery(
    ["useGetUserAvatarQuery"],
    async () => {
      return UserControllerGetAvatar({});
    },
    {
      onSuccess,
    },
  );
};

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
    async () => {
      return UserControllerGetProfile({});
    },
    {
      onSuccess: async (result) => {
        config?.onSuccess(result);
      },
    },
  );
};
