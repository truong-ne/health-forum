import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationSchema } from '../schemas/notification.schema';
import NotificationService from '../services/notification.service';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import * as dotenv from 'dotenv'
import PostsModule from './post.module';
import NotificationsController from '../controllers/notification.controller';

dotenv.config()
@Module({
  imports: [
    PostsModule,
    MongooseModule.forFeature([{ name: 'Notification', schema: NotificationSchema }]),
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
  controllers: [NotificationsController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export default class NotificationModule {}