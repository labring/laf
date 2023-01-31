import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import * as querystring from 'node:querystring'
import { ServerConfig } from '../constants'

@Injectable()
export class CasdoorService {
  private logger = new Logger()
  constructor(private readonly httpService: HttpService) {}

  /**
   * Get user from code directly
   * @param code
   * @returns
   */
  async code2user(code: string) {
    const token = await this.code2token(code)
    const user = await this.getUserInfo(token)
    return user
  }

  /**
   * Get user token by code
   * @param code
   * @returns
   */
  async code2token(code: string): Promise<string> {
    try {
      const url = `${ServerConfig.CASDOOR_ENDPOINT}/api/login/oauth/access_token`
      const res = await this.httpService.axiosRef.post(url, {
        client_id: ServerConfig.CASDOOR_CLIENT_ID,
        client_secret: ServerConfig.CASDOOR_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
      })

      const data = res.data as {
        access_token: string
        refresh_token: string
        id_token: string
        token_type: string
        expires_in: number
        scope: string
      }

      return data?.access_token
    } catch (error) {
      return null
    }
  }

  /**
   * Get user info by token
   * @param token
   * @returns
   */
  async getUserInfo(token: string) {
    try {
      const url = `${ServerConfig.CASDOOR_ENDPOINT}/api/userinfo`
      const res = await this.httpService.axiosRef.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = res.data
      const user: CasdoorUserInfo = {
        id: data.id || data.sub,
        username: data.name,
        displayName: data.displayName || data.preferred_username || '',
        email: data.email || undefined,
        phone: data.phone || undefined,
        avatar: data.avatar || data.picture || '',
      }
      return user
    } catch (err) {
      this.logger.error(err)
      return null
    }
  }

  /**
   * Generate login url
   * @returns
   */
  getSignInUrl(): string {
    const endpoint = ServerConfig.CASDOOR_ENDPOINT
    const query = {
      client_id: ServerConfig.CASDOOR_CLIENT_ID,
      redirect_uri: ServerConfig.CASDOOR_REDIRECT_URI,
      response_type: 'code',
      scope: 'openid,profile,phone,email',
      state: 'casdoor',
    }
    const encoded_query = querystring.encode(query)
    const base_api = `${endpoint}/login/oauth/authorize`
    const url = `${base_api}?${encoded_query}`
    return url
  }

  /**
   * Generate register url
   * @returns
   */
  getSignUpUrl(): string {
    const endpoint = ServerConfig.CASDOOR_ENDPOINT
    const app_name = ServerConfig.CASDOOR_APP_NAME
    const url = `${endpoint}/signup/${app_name}`
    return url
  }
}

interface CasdoorUserInfo {
  id: string
  username: string
  email?: string
  phone?: string
  displayName: string
  avatar: string
}
