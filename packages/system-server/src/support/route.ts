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

export enum RouteType {
    APP = 'app',
    WEBSITE = 'website'
}


export interface IRouteData {
    _id?: string
    name: string
    appid: string
    type: RouteType
    website_id: string
    domain: string[]
    status: RouteStatus
    created_by: ObjectId
    created_at?: Date
    updated_at?: Date
}

export async function createApplicationRoute(name: string, appid: string, uid: any): Promise<Boolean> {
    const route = await DatabaseAgent.db.collection(CN_ROUTES).findOne({
        appid: appid,
        type: RouteType.APP,
    })
    const now = new Date()
    if (route) {
        const ret = await DatabaseAgent.db.collection(CN_ROUTES).updateOne({
            appid: appid,
            type: RouteType.APP,
        }, {
            $set: {
                status: RouteStatus.PREPARED_CREATE,
                created_at: now,
                updated_at: now,
            }
        })
        if (!ret.modifiedCount) {
            logger.error('update app route task failed: {}', appid)
            return false
        }
    } else {
        let data: IRouteData = {
            name: name,
            appid: appid,
            type: RouteType.APP,
            website_id: null,
            domain: [],
            status: RouteStatus.PREPARED_CREATE,
            created_by: new ObjectId(uid),
            created_at: now,
            updated_at: now,
        }
        const ret = await DatabaseAgent.db.collection(CN_ROUTES)
            .insertOne(data as any)
        if (!ret.insertedId) {
            logger.error('create app route task successful: {}', appid)
            return false
        }
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


export async function createWebsiteRoute(name: string, appid: string, websiteId: string, domain: string[], uid: any): Promise<Boolean> {
    const route = await DatabaseAgent.db.collection(CN_ROUTES).findOne({
        appid: appid,
        websiteId: websiteId
    })
    const now = new Date()
    if (route) {
        const ret = await DatabaseAgent.db.collection(CN_ROUTES).updateOne({
            appid: appid,
            websiteId: websiteId
        }, {
            $set: {
                domain: domain,
                status: RouteStatus.PREPARED_CREATE,
                created_at: now,
                updated_at: now,
            }
        })
        if (!ret.modifiedCount) {
            logger.error('update route task failed: {}', appid)
            return false
        }
    } else {
        let data: IRouteData = {
            name: name,
            appid: appid,
            type: RouteType.WEBSITE,
            website_id: websiteId,
            domain: domain,
            status: RouteStatus.PREPARED_CREATE,
            created_by: new ObjectId(uid),
            created_at: now,
            updated_at: now,
        }
        const ret = await DatabaseAgent.db.collection(CN_ROUTES)
            .insertOne(data as any)
        if (!ret.insertedId) {
            logger.error('create route task failed: {}', appid)
            return false
        }
    }

    return true
}

export async function deleteWebsiteRoute(appid: string, websiteId: string) {
    const ret = await DatabaseAgent.db.collection<IRouteData>(CN_ROUTES)
        .updateOne({
            appid: appid,
            website_id: websiteId,
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
