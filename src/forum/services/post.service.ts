import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, PopulateOptions, QueryOptions, UpdateQuery } from 'mongoose';
import { Post, PostType } from '../schemas/post.schema';
import NotificationService from './notification.service';
import { PostAddDto } from '../dtos/postAdd.dto';
import { BaseService } from '../../config/base.service';
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
    return this.postModel.findById(id, undefined, options);
  }

  findByIdAndUpdate(id: string, update: UpdateQuery<PostType>, options?: QueryOptions) {
    return this.postModel.findByIdAndUpdate(id, update, {
      new: options?.new ?? true,
      runValidators: options?.runValidators ?? true,
      ...options,
    });
  }

  delete(id: string) {
    return this.postModel.findByIdAndDelete(id);
  }

  async cascadeDeleteComments(postId: string) {
    await this.commentModel.deleteMany({ postId });
  }

  async getAllPostsOfSingleUser(userId: string): Promise<any> {
    const values = await this.postModel
      .find({ user: userId })
      .lean()
      .sort({ createdAt: -1 });
    return values.map((value) => ({ ...value, photo: !!value.photo }));
  }

  getPostModel() {
    return this.postModel;
  }

  async createPost(dto: PostAddDto, userId: string): Promise<any> {
    if (!dto.description && !dto.photo) {
      throw new BadRequestException("the_post_needs_a_description_or_a_photo_or_both")
    }

    const post = { ...dto, user: userId, likes: 0, createdAt: this.VNTime(), updatedAt: this.VNTime()};
  
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
}