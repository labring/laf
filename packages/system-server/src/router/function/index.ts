/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-29 11:35:05
 * @LastEditTime: 2021-11-02 14:25:55
 * @Description:
 */

import { Router } from "express"
import { handleCreateFunction } from "./create"
import { handleGetAllFunctionTags, handleGetFunctionById, handleGetFunctions } from "./get"
import { handleGetFunctionLogs } from "./logs"
import { handlePublishFunctions, handlePublishOneFunction } from "./publish"
import { handleRemoveFunctionById } from "./remove"
import { handleCreateTrigger, handleRemoveTrigger, handleUpdateTrigger } from "./trigger"
import { handleUpdateFunction, handleUpdateFunctionCode } from "./update"


export const FunctionRouter = Router()

/**
 * Get functions of an application
 */
FunctionRouter.get('/', handleGetFunctions)

/**
 * Get functions of an application
 */
FunctionRouter.get('/tags/all', handleGetAllFunctionTags)

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
FunctionRouter.post('/:func_id/info', handleUpdateFunction)

/**
 * Update the function's code
 */
FunctionRouter.post('/:func_id/code', handleUpdateFunctionCode)

/**
 * Remove a function by id of an application
 */
FunctionRouter.delete('/:func_id', handleRemoveFunctionById)

/**
 * Debug the function
 */
FunctionRouter.post('/:func_id/debug')

/**
 * Publish functions of the application
 */
FunctionRouter.post('/publish', handlePublishFunctions)


/**
 * Publish functions of the application
 */
FunctionRouter.post('/:func_id/publish', handlePublishOneFunction)

/**
 * Get function logs
 */
FunctionRouter.get('/logs/query', handleGetFunctionLogs)

/**
 * Create a trigger to the function
 */
FunctionRouter.post('/:func_id/triggers/create', handleCreateTrigger)

/**
 * Update a trigger of the function
 */
FunctionRouter.post('/:func_id/triggers/:trigger_id', handleUpdateTrigger)

/**
 * Remove a trigger of the function
 */
FunctionRouter.delete('/:func_id/triggers/:trigger_id', handleRemoveTrigger)