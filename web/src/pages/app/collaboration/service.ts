import { useMutation, useQuery } from "@tanstack/react-query";

import {
  GroupControllerFindGroupByAppId,
  GroupControllerFindGroupByInviteCode,
  GroupInviteControllerDeleteInviteCode,
  GroupInviteControllerGenerateInviteCode,
  GroupInviteControllerGetInviteCode,
  GroupMemberControllerAddMember,
  GroupMemberControllerFindMembers,
  GroupMemberControllerLeaveGroup,
  GroupMemberControllerRemoveMember,
  GroupMemberControllerUpdateMemberRole,
} from "@/apis/v1/group";

export const useGroupQueryByCode = (
  params?: any,
  config?: { onSuccess?: (data: any) => void; enabled?: boolean },
) => {
  return useQuery(
    ["useGroupQueryByCode"],
    () => {
      return GroupControllerFindGroupByInviteCode(params);
    },
    {
      enabled: config?.enabled,
      onSuccess: config?.onSuccess,
    },
  );
};

export const useGroupCodeQuery = (config?: {
  onSuccess?: (data: any) => void;
  enabled?: boolean;
}) => {
  return useQuery(
    ["useGroupCodeQuery"],
    () => {
      return GroupControllerFindGroupByAppId({});
    },
    {
      enabled: config?.enabled,
      onSuccess: config?.onSuccess,
    },
  );
};

export const useGroupInviteCodeQuery = (
  params?: any,
  config?: { onSuccess?: (data: any) => void; enabled?: boolean },
) => {
  return useQuery(
    ["useGroupInviteCodeQuery"],
    () => {
      return GroupInviteControllerGetInviteCode(params);
    },
    {
      enabled: config?.enabled,
      onSuccess: config?.onSuccess,
    },
  );
};

export const useGroupInviteCodeGenerateMutation = () => {
  return useMutation(
    (values: any) => {
      return GroupInviteControllerGenerateInviteCode(values);
    },
    {
      onSuccess: (data) => {
        console.log(data);
      },
    },
  );
};

export const useGroupInviteCodeDeleteMutation = () => {
  return useMutation(
    (values: any) => {
      return GroupInviteControllerDeleteInviteCode(values);
    },
    {
      onSuccess: (data) => {
        console.log(data);
      },
    },
  );
};

export const useGroupMembersQuery = (
  params?: any,
  config?: { onSuccess?: (data: any) => void; enabled?: boolean },
) => {
  return useQuery(
    ["useGroupMembersQuery"],
    () => {
      return GroupMemberControllerFindMembers(params);
    },
    {
      enabled: config?.enabled,
      onSuccess: config?.onSuccess,
    },
  );
};

export const useGroupMemberAddMutation = () => {
  return useMutation(
    (values: any) => {
      return GroupMemberControllerAddMember(values);
    },
    {
      onSuccess: (data) => {
        console.log(data);
      },
    },
  );
};

export const useGroupMemberRemoveMutation = () => {
  return useMutation(
    (values: any) => {
      return GroupMemberControllerRemoveMember(values);
    },
    {
      onSuccess: (data) => {
        console.log(data);
      },
    },
  );
};

export const useGroupMemberUpdateMutation = () => {
  return useMutation(
    (values: any) => {
      return GroupMemberControllerUpdateMemberRole(values);
    },
    {
      onSuccess: (data) => {
        console.log(data);
      },
    },
  );
};

export const useGroupMemberLeaveMutation = () => {
  return useMutation(
    (values: any) => {
      return GroupMemberControllerLeaveGroup(values);
    },
    {
      onSuccess: (data) => {
        console.log(data);
      },
    },
  );
};
