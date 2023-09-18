import EventEmitter from "events";
import { DatabaseAgent } from "../../db";
import { logger } from "../logger";
import Config from "../../config";
import { CLOUD_FUNCTION_COLLECTION, CONFIG_COLLECTION, WEBSITE_HOSTING_COLLECTION } from "../../constants";

const collectionsToWatch = [CONFIG_COLLECTION, CLOUD_FUNCTION_COLLECTION, WEBSITE_HOSTING_COLLECTION] as const;
export class DatabaseChangeStream extends EventEmitter {
  private static instance: DatabaseChangeStream;
  
  private constructor() {
    super();
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new DatabaseChangeStream();
    }
    return this.instance;
  }

  initializeForCollection(collectionName: string) {
    const stream = DatabaseAgent.db.collection(collectionName).watch();

    stream.on('change', (change) => {
      this.emit(collectionName, change);
    });

    stream.once('close', () => {
      stream.off('change', this.emit);
      logger.error(`${collectionName} collection change stream closed.`);

      setTimeout(() => {
        logger.info(`Reconnecting ${collectionName} collection change stream...`);
        this.initializeForCollection(collectionName);
      }, Config.CHANGE_STREAM_RECONNECT_INTERVAL);
    });
  }

  static initialize() {
    const instance = DatabaseChangeStream.getInstance();

    collectionsToWatch.forEach(collectionName => {
      instance.initializeForCollection(collectionName);
    });
  }

  static onStreamChange(collectionName: typeof collectionsToWatch[number], listener: (...args: any[]) => void) {
    const instance = DatabaseChangeStream.getInstance();
    instance.on(collectionName, listener);
  }

  static removeAllListeners() { 
    const instance = DatabaseChangeStream.getInstance();
    instance.removeAllListeners();
  }
}
