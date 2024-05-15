import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, PopulateOptions, QueryOptions, UpdateQuery } from 'mongoose';
import { Post, PostType } from '../schemas/post.schema';
import { BaseService, getAdvanceResults } from '../../config/base.service';
import { PostDto, PostIds } from '../dtos/post.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
@Injectable()
export class PostsService extends BaseService {
  constructor(@InjectModel('Post') private postModel: Model<PostType>,
  @InjectModel('Comment') private commentModel: Model<Comment>,
  public readonly amqpConnection: AmqpConnection
  ) {
    super()
    this.updatePostMeili()
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

    await this.deleteIndexMeilisearch("post", id)

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

  async dataPosts(posts: PostType[]) {
    if(posts.length === 0) return []

    const rabbitmq = await this.getDataRabbitMq(Array.from(new Set(posts.map(p => p.user))))
    
    const data = []
    posts.forEach(p => {
      for(let item of rabbitmq)
        if(p.user === item.uid) {
          data.push({
            id: p.id,
            description: p.description,
            photo: p.photo,
            user: item,
            likes: p.likes,
            updatedAt: p.updatedAt,
          })
          break
        }
    })
    return posts
  }

  async getNewsfeedPosts(): Promise<any> {
  
    const posts = await this.postModel.find({ isActive: true })

    return await this.dataPosts(posts)
  }

  async getAllPosts(page: number, limit: number): Promise<any> {
    const posts = await getAdvanceResults(
        this.postModel,
        { isActive: true },
        page,
        limit,
        undefined,
        undefined,
        { 'updatedAt': -1 },
    );
    
    const data = await this.dataPosts(posts.data)
    
    return {
      "code": 200,
      "message": "success",
      "data": data
    }
  }

  async getAllPostsByIds(ids: PostIds): Promise<any> {
    const posts = await this.postModel.find({ "_id": { $in: ids.ids }, "isActive": true }).sort({ 'updatedAt': -1 })
    
    const data = await this.dataPosts(posts)
    return {
      "code": 200,
      "message": "success",
      "data": data
    }
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

  @Cron(CronExpression.EVERY_10_MINUTES)
  async updatePostMeili() {
      const data = await this.getNewsfeedPosts()
      await this.updateMeilisearch('post', data)
  }
}