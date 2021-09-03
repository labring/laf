/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-29 11:35:05
 * @LastEditTime: 2021-09-04 00:00:56
 * @Description:
 */

import { Router } from "express"
import { handleCreateFunction } from "./create"
import { handleGetFunctionById, handleGetFunctions } from "./get"
import { handlePublishFunctions } from "./publish"
import { handleRemoveFunctionById } from "./remove"
import { handlePublishTriggers } from "./trigger"


export const FunctionRouter = Router()

/**
 * Get functions of an application
 */
FunctionRouter.get('/', handleGetFunctions)

/**
 * Get a function by id of an application
 */
FunctionRouter.get('/:func_id', handleGetFunctionById)

/**
 * Create a function
 */
FunctionRouter.post('/create', handleCreateFunction)

/**
 * Update the function's info except the codes & triggers
 */
FunctionRouter.post('/:func_id/info')

/**
 * Update the function's code
 */
FunctionRouter.post('/:func_id/codes')

/**
 * Remove a function by id of an application
 */
FunctionRouter.delete('/:func_id', handleRemoveFunctionById)

/**
 * Create a trigger to the function
 */
FunctionRouter.post('/:func_id/triggers')

/**
 * Update a trigger of the function
 */
FunctionRouter.post('/:func_id/triggers/:trigger_id')

/**
 * Debug the function
 */
FunctionRouter.post('/:func_id/debug')

/**
 * Publish functions of the application
 */
FunctionRouter.post('/publish', handlePublishFunctions)

/**
 * Publish triggers of the application
 */
FunctionRouter.post('/publish/triggers', handlePublishTriggers)