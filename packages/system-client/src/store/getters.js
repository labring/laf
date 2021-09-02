const getters = {
  sidebar: state => state.settings.sidebar,
  size: state => state.settings.size,
  device: state => state.settings.device,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  application: state => state.app.application,
  roles: state => state.app.roles,
  permissions: state => state.app.permissions,
  permission_routes: state => state.permission.routes,
  errorLogs: state => state.errorLog.logs
}
export default getters
