import axios from 'axios'
import { Config } from './config'


export const api = axios.create({
  baseURL: Config.API_ENDPOINT,
  validateStatus: (status) => {
    return status >= 200 && status <= 430
  }
})