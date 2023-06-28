export type MinioCommandExecOutput = {
  status: 'success' | 'error'
  error?: any
  [key: string]: any
}
