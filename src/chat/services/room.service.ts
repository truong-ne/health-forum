import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { RoomType } from "../schemas/room.schema";
import { MessageType } from "../schemas/message.schema";
import { NotFoundError } from "rxjs";
import { Code } from "mongodb";
import { AddMessageDto } from "../dtos/addMessage.dto";
import { BaseService } from "src/config/base.service";
import { CreateRoomDto } from "../dtos/createRoom.dto";

@Injectable()
export default class RoomService extends BaseService{
  constructor(
    @InjectModel('Room') public chatModel: Model<RoomType>,
    @InjectModel('Message') public messageModel: Model<MessageType>,
  ) {
    super()
  }
  async checkExistingConversation(roomId: string, userId: string) {
    const room = await this.chatModel.findOne(
        { _id: roomId }
    );

    if(!room.members.includes(userId))
        throw new UnauthorizedException('unauthorize')

    if(!room)
        throw new NotFoundException('room_not_found')

    const ROOM_EXPIRE_TIME = 7 * 24 * 60 * 60 * 1000;
    const currentTime = this.VNTime().getTime();
    console.log(currentTime - room.createdAt.getTime(), ROOM_EXPIRE_TIME)
    if(currentTime - room.createdAt.getTime() > ROOM_EXPIRE_TIME)
        throw new BadRequestException('room_is_expire')

    return room
  }

  async getMessage(room_id: string) {
    return await this.messageModel.find({ room_id: room_id }, undefined, { sort: { createdAt: 1 } });
  }

  async addMessage(dto: AddMessageDto, sender_id: string) {
    const room = await this.chatModel.findOne({ _id: dto.room_id });
    console.log(dto.room_id)
    if (!room) throw new NotFoundException("room_not_found");

    if (!room.members.includes(sender_id))
        throw new UnauthorizedException('unauthorize')

    const message = {
        room_id: dto.room_id,
        sender_id: sender_id,
        text: dto.text,
        type: dto.type,
        createdAt: this.VNTime(),
    };

    await this.messageModel.create(message);
  }

  async createRoom(dto: CreateRoomDto){
    const room = await this.chatModel.findOne({ member: [dto.doctorId, dto.userId] });
    if (room) {
      await room.updateOne({
        createdAt: this.VNTime(),
      });
    }

    const data = {
        consultation: dto.consultationId,
        members: [dto.doctorId, dto.userId],
        isSeen: [false, false],
        createdAt: this.VNTime()
    }

    await this.chatModel.create(data)

    return {
        code: 200,
        message: 'success'
    }
  }

  async getRoom(ids: string[]){
    const rooms = await this.chatModel.find({ consultation: { $in: ids } });

    return rooms
  }
}