import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type OtpType = Otp & Document;

@Schema({ timestamps: true, validateBeforeSave: true })
export class Otp {
  @Prop()
  userId: string;

  @Prop()
  code: string;

  @Prop()
  timestamp: number;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);