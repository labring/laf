import * as assert from 'assert'
import { Params } from './types'
import { PolicyInterface } from './policy/interface'

export enum ProcessTypes {
    Validator = 'validator'
}

export interface HandlerContext {
    ruler: PolicyInterface,
    params: Params,
    injections: any
}

export interface Handler {
    (config: any, context: HandlerContext): any
}

export class Processor {
    protected handler: Handler
    readonly name: string
    readonly type: ProcessTypes
    readonly config: any
    constructor(name: string, handler: Handler, config: any, type: ProcessTypes = ProcessTypes.Validator) {
        assert.ok(handler instanceof Function, `${name}'s handler must be callable`)

        this.name = name
        this.handler = handler

        this.type = type
        this.config = config
    }

    async run(context: HandlerContext): Promise<any> {
        return await this.handler.call(this, this.config, context)
    }
}