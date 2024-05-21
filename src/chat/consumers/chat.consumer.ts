import { Injectable } from "@nestjs/common";
import { RabbitPayload, RabbitRPC } from "@golevelup/nestjs-rabbitmq"
import RoomService from "../services/room.service";
import { CreateRoomDto } from "../dtos/createRoom.dto";

@Injectable()
export class ChatConsumer {
    constructor(
        private readonly roomService: RoomService,
    ) { }

    @RabbitRPC({
        exchange: 'healthline.chat',
        routingKey: 'room', 
        queue: 'room',
    })
    async createRoom(@RabbitPayload() dto: CreateRoomDto): Promise<any> {
        console.log(dto)
        return await this.roomService.createRoom(dto)
    }
}