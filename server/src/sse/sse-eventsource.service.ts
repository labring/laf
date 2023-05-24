import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { SsePongEvent, SseDefaultEvent, SseAbstractEvent, CHANGE_STREAM_PIPELINE } from './types'
import { SystemDatabase } from "../database/system-database";
import { CreateEventSourceDto } from './dto/create-eventsource.dto';



@Injectable()
export class SseEventsourceService {

    private readonly logger = new Logger(SseEventsourceService.name)
    private readonly mogodb

    constructor(
        private readonly prisma: PrismaService,
    ) {
        this.mogodb = SystemDatabase.db()
        if (this.mogodb) {
            this.initSseEventChangeStreams()
        } else {
            this.logger.warn(`mogodb not support changeStreams`)
        }
    }


    async addSseEventSource(dto: CreateEventSourceDto) {
        const { uid, appid, payload } = dto
        const sseEventSource = await this.prisma.sseEventSource.create({
            data: {
                uid,
                appid,
                payload,
            },
        })

        return sseEventSource
    }



    // https://www.mongodb.com/docs/manual/changeStreams/
    // todo 监听集合的写入操作
    initSseEventChangeStreams() {
        const changeStream = this.mogodb.collection("SseEventSource").watch(CHANGE_STREAM_PIPELINE)

        changeStream.on("change", changeEvent => {
            const { fullDocument } = changeEvent

            // process any change event
            console.log("received a change to the collection: \t", JSON.stringify(changeEvent))
        })
    }


}
