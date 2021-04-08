import { AxiosStatic } from 'axios'
import { Db } from 'less-api-database'
import * as crypto from 'crypto'
import * as path from 'path'
import * as querystring from 'querystring'
import * as url from 'url'
import * as assert from 'assert'
import * as lodash from 'lodash'

import { FileStorageInterface } from './storage/interface'

export interface LessInterface {
  fetch: AxiosStatic
  crypto: typeof crypto
  path: typeof path
  qs: typeof querystring
  url: typeof url
  Buffer: typeof Buffer
  assert: typeof assert
  lodash: typeof lodash

  storage(namespace: string): FileStorageInterface
  database(): Db
}
