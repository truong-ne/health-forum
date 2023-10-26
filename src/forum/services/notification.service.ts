import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationType } from '../schemas/notification.schema';
import {
  NotificationTypeEnum,
  NotificationTypeFriendRequest,
  NotificationTypeLikePost,
} from '../schemas/notificationTypes';

@Injectable()
export default class NotificationService {
  constructor(
    @InjectModel('Notification')
    readonly notificationModel: Model<NotificationType>,
  ) {}

  async sendPostNotificationToUser(from: string, to: string, postId: string, type: NotificationTypeEnum) {
    const notification: NotificationTypeLikePost = {
      from,
      to,
      type: type,
      content: {
        postId,
      },
    };
    await this.notificationModel.create(notification);
  }
}