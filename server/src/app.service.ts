import { Injectable } from '@nestjs/common'
import { SDK, Config } from 'casdoor-nodejs-sdk'
import * as querystring from 'node:querystring'
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello laf!'
  }

  /**
   * Get auth config of casdoor
   * @returns
   */
  getAuthConfig() {
    const authCfg: Config = {
      endpoint: process.env.CASDOOR_ENDPOINT,
      clientId: process.env.CASDOOR_CLIENT_ID,
      clientSecret: process.env.CASDOOR_CLIENT_SECRET,
      certificate: Buffer.from(
        process.env.CASDOOR_PUBLIC_CERT,
        'base64',
      ).toString('ascii'),
      orgName: process.env.CASDOOR_ORG_NAME,
    }
    return authCfg
  }

  /**
   * Create casdoor SDK instance
   * @returns
   */
  getAuthSDK() {
    const sdk = new SDK(this.getAuthConfig())
    return sdk
  }

  /**
   * Get user token by code
   * @param code
   * @returns
   */
  async code2token(code: string): Promise<string> {
    try {
      const token = await this.getAuthSDK().getAuthToken(code)
      return token
    } catch (error) {
      return null
    }
  }

  /**
   * Generate login url
   * @returns
   */
  getSignInUrl(): string {
    const authCfg = this.getAuthConfig()
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
    const authCfg = this.getAuthConfig()
    const app_name = process.env.CASDOOR_APP_NAME
    const url = `${authCfg.endpoint}/signup/${app_name}`
    return url
  }
}
