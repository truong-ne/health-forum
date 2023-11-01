import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, PopulateOptions, QueryOptions, UpdateQuery } from 'mongoose';
import { Comment, CommentSchema, CommentType } from '../schemas/comment.schema';
import NotificationService from '../services/notification.service';
import { PostsService } from '../services/post.service';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { ExpectedReturnType, UserReturnType } from '../../config/ExpectedReturnType';
import { CommentAddDto } from '../dtos/commentAdd.dto';
import { BaseService } from '../../config/base.service';
import { NotificationTypeEnum } from '../schemas/notificationTypes';

@Injectable()
export default class CommentsService extends BaseService {
  constructor(
    @InjectModel('Comment') public commentModel: Model<CommentType>, 
    private postsService: PostsService,
    private notificationsService: NotificationService,
    private readonly amqpConnection: AmqpConnection
  ) {
    super()
  }
  create(comment: Comment) {
    return this.commentModel.create(comment);
  }

  findById(id: string, options?: QueryOptions) {
    return this.commentModel.findById(id, undefined, options);
  }

  find(query: FilterQuery<CommentType>, options?: QueryOptions) {
    return this.commentModel.find(query, undefined, options);
  }

  findOne(query: FilterQuery<CommentType>, options?: QueryOptions) {
    return this.commentModel.findOne(query, undefined, options);
  }

  findByIdAndDelete(id: string) {
    return this.commentModel.findByIdAndDelete(id);
  }

  findByIdAndUpdate(id: string, update: UpdateQuery<CommentType>, options?: QueryOptions) {
    return this.commentModel.findByIdAndUpdate(id, update, {
      new: options?.new ?? true,
      runValidators: options?.runValidators ?? true,
      ...options,
    });
  }

  async cascadeDeleteComments(postId: string) {
    await this.commentModel.deleteMany({ postId });
  }

  async getPostComments(postId: string): Promise<any> {
    const post = await this.postsService.findById(postId);
    if (!post) throw new NotFoundException("post_not_found")

    const comments = await this.find({ postId: postId }, { sort: { createdAt: -1 } });
  
    const rabbitmq = await this.amqpConnection.request<ExpectedReturnType<UserReturnType>>({
      exchange: 'healthline.user.information',
      routingKey: 'user',
      payload: comments.map(c => c.user),
      timeout: 10000,
    })

    if(rabbitmq.code !== 200) {
      throw new BadRequestException(rabbitmq.message)
    }

    const data = []
    comments.forEach(c => {
      for(let i=0; i<rabbitmq.data.length; i++)
        if(c.user === rabbitmq.data[i].uid) {
          data.push({
            id: c.id,
            user: rabbitmq.data[i],
            postId:c.postId,
            text: c.text,
            likes: c.likes,
            createdAt: c.createdAt
          })
          break
        }
    })
    
    return {
      "code": 200,
      "message": "success",
      "data": data
    }
  }

  async addComment(dto: CommentAddDto, userId: string): Promise<any> {
    const post = await this.postsService.findById(dto.postId);

    if (!post) throw new NotFoundException("post_not_found")

    try {
      await this.create({
        ...dto,
        user: userId,
        likes: 0,
        createdAt: this.VNTime(),
        updatedAt: this.VNTime()
      });
    } catch (error) {
      throw new BadRequestException("create_comment_failed")
    }

    const isPostAuthor = userId === String(post.user);
    if (!isPostAuthor) {
      this.notificationsService.sendPostNotificationToUser(
          userId,
          post.user,
          post.id,
          NotificationTypeEnum.postCommentAdded,
      );
    }

    return {
      "code": 200,
      "message": "success",
    }
  }

}