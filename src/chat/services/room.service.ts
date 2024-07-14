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
import { text } from "stream/consumers";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";

@Injectable()
export default class RoomService extends BaseService{
  constructor(
    @InjectModel('Room') public chatModel: Model<RoomType>,
    @InjectModel('Message') public messageModel: Model<MessageType>,
    public readonly amqpConnection: AmqpConnection
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

    // const ROOM_EXPIRE_TIME = 30 * 24 * 60 * 60 * 1000;
    // const currentTime = this.VNTime().getTime();
    // console.log(currentTime - room.createdAt.getTime(), ROOM_EXPIRE_TIME)
    // if(currentTime - room.createdAt.getTime() > ROOM_EXPIRE_TIME)
    //     throw new BadRequestException('room_is_expire')

    return room
  }

  async getMessage(room_id: string) {
    return await this.messageModel.find({ room_id: room_id }, undefined, { sort: { createdAt: 1 } });
  }

  async addMessage(dto: AddMessageDto, sender_id: string) {
    if(dto.text === '')
      throw new BadRequestException('text_not_null')
    const room = await this.chatModel.findOne({ _id: dto.room_id });
    if (!room) throw new NotFoundException("room_not_found");

    if (!room.members.includes(sender_id))
        throw new UnauthorizedException('unauthorize')

    await room.updateOne({
      lastMessage: dto.text,
    });

    const message = {
        room_id: dto.room_id,
        sender_id: sender_id,
        text: dto.text,
        type: dto.type,
        createdAt: this.VNTime(),
    };

    await this.messageModel.create(message);

    return room.medical_id
  }

  async createRoom(dto: CreateRoomDto){
    const room = await this.chatModel.findOne({ members: [ dto.doctorId, dto.userId ],medical_id: dto.medicalId });
    if (room) {
      room.createdAt = this.VNTime()
      room.consultation.push(dto.consultationId)

      await room.updateOne(room);
    } else {
      const data = {
          consultation: [dto.consultationId],
          medical_id: dto.medicalId,
          members: [dto.doctorId, dto.userId],
          isSeen: [false, false],
          lastMessage: '',
          createdAt: this.VNTime()
      }

      await this.chatModel.create(data)
    }

    return {
        code: 200,
        message: 'success'
    }
  }

  async getRoom(ids: string[][]){
    const rooms = []
    const flag = {}
    for(let id of ids) {
      const room = await this.chatModel.findOne({ members: [ id[0], id[1] ],medical_id: id[2] });
      if(!flag[room._id]){
        flag[room._id] = true
        rooms.push(room)
      }
    }

    return rooms
  }

  async getMedicalRoom(userId: string, medicalId: string){
    const rooms = await this.chatModel.find({ medical_id: medicalId });

    if(rooms[0].members[1] !== userId)
      throw new UnauthorizedException('unauthorize')

    const medical = await this.getMedicalRecord([medicalId])
    const doctors = await this.getDataRabbitMq(Array.from(new Set(rooms.map(r => r.members[0]))))

    const data = []
    rooms.forEach(r => {
      for(let item of doctors)
        if(r.members[0] === item.id) {
          data.push({
            id: r._id,
            consultation: r.consultation,
            medical: medical.data[0],
            doctor: item,
            members: r.members,
            isSeen: r.isSeen,
            lastMessage: r.lastMessage,
            createdAt: r.createdAt
          })
          break
        }
    })

    return data
  }

  async getDoctorRoom(doctorId: string) {
    const rooms = await this.chatModel.find({ members: { $in: [doctorId] } })

    const medical = await this.getMedicalRecord(Array.from(new Set(rooms.map(r => r.medical_id))))
    const doctors = await this.getDataRabbitMq([doctorId])

    const data = []
    rooms.forEach(r => {
      for(let item of medical.data)
        if(r.medical_id === item.id) {
          data.push({
            id: r._id,
            consultation: r.consultation,
            medical: item,
            doctor: doctors[0],
            members: r.members,
            isSeen: r.isSeen,
            lastMessage: r.lastMessage,
            createdAt: r.createdAt
          })
          break
        }
    })
    console.log(data)

    return data
  }
}