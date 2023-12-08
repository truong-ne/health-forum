import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, PopulateOptions, QueryOptions, UpdateQuery } from 'mongoose';
import { BaseService, getAdvanceResults } from '../../config/base.service';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { ExpectedReturnType, UserReturnType } from '../../config/ExpectedReturnType';
import { Blog, BlogType } from '../schemas/blog.schema';
import { BlogDto } from '../dtos/blog.dto';
@Injectable()
export class BlogsService extends BaseService {
  constructor(@InjectModel('Blog') private blogModel: Model<BlogType>,
  private readonly amqpConnection: AmqpConnection,
  ) {
    super()
  }

  create(blog: Blog) {
    return this.blogModel.create(blog);
  }

  find(query: FilterQuery<BlogType>, options?: QueryOptions) {
    return this.blogModel.find(query, undefined, options);
  }

  async findById(id: string, options?: QueryOptions) {
    const blog = await this.blogModel.findById(id, undefined, options);
    if (!blog) throw new NotFoundException('blog_not_found');
    return {
      "code": 200,
      "message": "success",
      "data": blog
    }
  }

  delete(id: string) {
    return this.blogModel.findByIdAndDelete(id);
  }

  async deleteBlog(id: string): Promise<any> {
    const blog = await this.findById(id);
    console.log(blog)
    
    const rabbit = await this.amqpConnection.request<any>({
        exchange: 'healthline.upload.folder',
        routingKey: 'delete_file',
        payload: [blog.data.photo],
        timeout: 20000,
    })

    if(rabbit.code !== 200)
        return rabbit

    try {
      await this.delete(id)
    } catch (error) {
      throw new BadRequestException("delete_blog_failed")
    }
    return {
      "code": 200,
      "message": "success"
    }
  }
  
  async addOrUpdateBlog(dto: BlogDto): Promise<any> {
    if(dto.id === "" || !dto.id) {
        const blog = { title: dto.title, content: dto.content, photo: dto.photo, createdAt: this.VNTime(), updatedAt: this.VNTime()};
    
        try {
            await this.create(blog)
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
        var update: UpdateQuery<BlogType> 
        if(dto.photo === "")
            update ={
                $set: { title: dto.title,
                        content: dto.content,
                        updatedAt: this.VNTime() 
                    },
            };
        else
            update = {
                $set: { title: dto.title,
                        content: dto.content,
                        photo: dto.photo,
                        updatedAt: this.VNTime() 
                    },
            };
            
        const blog = await this.blogModel.findOneAndUpdate({ _id: dto.id }, update);
        if (!blog) return {
            "code": 400,
            "message": "blog_not_found"
        }
        return {
            "code": 200,
            "message": "success"
        }
    }
  }

  async getAllBlogs(): Promise<any> {
    const values = await this.blogModel
      .find()
      .lean()
      .sort({ createdAt: -1 });
    return {
      "code": 200,
      "message": "success",
      "data": values
    }
  }


}