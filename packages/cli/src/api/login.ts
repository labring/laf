import {postData }from "./request"



export async function loginapi(obj:Object) {
    return await postData('/sys-extension-api/func/password-login',obj)
}