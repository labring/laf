import { Injectable, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { SDK, Config } from 'casdoor-nodejs-sdk'
import * as querystring from 'node:querystring'

@Injectable()
export class AuthService {
  private logger = new Logger()
  constructor(private jwtService: JwtService) {}

  /**
   * Get auth config of casdoor
   * @returns
   */
  getCasdoorConfig() {
    const authCfg: Config = {
      endpoint: process.env.CASDOOR_ENDPOINT,
      clientId: process.env.CASDOOR_CLIENT_ID,
      clientSecret: process.env.CASDOOR_CLIENT_SECRET,
      certificate: process.env.CASDOOR_PUBLIC_CERT,
      orgName: process.env.CASDOOR_ORG_NAME,
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
      const user = this.jwtService.verify(token, {
        publicKey: this.getCasdoorConfig().certificate,
      })
      Object.keys(user).forEach((key) => {
        if (user[key] === '' || user[key] === null) delete user[key]
      })
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
    const app_name = process.env.CASDOOR_APP_NAME
    const url = `${authCfg.endpoint}/signup/${app_name}`
    return url
  }
}
