
import  * as path  from 'node:path'
import {homedir} from 'node:os'

const credentials_dir = ".laf-credentials"

const auth_file = "auth.json"

export const API_BASE_URL = "https://console.lafyun.com/"
export const CREDENTIALS_DIR = path.resolve(homedir(),credentials_dir)
export const AUTH_FILE = path.resolve(CREDENTIALS_DIR,auth_file)

export const LAF_FILE = "laf.json"