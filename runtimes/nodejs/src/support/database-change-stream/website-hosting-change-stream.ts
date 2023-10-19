import { DatabaseChangeStream } from '.'
import { WEBSITE_HOSTING_COLLECTION } from '../../constants'
import { DatabaseAgent } from '../../db'

export class WebsiteHostingChangeStream {
  static websiteHosting = []

  static initialize() {
    this.onStreamChange()

    DatabaseChangeStream.onStreamChange(
      WEBSITE_HOSTING_COLLECTION,
      this.onStreamChange.bind(this),
    )
  }

  static async onStreamChange() {
    const websiteHosting = await DatabaseAgent.db
      .collection(WEBSITE_HOSTING_COLLECTION)
      .find()
      .toArray()
    this.websiteHosting = websiteHosting
  }
}
