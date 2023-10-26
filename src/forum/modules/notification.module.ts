import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationSchema } from '../schemas/notification.schema';
import NotificationService from '../services/notification.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Notification', schema: NotificationSchema }]),
  ],
  controllers: [],
  providers: [NotificationService],
  exports: [NotificationService],
})
export default class NotificationModule {}