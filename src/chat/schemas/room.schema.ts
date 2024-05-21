import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type RoomType = Room & Document;

@Schema({ timestamps: true, validateBeforeSave: true })
export class Room {
  @Prop({ required: true })
  members: string[]

  @Prop({ required: true, default: [false, false] })
  isSeen: boolean[]

  @Prop()
  createdAt: Date;
}

export const RoomSchema = SchemaFactory.createForClass(Room);