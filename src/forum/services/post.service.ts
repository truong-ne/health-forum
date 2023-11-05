import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, PopulateOptions, QueryOptions, UpdateQuery } from 'mongoose';
import { Post, PostType } from '../schemas/post.schema';
import NotificationService from './notification.service';
import { PostAddDto } from '../dtos/postAdd.dto';
import { BaseService, getAdvanceResults } from '../../config/base.service';
import { PostUpdateDto } from '../dtos/postUpdate.dto';
import { NotificationTypeEnum } from '../schemas/notificationTypes';
@Injectable()
export class PostsService extends BaseService {
  constructor(@InjectModel('Post') private postModel: Model<PostType>,
  @InjectModel('Comment') private commentModel: Model<Comment>,
  private notificationService: NotificationService,) {
    super()
  }

  create(post: Post) {
    return this.postModel.create(post);
  }

  find(query: FilterQuery<PostType>, options?: QueryOptions) {
    return this.postModel.find(query, undefined, options);
  }

  findById(id: string, options?: QueryOptions) {
    const post = this.postModel.findById(id, undefined, options);
    if (!post) throw new NotFoundException('post_not_found');
    return {
      "code": 200,
      "message": "success",
      "data": post
    }
  }

  findByIdAndUpdate(dto: PostUpdateDto, id: string, options?: QueryOptions) {
    const update: UpdateQuery<PostType> = {
      $set: { description: dto.description,
              photo: dto.photo },
    };
    const post = this.postModel.findOneAndUpdate({ id: dto.id, user: id }, update, {
      new: options?.new ?? true,
      runValidators: options?.runValidators ?? true,
      ...options,
    });
    if (!post) throw new NotFoundException('post_not_found');
    return {
      "code": 200,
      "message": "success"
    }
  }

  delete(id: string) {
    return this.postModel.findByIdAndDelete(id);
  }

  async deletePost(id: string, userId: string): Promise<any> {
    const post = await this.findById(id);
    if ((await post.data).user.toString() !== userId)
      throw new NotFoundException('post_not_found');
    try {
      await this.delete(id)
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

  async createPost(dto: PostAddDto, userId: string): Promise<any> {
    if (!dto.description && !dto.photo) {
      throw new BadRequestException("the_post_needs_a_description_or_a_photo_or_both")
    }

    const post = { ...dto, user: userId, likes: [], createdAt: this.VNTime(), updatedAt: this.VNTime()};
  
    if (dto.photo) {
      try {
        await this.create({ ...post, photo: dto.photo })
      } catch (error) {
        throw new BadRequestException("created_post_failed")
      }
    } else {
      try {
        await this.create(post)
      } catch (error) {
        throw new BadRequestException("created_post_failed")
      }
    }

    return {
      "code": 200,
      "message": "success"
    }
  }

  async getNewsfeedPosts(limitQ: number, page: number): Promise<any> {
    const limit = limitQ ?? 2;
    const query = {};
  
    const posts = getAdvanceResults(
      this.getPostModel(),
      query,
      page,
      limit,
      undefined,
      undefined,
      {
        createdAt: -1,
      },
    );

    return {
      "code": 200,
      "message": "success",
      "data": posts
    }
  }

  async likePost(id: string, userId: string): Promise<any> {
    const post = await this.findById(id, { projection: 'likes user' });
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
}