/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-02 15:03:40
 * @LastEditTime: 2021-08-17 14:06:10
 * @Description: 
 */
import { DatabaseAgent } from "../database"
import { PolicyAgent } from "./policy-agent"


export const PolicyAgentInstance = new PolicyAgent(DatabaseAgent.accessor)