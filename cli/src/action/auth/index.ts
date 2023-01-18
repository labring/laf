import { authControllerPat2Token } from "../../api/v1/authentication"
import { Pat2TokenDto } from "../../api/v1/data-contracts"
import { DEFAULT_REMOTE_SERVER, TOKEN_EXPIRE } from "../../common/constant"
import { removeSystemConfig, SystemConfig, writeSystemConfig } from "../../config/system"
import { getEmoji } from "../../util/print"


export async function login(pat, options) {

  let systemConfig: SystemConfig = {
    remoteServer: DEFAULT_REMOTE_SERVER,
  }
  writeSystemConfig(systemConfig)

  const patDto: Pat2TokenDto = {
    pat: pat,
  }
  const token = await authControllerPat2Token(patDto)
  const timestamp = Date.parse(new Date().toString()) / 1000
  systemConfig = {
    token: token,
    tokenExpire: timestamp + TOKEN_EXPIRE,
    pat: pat,
    remoteServer: DEFAULT_REMOTE_SERVER,
  }
  if (options.remote) {
    systemConfig.remoteServer = options.remote
  }
  writeSystemConfig(systemConfig)
  console.log(`${getEmoji('🎉')} login success`)
}

export async function logout() {
  removeSystemConfig()
  console.log(`${getEmoji('👋')} logout success`)
}