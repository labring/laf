import {ObjectId} from 'mongodb'
import {DatabaseAgent} from "../db";
import {CN_ROUTES} from "../constants";
import {logger} from "./logger";

export enum RouteStatus {
    PREPARED_CREATE = 'prepared_create',
    CREATED = 'created',
    PREPARED_PAUSE = 'prepared_pause',
    PAUSED = 'paused',
    PREPARED_DELETE = 'prepared_deleted',
    DELETED = 'deleted',
}


export interface IRouteData {
    _id?: string
    name: string
    created_by: ObjectId
    appid: string
    status: RouteStatus
    created_at?: Date
    updated_at?: Date
}


export async function createApplicationRoute(name: string, appid: string, uid: any): Promise<Boolean> {
    const now = new Date()
    let data: IRouteData = {
        name: name,
        appid: appid,
        created_by: new ObjectId(uid),
        status: RouteStatus.PREPARED_CREATE,
        created_at: now,
        updated_at: now,
    }
    const ret = await DatabaseAgent.db.collection(CN_ROUTES)
        .insertOne(data as any)
    if (!ret.insertedId) {
        logger.error('create route task successful: {}', appid)
        return false
    }
    return true
}

export async function deleteApplicationRoute(appid: string) {
    const ret = await DatabaseAgent.db.collection<IRouteData>(CN_ROUTES)
        .updateOne({
            appid: appid,
        }, {
            $set: {
                status: RouteStatus.PREPARED_DELETE
            }
        })
    if (!ret.modifiedCount) {
        logger.error('delete route task successful: {}', appid)
        return false
    }
    return true
}