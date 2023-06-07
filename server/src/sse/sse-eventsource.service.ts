import { Injectable, Logger } from '@nestjs/common'
import { SystemDatabase } from "../database/system-database";
import { CreateEventSourceDto } from './dto/create-eventsource.dto';
import {User} from "../user/entities/user";
import {COLLECTION_SSEEVENTSOURCE} from "./types";


@Injectable()
export class SseEventsourceService {

    private readonly logger = new Logger(SseEventsourceService.name)
    private readonly db = SystemDatabase.db


    async create(dto: CreateEventSourceDto) {

        const res = await this.db.collection<User>(COLLECTION_SSEEVENTSOURCE).insertOne({
            ...dto,
            createdAt: new Date(),
            updatedAt: new Date(),
        })

        return  res.insertedId
    }

}
