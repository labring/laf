import {ObjectId} from 'mongodb'
import {CN_ROUTES} from "./constants";
import {DatabaseAgent} from "./db";

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

/**
 * Get route list in pointed status
 * @param status
 * @returns
 */
export async function getRoutesInStatus(status: RouteStatus) {
  const db = DatabaseAgent.db
  const docs = await db.collection<IRouteData>(CN_ROUTES)
      .find({status: status})
      .toArray()

  return docs
}

/**
 * Update route status
 * @param appid
 * @param from original status
 * @param to target status to update
 * @returns
 */
export async function updateRouteStatus(appid: string, from: RouteStatus, to: RouteStatus) {
  const db = DatabaseAgent.db
  const r = await db.collection<IRouteData>(CN_ROUTES)
      .updateOne({
        appid: appid,
        status: from,
      }, {
        $set: {
          status: to
        }
      })

  return r.modifiedCount
}
