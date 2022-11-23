/**
 * Get system namespace of laf (in kubernetes)
 * @returns
 */
export function GetSystemNamespace(): string {
  return 'laf-system'
}

/**
 * Get application namespace name by appid (in kubernetes)
 * @param appid
 * @returns
 */
export function GetApplicationNamespaceById(appid: string): string {
  return appid
}
