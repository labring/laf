import { request, RequestParams } from '../../util/request'
import { CreateGroupDto, GenerateGroupInviteCodeDto, UpdateGroupDto, UpdateGroupMemberRoleDto } from './data-contracts'

/**
 * No description
 *
 * @tags Group
 * @name GroupControllerFindGroupByAppId
 * @summary Find internal group of the application
 * @request GET:/v1/group/application/{appid}/group
 * @secure
 */
export async function groupControllerFindGroupByAppId(appid: string, configParams: RequestParams = {}): Promise<any> {
  return request({
    url: `/v1/group/application/${appid}/group`,
    method: 'GET',
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags Group
 * @name GroupControllerFindGroupByInviteCode
 * @summary Get group by invite code
 * @request GET:/v1/group/invite/code/{code}/group
 * @secure
 */
export async function groupControllerFindGroupByInviteCode(
  code: string,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/group/invite/code/${code}/group`,
    method: 'GET',
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags Group
 * @name GroupControllerFindAll
 * @summary Get group list of the user
 * @request GET:/v1/group
 * @secure
 */
export async function groupControllerFindAll(configParams: RequestParams = {}): Promise<any> {
  return request({
    url: `/v1/group`,
    method: 'GET',
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags Group
 * @name GroupControllerCreate
 * @summary Create group for the user
 * @request POST:/v1/group
 * @secure
 */
export async function groupControllerCreate(data: CreateGroupDto, configParams: RequestParams = {}): Promise<any> {
  return request({
    url: `/v1/group`,
    method: 'POST',
    data: data,
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags Group
 * @name GroupControllerDelete
 * @summary Delete a group
 * @request DELETE:/v1/group/{groupId}
 * @secure
 */
export async function groupControllerDelete(groupId: string, configParams: RequestParams = {}): Promise<any> {
  return request({
    url: `/v1/group/${groupId}`,
    method: 'DELETE',
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags Group
 * @name GroupControllerFindOne
 * @summary Get detail of a group
 * @request GET:/v1/group/{groupId}
 * @secure
 */
export async function groupControllerFindOne(groupId: string, configParams: RequestParams = {}): Promise<any> {
  return request({
    url: `/v1/group/${groupId}`,
    method: 'GET',
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags Group
 * @name GroupControllerUpdateGroup
 * @summary Update group
 * @request PATCH:/v1/group/{groupId}
 * @secure
 */
export async function groupControllerUpdateGroup(
  groupId: string,
  data: UpdateGroupDto,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/group/${groupId}`,
    method: 'PATCH',
    data: data,
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags Group
 * @name GroupInviteControllerGetInviteCode
 * @summary Get group invite code
 * @request GET:/v1/group/{groupId}/invite/code
 * @secure
 */
export async function groupInviteControllerGetInviteCode(
  groupId: string,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/group/${groupId}/invite/code`,
    method: 'GET',
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags Group
 * @name GroupInviteControllerGenerateInviteCode
 * @summary Update group invite code
 * @request POST:/v1/group/{groupId}/invite/code
 * @secure
 */
export async function groupInviteControllerGenerateInviteCode(
  groupId: string,
  data: GenerateGroupInviteCodeDto,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/group/${groupId}/invite/code`,
    method: 'POST',
    data: data,
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags Group
 * @name GroupInviteControllerDeleteInviteCode
 * @summary Delete group invite code
 * @request DELETE:/v1/group/{groupId}/invite/code/{code}
 * @secure
 */
export async function groupInviteControllerDeleteInviteCode(
  code: string,
  groupId: string,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/group/${groupId}/invite/code/${code}`,
    method: 'DELETE',
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags Group
 * @name GroupMemberControllerFindMembers
 * @summary Get members of a group
 * @request GET:/v1/group/{groupId}/member
 * @secure
 */
export async function groupMemberControllerFindMembers(
  groupId: string,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/group/${groupId}/member`,
    method: 'GET',
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags Group
 * @name GroupMemberControllerAddMember
 * @summary Join a group
 * @request POST:/v1/group/{code}/member/join
 * @secure
 */
export async function groupMemberControllerAddMember(code: string, configParams: RequestParams = {}): Promise<any> {
  return request({
    url: `/v1/group/${code}/member/join`,
    method: 'POST',
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags Group
 * @name GroupMemberControllerRemoveMember
 * @summary Remove a group member
 * @request DELETE:/v1/group/{groupId}/member/{userId}
 * @secure
 */
export async function groupMemberControllerRemoveMember(
  groupId: string,
  userId: string,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/group/${groupId}/member/${userId}`,
    method: 'DELETE',
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags Group
 * @name GroupMemberControllerUpdateMemberRole
 * @summary Update the role of a member
 * @request PATCH:/v1/group/{groupId}/member/{userId}/role
 * @secure
 */
export async function groupMemberControllerUpdateMemberRole(
  groupId: string,
  userId: string,
  data: UpdateGroupMemberRoleDto,
  configParams: RequestParams = {},
): Promise<any> {
  return request({
    url: `/v1/group/${groupId}/member/${userId}/role`,
    method: 'PATCH',
    data: data,
    ...configParams,
  })
}
/**
 * No description
 *
 * @tags Group
 * @name GroupMemberControllerLeaveGroup
 * @summary Leave a group
 * @request POST:/v1/group/{groupId}/member/leave
 * @secure
 */
export async function groupMemberControllerLeaveGroup(groupId: string, configParams: RequestParams = {}): Promise<any> {
  return request({
    url: `/v1/group/${groupId}/member/leave`,
    method: 'POST',
    ...configParams,
  })
}
