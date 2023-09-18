import { DatabaseChangeStream } from ".";
import { WEBSITE_HOSTING_COLLECTION } from "../../constants";
import { DatabaseAgent } from "../../db";



export class WebsiteHostingStreamChange extends DatabaseChangeStream {
  static websiteHosting = []
  static collectionName = WEBSITE_HOSTING_COLLECTION
  
  
  static async onStreamChange(change: any) {
    const websiteHosting = await DatabaseAgent.db.collection(WEBSITE_HOSTING_COLLECTION).find().toArray()
    this.websiteHosting = websiteHosting
  }
}