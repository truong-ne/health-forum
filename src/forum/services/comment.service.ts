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
import { CommentUpdateDto } from '../dtos/commentUpdate.dto';

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

  findByIdAndDelete(id: string, userId: string) {
    return this.commentModel.findOneAndDelete({ id: id, user: userId });
  }

  async findByIdAndUpdate(dto: CommentUpdateDto, id: string, options?: QueryOptions) {
    const update: UpdateQuery<CommentType> = {
      $set: { text: dto.text },
    };
    const comment = await this.commentModel.findOneAndUpdate({ _id: dto.commentId, user: id }, update, {
      new: options?.new ?? true,
      runValidators: options?.runValidators ?? true,
      ...options,
    });
    if (!comment) throw new NotFoundException('comment_not_found');
    const rabbitmq = await this.amqpConnection.request<ExpectedReturnType<UserReturnType>>({
      exchange: 'healthline.user.information',
      routingKey: 'user',
      payload: [id],
      timeout: 10000,
    })

    if(rabbitmq.code !== 200) {
      return rabbitmq.message
    }

    return {
      id: comment.id,
      user: rabbitmq.data[0],
      text: comment.text,
      likes: comment.likes,
      createdAt: comment.createdAt
    }
  }

  async getPostComments(postId: string): Promise<any> {
    const post = await this.postsService.findById(postId);
    if (!post) throw new NotFoundException("post_not_found")

    const comments = await this.find({ postId: postId }, { sort: { createdAt: 1 } });
  
    const rabbitmq = await this.amqpConnection.request<ExpectedReturnType<UserReturnType>>({
      exchange: 'healthline.user.information',
      routingKey: 'user',
      payload: comments.map(c => c.user),
      timeout: 10000,
    })

    if(rabbitmq.code !== 200) {
      return rabbitmq.message
    }

    const data = []
    comments.forEach(c => {
      for(let i=0; i<rabbitmq.data.length; i++)
        if(c.user === rabbitmq.data[i].uid) {
          data.push({
            id: c.id,
            user: rabbitmq.data[i],
            text: c.text,
            likes: c.likes,
            createdAt: c.createdAt
          })
          break
        }
    })
    
    return data
  }

  async addComment(dto: CommentAddDto, userId: string): Promise<any> {
    const post = await this.postsService.findById(dto.postId);

    if (!post) throw new NotFoundException("post_not_found")

    var comment
    try {
      comment = await this.create({
        ...dto,
        user: userId,
        likes: [],
        createdAt: this.VNTime(),
        updatedAt: this.VNTime()
      });
    } catch (error) {
      throw new BadRequestException(error)
    }

    const isPostAuthor = userId === String((await post.data).user);
    if (!isPostAuthor) {
      this.notificationsService.sendPostNotificationToUser(
          userId,
          (await post.data).user,
          (await post.data).id,
          NotificationTypeEnum.postCommentAdded,
      );
    }

    const rabbitmq = await this.amqpConnection.request<ExpectedReturnType<UserReturnType>>({
      exchange: 'healthline.user.information',
      routingKey: 'user',
      payload: [userId],
      timeout: 10000,
    })

    if(rabbitmq.code !== 200) {
      return rabbitmq.message
    }

    return {
      id: comment.id,
      user: rabbitmq.data[0],
      text: comment.text,
      likes: comment.likes,
      createdAt: comment.createdAt
    }
  }

  async likeComment(id: string, userId: string): Promise<any> {
    const comment = await this.findById(id);
    if (!comment) throw new NotFoundException('comment_not_found');
    if (comment.likes.includes(userId))
      throw new BadRequestException("comment_is_liked_already")

    await comment.updateOne(
      {
        $push: { likes: userId },
      },
      { runValidators: true },
    );

    const isPostCreator = userId === String(comment.user);
    if (!isPostCreator) {
      this.notificationsService.sendPostNotificationToUser(
        userId,
        comment.user,
        String(comment.postId),
        NotificationTypeEnum.postCommentLiked,
      );
    }

    return {
      "code": 200,
      "message": "success"
    }
  }

  async unlikeComment(id: string, userId: string): Promise<any> {
    const comment = await this.findById(id);
    if (!comment) throw new NotFoundException('comment_not_found');
    if (!comment.likes.includes(userId))
      throw new BadRequestException("comment_is_not_liked")

    await comment.updateOne({ $pull: { likes: userId } });

    return {
      "code": 200,
      "message": "success"
    }
  }

}