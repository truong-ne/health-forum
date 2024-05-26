import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import * as dotenv from 'dotenv'
import { RoomSchema } from './schemas/room.schema';
import { MessageSchema } from './schemas/message.schema';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import RoomService from './services/room.service';
import { ChatGateway } from './gateways/chat.gateway';
import { ChatConsumer } from './consumers/chat.consumer';
import ChatController from './controllers/chat.controller';

dotenv.config()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Room', schema: RoomSchema }, { name: 'Message', schema: MessageSchema }]),
    RabbitMQModule.forRoot(RabbitMQModule, {
        exchanges: [
            {
                name: 'healthline.user.information',
                type: 'direct'
            }
        ],
        uri: process.env.RABBITMQ_URL,
        connectionInitOptions: { wait: false, reject: true, timeout: 10000 },
        enableControllerDiscovery: true
    }),
  ],
  controllers: [ChatController],
  providers: [RoomService, ChatGateway, ChatConsumer],
  exports: [RoomService],
})
export default class ChatModule {}