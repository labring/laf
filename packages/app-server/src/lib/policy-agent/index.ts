import { Globals } from "../globals"
import { PolicyAgent } from "./policy-agent"


export const PolicyAgentInstance = new PolicyAgent(Globals.accessor)