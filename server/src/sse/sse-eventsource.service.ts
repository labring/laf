import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import {
    SseDefaultEvent,
    CHANGE_STREAM_PIPELINE,
    SseEventEnum,
    COLLECTION_SSEEVENTSOURCE
} from './types'
import { SystemDatabase } from "../database/system-database";
import { CreateEventSourceDto } from './dto/create-eventsource.dto';
import { SseClientsService } from './sse-clients.service';



@Injectable()
export class SseEventsourceService {

    private readonly logger = new Logger(SseEventsourceService.name)
    private readonly mogodb

    constructor(
        private readonly prisma: PrismaService,
        private readonly sseClientsService: SseClientsService,

    ) {
        this.mogodb = SystemDatabase.db
        if (this.mogodb) {
            this.listenSseEventChangeStreams()
        } else {
            this.logger.warn(`mongodb not support changeStreams`)
        }
    }


    async addSseEventSource(dto: CreateEventSourceDto) {
        const sseEventSource = await this.prisma.sseEventSource.create({
            data: {
                ...dto
            },
        })

        return sseEventSource
    }



    // received a change from the collection SseEventSource
    private listenSseEventChangeStreams() {
        const changeStream = this.mogodb.collection(COLLECTION_SSEEVENTSOURCE).watch(CHANGE_STREAM_PIPELINE)

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
    }


}
