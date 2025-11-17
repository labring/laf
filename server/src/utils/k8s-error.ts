interface K8sError {
  message: string
  stack?: string
  response?: {
    statusCode?: number
    statusText?: string
    body?: {
      reason?: string
      code?: number
      details?: any
    }
  }
}
/**
 * Format k8s error information for debugging and logging
 * @param error - Error object thrown by k8s operations
 * @returns Formatted error details object
 */
export function formatK8sError(error: K8sError | Error | any) {
  return {
    message: error.message,
    statusCode: error.response?.statusCode,
    statusText: error.response?.statusText,
    body: error.response?.body,
    reason: error.response?.body?.reason,
    code: error.response?.body?.code,
    details: error.response?.body?.details,
    stack: error.stack,
  }
}

/**
 * Format k8s error as JSON string for log output
 * @param error - Error object thrown by k8s operations
 * @returns Formatted JSON string
 */
export function formatK8sErrorAsJson(error: K8sError | Error | any): string {
  try {
    return JSON.stringify(formatK8sError(error), null, 2)
  } catch (e) {
    return JSON.stringify({ message: error.message, stringifyError: e.message })
  }
}
