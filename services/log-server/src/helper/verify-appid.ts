import jwt from 'jsonwebtoken'
import Config from '../config'

const verifyAppid = (appid: string, token: string): boolean => { 
  try {
    const decoded = jwt.verify(token, Config.JWT_SECRET)
    return decoded['appid'] === appid
  } catch {
    return false
  }
}

export default verifyAppid