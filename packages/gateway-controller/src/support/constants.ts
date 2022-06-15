/** prefix of sys db collection name */
const coll_prefix = 'sys_'


/** collection names of sys db */
const _ = (cn: string) => coll_prefix + cn
export const CN_ROUTES = _('routes')