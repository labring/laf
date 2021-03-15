interface FileInfo {
  filename: string,  // 文件名，包括扩展名
  ext: string        // 扩展名
  basename: string       // 文件名，不包括扩展名
  size: number       // 文件大小，byte
  path: string       // 文件路径，相对路径
  fullpath?: string   // 文件路径，绝对路径
  orignal_name?: string // 原文件名
  namespace?: string
}

interface FileStorageInterface {

  /**
   * 保存文件
   * @param filePath 要保存的文件路径
   */
  saveFile(filePath: string): Promise<FileInfo>

  getFileInfo(filename: string): Promise<FileInfo>

  deleteFile(filename: string): Promise<boolean>
}