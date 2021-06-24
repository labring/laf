export interface FileInfo {
  filename: string,  // 文件名，包括扩展名
  ext: string        // 扩展名
  basename: string       // 文件名，不包括扩展名
  size: number       // 文件大小，byte
  path: string       // 文件路径，相对路径
  fullpath?: string   // 文件路径，绝对路径
  orignal_name?: string // 原文件名
  namespace?: string
}

export interface FileStorageInterface {

  /**
   * 保存文件，主要用于将上传的临时文件保存（移动）到 storage 目录
   * @param filePath 要保存的文件路径
   */
  saveFile(filePath: string): Promise<FileInfo>

  /**
   * 获取文件信息
   * @param filename 文件名
   */
  getFileInfo(filename: string): Promise<FileInfo>

  /**
   * 删除文件
   * @param filename 文件名
   */
  deleteFile(filename: string): Promise<boolean>

  /**
   * 读取文件
   * @param {string} filename 文件名
   */
  readFile(filename: string, encoding?: string): Promise<Buffer>

  /**
   * 检查文件夹名是否安全
   * @param {string} name
   */
  checkSafeDirectoryName(name: string): boolean

  /**
   * 检查文件名是否安全
   * @param {string} name
   */
  checkSafeFilename(name: string): boolean
}