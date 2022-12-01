import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { SDK, Config } from 'casdoor-nodejs-sdk'
import * as querystring from 'node:querystring'
import { ServerConfig } from '../constants'

@Injectable()
export class CasdoorService {
  private logger = new Logger()
  constructor(private readonly httpService: HttpService) {}

  /**
   * Get auth config of casdoor
   * @returns
   */
  getCasdoorConfig() {
    const authCfg: Config = {
      endpoint: ServerConfig.CASDOOR_ENDPOINT,
      clientId: ServerConfig.CASDOOR_CLIENT_ID,
      clientSecret: ServerConfig.CASDOOR_CLIENT_SECRET,
      certificate: ServerConfig.CASDOOR_PUBLIC_CERT,
      orgName: ServerConfig.CASDOOR_ORG_NAME,
    }
    return authCfg
  }

  /**
   * Create casdoor SDK instance
   * @returns
   */
  getCasdoorSDK() {
    const sdk = new SDK(this.getCasdoorConfig())
    return sdk
  }

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
      const token = await this.getCasdoorSDK().getAuthToken(code)
      return token
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

      const user = res.data
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
    const authCfg = this.getCasdoorConfig()
    const query = {
      client_id: authCfg.clientId,
      redirect_uri: process.env.CASDOOR_REDIRECT_URI,
      response_type: 'code',
      scope: 'openid,profile,phone,email',
      state: 'casdoor',
    }
    const encoded_query = querystring.encode(query)
    const base_api = `${authCfg.endpoint}/login/oauth/authorize`
    const url = `${base_api}?${encoded_query}`
    return url
  }

  /**
   * Generate register url
   * @returns
   */
  getSignUpUrl(): string {
    const authCfg = this.getCasdoorConfig()
    const app_name = ServerConfig.CASDOOR_APP_NAME
    const url = `${authCfg.endpoint}/signup/${app_name}`
    return url
  }
}
