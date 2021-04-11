import { AxiosStatic } from 'axios'
import { Db } from 'less-api-database'

import { FileStorageInterface } from './storage/interface'

export interface LessInterface {
  fetch: AxiosStatic
  storage(namespace: string): FileStorageInterface
  database(): Db
}