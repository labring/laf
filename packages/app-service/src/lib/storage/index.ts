/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-19 15:48:54
 * @LastEditTime: 2021-08-19 16:33:25
 * @Description:
 */

import Config from "../../config"
import { DatabaseAgent } from "../database"
import { GridFSStorage } from "./gridfs-storage"
import { FileStorageInterface } from "./interface"
import { LocalFSStorage } from "./localfs-storage"


/**
 * Create fs storage by configured fs driver
 * @param bucket bucket name
 * @returns 
 */
export function createFileStorage(bucket = 'public'): FileStorageInterface {
  if (Config.FILE_SYSTEM_DRIVER === 'localfs') {
    return new LocalFSStorage(Config.LOCAL_STORAGE_ROOT_PATH, bucket)
  }

  return new GridFSStorage(bucket, DatabaseAgent.accessor.db)
}