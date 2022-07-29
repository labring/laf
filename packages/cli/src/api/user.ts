import axios from 'axios'

/**
 * 根据 server 登陆
 * @param {string} server
 * @param {Object} obj
 * @returns
 */
export async function loginApi(server: string, obj: Object) {
    // remote server login url
    const url = `${server}/sys-api/account/login`

    try {
        const result = await axios.post(url, obj, { timeout: 5000 })
        const response = result.data
        if (response.code != 0) {
            return false
        }

        return { access_token: response.data.access_token, expire_time: response.data.expire }
    } catch (err) {
        console.error(err.message)
        process.exit(1)
    }
}