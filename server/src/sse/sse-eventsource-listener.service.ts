import { Injectable, Logger } from '@nestjs/common'
import {
    SseDefaultEvent,
    CHANGE_STREAM_PIPELINE,
    SseEventEnum,
    COLLECTION_SSEEVENTSOURCE
} from './types'
import { SystemDatabase } from "../database/system-database";
import { SseClientsService } from './sse-clients.service';



@Injectable()
export class SseEventsourceListenerService {

    private readonly logger = new Logger(SseEventsourceListenerService.name)
    private readonly db = SystemDatabase.db

    constructor(
        private readonly sseClientsService: SseClientsService,
    ) {
        this.listenSseEventChangeStreams()
    }


    // received a change from the collection SseEventSource
    private listenSseEventChangeStreams() {
        try {
            const changeStream = this.db.collection(COLLECTION_SSEEVENTSOURCE).watch(CHANGE_STREAM_PIPELINE)

            changeStream.on("change", changeEvent => {
                const { fullDocument } = changeEvent

                if (fullDocument && fullDocument['_id']) {
                    const { uid, appid, eventType, payload } = fullDocument

                    if (uid && appid && eventType) {
                        const sseDefaultEvent = new SseDefaultEvent(uid, appid, eventType as SseEventEnum, payload)
                        this.sseClientsService.sendDefaultEvent(sseDefaultEvent)
                    }
                }
            })
        } catch (e) {
            this.logger.error(`listenSseEventChangeStreams is error error=${e.msg}`)
        }
    }

}
