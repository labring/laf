import { authControllerPat2Token } from "../../api/v1/authentication"
import { Pat2TokenDto } from "../../api/v1/data-contracts"
import { DEFAULT_REMOTE_SERVER, TOKEN_EXPIRE } from "../../common/constant"
import { removeSystemConfig, SystemConfig, writeSystemConfig } from "../../config/system"


export async function login(pat, options) {

  const patDto: Pat2TokenDto = {
    pat: pat,
  }
  const token = await authControllerPat2Token(patDto)

  const timestamp = Date.parse(new Date().toString()) / 1000

  let systemConfig: SystemConfig = {
    token: token,
    tokenExpire: timestamp + TOKEN_EXPIRE,
    pat: pat,
    remoteServer: DEFAULT_REMOTE_SERVER,
  }
  if (options.remote) {
    systemConfig.remoteServer = options.remote
  }
  writeSystemConfig(systemConfig)
  console.log("login success")
}

export async function logout() {
  removeSystemConfig()
  console.log("logout success")
}