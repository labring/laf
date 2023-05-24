import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { SsePongEvent, SseDefaultEvent, SseAbstractEvent, CHANGE_STREAM_PIPELINE, SseEventEnum } from './types'
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
            this.initSseEventChangeStreams()
        } else {
            this.logger.warn(`mogodb not support changeStreams`)
        }
    }


    async addSseEventSource(dto: CreateEventSourceDto) {
        // const { uid, appid, payload, eventType } = dto
        const sseEventSource = await this.prisma.sseEventSource.create({
            data: {
                ...dto
            },
        })

        return sseEventSource
    }



    // https://www.mongodb.com/docs/manual/changeStreams/
    // todo 监听集合的写入操作
    initSseEventChangeStreams() {
        const changeStream = this.mogodb.collection("SseEventSource").watch(CHANGE_STREAM_PIPELINE)

        changeStream.on("change", changeEvent => {
            // process any change event
            console.log("received a change to the collection: \t", JSON.stringify(changeEvent))
            const { fullDocument } = changeEvent

            if (fullDocument && fullDocument['_id']) {
                const { uid, appid, eventType, payload } = fullDocument

                if (uid && appid && eventType) {
                    SseEventEnum
                    // const sseDefaultEvent = new SseDefaultEvent(uid, appid, SseEventEnum.NPMINSTALL
                    //     , payload)

                    const sseDefaultEvent = new SseDefaultEvent(uid, appid, eventType as SseEventEnum, payload)

                    this.sseClientsService.sendDefaultEvent(sseDefaultEvent)
                }
            }
        })
    }


}
