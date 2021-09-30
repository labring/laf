export const ERRORS = {
  // 创建侦听失败 网络原因
  CREATE_WATCH_NET_ERROR: {
    code: 'CREATE_WATCH_NET_ERROR',
    message: 'create watch network error'
  },
  // 创建侦听失败 超过最大连接数限制
  CREATE_WACTH_EXCEED_ERROR: {
    code: 'CREATE_WACTH_EXCEED_ERROR',
    message: 'maximum connections exceed'
  },
  // 创建侦听失败 服务端报错
  CREATE_WATCH_SERVER_ERROR: {
    code: 'CREATE_WATCH_SERVER_ERROR',
    message: 'create watch server error'
  },
  // 连接异常
  CONN_ERROR: {
    code: 'CONN_ERROR',
    message: 'connection error'
  },

  INVALID_PARAM: {
    code: 'INVALID_PARAM',
    message: 'Invalid request param'
  },

  INSERT_DOC_FAIL: {
    code: 'INSERT_DOC_FAIL',
    message: 'insert document failed'
  },

  DATABASE_TRANSACTION_CONFLICT: {
    code: 'DATABASE_TRANSACTION_CONFLICT',
    message: 'database transaction conflict'
  }
}
