import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, PopulateOptions, QueryOptions, UpdateQuery } from 'mongoose';
import { Post, PostType } from '../schemas/post.schema';
import NotificationService from './notification.service';
import { PostAddDto } from '../dtos/postAdd.dto';
import { BaseService, getAdvanceResults } from '../../config/base.service';
import { PostUpdateDto } from '../dtos/postUpdate.dto';
import { NotificationTypeEnum } from '../schemas/notificationTypes';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { PostDto } from '../dtos/post.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
@Injectable()
export class PostsService extends BaseService {
  constructor(@InjectModel('Post') private postModel: Model<PostType>,
  @InjectModel('Comment') private commentModel: Model<Comment>,
  private notificationService: NotificationService,
  private readonly amqpConnection: AmqpConnection) {
    super()
  }

  create(post: Post) {
    return this.postModel.create(post);
  }

  find(query: FilterQuery<PostType>, options?: QueryOptions) {
    return this.postModel.find(query, undefined, options);
  }

  async findById(id: string, options?: QueryOptions) {
    const post = await this.postModel.findById(id, undefined, options);
    if (!post) throw new NotFoundException('post_not_found');
    return {
      "code": 200,
      "message": "success",
      "data": post
    }
  }

  delete(id: string) {
    return this.postModel.findByIdAndDelete(id);
  }

  async deletePost(id: string, userId: string): Promise<any> {
    const post = await this.findById(id);
    if ((await post.data).user.toString() !== userId)
      throw new NotFoundException('post_not_found');

    const update = {
      $set: { isActive: false,
              updatedAt: this.VNTime() 
          },
    };

    try {
      await this.postModel.findOneAndUpdate({ _id: id }, update);
    } catch (error) {
      throw new BadRequestException("delete_post_failed")
    }
    return {
      "code": 200,
      "message": "success"
    }
  }

  async cascadeDeleteComments(postId: string) {
    await this.commentModel.deleteMany({ postId });
  }

  async getAllPostsOfSingleUser(userId: string): Promise<any> {
    const values = await this.postModel
      .find({ user: userId })
      .lean()
      .sort({ createdAt: -1 });
    const posts = values.map((value) => ({ ...value, photo: !!value.photo }));
    return {
      "code": 200,
      "message": "success",
      "data": posts
    }
  }

  getPostModel() {
    return this.postModel;
  }

  async addOrUpdatePost(dto: PostDto): Promise<any> {
    if(dto.id === "" || !dto.id) {
        const post = { description: dto.description, photo: dto.photo, user: dto.userId, likes: [], isActive: true, createdAt: this.VNTime(), updatedAt: this.VNTime()};
    
        try {
            await this.create(post)
        } catch (error) {
            return {
                "code": 400,
                "message": "created_post_failed"
            }
        }
    
        return {
            "code": 200,
            "message": "success"
        }
    } else {
        var update: UpdateQuery<PostType> 
        if(dto.photo.length === 0)
            update ={
                $set: { description: dto.description,
                        updatedAt: this.VNTime() 
                    },
            };
        else
            update = {
                $set: { description: dto.description,
                        photo: dto.photo,
                        updatedAt: this.VNTime() 
                    },
            };
            
        const post = await this.postModel.findOneAndUpdate({ _id: dto.id }, update);
        if (!post) return {
            "code": 400,
            "message": "blog_not_found"
        }
        return {
            "code": 200,
            "message": "success"
        }
    }
  }

  async getNewsfeedPosts(): Promise<any> {
  
    const posts = await this.postModel.find()

    if(posts.length === 0) return []

    const rabbitmq = await this.amqpConnection.request<any>({
      exchange: 'healthline.user.information',
      routingKey: 'user',
      payload: posts.map(p => p.user),
      timeout: 10000,
    })

    if(rabbitmq.code !== 200) {
      throw new BadRequestException(rabbitmq.message)
    }

    const data = []
    posts.forEach(p => {
      for(let i=0; i<rabbitmq.data.length; i++)
        if(p.user === rabbitmq.data[i].uid) {
          data.push({
            id: p.id,
            description: p.description,
            photo: p.photo,
            user: rabbitmq.data[i],
            likes: p.likes,
            updatedAt: p.updatedAt,
          })
          break
        }
    })

    return data
  }

  async likePost(id: string, userId: string): Promise<any> {
    const post = await this.findById(id);
    if (!post) throw new NotFoundException('post_not_found');

    if ((await post.data).likes.includes(userId))
        throw new BadRequestException("post_is_liked_already")

    await post.data.updateOne(
      {
        $push: { likes: userId },
      },
      { runValidators: true },
    );

    const isPostCreator = userId === String((await post.data).user);
    if (!isPostCreator) {
      this.notificationService.sendPostNotificationToUser(
        userId,
        (await post.data).user,
        (await post.data).id,
        NotificationTypeEnum.postLike,
      );
    }

    return {
      "code": 200,
      "message": "success"
    }
  }

  async unlikePost(id: string, userId: string): Promise<any> {
    const post = await this.findById(id, { projection: 'likes user' });
    if (!post) throw new NotFoundException('post_not_found');

    if (!(await post.data).likes.includes(userId))
        throw new BadRequestException("post_is_not_liked")

    await post.data.updateOne(
      {
        $pull: { likes: userId },
      },
      { runValidators: true },
    );

    return {
      "code": 200,
      "message": "success"
    }
  }

  async updateMeilisearch(data: any) {
    const response = await fetch('https://meilisearch-truongne.koyeb.app/indexes/post/documents', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer CHOPPER_LOVE_MEILISEARCH",
        },
        body: JSON.stringify(data),
    });
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async getAllUsers() {
      const data = await this.getNewsfeedPosts()

      await this.updateMeilisearch(data)
  }
}