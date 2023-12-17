import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryOptions } from 'mongoose';
import { NotificationType } from '../schemas/notification.schema';
import {
  NotificationTypeEnum,
  NotificationTypeFriendRequest,
  NotificationTypeLikePost,
} from '../schemas/notificationTypes';
import { getAdvanceResults } from '../../config/base.service';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export default class NotificationService {
  constructor(
    @InjectModel('Notification')
    readonly notificationModel: Model<NotificationType>,
    private readonly amqpConnection: AmqpConnection
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

  async getUserNotifications(limitQ: number, page: number, userId: string): Promise<any> {
    const limit = limitQ ?? 10;

    const totalUnseeNotifications = await this.notificationModel
      .find({ to: userId, seen: false })
      .countDocuments();

    const advancedResults = await getAdvanceResults(
      this.notificationModel,
      { to: userId },
      page,
      limit,
      undefined,
      undefined,
      { createdAt: -1 },
    );

    const rabbitmq = await this.amqpConnection.request<any>({
      exchange: 'healthline.user.information',
      routingKey: 'user',
      payload: advancedResults.data.map(n => n.from),
      timeout: 10000,
    })

    if(rabbitmq.code !== 200) {
      throw new BadRequestException(rabbitmq.message)
    }

    const data = []
    advancedResults.data.forEach(n => {
      for(let i=0; i<rabbitmq.data.length; i++)
        if(n.from === rabbitmq.data[i].uid) {
          data.push({
            id: n.id,
            from: rabbitmq.data[i],
            type:n.type,
            content: n.content,
            seen: n.seen
          })
          break
        }
    })

    return {
      "code": 200,
      "message": "success",
      "data": { notification: data, totalUnseen: totalUnseeNotifications }
    }
  }

  async markSeen(id: string, options?: QueryOptions): Promise<any> {
    try {
      await this.notificationModel.findByIdAndUpdate(id, options);
    } catch (error) {
      throw new BadRequestException("update_notification_failed")
    }
    return {
      "code": 200,
      "message": "success"
    }
  }
}