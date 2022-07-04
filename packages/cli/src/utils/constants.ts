
import * as path from 'node:path'
import { homedir } from 'node:os'


export const CREDENTIALS_DIR = path.resolve(homedir(), ".laf-credentials")
export const AUTH_FILE = path.resolve(CREDENTIALS_DIR, "auth.json")

export const LAF_CONFIG_FILE = path.resolve(process.cwd(), "laf.json")

export const PROJECT_DIR = path.resolve(process.cwd(), "@laf")

export const FUNCTIONS_DIR = "functions"

export const FUNCTIONS_FILE = "index.ts"

export const DEFAULT_SERVER = "https://console.lafyun.com"