import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryOptions } from 'mongoose';
import { NotificationType } from '../schemas/notification.schema';
import {
  NotificationTypeConsultation,
  NotificationTypeEnum,
  NotificationTypeLikePost,
} from '../schemas/notificationTypes';
import { BaseService, getAdvanceResults } from '../../config/base.service';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { PostsService } from './post.service';

@Injectable()
export default class NotificationService extends BaseService {
  constructor(
    @InjectModel('Notification')
    readonly notificationModel: Model<NotificationType>,
    private postsService: PostsService,
    public readonly amqpConnection: AmqpConnection
  ) {
    super()
  }

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

    const post = (await this.postsService.findById(postId)).data
    const sender = await this.getDataRabbitMq([from])

    return {
      from: sender[0],
      to: to,
      type: type,
      content: {
        image: post.photo[0],
        description: post.description
      },
      seen: false
    }
  }

  async sendConsultationNotificationToUser(from: string, to: string, consultationId: string, type: NotificationTypeEnum) {
    const notification: NotificationTypeConsultation = {
      from,
      to,
      type: type,
      content: {
        consultationId,
      }
    };
    await this.notificationModel.create(notification);

    const consultation = await this.getConsultationInformation([consultationId])
    const sender = await this.getDataRabbitMq([from])

    return {
      from: sender[0],
      to: to,
      type: type,
      content: consultation,
      seen: false
    }
  }

  async getUserNotifications(userId: string): Promise<any> {
    const totalUnseeNotifications = await this.notificationModel
      .find({ to: userId, seen: false })
      .countDocuments();


    const notifications = await this.notificationModel.find({ to: userId }, undefined, { sort: { createdAt: -1 } });
    const rabbitmq = await this.getDataRabbitMq(notifications.map(n => n.from))
    const data = []
    for(let n of notifications) {
      for(let item of rabbitmq)
        if(n.from === item.id) {
          var content
          if (
            n.type === NotificationTypeEnum.postLike ||
            n.type === NotificationTypeEnum.postCreate ||
            n.type === NotificationTypeEnum.postCommentAdded ||
            n.type === NotificationTypeEnum.postCommentLiked
          ) {
            const temp: any = n
            const post = (await this.postsService.findById(temp.content.postId)).data
            content = {
              image: post.photo[0],
              description: post.description
            }
          } 
          if (
            n.type === NotificationTypeEnum.consultationRequest ||
            n.type === NotificationTypeEnum.consultationConfirmed ||
            n.type === NotificationTypeEnum.consultationDenied ||
            n.type === NotificationTypeEnum.consultationCanceled
          ) {
            const temp: any = n
            const consultation = await this.getConsultationInformation([temp.content.consultationId])
            content = consultation
          }
          data.push({
            id: n.id,
            from: item,
            type:n.type,
            content: content,
            seen: n.seen
          })          
          break
        }      
    }

    return { notification: data, totalUnseen: totalUnseeNotifications }
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